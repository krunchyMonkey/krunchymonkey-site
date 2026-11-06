"""Validate the small static site without external dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / "index.html", ROOT / "tracing-guatemala/index.html", ROOT / "tracing-guatemala/demo/index.html", ROOT / "tracing-guatemala/privacy/index.html"]
ASSETS = [ROOT / "assets/site.css", ROOT / "assets/favicon.png", ROOT / "assets/krunchymonkey-logo.webp"]

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.title = False
        self.description = False
        self.lang = False
        self.viewport = False
        self.images_without_alt = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "html" and a.get("lang") == "en":
            self.lang = True
        if tag == "title":
            self.title = True
        if tag == "meta" and a.get("name") == "description" and a.get("content"):
            self.description = True
        if tag == "meta" and a.get("name") == "viewport":
            self.viewport = True
        if tag == "img" and "alt" not in a:
            self.images_without_alt += 1
        for key in ("href", "src"):
            if a.get(key):
                self.links.append((key, a[key]))

def parse(page):
    doc = Document()
    doc.feed(page.read_text(encoding="utf-8"))
    return doc

def main():
    problems = []
    docs = {page: parse(page) for page in PAGES}
    for asset in ASSETS:
        if not asset.is_file():
            problems.append(f"Missing asset: {asset.relative_to(ROOT)}")
    for page, doc in docs.items():
        rel = page.relative_to(ROOT)
        if not all((doc.lang, doc.title, doc.description, doc.viewport)):
            problems.append(f"Required HTML metadata missing: {rel}")
        if doc.images_without_alt:
            problems.append(f"Images without alt attributes in {rel}: {doc.images_without_alt}")
        for kind, target in doc.links:
            parsed = urlsplit(target)
            if parsed.scheme or parsed.netloc or target.startswith(("mailto:", "tel:", "data:")):
                continue
            if parsed.path.startswith("/"):
                problems.append(f"Absolute-root path in {rel}: {target} (breaks project Pages preview)")
                continue
            relative = unquote(parsed.path)
            dest = (page.parent / relative) if relative else page
            if dest.is_dir():
                dest = dest / "index.html"
            dest = dest.resolve()
            try:
                dest.relative_to(ROOT)
            except ValueError:
                problems.append(f"Link escapes source tree in {rel}: {target}")
                continue
            if not dest.is_file():
                problems.append(f"Broken {kind} in {rel}: {target}")
            elif parsed.fragment and dest.suffix == ".html":
                doc_for_dest = docs.get(dest) or parse(dest)
                if parsed.fragment not in doc_for_dest.ids:
                    problems.append(f"Missing #{parsed.fragment} in {dest.relative_to(ROOT)} linked from {rel}")
    for page in PAGES:
        content = page.read_text(encoding="utf-8")
        for forbidden in ("CLOUDFLARE_API_TOKEN", "-----BEGIN PRIVATE KEY-----", "ghp_", "sk-"):
            if forbidden.lower() in content.lower():
                problems.append(f"Potential secret/config reference in {page.relative_to(ROOT)}: {forbidden[:8]}")
    if problems:
        print("Static site checks failed:", *[f"- {p}" for p in problems], sep="\n", file=sys.stderr)
        raise SystemExit(1)
    print(f"Validated {len(PAGES)} pages, {len(ASSETS)} shared assets, and all local links/anchors.")

if __name__ == "__main__":
    main()
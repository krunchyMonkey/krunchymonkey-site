"""Proof-of-concept harness: mount KrunchOS in the Pages artifact under GitHub Pages semantics."""
import argparse
import hashlib
import html
import http.client
import http.server
import importlib.util
import json
import posixpath
import shutil
import sys
import threading
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

HERE = Path(__file__).resolve().parent
HOST = "127.0.0.1"
DEFAULT_PORT = 4318
CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".webp": "image/webp",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
}
PAGES = ["", "tracing-guatemala/", "tracing-guatemala/demo/", "tracing-guatemala/privacy/"]


def load_build_site():
    spec = importlib.util.spec_from_file_location("build_site", HERE / "build_site.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def normalize_base(base: str) -> str:
    if not base.startswith("/"):
        base = "/" + base
    return base if base.endswith("/") else base + "/"


def not_found_page(base: str) -> str:
    home = html.escape(base, quote=True)
    privacy = html.escape(base + "tracing-guatemala/privacy/", quote=True)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found - KrunchyMonkey</title>
<meta name="description" content="The page you requested does not exist on this site.">
</head>
<body>
<main>
<h1>Page not found</h1>
<p>The page you requested does not exist.</p>
<ul>
<li><a href="{home}">KrunchyMonkey home</a></li>
<li><a href="{privacy}">Tracing Guatemala privacy notice</a></li>
</ul>
</main>
</body>
</html>
"""


def cmd_assemble(args) -> int:
    build = load_build_site()
    root = build.ROOT
    out = Path(args.out)
    base = normalize_base(args.base)
    dist = Path(args.krunchos_dist) if args.krunchos_dist else None
    if dist is not None:
        if not dist.is_dir():
            print(f"KrunchOS dist not found: {dist}", file=sys.stderr)
            return 2
        bad = [
            p.relative_to(dist).as_posix()
            for p in sorted(dist.rglob("*"))
            if p.is_file() and (p.suffix == ".map" or any(part.startswith(".") for part in p.relative_to(dist).parts))
        ]
        if bad:
            print("Refusing KrunchOS dist with source maps or dotfiles: " + ", ".join(bad), file=sys.stderr)
            return 2
    if out.exists():
        shutil.rmtree(out)
    for relative in build.PUBLISH_FILES:
        src = root / relative
        if not src.is_file():
            print(f"Missing required site asset: {relative}", file=sys.stderr)
            return 2
        target = out / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, target)
    if dist is not None:
        shutil.copytree(dist, out / args.mount)
    (out / "404.html").write_text(not_found_page(base), encoding="utf-8", newline="\n")
    print(f"Assembled {sum(1 for p in out.rglob('*') if p.is_file())} files in {out}")
    return 0


def listing(directory: Path):
    entries = []
    for p in sorted(directory.rglob("*"), key=lambda q: q.relative_to(directory).as_posix()):
        if p.is_file():
            data = p.read_bytes()
            entries.append((p.relative_to(directory).as_posix(), len(data), hashlib.sha256(data).hexdigest()))
    return entries


def combined(entries) -> str:
    text = "".join(f"{digest}  {size}  {path}\n" for path, size, digest in entries)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def cmd_manifest(args) -> int:
    entries = listing(Path(args.dir))
    total = combined(entries)
    for path, size, digest in entries:
        print(f"{digest}  {size:>8}  {path}")
    print(f"combined sha256: {total}")
    if args.json:
        payload = {
            "files": [{"path": p, "size": s, "sha256": d} for p, s, d in entries],
            "combined_sha256": total,
        }
        Path(args.json).write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    return 0


def make_handler(directory: Path, prefix: str):
    root = directory.resolve()
    fallback = root / "404.html"

    class Handler(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *_):
            pass

        def send(self, status, body=b"", ctype="text/html; charset=utf-8", location=None, head=False):
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "max-age=600")
            if location:
                self.send_header("Location", location)
            self.send_header("Connection", "close")
            self.end_headers()
            if not head:
                self.wfile.write(body)

        def missing(self, head):
            body = fallback.read_bytes() if fallback.is_file() else b"Not found"
            self.send(404, body, head=head)

        def handle_request(self, head):
            path = unquote(urlsplit(self.path).path)
            if not path.startswith(prefix):
                return self.missing(head)
            rel = path[len(prefix):]
            parts = [p for p in rel.split("/") if p]
            if ".." in parts or "\\" in rel:
                return self.missing(head)
            target = root.joinpath(*parts)
            if rel == "" or rel.endswith("/"):
                target = target / "index.html"
                if target.is_file():
                    return self.send(200, target.read_bytes(), CONTENT_TYPES[".html"], head=head)
                return self.missing(head)
            if target.is_file():
                ctype = CONTENT_TYPES.get(target.suffix.lower(), "application/octet-stream")
                return self.send(200, target.read_bytes(), ctype, head=head)
            if target.is_dir():
                return self.send(301, b"", location=posixpath.join(prefix, *parts) + "/", head=head)
            return self.missing(head)

        def do_GET(self):
            self.handle_request(False)

        def do_HEAD(self):
            self.handle_request(True)

    return Handler


def start_server(directory, prefix, port):
    server = http.server.ThreadingHTTPServer((HOST, port), make_handler(Path(directory), prefix))
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def stop_server(server, thread):
    server.shutdown()
    server.server_close()
    thread.join(timeout=5)


def cmd_serve(args) -> int:
    prefix = normalize_base(args.prefix)
    server = http.server.ThreadingHTTPServer((HOST, args.port), make_handler(Path(args.dir), prefix))
    print(f"Serving {args.dir} at http://{HOST}:{args.port}{prefix}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ("href", "src") and value:
                self.refs.append(value)


def relative_refs(body: str):
    parser = RefParser()
    parser.feed(body)
    out = []
    for ref in parser.refs:
        ref = ref.strip()
        low = ref.lower()
        if not ref or ref.startswith(("#", "//")) or low.startswith(("mailto:", "http:", "https:", "data:", "tel:", "javascript:")):
            continue
        out.append(ref)
    return out


class Client:
    def __init__(self, port):
        self.port = port

    def get(self, path):
        conn = http.client.HTTPConnection(HOST, self.port, timeout=10)
        try:
            conn.request("GET", path)
            resp = conn.getresponse()
            return resp.status, resp.getheader("Content-Type") or "", resp.getheader("Location"), resp.getheader("Cache-Control"), resp.read()
        finally:
            conn.close()


def run_checks(directory: Path, prefix: str, mount, port: int):
    results = []
    client = Client(port)

    def record(name, ok, detail=""):
        results.append((name, ok, detail))

    def check_refs(label, page_rel, body):
        page_url = "http://x" + prefix + page_rel
        for ref in relative_refs(body):
            resolved = urlsplit(urljoin(page_url, ref))
            path = resolved.path + (f"?{resolved.query}" if resolved.query else "")
            status = client.get(path)[0]
            record(f"{label} ref {ref}", status == 200, f"{path} -> {status}")

    for rel in PAGES:
        status, ctype, _, cache, body = client.get(prefix + rel)
        record(f"GET {prefix}{rel}", status == 200 and ctype.startswith("text/html") and cache == "max-age=600", f"{status} {ctype}")
        if status == 200:
            check_refs(f"/{rel}", rel, body.decode("utf-8", "replace"))

    status, _, location, _, _ = client.get(prefix + "tracing-guatemala")
    record("301 tracing-guatemala -> slash", status == 301 and location == prefix + "tracing-guatemala/", f"{status} {location}")

    status, _, _, _, body = client.get(prefix + "does-not-exist/")
    page = directory / "404.html"
    expected = page.read_bytes() if page.is_file() else None
    record("404 does-not-exist/ serves 404.html", status == 404 and expected is not None and body == expected, str(status))

    if prefix != "/":
        record("404 outside prefix", client.get("/")[0] == 404, "/")

    if expected is not None:
        check_refs("404.html", "does-not-exist/", expected.decode("utf-8"))

    if mount and (directory / mount).is_dir():
        status, ctype, _, _, body = client.get(f"{prefix}{mount}/")
        record(f"GET {prefix}{mount}/", status == 200 and ctype.startswith("text/html"), f"{status} {ctype}")
        if status == 200:
            check_refs(f"/{mount}/", f"{mount}/", body.decode("utf-8", "replace"))
        status = client.get(f"{prefix}{mount}/workbench")[0]
        record(f"404 {mount}/workbench (no SPA rewrites)", status == 404, str(status))
    return results


def cmd_verify(args) -> int:
    directory = Path(args.dir)
    prefix = normalize_base(args.prefix)
    server, thread = start_server(directory, prefix, args.port)
    try:
        results = run_checks(directory, prefix, args.mount, args.port)
    finally:
        stop_server(server, thread)
    width = max(len(name) for name, _, _ in results)
    for name, ok, detail in results:
        print(f"{'PASS' if ok else 'FAIL'}  {name.ljust(width)}  {detail}")
    failed = sum(1 for _, ok, _ in results if not ok)
    print(f"prefix {prefix}: {len(results) - failed} passed, {failed} failed")
    return 1 if failed else 0


def read_tree(directory: Path):
    return {p.relative_to(directory).as_posix(): p.read_bytes() for p in directory.rglob("*") if p.is_file()}


def cmd_rollback(args) -> int:
    build = load_build_site()
    with_tree = read_tree(Path(args.with_dir))
    without_tree = read_tree(Path(args.without))
    mount_prefix = args.mount + "/"
    stripped = {k: v for k, v in with_tree.items() if not k.startswith(mount_prefix)}
    expected = set(build.PUBLISH_FILES) | {"404.html"}
    problems = []
    if len(stripped) == len(with_tree):
        problems.append(f"'with' tree has no {mount_prefix} files")
    if set(without_tree) != expected:
        problems.append(f"'without' files differ from PUBLISH_FILES + 404.html: {sorted(set(without_tree) ^ expected)}")
    for key in sorted(set(stripped) | set(without_tree)):
        if stripped.get(key) != without_tree.get(key):
            problems.append(f"differs: {key}")
    for key in sorted(expected & set(without_tree)):
        if key != "404.html" and without_tree[key] != (build.ROOT / key).read_bytes():
            problems.append(f"not equal to source: {key}")
    for problem in problems:
        print("FAIL  " + problem)
    if problems:
        return 1
    print(f"PASS  removing {mount_prefix} restores the current public artifact exactly ({len(without_tree)} files)")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("assemble")
    p.add_argument("--out", required=True)
    p.add_argument("--krunchos-dist")
    p.add_argument("--mount", default="os")
    p.add_argument("--base", default="/")
    p.set_defaults(func=cmd_assemble)

    p = sub.add_parser("manifest")
    p.add_argument("dir")
    p.add_argument("--json")
    p.set_defaults(func=cmd_manifest)

    p = sub.add_parser("serve")
    p.add_argument("dir")
    p.add_argument("--prefix", default="/")
    p.add_argument("--port", type=int, default=DEFAULT_PORT)
    p.set_defaults(func=cmd_serve)

    p = sub.add_parser("verify")
    p.add_argument("dir")
    p.add_argument("--prefix", default="/")
    p.add_argument("--mount", default="os")
    p.add_argument("--port", type=int, default=DEFAULT_PORT)
    p.set_defaults(func=cmd_verify)

    p = sub.add_parser("rollback-check")
    p.add_argument("--with", dest="with_dir", required=True)
    p.add_argument("--without", required=True)
    p.add_argument("--mount", default="os")
    p.set_defaults(func=cmd_rollback)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())

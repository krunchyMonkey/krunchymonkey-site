"""Assemble the allowlisted, dependency-free GitHub Pages artifact."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "dist"
PUBLISH_FILES = [
    "index.html",
    ".nojekyll",
    "assets/site.css",
    "assets/favicon.png",
    "assets/krunchymonkey-logo.webp",
    "tracing-guatemala/index.html",
    "tracing-guatemala/privacy/index.html",
]

def main() -> None:
    if DEST.exists():
        shutil.rmtree(DEST)
    for relative in PUBLISH_FILES:
        src = ROOT / relative
        if not src.is_file():
            raise SystemExit(f"Missing required site asset: {relative}")
        out = DEST / relative
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, out)
    print(f"Built {len(PUBLISH_FILES)} public files in {DEST} (no secrets, docs, or mockup screenshots).")

if __name__ == "__main__":
    main()

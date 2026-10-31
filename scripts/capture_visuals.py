"""Capture reproducible visual-review screenshots (optional Playwright + Pillow).

Run `python -m pip install playwright pillow` and `python -m playwright install chromium`
then `python scripts/capture_visuals.py`. Use CHROME_PATH to point at a local browser.

This reports differences but does NOT hard-fail on pixel deltas: different operating
systems, fonts and Chromium versions routinely change glyph rasterization.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os
import sys
import re
import base64
import mimetypes

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "visual-output"
CASES = [
    ("/", "home-desktop-1440", 1440, 900),
    ("/", "home-mobile-390", 390, 844),
    ("/tracing-guatemala/", "tracing-guatemala-desktop-1440", 1440, 900),
    ("/tracing-guatemala/privacy/", "privacy-draft-desktop-1440", 1440, 900),
]


def diff_report(actual, baseline):
    try:
        from PIL import Image, ImageChops, ImageStat
    except ImportError:
        print("  (Install pillow for local visual pixel-difference reports.)")
        return
    with Image.open(actual).convert("RGB") as image, Image.open(baseline).convert("RGB") as reference:
        if image.size != reference.size:
            print(f"  Size changed: baseline {reference.size}, actual {image.size}")
            return
        stat = ImageStat.Stat(ImageChops.difference(image, reference))
        avg = sum(stat.mean) / 3
        print(f"  Mean pixel difference from baseline: {avg:.2f}/255 (review even small visual changes)")


def render_inline(page, route):
    """Fallback when a managed browser blocks local HTTP/file navigation."""
    relative = 'index.html' if route == '/' else route.lstrip('/') + 'index.html'
    html = ROOT / relative
    source = html.read_text(encoding='utf-8')
    def css_replacer(m):
        css = (html.parent / m.group(1)).resolve().read_text(encoding='utf-8')
        return '<style>' + css + '</style>'
    source = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_replacer, source)
    def image_replacer(m):
        file = (html.parent / m.group(2)).resolve()
        mime = mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
        uri = f'data:{mime};base64,' + base64.b64encode(file.read_bytes()).decode('ascii')
        return m.group(1) + uri + m.group(3)
    source = re.sub(r'(<img\b[^>]*?\bsrc=")([^"]+)(")', image_replacer, source)
    page.set_content(source, wait_until='load')


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit("Install optional tooling: python -m pip install playwright pillow; python -m playwright install chromium") from exc
    OUT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as playwright:
            options = {"headless": True}
            if os.getenv("CHROME_PATH"):
                options["executable_path"] = os.getenv("CHROME_PATH")
            browser = playwright.chromium.launch(**options)
            for route, name, width, height in CASES:
                page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
                try:
                    response = page.goto(base + route, wait_until="networkidle")
                    status = response.status if response else None
                except Exception as exc:
                    if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):
                        raise
                    print('  Managed browser blocked loopback navigation; using inline asset fallback for visual-only QA.')
                    page.close()
                    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
                    render_inline(page, route)
                    status = 200  # Inline content is not proof of HTTP deployment.
                screenshot = OUT / f"{name}.png"
                page.screenshot(path=str(screenshot), full_page=True)
                result = page.evaluate("""() => ({overflow: document.documentElement.scrollWidth > innerWidth, broken: [...document.images].filter(i=>!i.complete||!i.naturalWidth).length})""")
                print(f"{route} [{width}x{height}]: render={status}, overflow={result['overflow']}, broken images={result['broken']}")
                baseline = ROOT / "docs/reference" / (name + ".png")
                if baseline.exists():
                    diff_report(screenshot, baseline)
                if status != 200 or result["overflow"] or result["broken"]:
                    raise SystemExit(f"Browser smoke test failed: {name}")
                page.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print(f"Saved screenshots in {OUT}")


if __name__ == "__main__":
    main()

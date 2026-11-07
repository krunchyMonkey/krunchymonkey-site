import contextlib
import io
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pages_poc  # noqa: E402

PREFIXES = ["/", "/krunchymonkey-site/"]


def run(*argv):
    out = io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
        code = pages_poc.main(list(argv))
    return code, out.getvalue()


class PagesPocTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, True)

    def fake_dist(self, js_ref="./assets/app.js"):
        dist = self.tmp / "dist"
        (dist / "assets").mkdir(parents=True, exist_ok=True)
        (dist / "index.html").write_text(
            '<!doctype html><html lang="en"><head><link rel="stylesheet" href="./assets/app.css">'
            f'</head><body><script src="{js_ref}"></script></body></html>',
            encoding="utf-8",
        )
        (dist / "assets" / "app.js").write_text("console.log(1);\n", encoding="utf-8")
        (dist / "assets" / "app.css").write_text("body{margin:0}\n", encoding="utf-8")
        return dist

    def assemble(self, name, prefix, dist=None):
        out = self.tmp / name
        args = ["assemble", "--out", str(out), "--base", prefix]
        if dist:
            args += ["--krunchos-dist", str(dist)]
        return out, run(*args)

    def test_verify_both_prefixes_with_mount(self):
        dist = self.fake_dist()
        for prefix in PREFIXES:
            out, (code, _) = self.assemble("site", prefix, dist)
            self.assertEqual(code, 0)
            code, text = run("verify", str(out), "--prefix", prefix)
            self.assertEqual(code, 0, text)
            self.assertIn("404 os/workbench", text)

    def test_verify_both_prefixes_without_mount(self):
        for prefix in PREFIXES:
            out, (code, _) = self.assemble("plain", prefix)
            self.assertEqual(code, 0)
            code, text = run("verify", str(out), "--prefix", prefix)
            self.assertEqual(code, 0, text)

    def test_manifest_deterministic(self):
        out, _ = self.assemble("site", "/", self.fake_dist())
        first = run("manifest", str(out))
        second = run("manifest", str(out))
        self.assertEqual(first, second)
        self.assertIn("combined sha256:", first[1])

    def test_rollback_check_passes(self):
        with_dir, _ = self.assemble("with", "/", self.fake_dist())
        without, _ = self.assemble("without", "/")
        code, text = run("rollback-check", "--with", str(with_dir), "--without", str(without))
        self.assertEqual(code, 0, text)

    def test_rollback_check_detects_drift(self):
        with_dir, _ = self.assemble("with", "/", self.fake_dist())
        without, _ = self.assemble("without", "/")
        (without / "index.html").write_bytes(b"changed")
        code, _ = run("rollback-check", "--with", str(with_dir), "--without", str(without))
        self.assertEqual(code, 1)

    def test_absolute_asset_fails_under_project_prefix(self):
        out, _ = self.assemble("abs", "/krunchymonkey-site/", self.fake_dist("/assets/app.js"))
        code, text = run("verify", str(out), "--prefix", "/krunchymonkey-site/")
        self.assertEqual(code, 1, text)

    def test_map_file_refused(self):
        dist = self.fake_dist()
        (dist / "assets" / "app.js.map").write_text("{}", encoding="utf-8")
        out, (code, text) = self.assemble("map", "/", dist)
        self.assertNotEqual(code, 0)
        self.assertIn("app.js.map", text)
        self.assertFalse((out / "os").exists())


if __name__ == "__main__":
    unittest.main()

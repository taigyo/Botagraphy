#!/usr/bin/env python3
"""public/ を単一のHTMLにまとめる（style.css・js/*.js・img/ を埋め込む）。
アーティファクト公開や、サーバー無しで file:// から開きたいとき用。
使い方:  python3 tools/bundle.py  →  dist/botagraphy-single.html
"""
import base64, re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent / "public"
MIME = {"webp": "image/webp", "png": "image/png", "jpg": "image/jpeg"}

def inline_imgs(text):
    def f(m):
        p = R / m.group(0)
        return f"data:{MIME[p.suffix[1:]]};base64," + base64.b64encode(p.read_bytes()).decode()
    return re.sub(r"img/[\w.\-]+\.(?:webp|png|jpg)", f, text)

html = (R / "index.html").read_text(encoding="utf-8")
css = inline_imgs((R / "style.css").read_text(encoding="utf-8"))
def inline_js(m):
    return "<script>\n" + inline_imgs((R / m.group(1)).read_text(encoding="utf-8")) + "</script>"

html = html.replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "</style>")
html = re.sub(r'<script src="([^"]+\.js)"></script>', inline_js, html)
out = R.parent / "dist"
out.mkdir(exist_ok=True)
(out / "botagraphy-single.html").write_text(html, encoding="utf-8")
print("dist/botagraphy-single.html", len(html) // 1024, "KB")

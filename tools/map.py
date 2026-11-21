#!/usr/bin/env python3
"""public/js/*.js の先頭レベルの名前（関数・定数）を、ファイルごとに一覧表示する。NOTES.md の地図の更新用。"""
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent / "public" / "js"
for f in sorted(R.glob("*.js")):
    names = []
    for l in f.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^(?:async function|function|const|let|class)\s+([\w$]+)", l)
        if m:
            names.append(m.group(1))
            for x in re.findall(r",([A-Za-z_$][\w$]*)=", l.split(";")[0][:600]) if l.startswith("const $=") else []:
                names.append(x)
    print(f"### {f.name}\n" + " ".join(dict.fromkeys(names)) + "\n")

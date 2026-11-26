#!/usr/bin/env python3
"""カード枠・カード裏面のCSS（SVGマスク入り）を生成し、style.css の
/* @@CUSTOM-BEGIN */ 〜 /* @@CUSTOM-END */ の間を書き換える。
枠・裏面を増やすときは FRAMES / BACKS に足して実行する（名前と説明は js/00-custom.js の FRD / BKD）。
使い方: python3 tools/gencustom.py"""
import pathlib, re
from urllib.parse import quote
R = pathlib.Path(__file__).resolve().parent.parent / "public"

def url(svg): return 'url("data:image/svg+xml,' + quote(svg, safe="/:=' ,.-()") + '")'
def svg(vb, body, extra=""): return f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='{vb}' {extra}>{body}</svg>"
def f(x): return ("%.2f" % x).rstrip("0").rstrip(".")

# ---------- 窓（リングの内側の形）。座標は 100x150 ----------
def rr(w, r):
    x0, y0, x1, y1 = w, w, 100 - w, 150 - w
    return (f"M{f(x0+r)} {f(y0)}H{f(x1-r)}A{r} {r} 0 0 1 {f(x1)} {f(y0+r)}V{f(y1-r)}A{r} {r} 0 0 1 {f(x1-r)} {f(y1)}"
            f"H{f(x0+r)}A{r} {r} 0 0 1 {f(x0)} {f(y1-r)}V{f(y0+r)}A{r} {r} 0 0 1 {f(x0+r)} {f(y0)}Z")
def poly(p): return "M" + "L".join(f"{f(a)} {f(b)}" for a, b in p) + "Z"
def chamfer(w, c):
    x0, y0, x1, y1 = w, w, 100 - w, 150 - w
    tl, tr, br, bl = c
    return poly([(x0+tl, y0), (x1-tr, y0), (x1, y0+tr), (x1, y1-br), (x1-br, y1), (x0+bl, y1), (x0, y1-bl), (x0, y0+tl)])
def edges(w, amp, n, alt, c=7):
    """辺をぐるっと弧でつなぐ。alt=False：外へふくらむ（花びら）／True：波"""
    x0, y0, x1, y1 = w + amp, w + amp, 100 - w - amp, 150 - w - amp
    d = f"M{f(x0+c)} {f(y0)}"
    def side(L, k, horiz, sgn, sx, sy):
        s = ""; seg = L / k
        for i in range(k):
            sw = 1 if not alt else (1 if i % 2 == 0 else 0)
            if horiz: sx += sgn * seg; s += f"A{f(seg/2)} {amp} 0 0 {sw} {f(sx)} {f(sy)}"
            else: sy += sgn * seg; s += f"A{amp} {f(seg/2)} 0 0 {sw} {f(sx)} {f(sy)}"
        return s, sx, sy
    sx, sy = x0 + c, y0
    s, sx, sy = side((x1 - c) - (x0 + c), n, True, 1, sx, sy); d += s
    d += f"L{f(x1)} {f(y0+c)}"; sx, sy = x1, y0 + c
    s, sx, sy = side((y1 - c) - (y0 + c), n + 3, False, 1, sx, sy); d += s
    d += f"L{f(x1-c)} {f(y1)}"; sx, sy = x1 - c, y1
    s, sx, sy = side((x1 - c) - (x0 + c), n, True, -1, sx, sy); d += s
    d += f"L{f(x0)} {f(y1-c)}"; sx, sy = x0, y1 - c
    s, sx, sy = side((y1 - c) - (y0 + c), n + 3, False, -1, sx, sy); d += s
    return d + "Z"
def arch(w, r=6):
    x0, x1, y1 = w, 100 - w, 150 - w; rx = (x1 - x0) / 2
    return f"M{f(x0)} {f(w+rx)}A{f(rx)} {f(rx)} 0 0 1 {f(x1)} {f(w+rx)}V{f(y1-r)}A{r} {r} 0 0 1 {f(x1-r)} {f(y1)}H{f(x0+r)}A{r} {r} 0 0 1 {f(x0)} {f(y1-r)}Z"
def flame(w):
    x0, y0, x1, y1 = w, w, 100 - w, 150 - w; p = [(x0+6, y0), (x1-6, y0), (x1, y0+6), (x1, y1-10)]
    n = 7; seg = (x1 - x0) / n
    for i in range(n):
        xr = x1 - seg * i; p += [(xr - seg/2, y1 - 1), (xr - seg, y1 - 10)]
    p += [(x0, y0+6)]; return poly(p)
def crown(w):
    x0, y0, x1, y1 = w, w, 100 - w, 150 - w
    return poly([(x0, y0+14), (x0+8, y0+14), (x0+8, y0+6), (x0+14, y0+6), (x0+14, y0), (42, y0), (46, y0-2.4), (50, y0+2), (54, y0-2.4), (58, y0), (x1-14, y0), (x1-14, y0+6), (x1-8, y0+6), (x1-8, y0+14), (x1, y0+14),
                 (x1, y1-14), (x1-8, y1-14), (x1-8, y1-6), (x1-14, y1-6), (x1-14, y1), (x0+14, y1), (x0+14, y1-6), (x0+8, y1-6), (x0+8, y1-14), (x0, y1-14)])
def ring(*wins):
    assert len(wins)%2==1, "窓は奇数個（1か3）にする。偶数だと内側まで塗りつぶされる"
    return url(svg("0 0 100 150", "<path fill-rule='evenodd' d='M0 0H100V150H0Z" + "".join(wins) + "'/>", "preserveAspectRatio='none'"))

# ---------- 飾り（角など）。モチーフは左上を原点に描いて4隅へ ----------
CORN = [(0, 0, 1, 1), (100, 0, -1, 1), (100, 150, -1, -1), (0, 150, 1, -1)]
def corners(motif):
    return url(svg("0 0 100 150", "".join(f"<g transform='translate({a} {b}) scale({c} {d})'>{motif}</g>" for a, b, c, d in CORN), "preserveAspectRatio='none'"))
def spots(items): return url(svg("0 0 100 150", items, "preserveAspectRatio='none'"))
def star4(x, y, r): return f"<path d='M{x} {y-r}Q{x} {y} {x+r} {y}Q{x} {y} {x} {y+r}Q{x} {y} {x-r} {y}Q{x} {y} {x} {y-r}Z'/>"
SAKURA = "".join(f"<ellipse cx='11' cy='6.2' rx='3.6' ry='5.2' transform='rotate({a} 11 11)'/>" for a in range(0, 360, 72)) + "<circle cx='11' cy='11' r='2'/>"
LEAF = "<path d='M2 2C11 1 18 6 20 15C10 16 3 11 2 2Z'/><path d='M2 2C1 11 6 18 15 20C16 10 11 3 2 2Z'/>"
CRACK = ("<path d='M0 20L8 18L11 24L19 22' fill='none' stroke='#000' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/>"
         "<path d='M20 0L18 8L24 11L22 19' fill='none' stroke='#000' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/><circle cx='11' cy='24' r='1.6'/><circle cx='24' cy='11' r='1.6'/>")
STUD = "<path d='M9 2L16 9L9 16L2 9Z'/>"

FRAMES = [
 dict(id="gild", m=ring(rr(3.2, 7), rr(5.4, 5.2), rr(6.2, 4.6)), g="linear-gradient(135deg,#fff0b0,#e0a93a 28%,#fff3c0 50%,#c98a1e 74%,#f6d77a)", sh="#fffbe6", p=6, gl="#f6d77a88", dd=1),
 dict(id="argent", m=ring(chamfer(3.2, (14, 14, 14, 14)), chamfer(5.6, (11, 11, 11, 11)), chamfer(6.4, (10, 10, 10, 10))), g="linear-gradient(160deg,#fff,#b8c6dc 30%,#eef3fb 52%,#8fa3c4 78%,#f4f8ff)", sh="#ffffff", p=10, gl="#cfe0ffaa", dd=1),
 dict(id="sakura", m=ring(edges(2.6, 2.6, 5, False, 7)), g="linear-gradient(160deg,#ffe4ee,#ff9fc0 45%,#ffd0e0 70%,#ff86b0)", p=5, mo=corners(SAKURA), go="radial-gradient(circle at 50% 50%,#fff,#ffc0d6 60%,#ff8fb4)", gl="#ffa8c855", dd=1, cd=1, ca="frt"),
 dict(id="wakaba", m=ring(rr(3, 6)), g="linear-gradient(135deg,#d7f5a8,#6cc070 40%,#2f8f55 70%,#9ad87a)", sh="#f2ffd0", p=12, mo=corners(LEAF), go="linear-gradient(135deg,#f3ffb8,#7fd070 55%,#2f9a58)", cd=1, ca="frt"),
 dict(id="tsuru", m=ring(edges(2.8, 2.2, 4, True, 6)), g="linear-gradient(135deg,#1f6b45,#3fae6e 25%,#e9c868 50%,#3fae6e 75%,#1f6b45)", aa="frw", pa=12),
 dict(id="arch", m=ring(arch(4.4)), g="linear-gradient(150deg,#fff0e6,#f0b89f 35%,#fff2ea 55%,#d99577 80%,#f6cdb9)", sh="#fff", p=12,
      mo=spots(star4(10, 12, 5) + star4(90, 12, 5) + star4(10, 48, 3.2) + star4(90, 48, 3.2)), go="linear-gradient(160deg,#fff,#ffe29a)", cd=1, ca="frt"),
 dict(id="aurora", m=ring(rr(2.6, 6), rr(4.4, 4.5), rr(5, 4)), g="conic-gradient(from var(--a),#7ef0c8,#7ab8ff,#c79bff,#ff9bd3,#ffe08a,#7ef0c8)", aa="frs", pa=10, gl="#9ad8ff66", dd=1),
 dict(id="tomoshi", m=ring(flame(3.4)), g="linear-gradient(0deg,#ff4a22,#ff9a3a 45%,#ffd36e 78%,#fff2b8)", gl="#ff8a3acc", dd=1, da="frf", pd=3),
 dict(id="umi", m=ring(rr(3.6, 7), rr(5.6, 5), rr(6.5, 4.4)), g="linear-gradient(120deg,#0b4f7a,#1aa3b8 25%,#8fe6ee 50%,#1aa3b8 75%,#0b4f7a)", aa="frw", pa=10, gl="#5fe0e855", dd=1),
 dict(id="ouka", m=ring(crown(3.8)), g="linear-gradient(135deg,#f6e3ff,#b78af0 30%,#ffe58a 50%,#8a5ad8 75%,#e9d0ff)", sh="#fff4c0", p=6,
      mo=spots("".join(f"<g transform='translate({x} {y})'><path d='M0 -4.5L4.5 0L0 4.5L-4.5 0Z'/></g>" for x, y in [(50, 6.2), (6, 75), (94, 75), (50, 143.8)])), go="linear-gradient(160deg,#fff7c8,#ffd45e 55%,#e0a030)", cd=1, ca="frt"),
 dict(id="koori", m=ring(chamfer(3, (24, 8, 24, 8)), chamfer(5.6, (20, 6, 20, 6)), chamfer(6.4, (19, 5, 19, 5))), g="linear-gradient(135deg,#f2fdff,#a6e4f5 35%,#e8fbff 55%,#74c8e8 80%,#d9f6ff)", sh="#fff", p=10,
      mo=spots(star4(8, 8, 6) + star4(92, 142, 6) + star4(50, 4, 3)), go="#fff", cd=1, ca="frt"),
 dict(id="kintsugi", m=ring(rr(3.8, 5)), g="linear-gradient(160deg,#fffdf6,#efe6d2 55%,#fffaf0)", mo=corners(CRACK), go="linear-gradient(135deg,#fff1b0,#d9a331 50%,#fff1b0)", cd=1, ca="frt", gl="#ffe9a844", dd=1),
]

def frame_css():
    o = ["""@property --a{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes frs{to{--a:360deg}}
@keyframes frp{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes frw{from{background-position:0% 50%}to{background-position:100% 50%}}
@keyframes frt{0%,100%{opacity:.62}50%{opacity:1;filter:brightness(1.35)}}
@keyframes frf{0%,100%{opacity:.5}18%{opacity:.95}34%{opacity:.58}55%{opacity:1}76%{opacity:.52}}
@keyframes frh{to{filter:hue-rotate(360deg)}}
.fro{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit;z-index:1}
.fro>i{position:absolute;inset:0;border-radius:inherit;display:none;pointer-events:none}
.fro>i.a{display:block;background:var(--g);background-size:var(--gz,100% 100%);-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;animation:var(--aa,none) var(--pa,8s) linear infinite;animation-delay:var(--dl,0s)}
.fro>i.b{display:var(--bd,none);background:conic-gradient(from var(--a),transparent 0 62%,var(--sh,#fff) 80%,transparent 92%);-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;animation:frs var(--p,6s) linear infinite;animation-delay:var(--dl,0s)}
.fro>i.c{display:var(--cd,none);background:var(--go,#fff);-webkit-mask:var(--mo,none) 0 0/100% 100% no-repeat;mask:var(--mo,none) 0 0/100% 100% no-repeat;animation:var(--ca,none) 4s ease-in-out infinite;animation-delay:var(--dl,0s)}
.fro>i.d{display:var(--dd,none);box-shadow:inset 0 0 12px 1px var(--gl,#fff6);animation:var(--da,frp) var(--pd,4s) ease-in-out infinite;animation-delay:var(--dl,0s)}
"""]
    for x in FRAMES:
        v = [f"--m:{x['m']}", f"--g:{x['g']}"]
        if x.get("sh"): v += [f"--sh:{x['sh']}", "--bd:block", f"--p:{x.get('p',6)}s"]
        if x.get("aa"): v += [f"--aa:{x['aa']}", f"--pa:{x.get('pa',8)}s"]
        if x["aa"] == "frw" if x.get("aa") else False: v += ["--gz:300% 100%"]
        if x.get("mo"): v += [f"--mo:{x['mo']}", f"--go:{x['go']}", "--cd:block"]
        if x.get("ca"): v += [f"--ca:{x['ca']}"]
        if x.get("dd"): v += ["--dd:block", f"--gl:{x.get('gl','#fff6')}"]
        if x.get("da"): v += [f"--da:{x['da']}", f"--pd:{x.get('pd',4)}s"]
        o.append(f".fr-{x['id']}{{{';'.join(v)}}}")
    return "\n".join(o)

# ---------- 裏面 ----------
def pat_lattice(c="#fff", o=.22): return svg("0 0 20 20", f"<path d='M10 0L20 10L10 20L0 10Z' fill='none' stroke='{c}' stroke-opacity='{o}'/><circle cx='10' cy='10' r='1.2' fill='{c}' fill-opacity='{o}'/>")
def pat_petals(): return svg("0 0 40 40", "<g fill='#fff' fill-opacity='.4'><ellipse cx='9' cy='9' rx='3.2' ry='5.5' transform='rotate(-35 9 9)'/><ellipse cx='28' cy='24' rx='3.2' ry='5.5' transform='rotate(50 28 24)'/><ellipse cx='33' cy='6' rx='2.4' ry='4' transform='rotate(20 33 6)'/><ellipse cx='12' cy='32' rx='2.4' ry='4' transform='rotate(-70 12 32)'/></g>")
def pat_stars(): return svg("0 0 30 30", "<g fill='#fff'><path fill-opacity='.7' d='M7 3L8 6L11 7L8 8L7 11L6 8L3 7L6 6Z'/><circle cx='22' cy='20' r='.9' fill-opacity='.7'/><circle cx='14' cy='26' r='.7' fill-opacity='.5'/><circle cx='26' cy='6' r='.6' fill-opacity='.5'/></g>")
def pat_seigaiha(): return svg("0 0 24 12", "<g fill='none' stroke='#fff' stroke-opacity='.34'><circle cx='12' cy='12' r='11'/><circle cx='12' cy='12' r='7.5'/><circle cx='12' cy='12' r='4'/><circle cx='0' cy='0' r='11'/><circle cx='0' cy='0' r='7.5'/><circle cx='0' cy='0' r='4'/><circle cx='24' cy='0' r='11'/><circle cx='24' cy='0' r='7.5'/><circle cx='24' cy='0' r='4'/></g>")
def pat_asa(): return svg("0 0 24 24", "<path d='M0 0L24 24M24 0L0 24M12 0V24M0 12H24M0 0L12 12M24 0L12 12M0 24L12 12M24 24L12 12' fill='none' stroke='#fff' stroke-opacity='.3'/>")
def pat_arab(): return svg("0 0 32 32", "<g fill='none' stroke='#d9aa4a' stroke-opacity='.55'><path d='M0 16Q8 2 16 16T32 16'/><path d='M0 0Q8 14 16 0T32 0'/><path d='M0 32Q8 18 16 32T32 32'/></g><circle cx='16' cy='16' r='1.6' fill='#d9aa4a' fill-opacity='.7'/>")
def pat_snow(): return svg("0 0 28 28", "<g stroke='#fff' stroke-opacity='.55' stroke-linecap='round'><path d='M7 3V11M3 7H11M4.2 4.2L9.8 9.8M9.8 4.2L4.2 9.8'/><path d='M21 17V23M18 20H24'/></g><circle cx='22' cy='6' r='1' fill='#fff' fill-opacity='.6'/>")
def pat_fiber(): return svg("0 0 40 40", "<g stroke='#a88a55' stroke-opacity='.22' stroke-linecap='round'><path d='M3 8L12 5M20 14L31 18M8 28L19 31M30 33L37 29M26 4L35 7'/></g>")
def pat_dots(): return svg("0 0 14 14", "<circle cx='7' cy='7' r='1.3' fill='#fff' fill-opacity='.2'/>")

def E(body): return url(svg("0 0 100 100", body))
EM = {
 "sprout": E("<path d='M50 90V46' stroke='#000' stroke-width='5' stroke-linecap='round'/><path d='M50 54C30 56 18 42 16 26C36 26 48 36 50 54Z'/><path d='M50 48C52 30 64 18 84 16C84 36 72 48 50 48Z'/>"),
 "leaf": E("<path d='M50 90C20 70 14 36 50 10C86 36 80 70 50 90Z' fill='none' stroke='#000' stroke-width='5' stroke-linejoin='round'/><path d='M50 18V96M50 50L34 38M50 64L66 50' fill='none' stroke='#000' stroke-width='4' stroke-linecap='round'/>"),
 "sakura": E("".join(f"<ellipse cx='50' cy='27' rx='13' ry='20' transform='rotate({a} 50 50)'/>" for a in range(0, 360, 72)) + "<circle cx='50' cy='50' r='6' fill='#fff' fill-opacity='.0'/>"),
 "moon": E("<path d='M64 8A42 42 0 1 0 64 92A34 34 0 1 1 64 8Z'/><path d='M78 30L81 38L89 41L81 44L78 52L75 44L67 41L75 38Z'/>"),
 "crest": E("<path d='M50 6L94 50L50 94L6 50Z' fill='none' stroke='#000' stroke-width='5'/><path d='M50 26L74 50L50 74L26 50Z' fill='none' stroke='#000' stroke-width='4'/><circle cx='50' cy='50' r='7'/>"),
 "snow": E("<g stroke='#000' stroke-width='5' stroke-linecap='round' fill='none'><path d='M50 8V92M14 29L86 71M86 29L14 71'/><path d='M40 16L50 26L60 16M40 84L50 74L60 84M20 44L32 40L26 28M80 56L68 60L74 72M80 44L68 40L74 28M20 56L32 60L26 72'/></g>"),
 "flame": E("<path d='M50 6C58 28 78 40 74 64C72 80 62 92 50 92C38 92 26 80 26 64C26 52 34 46 38 36C42 44 44 48 46 50C50 40 48 24 50 6Z'/>"),
 "wave": E("<g fill='none' stroke='#000' stroke-width='6' stroke-linecap='round'><path d='M8 36Q29 12 50 36T92 36'/><path d='M8 58Q29 34 50 58T92 58'/><path d='M8 80Q29 56 50 80T92 80'/></g>"),
 "seal": E("<circle cx='50' cy='50' r='38' fill='none' stroke='#000' stroke-width='6'/><circle cx='50' cy='50' r='22' fill='none' stroke='#000' stroke-width='4'/><circle cx='50' cy='50' r='7'/>"),
 "enso": E("<path d='M70 18A38 38 0 1 0 86 58' fill='none' stroke='#000' stroke-width='10' stroke-linecap='round'/>"),
 "asa": E("<path d='M50 8L88 72H12Z M50 92L12 28H88Z' fill='none' stroke='#000' stroke-width='5' stroke-linejoin='round'/><circle cx='50' cy='50' r='6'/>"),
 "diamond": E("<path d='M50 6L66 34L94 50L66 66L50 94L34 66L6 50L34 34Z' fill='none' stroke='#000' stroke-width='5' stroke-linejoin='round'/><circle cx='50' cy='50' r='8'/>"),
}
BACKS = [
 dict(id="std", b="linear-gradient(160deg,#c08aa9,#8a4a7d)", pat=pat_dots(), pz="14px", ring=ring(rr(5, 8)), rg="linear-gradient(160deg,#ffffffcc,#ffffff66)", em="sprout", eg="linear-gradient(180deg,#fff,#ffe6f2)", an="none"),
 dict(id="moss", b="linear-gradient(160deg,#6dbb8c,#1f5e45)", pat=pat_lattice(), pz="20px", ring=ring(chamfer(5, (14,14,14,14)), chamfer(7.4, (11,11,11,11)), chamfer(8.2, (10,10,10,10))), rg="linear-gradient(160deg,#eaffd0,#8fd18a)", em="leaf", eg="linear-gradient(180deg,#f4ffd8,#9be08a)", an="drift", dx="20px", dy="20px", p=20),
 dict(id="fubuki", b="linear-gradient(160deg,#ffd0e0,#e0709a)", pat=pat_petals(), pz="40px", ring=ring(edges(4.5, 2.4, 5, False, 7)), rg="linear-gradient(160deg,#fff,#ffd0e0)", em="sakura", eg="linear-gradient(160deg,#fff,#ffc2d8 70%,#ff9fbe)", an="drift", dx="-40px", dy="40px", p=15),
 dict(id="hoshi", b="linear-gradient(170deg,#2b3d86,#0a1030)", pat=pat_stars(), pz="30px", ring=ring(arch(5)), rg="linear-gradient(160deg,#dfe8ff,#8fa6e8)", em="moon", eg="linear-gradient(160deg,#fffbe0,#ffe28a)", an="twinkle", p=4),
 dict(id="karakusa", b="linear-gradient(160deg,#25252b,#0a0a0d)", pat=pat_arab(), pz="32px", ring=ring(rr(4.6, 6), rr(6.6, 4.5), rr(7.4, 4)), rg="linear-gradient(135deg,#fff0b0,#d9a331 50%,#fff0b0)", em="crest", eg="linear-gradient(160deg,#fff3c0,#d9a331 60%,#a87414)", an="sweep", sw="#ffe9a899", p=6),
 dict(id="seigaiha", b="linear-gradient(170deg,#5fb4e4,#14518c)", pat=pat_seigaiha(), pz="24px 12px", ring=ring(rr(5, 8), rr(7.2, 6), rr(8, 5.2)), rg="linear-gradient(160deg,#fff,#bfe4ff)", em="wave", eg="linear-gradient(180deg,#fff,#d4efff)", an="drift", dx="24px", dy="0px", p=10),
 dict(id="asanoha", b="linear-gradient(160deg,#e8605a,#8f1f2e)", pat=pat_asa(), pz="24px", ring=ring(chamfer(4.6, (22,6,22,6)), chamfer(7, (18,4,18,4)), chamfer(7.8, (17,3,17,3))), rg="linear-gradient(160deg,#fff4d8,#f0c070)", em="asa", eg="linear-gradient(160deg,#fff4d8,#ffd27a)", an="sweep", sw="#ffffff88", p=6),
 dict(id="kyokko", b="linear-gradient(170deg,#0c3a4e,#071a2c)", pat="none", pz="100%", ring=ring(rr(5, 9), rr(6.6, 7.4), rr(7.4, 6.6)), rg="conic-gradient(from var(--a),#7ef0c8,#7ab8ff,#c79bff,#ff9bd3,#7ef0c8)", em="diamond", eg="conic-gradient(from var(--a),#7ef0c8,#7ab8ff,#c79bff,#ff9bd3,#7ef0c8)", an="hue", p=10, spin=1),
 dict(id="washi", b="linear-gradient(160deg,#fcf5e3,#e6d6b0)", pat=pat_fiber(), pz="40px", ring=ring(rr(5, 4), rr(6.8, 3), rr(7.6, 2.6)), rg="linear-gradient(160deg,#b9824a,#7a4a22)", em="seal", eg="linear-gradient(160deg,#e8554a,#a3261f)", an="pulse", p=3),
 dict(id="kagaribi", b="linear-gradient(0deg,#ff9a3a,#c2421a 40%,#3a0d0d)", pat="none", pz="100%", ring=ring(flame(5)), rg="linear-gradient(0deg,#ffd36e,#ff9a3a)", em="flame", eg="linear-gradient(0deg,#fff2b8,#ffd36e 55%,#ff9a3a)", an="pulse", p=3),
 dict(id="hyouka", b="linear-gradient(160deg,#e2f8ff,#6fb9e0)", pat=pat_snow(), pz="28px", ring=ring(chamfer(4.4, (26,8,26,8)), chamfer(6.8, (22,6,22,6)), chamfer(7.6, (21,5,21,5))), rg="linear-gradient(135deg,#fff,#a6e4f5 55%,#fff)", em="snow", eg="linear-gradient(160deg,#fff,#b8ecff)", an="twinkle", p=4),
 dict(id="sumi", b="radial-gradient(circle at 30% 25%,#fafaf6,#d9d9d2 45%,#3a3a3a 100%)", pat="none", pz="100%", ring=ring(rr(5, 6), rr(6.8, 4.5), rr(7.6, 4)), rg="linear-gradient(160deg,#444,#111)", em="enso", eg="linear-gradient(160deg,#333,#000)", an="spin", p=20, spin=1),
]
def back_css():
    o = ["""@keyframes bks{from{background-position:85% 0}to{background-position:15% 0}}
@keyframes bkd{from{background-position:0 0}to{background-position:var(--dx,0px) var(--dy,0px)}}
@keyframes bkt{0%,100%{opacity:.12}50%{opacity:1}}
@keyframes bkp{0%,100%{filter:none}50%{filter:brightness(1.45) drop-shadow(0 0 5px #ffd27a)}}
.bk:not(.oc){position:relative}
.bk{overflow:hidden;display:block;background:var(--b);box-shadow:0 3px 8px #0005,inset 0 0 0 1px #ffffff55}
.bk>i{position:absolute;inset:0;border-radius:inherit;display:block;pointer-events:none}
.bk>i.p{background-image:var(--bp,none);background-size:var(--bz,auto);background-repeat:repeat}
.bk>i.r{background:var(--rg);-webkit-mask:var(--rm) 0 0/100% 100% no-repeat;mask:var(--rm) 0 0/100% 100% no-repeat}
.bk>i.e{background:var(--eg);-webkit-mask:var(--em) 50% 50%/54% auto no-repeat;mask:var(--em) 50% 50%/54% auto no-repeat}
.bk>i.s{display:none}
.bk.a-drift>i.p{animation:bkd var(--p,20s) linear infinite;animation-delay:var(--dl,0s)}
.bk.a-sweep>i.s{display:block;background:linear-gradient(105deg,transparent 38%,var(--sw,#ffffff80) 50%,transparent 62%);background-size:300% 100%;animation:bks var(--p,6s) linear infinite;animation-delay:var(--dl,0s)}
.bk.a-twinkle>i.s{display:block;background:radial-gradient(circle at 22% 20%,#fff 0 1.6%,transparent 3.4%),radial-gradient(circle at 74% 34%,#fff 0 1.2%,transparent 3%),radial-gradient(circle at 40% 76%,#fff 0 1.5%,transparent 3.2%),radial-gradient(circle at 84% 82%,#fff 0 1.1%,transparent 2.8%);animation:bkt var(--p,4s) ease-in-out infinite;animation-delay:var(--dl,0s)}
.bk.a-pulse>i.e{animation:bkp var(--p,3s) ease-in-out infinite;animation-delay:var(--dl,0s)}
.bk.a-spin>i.s,.bk.a-hue>i.s{display:block;background:conic-gradient(from var(--a),#fff0,#ffffff66 25%,#fff0 50%,#0003 75%,#fff0);mix-blend-mode:overlay;animation:frs var(--p,20s) linear infinite;animation-delay:var(--dl,0s)}
.bk.a-hue>i.r,.bk.a-hue>i.e,.bk.a-spin>i.e{animation:frs var(--p,10s) linear infinite;animation-delay:var(--dl,0s)}
"""]
    for x in BACKS:
        v = [f"--b:{x['b']}", f"--bp:{url(x['pat']) if x['pat']!='none' else 'none'}", f"--bz:{x['pz']}", f"--rm:{x['ring']}", f"--rg:{x['rg']}", f"--em:{EM[x['em']]}", f"--eg:{x['eg']}"]
        if x.get("p"): v.append(f"--p:{x['p']}s")
        if x.get("sw"): v.append(f"--sw:{x['sw']}")
        if x.get("dx") is not None: v += [f"--dx:{x['dx']}", f"--dy:{x['dy']}"]
        o.append(f".bk-{x['id']}{{{';'.join(v)}}}")
    return "\n".join(o)

css = "/* @@CUSTOM-BEGIN（tools/gencustom.py が生成。手で編集しない） */\n" + frame_css() + "\n" + back_css() + "\n/* @@CUSTOM-END */"
p = R / "style.css"; t = p.read_text(encoding="utf-8")
if "@@CUSTOM-BEGIN" in t:
    t = re.sub(r"/\* @@CUSTOM-BEGIN.*?@@CUSTOM-END \*/", lambda m: css, t, flags=re.S)
else:
    t = t.rstrip("\n") + "\n\n" + css + "\n"
p.write_text(t, encoding="utf-8"); print("ok", len(css) // 1024, "KB")

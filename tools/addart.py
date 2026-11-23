#!/usr/bin/env python3
"""素材zip展開ディレクトリ(layout.json+images)から、レイヤーWebP・アイコン・ARTV・CSSを生成して public/ に反映する。
使い方: python3 tools/addart.py <展開dir> <キー(2〜3字)> <カード名> [<カード名>...]  ※ 名前は ART に入れる名前（1つ）
冪等: すでに ART にあるキーはスキップ。"""
import json,sys,hashlib,io,re,os
import numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/public'
def h6(b): return hashlib.md5(b).hexdigest()[:6]
def save(im,pref,q=80):
    buf=io.BytesIO(); im.save(buf,'WEBP',quality=q,method=6); b=buf.getvalue(); n=f'{pref}-{h6(b)}.webp'
    open(f'{R}/img/{n}','wb').write(b); return n
def pad_bg(im):
    a=np.array(im.convert('RGB')); a=np.pad(a,((49,49),(75,75),(0,0)),mode='reflect'); return Image.fromarray(a)
def num(x):
    x=round(float(x),2); return str(int(x)) if x==int(x) else str(x)
def build(d,key,name):
    L=json.load(open(f'{d}/layout.json')); css=[];arts=[]
    for l in L['layers']:
        im=Image.open(f"{d}/images/{l['file']}").convert('RGBA')
        role='bg' if l['kind']=='background' else re.search(r'_(main|sub\d*)\.png$',l['file']).group(1).replace('sub1','sub')
        if role=='bg': n=save(pad_bg(im).resize((496,664),Image.LANCZOS),f'al-{key}-bg')
        else: n=save(im.resize((420,614),Image.LANCZOS),f'al-{key}-{role}')
        css.append(f'.al-{key}-{role}{{background-image:url(img/{n})}}')
        if role!='bg':
            p=l['parallaxAtFullTilt'];o=l['position']
            arts.append('['+','.join([f'"{role}"',num(p['shiftXPercent']),num(p['shiftYPercent']),num(o['offsetXPercent']),num(o['offsetYPercent']),num(l['scalePercent']),num(l['rotationDeg']),num(l['anchorYPercent'])])+']')
    ic=Image.open(f"{d}/images/"+[f for f in os.listdir(f'{d}/images') if f.endswith('_icon.png')][0]).convert('RGBA').resize((128,128),Image.LANCZOS)
    ni=save(ic,f'i-{key}')
    t=L['tilt'];b=t['background'];g=b['groundGradient']['maxShiftAtFullTiltPercent'];s=b['skyShiftAtFullTiltPercent']
    ex=f',tilt:{num(t["maxTiltDeg"])}' if t['maxTiltDeg']!=7 else ''
    artv=f'{key}:{{...base,hz:{num(b["horizonYPercent"]/100)}{ex}, gs:[{num(g["x"])},{num(g["y"])}],sky:[{num(s["x"])},{num(s["y"])}],L:[{",".join(arts)}]}}'
    return css,ni,artv
if __name__=='__main__':
    d,key,name=sys.argv[1:4]; css,ni,artv=build(d,key,name); print(json.dumps({'css':css,'icon':ni,'artv':artv},ensure_ascii=False))

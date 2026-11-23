#!/usr/bin/env python3
"""手札・一覧・ホーム用の合成画像(card-ill-ac-キー.webp 300x501)を、詳細表示の正面状態から撮る。
使い方: python3 tools/snap.py キー=カード名 ...   → 画像を public/img に書き、CSSの1行ずつを標準出力へ"""
import asyncio,threading,http.server,functools,sys,io,hashlib,os
from PIL import Image
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/public'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=R))
threading.Thread(target=srv.serve_forever,daemon=True).start()
async def main(pairs,out):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1400,'height':900})
        await pg.route('**/fonts.g*/**',lambda r:r.abort())
        await pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/index.html'); await pg.wait_for_timeout(1500)
        for k,n in pairs:
            await pg.evaluate('(n)=>{window.mulligan=async()=>{};hmDetail(n)}',n); await pg.wait_for_timeout(3500)
            await pg.evaluate('''()=>{const d=document.querySelector("#hmdt .dcard .ib");d.style.cssText+=";background:none;transform:none";
              [...d.children].forEach(c=>{if(!c.classList.contains("stk"))c.style.display="none"});
              const s=d.querySelector(".stk");s.style.overflow="visible";s.style.borderRadius="0";
              d.querySelectorAll(".ly").forEach(l=>{l.style.transform=l.dataset.b});const w=d.querySelector(".wg");if(w)w.style.display="none"}''')
            await pg.mouse.move(5,5); await pg.wait_for_timeout(600)
            cv=await pg.query_selector('#hmdt .dcard .cv'); png=await cv.screenshot()
            ibw=await pg.evaluate('document.querySelector("#hmdt .dcard .ib").getBoundingClientRect().width')
            im=Image.open(io.BytesIO(png)).convert('RGB'); W,H=im.size; cw=round(W*ibw/ W*0+ibw) if False else round(ibw)
            x0=(W-cw)//2; im=im.crop((x0,0,x0+cw,H)).resize((300,501),Image.LANCZOS)
            buf=io.BytesIO(); im.save(buf,'WEBP',quality=80,method=6); bb=buf.getvalue(); nm=f'card-ill-ac-{k}-{hashlib.md5(bb).hexdigest()[:6]}.webp'
            open(f'{R}/img/{nm}','wb').write(bb); out.append(f'.card.ill.ac-{k},.dkc.ill.ac-{k}{{background-image:url(img/{nm})}}'); print(k,n,W,H,ibw,file=sys.stderr)
        await b.close()
if __name__=='__main__':
    pairs=[a.split('=') for a in sys.argv[1:]]; out=[]; asyncio.run(main(pairs,out)); print('\n'.join(out))

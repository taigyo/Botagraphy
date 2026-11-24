#!/usr/bin/env python3
"""CPU同士を戦わせて強さの序列を確かめる（待ち時間を消して高速に回す）。
使い方: python3 tools/cputest.py 0.12 0.5 [games=20] [par=4] [左のaiPlan上書きJSON] [右の同JSON] [syn＝シナジー系カードだけのデッキで戦う]   → 左の勝率を表示
  例（新旧比較）: python3 tools/cputest.py 0.92 0.92 40 8 '{}' '{"syn":0,"ord":false,"K":21}'
左=プレイヤー側(S.bot0)、右=CPU側(BM.lv)。デッキは毎試合ランダムに同じ分布で作る。"""
import asyncio,threading,http.server,functools,sys,os
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/public'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=R))
threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP='''([a,b,oa,ob,sy])=>{window.mulligan=async()=>{};
 const mains=MAINS,oth=sy?NORM.filter(aiDep):NORM,pk=L=>L[Math.floor(Math.random()*L.length)];
 const mk=id=>({id,name:id,main:pk(mains).n,k:[...oth].sort(()=>Math.random()-.5).slice(0,12).map(c=>c.n)});
 DKS.push(mk("ta"),mk("tb"));BM.my="ta";BM.cpu="tb";BM.lv=b;soloStart();
 S.bot0=1;S.lv[0]=a;S.opt=[oa,ob];
 return new Promise(res=>{const t0=Date.now(),t=setInterval(()=>{
  if(S.over||Date.now()-t0>90000){clearInterval(t);res([S.pts[0],S.pts[1],S.turn,S.over?1:0])}
  else if(!S.busy&&!S.pk&&!S.st.length&&S.turn>0){S.st=aiPlan(0,S.lv[0],S.opt[0]).map(p=>({...p,h:0}));commit()}},0)})}'''
async def game(br,a,b,oa,ob,sy):
    pg=await br.new_page(viewport={'width':1400,'height':900})
    async def r02(route):
        resp=await route.fetch();body=await resp.text()
        assert 'sleep=ms=>new Promise(r=>setTimeout(r,ms))' in body
        await route.fulfill(response=resp,body=body.replace('sleep=ms=>new Promise(r=>setTimeout(r,ms))','sleep=ms=>Promise.resolve()'))
    await pg.route('**/js/02-battle.js',r02);await pg.route('**/fonts.g*/**',lambda r:r.abort())
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(f'http://127.0.0.1:{srv.server_address[1]}/index.html');await pg.wait_for_timeout(300)
    r=await pg.evaluate(SETUP,[a,b,oa,ob,sy]);await pg.close();return r,errs
async def main(a,b,n,par,oa,ob,sy):
    async with async_playwright() as p:
        br=await p.chromium.launch();w=l=d=0;errs=set();sem=asyncio.Semaphore(par);bad=0
        async def one():
            nonlocal w,l,d,bad
            async with sem:
                r,e=await game(br,a,b,oa,ob,sy);errs.update(e)
                if not r[3]:bad+=1
                elif r[0]>r[1]:w+=1
                elif r[1]>r[0]:l+=1
                else:d+=1
        await asyncio.gather(*[one() for _ in range(n)])
        print(f'lv {a}{oa or ""} vs {b}{ob or ""}: win {w} lose {l} draw {d} unfinished {bad}  winrate(left)={w/max(1,w+l+d):.0%}')
        for e in list(errs)[:5]:print('ERR',e[:200])
        await br.close()
a,b=float(sys.argv[1]),float(sys.argv[2]);n=int(sys.argv[3]) if len(sys.argv)>3 else 20;par=int(sys.argv[4]) if len(sys.argv)>4 else 4
import json
oa=json.loads(sys.argv[5]) if len(sys.argv)>5 else None;ob=json.loads(sys.argv[6]) if len(sys.argv)>6 else None
sy=len(sys.argv)>7 and sys.argv[7]=='syn'
asyncio.run(main(a,b,n,par,oa,ob,sy))

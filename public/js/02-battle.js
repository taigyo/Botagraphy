const $=i=>document.getElementById(i),rnd=n=>Math.floor(Math.random()*n),sleep=ms=>{const s=S;return new Promise(r=>setTimeout(()=>{if(!(s&&s.halt))r()},ms))};
const dr=o=>{const c=S.deck[o].pop();if(c&&S.hand[o].length<7){c.nw=Date.now();S.hand[o].push(c)}else if(c&&o===0)setTimeout(()=>vanish2(c),600)};
const ar=i=>(i>=18?2:0)+(i%6>=3?1:0);
let S;
/* ---- ゲームログ：公開された出来事だけを S.lg に積む（表示は 12-battle-ui.js） ---- */
const OWN=o=>o===0?"あなた":OPN(),cellN=i=>`${AN[ar(i)]}エリア・${(i/6|0)+1}行${i%6+1}列`;let RMW="";
const LG=(k,o,h)=>{if(!S)return;(S.lg||(S.lg=[])).push({t:S.turn,k,o,h:esc(h)});if(typeof lgLive==="function")lgLive()};
const lgArea=(sm,w)=>LG("area",-1,"エリア判定　"+AN.map((a,i)=>`${a} ${sm[i][0]}–${sm[i][1]}${w[i]===0?"◯":w[i]===1?"●":"△"}`).join("　"));
/* 対戦を今すぐ終わらせる（降参・不戦勝）。進行中の演出は sleep が止まるので、そのまま止まる */
function forceEnd(res,msg,o){if(!S||S.over)return false;o=o||{};S.halt=1;S.oPend=0;S.over=true;S.res=res;S.busy=false;
  if(S.pk){S.pk=null;$("pp").classList.remove("on")}
  S.fx=null;S.hide.clear();S.stk=null;S.eff=0;S.jq=[];S.sel=null;
  if(S.st.length){[...S.st].sort((a,b)=>a.h-b.h).forEach(s=>S.hand[0].splice(Math.min(s.h,S.hand[0].length),0,s.card));S.st=[]}
  S.log=msg;if(o.nopay)S.paid=1;if(!PIN)info.classList.remove("on");finfo.classList.remove("on");
  render();finale(res);if(BM.st&&!NET.on)stageEnd(res);return true}
function init(){$("pp").classList.remove("on");$("sres").classList.remove("on");if(typeof stageUi==="function")stageUi();const og=$("mg");if(og)og.remove();
  const win=Math.max(1,Math.min(20,+$("win").value||5));$("win").value=win;
  S={win,max:win*3,turn:0,mana:[0,0],hand:[[],[]],board:Array(36).fill(null),pts:[0,0],st:[],sel:null,over:false,busy:false,log:"",res:"",hide:new Set(),fx:null,jq:[],pop:null,ini:0,nm:[0,0],stk:null,lv:[.5,Math.max(0,Math.min(1,BM.st?BM.st.lv:BM.lv==null?.5:BM.lv))],deck:[myDeck(BM.my||ACT),BM.st?stageDeck(BM.st):BM.cpu==="preset"||!DKS.some(d=>d.id===BM.cpu)?mkDeck("f").filter(c=>c.m!==0):myDeck(BM.cpu)]};
  if(typeof bui==="function")bui();
  const MN=[0,1].map(o=>S.deck[o].find(c=>c.m===1));for(let i=0;i<3;i++){dr(0);dr(1)}
  const s0=S;S.busy=true;mulligan().then(()=>{if(S!==s0)return;const tkf=o=>CARDS.find(c=>c.n===(MN[o]&&MN[o].tk||"牡丹のはなびら"));S.hand[0].push({...tkf(0),nw:Date.now()});S.hand[1].push({...tkf(1)});S.busy=false;next()});
}
async function next(){
  const s0=S;S.busy=true;S.turn++;LG("turn",-1,"");banner(S.turn);const g=S.turn>=4?3:2;S.mana[0]+=g+S.nm[0];S.mana[1]+=g+S.nm[1];S.nm=[0,0];
  if(S.turn>1){render();await sleep(1400);if(S!==s0)return;await sweep();if(S!==s0)return;S.eff=0;if(!PIN)info.classList.remove("on");finfo.classList.remove("on");S.ini^=1;dr(0);dr(1)}
  S.st=[];S.sel=null;S.busy=false;if(NET.on)NET.t0=Date.now();render();
}
const left=()=>S.mana[0]-S.st.reduce((a,s)=>a+s.card.c,0);
function sums(){const s=[[0,0],[0,0],[0,0],[0,0]];S.board.forEach((b,i)=>{if(b)s[ar(i)][b.o]+=pw(b,i)});return s}
function wins(){return sums().map(([a,b])=>a>b?0:b>a?1:2)}
/* CPUの思考は js/10-cpu.js（cpu()・aiPlan・cpuPick） */
async function commitOld(){
  if(S.over||S.busy)return;
  S.busy=true;S.mg=[0,0];
  const mine=S.st.map(s=>({...s,o:0})),theirs=cpu().map(s=>({...s,o:1}));
  S.st=[];
  const all=[],n=Math.max(mine.length,theirs.length);
  for(let i=0;i<n;i++){if(mine[i])all.push(mine[i]);if(theirs[i])all.push(theirs[i])}
  all.forEach(s=>S.mana[s.o]-=s.card.c);
  const by={};all.forEach(s=>(by[s.cell]=by[s.cell]||[]).push(s));
  const ev=[],done=new Set(),back=s=>{S.hand[s.o].push(s.card);S.mana[s.o]+=s.card.c};
  all.forEach(s=>{
    if(done.has(s.cell))return;done.add(s.cell);S.hide.add(s.cell);
    const l=by[s.cell];
    if(l.length===1){S.board[s.cell]={o:s.o,card:s.card};ev.push({t:"p",cell:s.cell});return}
    const[a,b]=l[0].o===0?l:[l[1],l[0]],txt=`${a.card.e}${a.card.p}⚔${b.card.e}${b.card.p}`;
    let lose;
    if(a.card.p>b.card.p){S.board[s.cell]={o:0,card:a.card};back(b);lose=b.card.e}
    else if(b.card.p>a.card.p){S.board[s.cell]={o:1,card:b.card};back(a);lose=a.card.e}
    else{back(a);back(b);lose=a.card.e+b.card.e}
    ev.push({t:"c",cell:s.cell,txt,lose});
  });
  render();await sleep(300);
  for(const e of ev){
    if(e.t==="p"){S.hide.delete(e.cell);S.fx={cell:e.cell,k:"drop"};render();await sleep(480)}
    else{S.fx={cell:e.cell,k:"clash",txt:e.txt};render();await sleep(800);
      S.hide.delete(e.cell);S.fx={cell:e.cell,k:"drop",gone:e.lose};render();await sleep(700)}
  }
  S.fx=null;S.hide.clear();render();await sleep(300);
  // 効果発動: イニシアチブ側から、出した順。衝突で戻ったカードは不発
  const stay=all.filter(s=>S.board[s.cell]&&S.board[s.cell].card===s.card).map(s=>S.board[s.cell]);
  const fxs=(L,w)=>L.flatMap(b=>b.card.f.filter(f=>f.w===w).map(f=>[b,f,S.board.indexOf(b)])).sort((p,q)=>p[2]-q[2]);
  const run=async L=>{for(const[b,f]of L){const i=S.board.indexOf(b);if(i<0)continue;S.eff=1;showCard(b.card,pw(b,i));S.fx={cell:i,k:"clash",c:f.a,txt:LBL[f.a](f.v).replace("同エリア","")};render();await sleep(1100);const A=f.a==="buff"?S.board.map((x,j)=>x&&x!==b&&x.o===b.o&&ar(j)===ar(i)?j:-1):f.a==="debuff"?S.board.map((x,j)=>x&&x.o!==b.o&&ar(j)===ar(i)?j:-1):["self","grow"].includes(f.a)?[i]:[];EF[f.a](b,i,f.v);S.fx=null;render();A.filter(j=>j>=0).forEach(j=>{const el=document.querySelector(`#board [data-i="${j}"]`);if(el)el.classList.add(f.a==="debuff"?"dn":"up")});await sleep(900)}};
  await run(fxs(stay,"r"));await run(fxs(S.board.filter(Boolean),"e"));S.eff=0;info.classList.remove("on");
  const sm=sums(),w=wins();
  for(let i=0;i<4;i++){S.jq[i]={t:`${sm[i][0]}–${sm[i][1]}`,w:w[i],n:true};render();await sleep(750)}
  const c0=w.filter(x=>x===0).length,c1=w.filter(x=>x===1).length;
  await sleep(300);
  let msg="引き分けのターン（得点なし）";
  if(c0>c1){S.pts[0]++;S.pop=0;msg="あなたが1点"}else if(c1>c0){S.pts[1]++;S.pop=1;msg=OPN()+"が1点"}
  S.log=`エリア ${c0} – ${c1}：${msg}`;render();await sleep(900);
  S.jq=[];
  if(S.pts[0]>=S.win||S.pts[1]>=S.win||S.turn>=S.max){
    const t=sm.reduce((a,[x,y])=>[a[0]+x,a[1]+y],[0,0]);
    let r="引き分け";for(const[x,y]of[S.pts,[c0,c1],t]){if(x!==y){r=x>y?"あなたの勝ち":"CPUの勝ち";break}}
    S.over=true;S.res=r;S.busy=false;render();
  }else{S.busy=false;next()}
}
let PIN=null;
const actT=(o,c)=>{const f=c.f.find(x=>x.w==="a");return f?f.cells(o):[]};
const skh=(L,o)=>{const f=s=>o?`<i data-n="${L.indexOf(s)}"></i>`:`<i ${S.stk?"":"data-k=\""+S.st.indexOf(s)+"\""}${ART[s.card.n]?" class=\"ic ic-"+ART[s.card.n]+"\"":""}>${ART[s.card.n]?"":s.card.e}</i>`,a=L.filter(s=>s.cell<0),c=L.filter(s=>s.cell>=0);return(a.length?`<b class="g ac">${a.map(f).join("")}</b>`:"")+(c.length?`<b class="g">${c.map(f).join("")}</b>`:"")};
const selectAct=async ac=>{const f=ac.f.find(x=>x.w==="a"),T=f.cells(0);if(!T.length)return;const j=f.rnd?0:await pick(0,{cells:T,msg:f.msg+"（別の場所をクリックで取消）",cancel:true});if(j<0){render();return}const k=S.hand[0].indexOf(ac);if(k<0||ac.c>left()){render();return}S.st.push({card:ac,cell:-1,h:k,tg:j});S.hand[0].splice(k,1);S.sel=null;render()};
async function mulligan(){
  const s=S,H=s.hand[0];s.hand[0]=[];render();
  const face=c=>ibHTML(c,c.p,false);
  const mg=document.createElement("div");mg.id="mg";
  mg.innerHTML=`<h2>MULLIGAN</h2><p>入れ替えたいカードを選んでください（最大3枚）</p><div class="row">${H.map(c=>`<div class="slot" style="--ac:${IC[c.d]}">${face(c)}</div>`).join("")}</div><button id="mgb">Confirm</button>`;
  document.body.appendChild(mg);tiltKick();
  const sl=[...mg.querySelectorAll(".slot")],ease="cubic-bezier(.2,.85,.25,1)";
  const run=(els,kf,ms,fill)=>Promise.all(els.map((e,i)=>e.animate(kf,{duration:ms,delay:i*110,easing:ease,fill:fill||"none"}).finished));
  const OUT=[{transform:"translateX(0) rotate(0)",opacity:1},{transform:"translateX(120vw) rotate(16deg)",opacity:0}],IN=[{transform:"translateX(-120vw) rotate(-16deg)",opacity:0},{transform:"translateX(0) rotate(0)",opacity:1}];
  sl.forEach(e=>e.onclick=()=>e.classList.toggle("sel"));
  await new Promise(r=>$("mgb").onclick=r);$("mgb").disabled=true;
  const idx=sl.map((e,i)=>e.classList.contains("sel")?i:-1).filter(i=>i>=0);
  sl.forEach(e=>{e.classList.remove("sel");e.classList.add("lock")});
  if(idx.length){
    const els=idx.map(i=>sl[i]);await run(els,OUT,650,"forwards");
    const names=new Set(H.map(c=>c.n)),nw=[];
    for(const c of s.deck[0]){if(nw.length>=idx.length)break;if(!names.has(c.n)&&!nw.some(x=>x.n===c.n))nw.push(c)}
    nw.forEach(c=>s.deck[0].splice(s.deck[0].indexOf(c),1));
    const ret=idx.slice(0,nw.length).map(i=>H[i]);
    idx.forEach((i,k)=>{if(nw[k])H[i]=nw[k]});
    s.deck[0].push(...ret);s.deck[0].sort(()=>Math.random()-.5);
    els.forEach(e=>{e.style.opacity=0;e.getAnimations().forEach(a=>a.cancel())});
    const ch=[];idx.forEach((i,k)=>{if(nw[k]){sl[i].innerHTML=face(nw[k]);ch.push(sl[i])}});tiltKick();els.filter(e=>!ch.includes(e)).forEach(e=>e.style.opacity="");
    await run(ch,IN,750,"both");ch.forEach(e=>{e.getAnimations().forEach(a=>a.cancel());e.style.opacity=""});await sleep(600)}
  await sleep(500);await mg.animate([{opacity:1},{opacity:0}],{duration:600,easing:"ease-in",fill:"forwards"}).finished;mg.remove();
  H.forEach(c=>c.nw=Date.now());s.hand[0]=H;
}
const sweep=async()=>{const d=[];S.board.forEach((b,i)=>{if(b&&pw(b,i)<=0)d.push(i)});if(!d.length)return;d.forEach(i=>{const el=document.querySelector(`#board [data-i="${i}"] .cd`);if(el)el.classList.add("fo")});await sleep(700);RMW="パワー0で";await rm(d)};
const rm=async(ix,gs)=>{ix=ix.filter(i=>S.board[i]);if(!ix.length)return[];
 const g=gs||guardSet(),tr=[],dd=[];
 ix.forEach(i=>adj(i).forEach(j=>{const x=S.board[j];if(x&&!ix.includes(j))for(const f of x.card.f)if(f.w==="x"&&f.on(j,i))tr.push([x,j,f,i])}));
 const why=RMW;RMW="";ix.forEach(i=>{const b=S.board[i];S.board[i]=null;const gd=g[b.o]&&b.card.a.includes("木");LG("rm",b.o,`${b.card.n}が${why}撤去された${gd?"（手札に戻る）":""}（${cellN(i)}）`);if(gd){const c={...b.card,c:Math.max(0,b.card.c-1)};if(S.hand[b.o].length<7){c.nw=Date.now();S.hand[b.o].push(c)}else if(b.o===0)setTimeout(()=>vanish2(c),600)}else{(S.yard||(S.yard=[[],[]]))[b.o].push(b.card);for(const f of b.card.f)if(f.w==="d")dd.push([b,i,f])}});
 render();for(const[x,j,f,i]of tr)if(S.board[j]===x&&(!f.can||f.can(x,j,i)))await fire(x,j,f.run?{s:f.s,t:f.t,k:f.k||"up",run:(b,jj)=>f.run(b,jj,i)}:{s:"+1マナ",k:"up",run:()=>{gm(x.o,1)}});
 for(const[b,i,f]of dd)await fire(b,i,{s:f.s,t:f.t,k:f.k||"up",run:()=>f.run(b)});return ix};
const isAct=c=>!!c&&c.a.includes("アクション");
const pick=(o,{cells,hand,msg,cancel})=>new Promise(res=>{const L=cells||hand,sync=NET.on&&S.busy;if(o===1||S.bot0){if(sync)return netWait("choice").then(res);return res(cpuPick(o,L,{cells,hand,msg}))}S.pk={cells,hand,res:sync?v=>{netSend({k:"ch",v});res(v)}:res,cancel};$("pp").textContent=msg;$("pp").classList.add("on");render()});
document.addEventListener("click",e=>{if(!S.pk)return;if(e.target.closest("#tbar,#lgw,#ffw"))return;if(JD){e.stopPropagation();return}const c=e.target.closest("#board [data-i]"),h=e.target.closest("[data-h]");let v=null;
  if(c&&S.pk.cells&&S.pk.cells.includes(+c.dataset.i))v=+c.dataset.i;else if(h&&S.pk.hand&&S.pk.hand.includes(+h.dataset.h))v=+h.dataset.h;
  if(v===null){if(!S.pk.cancel)return;v=-1}e.stopPropagation();const t=c||h;if(v>=0&&t){const q=t.getBoundingClientRect(),p=document.createElement("i");p.className="rp";p.style.left=q.left+q.width/2+"px";p.style.top=q.top+q.height/2+"px";document.body.appendChild(p);setTimeout(()=>p.remove(),800)}const r=S.pk.res;S.pk=null;$("pp").classList.remove("on");render();r(v)},true);
const useAct=async s=>{const f=s.card.f.find(x=>x.w==="a");if(!f||!f.cells(s.o).length)return;LG("act",s.o,`アクション ${s.card.n}：${f.t||""}`);S.eff=1;showCard(s.card,null,1);castAt(s.o);S.fx=null;render();await sleep(1300);await f.use(s.o,f.rnd?-1:await pick(s.o,{cells:f.cells(s.o),msg:f.msg}));await drainQ();await mq();S.fx=null;render();await sweep()};
const drainQ=async()=>{if(S.pd||!S.q)return;while(S.q.length){const c=S.q.shift();if(S.board[c])await onPlace(c)}};
const fire=async(b,i,f)=>{
  if(f.off)return;const T=f.tg?f.tg(b,i):[];if(f.tg&&!T.length)return;let hv;
  if(f.hvf){if(NET.on&&b.o===1)hv=await netWait("out");else{hv=f.hvf(b,i);if(NET.on)netSend({k:"out",v:hv})}if(!hv)return}else if(f.ok&&!f.ok(b,i))return;
  const cc=(s,k)=>k==="dn"?"debuff":/移動|戻/.test(s)?"mv":"buff";
  LG("fx",b.o,`${b.card.n}：${f.t||f.s}`);
  S.eff=1;showCard(b.card,pw(b,i),1);
  const T0=T.map(j=>S.board[j]),hl=k=>T.forEach((j,n)=>{if(S.board[j]!==T0[n])return;const el=document.querySelector(`#board [data-i="${j}"]`);if(el)el.classList.add(k==="dn"?"dn":"up")});
  if(f.steps){
    for(const st of f.steps){let r;
      if(st.s){S.fx={cell:i,k:"clash",c:cc(st.s,st.k),txt:st.s};render();await sleep(1000)}
      r=await st.run(b,i,T);await mq();S.fx=null;render();if(st.hl)hl(st.k);await sleep(st.hl?800:300);if(r===false)break}
    await sleep(300);await sweep();await drainQ();return}
  S.fx={cell:i,k:"clash",c:cc(f.s,f.k),txt:f.s};render();await sleep(1100);
  await f.run(b,i,T,hv);await mq();S.fx=null;render();hl(f.k);await sleep(900);await sweep();await drainQ()};
const onPlace=async cell=>{S.pd=(S.pd||0)+1;try{
  const nb=S.board[cell];if(!nb)return;
  for(let j=0;j<36;j++){const sb=S.board[j];if(!sb||sb===nb)continue;
    for(const f of sb.card.f)if(f.w==="t"&&f.on(sb,j,nb,cell))await fire(sb,j,f.run?{...f,k:f.k||"up",run:(b2,i2,T2,hv)=>f.run(sb,j,nb,cell,hv)}:{s:"+"+f.n,k:"up",tg:()=>[cell],run:()=>{gb(cell,f.n)}})}
  for(const f of nb.card.f)if(f.w==="p")await fire(nb,cell,f);
  while(S.q.length){const c=S.q.shift();if(S.board[c])await onPlace(c)}}finally{S.pd--}};
async function commit(){
  if(S.over||S.busy)return;
  S.busy=true;S.mg=[0,0];S.ppl=[];render();
  const all=[...S.st.map(s=>({...s,o:0})),...(NET.on?await netPlans():cpu()).map(s=>({...s,o:1}))];
  S.st=[];S.oPend=all.filter(s=>s.o===1).length;if(NET.on)NET.pr=mul(NET.seed^Math.imul(S.turn+1,0x9E3779B1));all.forEach(s=>{S.mana[s.o]-=s.card.c;S.hide.add(s.cell)});S.ppl=all.filter(s=>s.cell>=0).map(s=>[s.cell,s.o]);
  S.stk=[all.filter(s=>s.o===0),[]];render();await battle();const th=all.filter(s=>s.o===1);for(let k=0;k<th.length;k++){S.stk=[S.stk[0],th.slice(0,k+1)];render();const e=document.querySelector('#sk1 [data-n="'+k+'"]');if(e)e.animate(SKIN,{duration:620,easing:"cubic-bezier(.2,.85,.25,1)"});await sleep(380)}await sleep(450);
  const sd=NET.on?relO(NET.pr()<.5?0:1):(Math.random()<.5?0:1);for(const s of[...all.filter(s=>s.cell<0&&s.o===sd),...all.filter(s=>s.cell<0&&s.o!==sd)]){S.stk=S.stk.map(L=>L.filter(x=>x!==s));if(s.o===1){S.oPend--;render()}await useAct(s)}
  const cs=[...new Set(all.filter(s=>s.cell>=0).map(s=>s.cell))].sort((a,b)=>a-b);S.pend=new Set(cs);S.q=[];S.pl={};all.forEach(s=>{if(s.cell>=0)(S.pl[s.cell]=S.pl[s.cell]||[]).push(s.o)});
  for(const cell of cs){S.pend.delete(cell);delete S.pl[cell];const oc=S.board[cell];S.board[cell]=null;const cp=s=>s.b?pw(s.b,cell):s.card.p;
    const l=[...(oc?[{o:oc.o,card:oc.card,b:oc,ex:1}]:[]),...all.filter(s=>s.cell===cell)];let win=l[0];if(l.length===1)LG("put",l[0].o,`${l[0].card.n} を ${cellN(cell)} に配置`);
    S.stk=S.stk.map(L=>L.filter(s=>!l.includes(s)));S.oPend-=l.filter(s=>s.o===1&&!s.ex).length;
    if(l.length>1){
      const[a,b]=l[0].o===0?l:[l[1],l[0]];win=cp(a)>cp(b)?a:cp(b)>cp(a)?b:null;LG("clash",-1,`${cellN(cell)}で衝突：${OWN(a.o)}の${a.card.n}(${cp(a)}) ⚔ ${OWN(b.o)}の${b.card.n}(${cp(b)}) → ${win?OWN(win.o)+"の"+win.card.n+"が勝ち":"相打ち（どちらも消える）"}`);
      l.forEach(s=>{if(s!==win&&!s.ex)S.mana[s.o]+=s.card.c});
      const ta=`${a.card.e}${cp(a)}⚔${b.card.e}${cp(b)}`;S.eff=1;S.fx={cell,k:"clash",c:"clash",txt:ta};render();showCard(a.card,cp(a),1);await sleep(1100);showCard(b.card,cp(b),1);await sleep(1100);S.fx={cell,k:"clash",c:win?"buff":"debuff",txt:win?`${win.card.e}${cp(win)} 勝利`:"相打ち"};render();await sleep(1300)}
    const gone=l.filter(s=>s!==win).map(s=>s.card.e).join("");
    S.hide.delete(cell);if(win)S.board[cell]=win.b||{o:win.o,card:win.card};S.eff=1;if(win){const bb=S.board[cell];showCard(bb.card,pw(bb,cell),1)}
    S.fx={cell,k:"drop",gone};render();await sleep(win?1500:1350);
    if(win&&!win.ex)await onPlace(cell)}
  S.oPend=0;S.fx=null;S.hide.clear();S.stk=null;S.eff=0;if(!PIN)info.classList.remove("on");finfo.classList.remove("on");render();await sleep(300);
  const sm=sums(),w=wins();
  for(let i=0;i<4;i++){S.jq[i]={t:`${sm[i][0]}–${sm[i][1]}`,w:w[i],n:true};render();areaAt(i,w[i]);await sleep(750)}
  const c0=w.filter(x=>x===0).length,c1=w.filter(x=>x===1).length;
  await sleep(300);
  let msg="引き分けのターン（得点なし）";
  if(c0>c1){S.pts[0]++;S.pop=0;msg="あなたが1点"}else if(c1>c0){S.pts[1]++;S.pop=1;msg=OPN()+"が1点"}
  lgArea(sm,w);LG("pt",c0>c1?0:c1>c0?1:-1,c0===c1?"引き分けのターン（得点なし）":`エリア ${c0}–${c1} で1点獲得（得点 ${S.pts[0]}–${S.pts[1]}）`);S.log=`エリア ${c0} – ${c1}：${msg}`;if(c0!==c1){flyPt(c0>c1?0:1);await sleep(1250)}render();await sleep(900);
  const over=S.pts[0]>=S.win||S.pts[1]>=S.win||S.turn>=S.max;
  if(!over){S.jq.forEach(q=>q&&(q.out=1));render();await sleep(700);S.jq=[];render();await sleep(200);{const wn=c0>c1?0:c1>c0?1:-1;if(wn>=0)for(let i=0;i<36;i++){const b=S.board[i];if(b&&b.o===wn)for(const f of b.card.f)if(f.w==="g")await fire(b,i,f)}}for(let i=0;i<36;i++){const b=S.board[i];if(b&&w[ar(i)]===1-b.o)for(const f of b.card.f)if(f.w==="l")await fire(b,i,f)}for(let i=0;i<36;i++){const b=S.board[i];if(b)for(const f of b.card.f)if(f.w==="e")await fire(b,i,f)}S.eff=0;if(!PIN)info.classList.remove("on");finfo.classList.remove("on")}
  S.jq=[];if(NET.on)netSum(over);
  if(over){
    const t=sm.reduce((a,[x,y])=>[a[0]+x,a[1]+y],[0,0]);
    let r="引き分け";for(const[x,y]of[S.pts,[c0,c1],t]){if(x!==y){r=x>y?"あなたの勝ち":"CPUの勝ち";break}}
    LG("end",-1,"対戦終了："+r.replace("CPU",OPN()));S.over=true;S.res=r;S.busy=false;render();finale(r);if(BM.st)stageEnd(r);
  }else{S.busy=false;next()}
}
function jig(big){const el=document.querySelector(".dp");if(!big&&el._a&&el._a.playState==="running")return;
  const R=big?["41% 59% 45% 55%/57% 41% 59% 43%","58% 42% 56% 44%/43% 58% 42% 57%","47% 53% 42% 58%/55% 45% 55% 45%"]:["46% 54% 48% 52%/52% 46% 54% 48%","54% 46% 53% 47%/47% 54% 46% 53%","49% 51% 47% 53%/52% 48% 52% 48%"],k=big?1.06:1.035,q=(k-1)/3;
  el._a=el.animate([{offset:.12,transform:`scale(${k},${2-k})`,borderRadius:R[0]},{offset:.38,transform:`scale(${2-k},${k})`,borderRadius:R[1]},{offset:.7,transform:`scale(${1+q},${1-q})`,borderRadius:R[2]}],{duration:big?720:820,easing:"ease-out"})}
document.querySelector(".dp").addEventListener("pointerenter",()=>jig(0));
for(let k=0;k<10;k++){const i=document.createElement("i");i.className="ob"+(k%3===0?" rg":"");i.style.cssText=`width:${24+Math.random()*110}px;height:${24+Math.random()*110}px;--d:${8+Math.random()*12}s;--t:-${Math.random()*10}s`;$("sun").appendChild(i)}
document.querySelectorAll("#sun .ob").forEach(o=>{const mv=()=>{const t=Math.random(),z=18+Math.random()*130;o.style.left=(4+t*78+(Math.random()-.5)*28)+"%";o.style.top=(2+Math.random()*78)+"%";o.style.width=o.style.height=z+"px";o.style.setProperty("--mx",(50+Math.random()*230)+"px");o.style.setProperty("--my",(30+Math.random()*170)+"px")};o.addEventListener("animationiteration",mv);mv()});
function unpin(){PIN=null;info.classList.remove("pin");info.classList.add("un");unpin.t=setTimeout(()=>info.classList.remove("un","on"),230)}
const FXL=document.createElement("div");FXL.id="fxl";document.body.appendChild(FXL);
const RM=matchMedia("(prefers-reduced-motion:reduce)").matches,puff=(e,kf,o)=>{e.animate(kf,o).onfinish=()=>e.remove();FXL.appendChild(e)},mkI=(c,css)=>{const e=document.createElement("i");e.className=c;e.style.cssText=css;return e};
function fxc(i){const e=document.querySelector(`#board [data-i="${i}"]`);if(!e)return null;const q=e.getBoundingClientRect();return{x:q.left+q.width/2,y:q.top+q.height/2,w:q.width}}
function windAt(i){const c=fxc(i);if(!c||RM)return;
  for(let k=0;k<10;k++){const a=Math.random()*6.28,d=c.w*(.7+Math.random()*.9),s=Math.random()<.5?-1:1;
    puff(mkI(k%3?"lf":"pt",`left:${c.x+Math.cos(a)*c.w*.15}px;top:${c.y+Math.sin(a)*c.w*.15}px`),[{transform:"translate(0,0) rotate(0) scale(.3)",opacity:0},{opacity:1,offset:.2},{transform:`translate(${Math.cos(a)*d*.6+s*18}px,${Math.sin(a)*d*.6-d*.3}px) rotate(${s*200}deg) scale(1)`,opacity:1,offset:.6},{transform:`translate(${Math.cos(a+s*.9)*d*1.3+40}px,${Math.sin(a)*d*.8+d*.4}px) rotate(${s*480}deg) scale(.7)`,opacity:0}],{duration:1650+Math.random()*750,delay:k*40,easing:"ease-out",fill:"backwards"})}
  for(let k=0;k<3;k++)puff(mkI("wd",`left:${c.x-c.w*1.1}px;top:${c.y+(k-1)*c.w*.28}px;width:${c.w*(1.2+k*.2)}px`),[{transform:"translateX(-30px) scaleX(.2)",opacity:0},{opacity:.9,offset:.35},{transform:`translateX(${c.w*1.6}px) scaleX(1)`,opacity:0}],{duration:800,delay:k*90,easing:"cubic-bezier(.3,.7,.2,1)",fill:"backwards"})}
function clashAt(i){const c=fxc(i);if(!c||RM)return;
  puff(mkI("sw",`left:${c.x}px;top:${c.y}px`),[{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(2.6)",opacity:0}],{duration:700,easing:"ease-out"});
  for(let k=0;k<12;k++){const a=k/12*6.28+Math.random()*.4,d=c.w*(.6+Math.random()*.6);
    puff(mkI("sh",`left:${c.x}px;top:${c.y}px`),[{transform:`rotate(${a}rad) translateX(${d*.15}px) scaleX(.4)`,opacity:1},{transform:`rotate(${a}rad) translateX(${d}px) scaleX(1.2)`,opacity:0}],{duration:520+Math.random()*200,easing:"cubic-bezier(.1,.8,.3,1)"})}}
function spdAt(e,up){if(RM)return;const q=e.getBoundingClientRect(),col=up?"#6dffa8":"#ff7076";
  for(let k=0;k<9;k++){const h=q.height*(.5+Math.random()*.6),dist=q.height*(1.2+Math.random()*.6);
    puff(mkI("spd",`left:${q.left+q.width*(.08+.84*k/8)+(Math.random()-.5)*6}px;top:${up?q.bottom-h*.5:q.top-h*.5}px;height:${h}px;background:linear-gradient(${up?"to top":"to bottom"},${col}00,${col});box-shadow:0 0 6px ${col}`),[{transform:`translateY(0) scaleY(.4)`,opacity:0},{opacity:1,offset:.3},{transform:`translateY(${up?-dist:dist}px) scaleY(1.2)`,opacity:0}],{duration:600+Math.random()*250,delay:Math.random()*250,easing:"cubic-bezier(.3,.7,.2,1)",fill:"backwards"})}}
new MutationObserver(ms=>ms.forEach(m=>{const e=m.target;if(e._sp)return;const u=e.classList.contains("up"),d=e.classList.contains("dn");if(u||d){e._sp=1;spdAt(e,u)}})).observe($("board"),{subtree:true,attributes:true,attributeFilter:["class"]});
function areaAt(a,w){if(RM)return;const r0=(a>>1)*3,c0=(a&1)*3,e1=document.querySelector(`#board [data-i="${r0*6+c0}"]`),e2=document.querySelector(`#board [data-i="${(r0+2)*6+c0+2}"]`);if(!e1||!e2)return;
  const p=e1.getBoundingClientRect(),q=e2.getBoundingClientRect(),L=p.left,T=p.top,W=q.right-L,H=q.bottom-T,win=w===0||w===1,col=w===0?"#6dffa8":w===1?"#ff8fb0":"#cfd8d2";
  puff(mkI("aw",`left:${L}px;top:${T}px;width:${W}px;height:${H}px;background:radial-gradient(ellipse at 50% 50%,${col}99,${col}00 72%)`),[{opacity:0,transform:"scale(.85)"},{opacity:1,offset:.3},{opacity:0,transform:"scale(1.08)"}],{duration:1500,easing:"ease-out"});
  if(!win)return;
  {const wr=mkI("ac",`left:${L}px;top:${T}px;width:${W}px;height:${H}px;overflow:hidden;border-radius:10px`),sw=mkI("as",`left:0;top:0;width:${W*.45}px;height:${H}px`);wr.appendChild(sw);puff(wr,[{opacity:1},{opacity:1}],{duration:1100});sw.animate([{transform:`translateX(${-W*.5}px)`,opacity:0},{opacity:.8,offset:.4},{transform:`translateX(${W*1.05}px)`,opacity:0}],{duration:1100,easing:"ease-in-out"})}
  for(let k=0;k<16;k++){const s=Math.random()<.5?-1:1;puff(mkI(w?"pt":"lf",`left:${L+Math.random()*W}px;top:${T+H*(.4+Math.random()*.6)}px`),[{transform:"translate(0,0) rotate(0) scale(.4)",opacity:0},{opacity:1,offset:.2},{transform:`translate(${s*30}px,${-H*.35}px) rotate(${s*240}deg) scale(1.1)`,opacity:1,offset:.6},{transform:`translate(${-s*20}px,${-H*.7}px) rotate(${s*500}deg) scale(.7)`,opacity:0}],{duration:1300+Math.random()*500,delay:Math.random()*500,easing:"ease-out",fill:"backwards"})}}
function flyPt(o){if(RM)return;const b=$("board").getBoundingClientRect(),t=$(o?"gr":"gl").getBoundingClientRect(),x0=b.left+b.width/2,y0=b.top+b.height/2,x1=t.left+t.width/2,y1=t.top+t.height/2,dx=x1-x0,dy=y1-y0,col=o?"#ff8fb0":"#6dffa8";
  for(let k=0;k<10;k++){const s=(k%2?1:-1)*(40+Math.random()*60);puff(mkI(o?"pt":"lf",`left:${x0+(Math.random()-.5)*b.width*.3}px;top:${y0+(Math.random()-.5)*b.height*.3}px`),[{transform:"translate(0,0) scale(.4) rotate(0)",opacity:0},{opacity:1,offset:.15},{transform:`translate(${dx*.5+s}px,${dy*.5-60}px) scale(1.3) rotate(${s*4}deg)`,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(.6) rotate(${s*8}deg)`,opacity:.9}],{duration:900+Math.random()*300,delay:k*60,easing:"cubic-bezier(.4,.1,.3,1)",fill:"backwards"})}
  setTimeout(()=>{puff(mkI("sw",`left:${x1}px;top:${y1}px;border-color:${col};box-shadow:0 0 18px ${col}`),[{transform:"translate(-50%,-50%) scale(.3)",opacity:1},{transform:"translate(-50%,-50%) scale(3)",opacity:0}],{duration:800,easing:"ease-out"});
    for(let k=0;k<12;k++){const a=k/12*6.28;puff(mkI("sh",`left:${x1}px;top:${y1}px`),[{transform:`rotate(${a}rad) translateX(10px) scaleX(.4)`,opacity:1},{transform:`rotate(${a}rad) translateX(${50+Math.random()*30}px) scaleX(1.2)`,opacity:0}],{duration:650,easing:"cubic-bezier(.1,.8,.3,1)"})}},1350)}
function finale(r){if(RM)return;const win=r==="あなたの勝ち",lose=r==="CPUの勝ち",n=win?46:lose?16:10,W=innerWidth,H=innerHeight;
  for(let k=0;k<n;k++){const sw=(Math.random()-.5)*160,s=Math.random()<.5?-1:1;puff(mkI(win&&k%3?"pt":"lf",`left:${Math.random()*W}px;top:-20px;${lose?"filter:grayscale(.7) brightness(.9);":""}${win&&k%5===0?"background:linear-gradient(135deg,#fff6c8,#f5b82e);":""}`),[{transform:`translate(0,0) rotate(0) scale(${.8+Math.random()*.9})`,opacity:0},{opacity:1,offset:.1},{transform:`translate(${sw*.6}px,${H*.5}px) rotate(${s*360}deg)`,offset:.55},{transform:`translate(${sw}px,${H+30}px) rotate(${s*720}deg)`,opacity:.9}],{duration:3200+Math.random()*2200,delay:Math.random()*1800,easing:"ease-in-out",fill:"backwards"})}}
function castAt(o){if(RM)return;const b=$("board").getBoundingClientRect(),col=o?"#ff8fb0":"#6dffa8";
  puff(mkI("aw",`left:${b.left}px;top:${b.top}px;width:${b.width}px;height:${b.height}px;border-radius:12px;background:radial-gradient(ellipse at 50% 50%,${col}55,${col}00 70%)`),[{opacity:0},{opacity:1,offset:.3},{opacity:0}],{duration:1300});
  for(let k=0;k<7;k++)puff(mkI("wd",`left:${b.left-40}px;top:${b.top+b.height*(.08+.84*k/6)}px;width:${b.width*.55}px;height:3px;background:linear-gradient(90deg,#fff0,${col},#fff0)`),[{transform:"translateX(0) scaleX(.3)",opacity:0},{opacity:.9,offset:.3},{transform:`translateX(${b.width*.8}px) scaleX(1.2)`,opacity:0}],{duration:900,delay:k*70,easing:"cubic-bezier(.3,.7,.2,1)",fill:"backwards"});
  for(let k=0;k<14;k++){const y=b.top+Math.random()*b.height,s=Math.random()<.5?-1:1;puff(mkI(o?"pt":"lf",`left:${b.left}px;top:${y}px`),[{transform:"translate(0,0) rotate(0) scale(.5)",opacity:0},{opacity:1,offset:.15},{transform:`translate(${b.width*.55}px,${s*30}px) rotate(${s*260}deg) scale(1)`,offset:.6},{transform:`translate(${b.width*1.05}px,${-s*20+30}px) rotate(${s*520}deg) scale(.7)`,opacity:0}],{duration:1200+Math.random()*500,delay:Math.random()*500,easing:"ease-in-out",fill:"backwards"})}}
function vanish2(c){if(RM)return;const h=$("hand").getBoundingClientRect(),m=3.5,sx=m*84,w=document.createElement("div");w.style.cssText=`position:fixed;left:${h.left}px;top:${h.top}px;width:${h.width}px;height:${h.height}px;pointer-events:none;z-index:40`;
  w.innerHTML=`<button class="card nw${ART[c.n]?" ill ac-"+ART[c.n]:""}" style="--x:${sx}px;--y:${(m*m*2.4).toFixed(1)}px;--r:${m*4}deg;z-index:7;animation:wind .95s cubic-bezier(.16,1,.3,1) backwards,vcut .5s .42s ease-in forwards;--ac:${c.d==="f"?"#f4a6c0":"#8ccf9c"}"><b>${c.c}</b><i class="em">${c.e}</i><em>${c.n}</em><span class="tx"><span>${c.t}</span></span><small>${c.p==null?"✦":c.p}</small></button>`;
  document.body.appendChild(w);setTimeout(()=>w.remove(),1100);const x=h.left+h.width/2+sx,y=h.top+h.height*.5;
  for(let k=0;k<14;k++){const a=Math.random()*6.28,d=50+Math.random()*80,s=Math.random()<.5?-1:1;puff(mkI(k%2?"pt":"lf",`left:${x+(Math.random()-.5)*60}px;top:${y+(Math.random()-.5)*90}px`),[{transform:"translate(0,0) rotate(0) scale(.5)",opacity:0},{opacity:1,offset:.25},{transform:`translate(${Math.cos(a)*d+30}px,${Math.sin(a)*d-50}px) rotate(${s*420}deg) scale(1)`,opacity:0}],{duration:1000+Math.random()*400,delay:520+Math.random()*300,easing:"ease-out",fill:"backwards"})}}
function inR(el,e){if(!el.classList.contains("on"))return false;const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
const DIS=new Set();
function vanish(c){if(RM)return;const h=$("hand").getBoundingClientRect(),x=Math.min(h.left+h.width/2+330,innerWidth-110),y=h.top+h.height*.45,g=mkI("cg",`left:${x-48}px;top:${y-68}px`);g.textContent=c.e;
  puff(g,[{opacity:0,transform:"translateY(30px) scale(.8)"},{opacity:1,transform:"none",offset:.25},{opacity:1,filter:"brightness(1.4)",offset:.55},{opacity:0,transform:"translateY(-14px) scale(1.12)",filter:"blur(5px) brightness(2)"}],{duration:1300,easing:"ease-out"});
  for(let k=0;k<16;k++){const a=Math.random()*6.28,d=60+Math.random()*90,s=Math.random()<.5?-1:1;puff(mkI(k%2?"pt":"lf",`left:${x+(Math.random()-.5)*60}px;top:${y+(Math.random()-.5)*90}px`),[{transform:"translate(0,0) rotate(0) scale(.5)",opacity:0},{opacity:1,offset:.25},{transform:`translate(${Math.cos(a)*d+30}px,${Math.sin(a)*d-50}px) rotate(${s*420}deg) scale(1)`,opacity:0}],{duration:1100+Math.random()*500,delay:500+Math.random()*350,easing:"ease-out",fill:"backwards"})}}
const SKIN=[{opacity:0,transform:"translateY(-34px) scale(.7) rotate(-8deg)",filter:"brightness(1.8)"},{opacity:1,transform:"translateY(4px) scale(1.08)",offset:.7},{opacity:1,transform:"none",filter:"none"}];
const battle=()=>{const b=$("bt");b.classList.remove("on");void b.offsetWidth;b.classList.add("on");return sleep(1500)};
function banner(t){const b=$("tb");b.textContent="Turn "+t;b.classList.remove("on");void b.offsetWidth;b.classList.add("on")}
$("go").onclick=commit;$("cc").onclick=()=>{if(S.busy||S.over||!S.st.length)return;[...S.st].sort((a,b)=>a.h-b.h).forEach(s=>S.hand[0].splice(Math.min(s.h,S.hand[0].length),0,s.card));S.st=[];S.sel=null;render()};
$("sk0").onclick=e=>{const t=e.target.closest("[data-k]");if(!t||S.busy||S.over||S.pk)return;const k=+t.dataset.k,s=S.st[k];if(!s)return;S.hand[0].splice(Math.min(s.h,S.hand[0].length),0,s.card);S.st.splice(k,1);S.sel=null;render()};
const info=$("info"),INFO=info,finfo=$("finfo"),IC={f:"#f4a6c0",t:"#8ccf9c"};
const PF='<svg class="pf" width="242" height="334" viewBox="0 0 242 334"><defs><linearGradient id="pfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#fff6c0"/><stop offset="1" stop-color="#f2b020"/></linearGradient></defs><rect x="1.5" y="1.5" width="239" height="331" rx="20" pathLength="1"/></svg>';
/* 詳細（左：自分側 / 右：相手側）は画面端でなく、盤面のすぐ隣に出す */
const placeInfo=(el,right)=>{const r=$("board").getBoundingClientRect(),w=232,g=66;el.style.left=(right?Math.min(innerWidth-w-8,r.right+g):Math.max(8,r.left-w-g))+"px";if(right)el.style.right="auto"};
const showCard=(c,p,F)=>{const info=F?finfo:INFO;if(F){finfo._c=c;finfo._p=p}else clearTimeout(unpin.t);info.classList.remove("un");info.classList.toggle("pin",!F&&PIN===c);info.style.setProperty("--ac",IC[c.d]);info.innerHTML=ibHTML(c,p,false);placeInfo(info,!!F);fitPF(info);info.classList.add("on");tiltKick()};
function setMana(m){const d=$("drop"),n=$("dn");if(d.dataset.v===String(m))return;const first=d.dataset.v===undefined;d.dataset.v=m;if(first){n.textContent=m;return}
  n.style.opacity=0;setTimeout(()=>{n.textContent=m;n.style.opacity=1;jig(1)},110)}
["contextmenu","dragstart","selectstart"].forEach(t=>document.addEventListener(t,e=>{if(!e.target.closest||!e.target.closest("input,select"))e.preventDefault()}));
document.addEventListener("mouseover",e=>{
  if(PIN||DR||e.target.closest("#finfo,.md"))return;
  const h=e.target.closest("[data-h]"),b=e.target.closest("#board [data-i]");let c=null,p=0;
  if(h){c=S.hand[0][+h.dataset.h];if(c)p=c.p}
  else if(b){const i=+b.dataset.i,x=S.board[i];if(x&&!S.hide.has(i)){c=x.card;p=pw(x,i)}else{const s=S.st.find(s=>s.cell===i);if(s){c=s.card;p=c.p}}}
  if(c)showCard(c,p);
  else info.classList.remove("on");
});
const HPOS=new WeakMap();/* 手札の前回位置（増減時に滑らかに動かすため） */
function render(){
  $("board").classList.toggle("sel",S.sel!==null);$("board").style.setProperty("--pv",S.sel!==null&&S.hand[0][S.sel]?'"'+S.hand[0][S.sel].e+'"':'""');$("board").style.setProperty("--pi",S.sel!==null&&S.hand[0][S.sel]&&ART[S.hand[0][S.sel].n]?"var(--i-"+ART[S.hand[0][S.sel].n]+")":"none");$("turn").textContent=`ターン ${S.turn} / ${S.max}`;$("ffb").disabled=!!S.over;
  $("gl").innerHTML=gauge(0,S.pop===0);$("gr").innerHTML=gauge(1,S.pop===1);S.pop=null;
  setMana(left());
  $("board").innerHTML=S.board.map((b,i)=>{
    const hid=S.hide.has(i),x=b&&!hid?b.card:null,st=S.st.find(s=>s.cell===i)||(S.stk&&hid?S.stk[0].find(s=>s.cell===i):null),f=S.fx&&S.fx.cell===i?S.fx:null,r=Math.floor(i/6),c=i%6;
    let inner="";
    if(f&&f.k==="clash")inner=`<span class="cd">${f.txt}</span>`;
    else if(x)inner=`<span class="cd${f?" drop":""}"><u class="ej${ART[x.n]?" ic ic-"+ART[x.n]:""}">${ART[x.n]?"":x.e}</u><small>${pw(b,i)}</small></span>`;
    else if(st)inner=`<span class="cd${S.land===i?" land":""}">${ART[st.card.n]?`<u class="ej ic ic-${ART[st.card.n]}"></u>`:st.card.e}<small>${st.card.p}</small></span>`;
    if(f&&f.gone)inner+=`<i class="gone">${f.gone}</i>`;
    const cl=`cell${r===2?" rb":""}${c===2?" cr":""}${x?" o"+b.o:""}${st?" st":""}${f?(f.k==="clash"?" clash"+(f.c?" fx-"+f.c:""):" fx"):""}${S.pk&&S.pk.cells&&S.pk.cells.includes(i)?" tg":""}`;
    return`<button class="${cl}" data-i="${i}">${inner}</button>`}).join("");
  const s=sums();$("cn").innerHTML=s.map((v,i)=>{const w=v[0]>v[1]?" l0":v[1]>v[0]?" l1":"",pv=S.ps||[];return`<div class="cb${w}">${[0,1].map(o=>`<i class="${o?"cp":"me"}${pv[i]&&pv[i][o]!==v[o]?" bump":""}">${v[o]}</i>`).join("<u>:</u>")}</div>`}).join("");S.ps=s;
  S.land=null;$("areas").innerHTML=s.map((v,i)=>`<span>${AN[i]}　<b class="me">${v[0]}</b> – <b class="cp">${v[1]}</b></span>`).join("");
  $("ov").innerHTML=[0,1,2,3].map(i=>{const q=S.jq[i];if(!q)return"<div></div>";const h=`<div class="q w${q.w}${q.n?" pop":""}${q.out?" out":""}">${q.t}</div>`;q.n=false;return h}).join("");
  const dis=S.over||S.busy||!!S.pk;
  const hn=S.hand[0].length,stp=hn>1?Math.min([0,0,142,126,116,108,102,96][hn]||96,780/(hn-1)):0;
  const D=c=>c.c>left()||dis||(isAct(c)&&!actT(0,c).length),prevD=new Set(DIS);DIS.clear();S.hand[0].forEach(c=>{if(D(c))DIS.add(c)});
  $("hand").innerHTML=S.hand[0].map((c,i)=>{const m=i-(hn-1)/2,hx=m*stp,hy=m*m*2.4,hr=m*4,pv=HPOS.get(c),mv=pv&&!(c.nw&&Date.now()-c.nw<1800)&&(Math.abs(pv.x-hx)>.5||Math.abs(pv.y-hy)>.5||Math.abs(pv.r-hr)>.3);HPOS.set(c,{x:hx,y:hy,r:hr});return`<button class="card${ART[c.n]?" ill ac-"+ART[c.n]:""}${mv?" mv":""}${S.sel===i?" on":""}${S.pk&&S.pk.hand&&S.pk.hand.includes(i)?" pk":""}${c.nw&&Date.now()-c.nw<1800?" nw":""}" data-h="${i}" style="${mv?`--x0:${pv.x.toFixed(1)}px;--y0:${pv.y.toFixed(1)}px;--r0:${pv.r.toFixed(1)}deg;`:""}--x:${(m*stp).toFixed(1)}px;--y:${(m*m*2.4).toFixed(1)}px;--r:${(m*4).toFixed(1)}deg;z-index:${i};animation-delay:${(i*.09-(c.nw?(Date.now()-c.nw)/1000:0)).toFixed(2)}s;--ac:${c.d==="f"?"#f4a6c0":"#8ccf9c"}" ${DIS.has(c)?(prevD.has(c)?"data-dis":"data-dis data-fd"):""}><b>${c.c}</b><i class="em">${c.e}</i><em>${c.n}</em><span class="tx"><span>${c.t}</span></span><small>${c.p==null?"✦":c.p}</small></button>`}).join("");
  {const n=S.turn>0?S.hand[1].length+(S.oPend||0):0,pc=S.ohc||0,T=S.ohT||(S.ohT=[]),P=S.ohP||(S.ohP=[]),stp=n>1?Math.min(52,320/(n-1)):0,now=Date.now();
    for(let i=pc;i<n;i++)T[i]=now;T.length=n;S.ohc=n;
    $("oh").innerHTML=Array.from({length:n},(_,i)=>{const m=i-(n-1)/2,x=m*stp,y=-m*m*2.4,r=-m*4,pv=P[i],nf=T[i]&&now-T[i]<1800,mv=pv&&!nf&&(Math.abs(pv.x-x)>.5||Math.abs(pv.y-y)>.5||Math.abs(pv.r-r)>.3);P[i]={x,y,r};
      return`<i class="oc${nf?" nw":""}${mv?" mv":""}" style="${mv?`--x0:${pv.x.toFixed(1)}px;--y0:${pv.y.toFixed(1)}px;--r0:${pv.r.toFixed(1)}deg;`:""}--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--r:${r.toFixed(1)}deg;z-index:${i};animation-delay:${(i*.09-(nf?(now-T[i])/1000:0)).toFixed(2)}s"></i>`}).join("");P.length=n}
  if(S.fx&&!S.fx.fd){S.fx.fd=1;if(S.fx.k==="drop")windAt(S.fx.cell);else if(S.fx.k==="clash"&&/⚔/.test(S.fx.txt))clashAt(S.fx.cell)}
  $("end").textContent="";
  $("sk0").innerHTML=skh(S.stk?S.stk[0]:S.st,0);$("sk1").innerHTML=skh(S.stk?S.stk[1]:[],1);
  $("go").disabled=dis;$("cc").disabled=dis||!S.st.length;
  if(S.over&&!S.paid){S.paid=1;coinAdd(10)}
  const R=$("res"),k=S.over?(S.res==="あなたの勝ち"?"win":S.res==="CPUの勝ち"?"lose":"draw"):"";if(R.dataset.k!==k){R.dataset.k=k;R.className=k?"on "+k:"";R.textContent=k.toUpperCase();if(k&&!NET.on){const s0=S;setTimeout(()=>{if(S===s0&&S.over&&!NET.on)$("sres").classList.add("on")},2800)}}
}
$("board").onclick=e=>{
  const b=e.target.closest("[data-i]");if(!b||S.over||S.busy)return;
  const i=+b.dataset.i;if(S.board[i])return;
  const k=S.st.findIndex(s=>s.cell===i);
  if(k>=0){S.hand[0].push(S.st[k].card);S.st.splice(k,1)}
  else if(0){}
  render();
};
function gauge(o,pop){const N=S.win,R=46,r=R*Math.cos(Math.PI/5),V=k=>{const a=(-90+72*k)*Math.PI/180;return[R*Math.cos(a),R*Math.sin(a)]};
  const E=a=>{const u=(((a+90)%72)+72)%72,d=r/Math.cos((u-36)*Math.PI/180),t=a*Math.PI/180;return[d*Math.cos(t),d*Math.sin(t)]};
  const f=p=>p[0].toFixed(1)+","+p[1].toFixed(1);let sl="";
  for(let k=0;k<N;k++){const a0=-90+360*k/N,a1=-90+360*(k+1)/N,P=[[0,0],E(a0)];
    for(let j=0;j<5;j++){const v=-90+72*j;if(v>a0+1e-6&&v<a1-1e-6)P.push(V(j))}
    P.push(E(a1));sl+=`<polygon points="${P.map(f).join(" ")}" class="sl${k<S.pts[o]?" on":""}${pop&&k===S.pts[o]-1?" new":""}"/>`}
  return`<svg viewBox="-52 -52 104 104">${sl}<defs><linearGradient id="gp${o}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(${o?"--cp":"--me"}) 30%,#fff)"/><stop offset="1" style="stop-color:var(${o?"--cp":"--me"})"/></linearGradient></defs><polygon class="pg" style="stroke:url(#gp${o})" points="${[0,1,2,3,4].map(k=>f(V(k))).join(" ")}"/></svg>`}
function arrow(d,x,y){
  const P0=[d.ox,d.oy],dx=x-P0[0],dy=y-P0[1],L=Math.hypot(dx,dy)||1,sg=Math.max(-1,Math.min(1,(innerWidth/2-x)/(innerWidth*.14))),C=[(P0[0]+x)/2+dy*.2*sg,(P0[1]+y)/2-dx*.2*sg];
  const B=t=>[(1-t)*(1-t)*P0[0]+2*(1-t)*t*C[0]+t*t*x,(1-t)*(1-t)*P0[1]+2*(1-t)*t*C[1]+t*t*y];
  const N=t=>{const tx=2*(1-t)*(C[0]-P0[0])+2*t*(x-C[0]),ty=2*(1-t)*(C[1]-P0[1])+2*t*(y-C[1]),m=Math.hypot(tx,ty)||1;return[-ty/m,tx/m]};
  const hl=Math.min(48,L*.5),tb=Math.max(.05,1-hl/(L*1.05)),n=20,Ls=[],Rs=[];
  for(let k=0;k<=n;k++){const t=tb*k/n,p=B(t),q=N(t),w=(4+22*Math.pow(k/n,1.3))/2;Ls.push([p[0]+q[0]*w,p[1]+q[1]*w]);Rs.push([p[0]-q[0]*w,p[1]-q[1]*w])}
  const bp=B(tb),bn=N(tb),hw=34;
  const pts=[...Ls,[bp[0]+bn[0]*hw,bp[1]+bn[1]*hw],[x,y],[bp[0]-bn[0]*hw,bp[1]-bn[1]*hw],...Rs.reverse()];
  d.g.firstChild.setAttribute("d","M"+pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join("L")+"Z");
}
let DR=null,JD=false;
$("hand").onclick=e=>{
  if(JD)return;
  const b=e.target.closest("[data-h]");if(!b||S.busy)return;
  const h=+b.dataset.h;S.sel=S.sel===h?null:h;render();
};
$("hand").onpointerdown=e=>{
  const b=e.target.closest("[data-h]");if(!b||b.hasAttribute("data-dis")||S.busy||S.over)return;
  DR={h:+b.dataset.h,b,x:e.clientX,y:e.clientY,on:false,g:null,cell:null};if(!PIN){const c=S.hand[0][DR.h];showCard(c,c.p)}$("board").style.setProperty("--pv",'"'+S.hand[0][DR.h].e+'"');$("board").style.setProperty("--pi",ART[S.hand[0][DR.h].n]?"var(--i-"+ART[S.hand[0][DR.h].n]+")":"none");
};
addEventListener("pointermove",e=>{
  if(!DR)return;
  if(!DR.on){if(Math.hypot(e.clientX-DR.x,e.clientY-DR.y)<8)return;
    DR.on=true;DR.b.classList.add("dragging");if(PIN){const c=S.hand[0][DR.h];unpin();setTimeout(()=>{if(DR&&DR.on&&c)showCard(c,c.p)},240)}
    const r=DR.b.getBoundingClientRect();DR.ox=r.left+r.width/2;DR.oy=r.top+6;
    const g=document.createElementNS("http://www.w3.org/2000/svg","svg");g.id="arrow";g.innerHTML="<path/>";document.body.appendChild(g);DR.g=g}
  const fr=$("field").getBoundingClientRect(),inF=e.clientY>=fr.top&&e.clientY<=fr.bottom&&e.clientX>=fr.left&&e.clientX<=fr.right;DR.g.style.display=inF?"":"none";if(inF)arrow(DR,e.clientX,e.clientY);
  const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest?el.closest("[data-i]"):null;
  const i=!isAct(S.hand[0][DR.h])&&c&&!S.board[+c.dataset.i]&&!S.st.some(s=>s.cell===+c.dataset.i)?c:null;
  if(DR.cell!==i){if(DR.cell)DR.cell.classList.remove("hv");if(i)i.classList.add("hv");DR.cell=i}
  DR.g.classList.toggle("ok",isAct(S.hand[0][DR.h])?inF:!!DR.cell);
});
addEventListener("pointerup",ev=>{
  if(!DR)return;const d=DR;DR=null;
  if(!d.on)return;
  JD=true;setTimeout(()=>JD=false,0);
  d.g.remove();if(!PIN)info.classList.remove("on");
  const fr=$("field").getBoundingClientRect(),ac=S.hand[0][d.h];
  if(ac&&isAct(ac)){if(ev.clientY>=fr.top&&ev.clientY<=fr.bottom&&ev.clientX>=fr.left&&ev.clientX<=fr.right&&ac.c<=left()){const T=actT(0,ac),el=document.elementFromPoint(ev.clientX,ev.clientY),cc=el&&el.closest?el.closest("#board [data-i]"):null,j=cc?+cc.dataset.i:-1;S.st.push({card:ac,cell:-1,h:d.h});S.hand[0].splice(d.h,1);S.sel=null}}
  else if(d.cell){const i=+d.cell.dataset.i,card=S.hand[0][d.h];
    if(card&&card.c<=left()){S.st.push({card,cell:i,h:d.h});S.hand[0].splice(d.h,1);S.sel=null;S.land=i}}
  render();
});
addEventListener("pointercancel",()=>{if(DR&&DR.on)DR.g.remove();DR=null;render()});
$("hand").onclick=null;
function openBd(c,p){const bd=$("bdt");bd.innerHTML=detailHTML(c,p,"");bd.classList.add("on");info.classList.remove("on");fitPF(bd);introOn(bd);tiltKick()}
document.addEventListener("click",e=>{
  if(e.target.closest("#bdt")){if(!e.target.closest(".dkw"))$("bdt").classList.remove("on");return}
  if(JD||S.pk||e.target.closest(".md"))return;
  const fi=e.target.closest("#finfo");if(fi&&finfo._c){openBd(finfo._c,finfo._p);return}
  if(S.busy)return;
  const h=e.target.closest("[data-h]"),b=e.target.closest("#board [data-i]");let c=null,p=0;
  if(h){c=S.hand[0][+h.dataset.h];if(c)p=c.p}else if(b){const i=+b.dataset.i,x=S.board[i];if(x&&!S.hide.has(i)){c=x.card;p=pw(x,i)}}
  if(c)openBd(c,p)});
addEventListener("keydown",e=>{if(e.key==="Escape")$("bdt").classList.remove("on")});
document.addEventListener("click",e=>{const b=e.target.closest("#hmd button[data-hm]");if(!b)return;$("hand").classList.toggle("im",b.dataset.hm==="i");document.querySelectorAll("#hmd button").forEach(x=>x.classList.toggle("on",x===b))});
/* 盤面アイコンのライト: 一度マウスオーバーしたら、外しても最後まで流れる */
document.addEventListener("mouseover",e=>{const c=e.target.closest&&e.target.closest("#board .cell");if(!c)return;const j=c.querySelector(".ej.ic");if(!j||j.classList.contains("ics"))return;j.classList.add("ics");if(!j._sh){j._sh=1;j.addEventListener("animationend",ev=>{if(ev.animationName==="icsh")j.classList.remove("ics")})}});
setInterval(()=>{const c=$("cn");c.classList.add("sw");setTimeout(()=>c.classList.remove("sw"),3200)},30000);

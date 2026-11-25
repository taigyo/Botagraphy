/* ===== オンライン対戦エンジン連携 =====
   公開情報（盤面・マナ・得点）は両端末が同じ計算をする。手札・山札は持ち主の端末だけが持ち、
   相手側は「枚数だけ分かる伏せカード」で扱う。持ち主しか知らない情報に依存する効果は、持ち主が結果を送る。 */
const NET={on:false,you:0,seed:0,ack:0,q:{},w:{},sums:{},mine:{},sent:[],nw:0,nwt:0,os:0,dead:false,pr:()=>0.5,tsec:90,psec:30,pkr:null,pt0:0,wk:"",t0:0,off:0,opp:"",rc:0};
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const prnd=n=>NET.on?Math.floor(NET.pr()*n):rnd(n);
const absO=o=>o===0?NET.you:1-NET.you,relO=a=>a===NET.you?0:1;
const OPN=()=>NET.on?(NET.opp||"相手"):(S&&S.who&&S.who[1]?S.who[1].name:"CPU");
const PH=()=>({hid:1,n:"?",e:"❓",c:0,p:0,a:[],f:[],d:"f"});
const hashStr=x=>{let h=2166136261;for(let i=0;i<x.length;i++){h^=x.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
function netOut(o){NET.sent.push(o);netFlush(o)}
function netFlush(o){const w=ON.ws;if(w&&w.readyState===1)w.send(JSON.stringify(o))}
function netSend(d){netOut({t:"relay",s:++NET.os,d})}
function netPush(k,v){const w=NET.w[k];if(w&&w.length)w.shift()(v);else(NET.q[k]=NET.q[k]||[]).push(v)}
function netWait(k){if(NET.dead)return new Promise(()=>{});const q=NET.q[k];if(q&&q.length)return Promise.resolve(q.shift());if(++NET.nw===1){NET.nwt=Date.now();NET.wk=k}return new Promise(r=>{(NET.w[k]=NET.w[k]||[]).push(v=>{NET.nw--;r(v)})})}
async function netPlans(){
  const turn=S.turn,items=S.st.map(s=>({n:s.card.n,c:s.card.c,cell:s.cell,tg:s.tg===undefined?null:s.tg,fx:eqOf(s.card.n).slice(0,10)}));
  netOut({t:"plan",turn,items});
  const p=await netWait("plans:"+turn),th=p[1-NET.you]||[],out=[];
  for(const it of th){const base=CARDS.find(c=>c.n===it.n);if(!base)continue;
    const H=S.hand[1];let k=H.findIndex(x=>!x.hid&&x.n===it.n);if(k<0)k=H.findIndex(x=>x.hid);if(k>=0)H.splice(k,1);
    const r={card:{...base,c:it.c,fx:Array.isArray(it.fx)?it.fx:[]},cell:it.cell};if(it.tg!=null)r.tg=it.tg;out.push(r)}
  return out;
}
function netSum(over){
  const st={b:S.board.map((b,i)=>b?[absO(b.o),b.card.n,pw(b,i)]:0),m:[0,1].map(a=>S.mana[relO(a)]),p:[0,1].map(a=>S.pts[relO(a)]),h:[0,1].map(a=>S.hand[relO(a)].length),d:[0,1].map(a=>S.deck[relO(a)].length)};
  const h=hashStr(JSON.stringify(st));NET.mine[S.turn]=[h,st];netSend({k:"sum",t:S.turn,h});netCheck(S.turn);if(over)netOut({t:"done"});
}
function netCheck(t){const m=NET.mine[t],o=NET.sums[t];if(!m||o===undefined)return;if(m[0]!==o){console.error("同期ずれ",t,m[1]);NET.desync=t;netBanner("⚠ 同期ずれを検出しました（ターン"+t+"）。結果が食い違う可能性があります。")}}
function netRecv(m){
  if(m.q&&m.q<=NET.ack)return;if(m.q)NET.ack=m.q;
  if(m.t==="plans")netPush("plans:"+m.turn,m.p);
  else if(m.t==="opp_left"){if(NET.on){if(S&&S.over){NET.oppGone=1;netEndUpdate()}else netForfeitWin("相手が退室しました")}}
  else{const d=m.d||{};if(d.k==="ch")netPush("choice",d.v);else if(d.k==="out")netPush("out",d.v);else if(d.k==="mull")netPush("mull",1);else if(d.k==="ff"){if(NET.on&&S&&!S.over){LG("end",1,"降参しました");forceEnd("あなたの勝ち",OPN()+"が降参しました");netOut({t:"done"})}}else if(d.k==="sum"){NET.sums[d.t]=d.h;netCheck(d.t)}}
}
function netState(m){const op=m.players[1-m.you];NET.opp=op?op.name:NET.opp;if(S&&S.who&&NET.on&&typeof bui==="function")bui(1);NET.off=op&&op.online===false?(NET.off||Date.now()):0;netEndUpdate()}
function netStartGame(g){ON.go=g;onl.classList.remove("on");initOnline(g)}
function initOnline(g){
  $("pp").classList.remove("on");const og=$("mg");if(og)og.remove();
  Object.assign(NET,{on:true,you:g.you,seed:g.seed,q:{},w:{},sums:{},mine:{},sent:[],nw:0,os:0,dead:false,off:0,desync:0,t0:0,endAt:0,oppGone:0});NE.style.display="none";NE.dataset.on="";
  const o=(ON.st&&ON.st.players[1-g.you]);NET.opp=o?o.name:"相手";
  NET.pr=mul(g.seed);
  $("bset").classList.remove("on");$("bmat").classList.remove("on");$("home").classList.remove("on");started=true;document.body.classList.add("net");
  const mine=myDeck(ON.dk);
  S={win:5,max:15,turn:0,mana:[0,0],hand:[[],[]],board:Array(36).fill(null),pts:[0,0],st:[],sel:null,over:false,busy:false,log:"",res:"",hide:new Set(),fx:null,jq:[],pop:null,ini:0,nm:[0,0],stk:null,lg:[],deck:[mine,mine.map(PH)]};
  if(typeof bui==="function")bui();
  const MN0=S.deck[0].find(c=>c.m===1);for(let i=0;i<3;i++){dr(0);dr(1)}
  const s0=S;S.busy=true;
  mulligan().then(async()=>{if(S!==s0)return;const tk=CARDS.find(c=>c.n===(MN0&&MN0.tk||"牡丹のはなびら"));S.hand[0].push({...tk,nw:Date.now()});S.hand[1].push(PH());render();netSend({k:"mull"});await netWait("mull");if(S!==s0)return;S.busy=false;next()});
}
function netForfeitWin(msg){if(!NET.on||NET.dead||!S||S.over)return;NET.oppGone=1;NET.dead=true;LG("end",-1,msg+"（不戦勝）");forceEnd("あなたの勝ち",msg+"（不戦勝）");netBanner("")}
function netLeave(){if(NET.on){netFlush({t:"leave"})}NE.style.display="none";NE.dataset.on="";NET.on=false;NET.dead=true;ON.bye=1;try{ON.ws&&ON.ws.close()}catch{}ON.ws=null;document.body.classList.remove("net");netBanner("")}
function netReconnect(){
  if(NET.rc||!NET.on||NET.dead)return;NET.rc=1;let n=0;
  const go=()=>{if(!NET.on||ON.bye||NET.dead){NET.rc=0;return}if(++n>40){NET.rc=0;netBanner("接続できません。ホームに戻ってください。");return}
    netBanner("再接続中…");
    const w=wsOpen("/ws/room/"+ON.room,onRoomMsg,()=>{if(ON.ws===w&&!ON.bye)setTimeout(go,2000)});ON.ws=w;
    w.onopen=()=>{NET.rc=0;netBanner("");w.send(JSON.stringify({t:"hello",pid:PID,name:PNAME,icon:PROF.icon,title:PROF.title,deck:deckLabel(),ack:NET.ack}));NET.sent.forEach(netFlush)};
  };go();
}

const NE=document.createElement("div");NE.id="nend";document.body.append(NE);
function endShow(){NE.dataset.on="1";NE.style.display="flex";netEndUpdate()}
function netEndUpdate(){if(!NE.dataset.on||!S)return;const s=ON.st,me=s&&s.players[s.you],op=s&&s.players[1-s.you],gone=NET.oppGone||!op;
  const r=S.res==="あなたの勝ち"?"勝利！":S.res==="CPUの勝ち"?"敗北…":"引き分け";
  NE.innerHTML=`<b>${r}</b><span>${gone?"相手が退室しました":me&&me.rm?"相手の返事を待っています…":op&&op.rm?"相手が再戦を希望しています":""}</span><button class="obtn" data-e="rematch"${gone?" disabled":""}>${me&&me.rm?"再戦を取り消す":"再戦"}</button><button class="obtn sub" data-e="back">戻る</button>`}
NE.onclick=e=>{const b=e.target.closest("[data-e]");if(!b||b.disabled)return;pop(b);if(b.dataset.e==="rematch"){const s=ON.st,me=s&&s.players[s.you];wsSend({t:"rematch",v:!(me&&me.rm)})}else netBack()};
function netBack(){netLeave();bsetOpen();bsFlip(true,true)}
function netToLobby(){NE.style.display="none";NE.dataset.on="";NET.on=false;NET.dead=false;NET.ack=0;NET.endAt=0;ON.go=null;document.body.classList.remove("net");bsetOpen();bsFlip(true,true)}
let nbTxt="";
function netBanner(t){nbTxt=t;NB.innerHTML=t?esc(t):"";NB.style.display=t?"block":"none"}
const NB=document.createElement("div"),NT=document.createElement("div");NB.id="nwait";NT.id="ntm";document.body.append(NB,NT);
setInterval(()=>{
  if(!NET.on||!S){NT.style.display="none";if(!NET.rc&&nbTxt!=="")netBanner("");return}
  const now=Date.now();
  if(S.pk&&S.busy){if(NET.pkr!==S.pk){NET.pkr=S.pk;NET.pt0=now}const r=Math.ceil(NET.psec-(now-NET.pt0)/1000);NT.style.display="block";NT.textContent="選択 ⏱ "+Math.max(0,r);NT.classList.toggle("low",r<=10);
    if(r<=0){const p=S.pk,L=p.cells||p.hand;NET.pkr=null;S.pk=null;$("pp").classList.remove("on");render();p.res(L[Math.floor(Math.random()*L.length)])}}
  else if(!S.busy&&!S.over&&S.turn>=1&&NET.t0){const r=Math.ceil(NET.tsec-(now-NET.t0)/1000);NT.style.display="block";NT.textContent="⏱ "+Math.max(0,r);NT.classList.toggle("low",r<=15);
    if(r<=0){NET.t0=0;if(S.pk){const f=S.pk.res;S.pk=null;$("pp").classList.remove("on");f(-1)}commit()}}else NT.style.display="none";
  if(S.over){if(!NET.endAt)NET.endAt=now;if(now-NET.endAt>1800&&!NE.dataset.on)endShow()}
  if(NET.rc||NET.desync)return;
  if(NET.off&&!S.over){const s=Math.floor((now-NET.off)/1000);netBanner(s<60?"相手の接続が切れています…（再接続を待っています "+s+"秒）":"相手の接続が戻りません。")}
  else if(NET.nw>0&&now-NET.nwt>400&&!S.over)netBanner(NET.wk&&NET.wk.startsWith("plans")?"相手の確定を待っています…":NET.wk==="choice"?"相手が選択中です…（最大"+NET.psec+"秒）":"相手の操作を待っています…");
  else if(nbTxt!=="")netBanner("");
},250);

(()=>{const hide=()=>{const l=document.getElementById("ld");if(!l)return;l.classList.add("out");setTimeout(()=>l.remove(),1000)};
 const loaded=new Promise(r=>document.readyState==="complete"?r():addEventListener("load",r));
 const bar=document.querySelector("#ld .ld-bar b"),played=new Promise(r=>{if(!bar)return r();bar.addEventListener("animationend",r,{once:true});setTimeout(r,7000)});
 Promise.all([loaded,document.fonts?document.fonts.ready:0,played]).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).then(()=>setTimeout(hide,500))})();


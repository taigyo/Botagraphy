/* ===== バトル設定／オンライン対戦（土台） ===== */
const NMK="bota_name",PID=sessionStorage.getItem("bota_pid")||(()=>{const v=Math.random().toString(36).slice(2,12);sessionStorage.setItem("bota_pid",v);return v})();

/* ---- プロフィール（アイコン・名前・称号）とボタコイン。どちらもlocalStorageに保存 ---- */
const PROF_K="bota_prof_v1",EPI=["芽吹きの園丁","深緑の守り人","花嵐の使者","朝露の詩人","巨木の継承者","緑陰の放浪者","開花の導き手","常緑の覇者","根源に触れし者","千花の歌い手"],ICON_E=["🌱","🌸","🌻","🍀","🌳","🍁","🌷","🍄","🪻","🌿"],ART_N=Object.fromEntries(Object.entries(ART).map(([n,k])=>[k,n]));
let PROF=(()=>{let j={};try{j=JSON.parse(localStorage.getItem(PROF_K)||"{}")||{}}catch{}const old=(localStorage.getItem(NMK)||"").slice(0,12),ok=/^(c:(\w\w)|e:.+)$/.exec(j.icon||"");
 return{icon:ok&&(ok[2]?!!ART_N[ok[2]]:true)?j.icon:"e:🌱",name:(typeof j.name==="string"?j.name:old).trim().slice(0,12)||"プレイヤー",title:EPI.includes(j.title)?j.title:""}})();
const profSave=()=>{try{localStorage.setItem(PROF_K,JSON.stringify(PROF));localStorage.setItem(NMK,PROF.name)}catch{}};
/* いま使っているアイコン・二つ名は所持扱い（ショップ制になる前から使っていた人のため） */
if(!ICO.includes(PROF.icon)){ICO.push(PROF.icon);icoSave()}if(PROF.title&&!TTO.includes(PROF.title)){TTO.push(PROF.title);ttoSave()}
const avStyle=ic=>ic.startsWith("c:")?`background:var(--i-${ic.slice(2)}) center/cover no-repeat`:"",avTxt=ic=>ic.startsWith("e:")?ic.slice(2):"";
function profShow(){const h=$("hprof");if(!h)return;const av=h.querySelector(".av");av.style.cssText=avStyle(PROF.icon);av.textContent=avTxt(PROF.icon);av.classList.toggle("e",PROF.icon.startsWith("e:"));
 h.querySelector(".tx b").textContent=PROF.name;const t=h.querySelector(".tx span");t.textContent=PROF.title;t.style.display=PROF.title?"":"none"}
function setName(v){PROF.name=String(v).trim().slice(0,12)||"プレイヤー";PNAME=PROF.name;profSave();profShow()}
const COIN_K="bota_coin_v1";let COIN=(()=>{const v=parseInt(localStorage.getItem(COIN_K),10);return v>0?v:0})();
const coinShow=()=>{document.querySelectorAll(".cb-n").forEach(e=>{if(e.textContent!==String(COIN)){e.textContent=COIN;const p=e.closest(".cbadge");if(p){p.classList.remove("bump");void p.offsetWidth;p.classList.add("bump")}}})};
const coinSave=()=>{try{localStorage.setItem(COIN_K,String(COIN))}catch{}coinShow()};
function coinToast(n){const d=document.createElement("div");d.className="ctoast";d.innerHTML=`<i class="coin">B</i>+${n} ボタコイン`;document.body.append(d);setTimeout(()=>d.remove(),2600)}
const coinAdd=n=>{COIN+=n;coinSave();coinToast(n)};
let PNAME=PROF.name;
const SRV=(()=>{const q=new URLSearchParams(location.search).get("server");if(q)return q.replace(/\/$/,"");if(/^https?:$/.test(location.protocol)&&!/(claude\.ai|claudeusercontent\.com)$/.test(location.hostname))return location.origin;return null})();
const wsUrl=p=>SRV.replace(/^http/,"ws")+p;
const esc=x=>String(x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const deckLabel=()=>{const d=DKS.find(x=>x.id===(ON.dk||ACT));return d&&dkFull(d)?d.name:"花デッキ（初期構成）"};
const ON={ws:null,room:null,via:"",st:null,go:null,timer:0,log:[],dk:""};
let bsFl=false;
const pop=el=>{el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")};
function bsFlip(v,instant){bsFl=v;const a=$("bsc1"),b=$("bsc2");a.classList.toggle("fl",v);if(instant)b.classList.toggle("fl",v);else setTimeout(()=>b.classList.toggle("fl",v),160)}
function bsetOpen(){$("home").classList.remove("on");$("bset").classList.add("on");bsFlip(false,true)}
function bsetClose(){$("bset").classList.remove("on");homeOpen()}

/* ---- 設定画面：アイコン（絵文字／カードのイラスト）・名前・称号 ---- */
const PS=document.createElement("div");PS.id="pset";document.body.append(PS);
function psOpen(){$("home").classList.remove("on");PS.innerHTML=`<div class="waves"><i></i><i></i><i></i><i></i><i></i></div><header><button id="psbk" class="bsb">← 戻る</button><h2>設定</h2><span></span></header><div class="psb">
 <div class="pssec"><div class="pprev"><div class="av"></div><div class="tx"><b></b><span></span></div></div></div>
 <div class="pssec"><h3>アイコン</h3><div class="picons">${ICON_E.filter(e=>ICO.includes("e:"+e)).map(e=>`<button class="pic e" data-ic="e:${e}">${e}</button>`).join("")}${Object.keys(ART_N).filter(k=>ICO.includes("c:"+k)).map(k=>`<button class="pic" data-ic="c:${k}" title="${esc(ART_N[k])}" style="background:var(--i-${k}) center/cover no-repeat"></button>`).join("")}</div></div>
 <div class="pssec"><h3>名前</h3><input id="psnm" maxlength="12" autocomplete="off" placeholder="プレイヤー"></div>
 <div class="pssec"><h3>二つ名</h3><div class="pepis"><button class="pep" data-ep="">なし</button>${EPI.filter(t=>TTO.includes(t)).map(t=>`<button class="pep" data-ep="${esc(t)}">${esc(t)}</button>`).join("")}</div></div><p class="pshint">アイコンと二つ名は、ショップで手に入れると増えます。</p></div>`;
 $("psnm").value=PROF.name;PS.classList.add("on");psSync()}
function psSync(){const p=PS.querySelector(".pprev .av");p.style.cssText=avStyle(PROF.icon);p.textContent=avTxt(PROF.icon);p.classList.toggle("e",PROF.icon.startsWith("e:"));
 PS.querySelector(".pprev .tx b").textContent=PROF.name;const t=PS.querySelector(".pprev .tx span");t.textContent=PROF.title||"二つ名なし";t.classList.toggle("none",!PROF.title);
 PS.querySelectorAll(".pic").forEach(b=>b.classList.toggle("on",b.dataset.ic===PROF.icon));PS.querySelectorAll(".pep").forEach(b=>b.classList.toggle("on",b.dataset.ep===PROF.title))}
PS.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.id==="psbk"){PS.classList.remove("on");homeOpen();return}
 if(b.dataset.ic){PROF.icon=b.dataset.ic;profSave();profShow();psSync()}else if(b.dataset.ep!==undefined){PROF.title=b.dataset.ep;profSave();profShow();psSync()}};
PS.addEventListener("input",e=>{if(e.target.id==="psnm"){PROF.name=e.target.value.trim().slice(0,12)||"プレイヤー";PNAME=PROF.name;profSave();profShow();psSync()}});
PS.addEventListener("change",e=>{if(e.target.id==="psnm")e.target.value=PROF.name});
$("hpset").onclick=psOpen;profShow();coinShow();

function soloStart(){NET.on=false;document.body.classList.remove("net");$("bset").classList.remove("on");$("bmat").classList.remove("on");$("home").classList.remove("on");started=true;init()}
$("hbB").onclick=bsetOpen;
$("bsbk").onclick=()=>{if(bsFl)bsFlip(false);else bsetClose()};
$("bsc1").onclick=()=>{pop($("bsc1"));if(!bsFl)setTimeout(()=>bmatOpen(soloTab()),260);else onlRandomDirect()};
$("bsc2").onclick=()=>{pop($("bsc2"));if(!bsFl)bsFlip(true);else bmatOpen("room")};

/* ---- 対戦設定：デッキ選択（ソロ・ランダム・ルーム共通）。自分のデッキ／ソロはCPUのデッキも選べる ---- */
const BMT=document.createElement("div");BMT.id="bmat";document.body.append(BMT);
const BMI={solo:["ソロ","フリー対戦：デッキと強さを自由に選ぶ","バトル開始"],random:["ランダムマッチ","世界のだれかと対戦","マッチング開始"],room:["ルーム","合言葉で友だちと対戦","ルームへ進む"],stage:["ソロ","ステージ：勝ち進んで次を解放","ステージ開始"]};
const bmFull=d=>dkFull(d);
function bmatOpen(mode){if(mode)BM.mode=mode;if(BM.mode==="stage")stageInit();$("home").classList.remove("on");$("bset").classList.remove("on");$("dkb").classList.remove("on");
  if(!DKS.some(d=>d.id===BM.my&&bmFull(d)))BM.my=(DKS.find(d=>d.id===ACT&&bmFull(d))||DKS.find(bmFull)||{}).id||null;
  if(BM.cpu!=="preset"&&!DKS.some(d=>d.id===BM.cpu&&bmFull(d)))BM.cpu="preset";
  bmatRender();BMT.classList.add("on")}
function bmatRender(){const m=BMI[BM.mode],solo=BM.mode==="solo";
  const ico=d=>{const c=d&&d.main&&byN(d.main),k=c&&ART[c.n];return k?`<i class="bmi ic ic-${k}"></i>`:`<i class="bmi e">${c?c.e:"🌸"}</i>`};
  const tile=(d,s,on)=>`<button class="bmd${on?" on":""}" data-s="${s}" data-id="${esc(d.id)}"${bmFull(d)?"":" disabled"}>${ico(d)}<span class="bmt"><b>${esc(d.name)}</b><em>${bmFull(d)?"メイン："+esc(d.main):"未完成（"+dkCnt(d)+"/25）"}</em></span></button>`;
  const pre=`<button class="bmd${BM.cpu==="preset"?" on":""}" data-s="cpu" data-id="preset"><i class="bmi e">🌸</i><span class="bmt"><b>花デッキ（初期構成）</b><em>CPUの標準デッキ</em></span></button>`;
  BMT.innerHTML=`<div class="waves"><i></i><i></i><i></i><i></i><i></i></div><header><button id="bmbk" class="bsb">← 戻る</button><h2>対戦設定</h2><span></span></header>
  <div class="bmb"><div class="bmmode"><b>${m[0]}</b><span>${m[1]}</span></div>${bmTabs()}
  <div class="bmcols"><section class="bmc"><h3>あなたのデッキ</h3><div class="bml">${DKS.map(d=>tile(d,"my",d.id===BM.my)).join("")}</div><button class="obtn sub bmed" data-a="edit">✎ このデッキを編集</button></section>
  ${solo?`<section class="bmc"><h3>CPUのデッキ</h3><div class="bml">${pre}${DKS.map(d=>tile(d,"cpu",d.id===BM.cpu)).join("")}</div></section>`:BM.mode==="stage"?stageCol():""}</div>
  ${solo?`<section class="bmc bmlv"><h3>CPUの強さ</h3><div class="bmlvs">${[["弱い",CPULV.weak],["普通",CPULV.mid],["強い",CPULV.strong]].map(([n,v])=>`<button class="bmd${cpuLvName(BM.lv)===n?" on":""}" data-s="lv" data-id="${v}"><span class="bmt"><b>${n}</b></span></button>`).join("")}</div><div class="bmlb" style="--v:${BM.lv}"><i></i></div></section>`:BM.mode==="stage"?stageLv():""}
  ${BM.my?"":`<p class="os bmnote">完成したデッキがないため、初期構成の花デッキを使います</p>`}
  <div class="orow bmgo"><button class="obtn" data-a="go">${m[2]}</button></div></div>`}
function bmatBack(){BMT.classList.remove("on");bsetOpen();if(BM.mode==="random"||BM.mode==="room")bsFlip(true,true)}
function bmatGo(){if(BM.my){ACT=BM.my;dkSave()}
  if(BM.mode==="solo"||BM.mode==="stage"){if(BM.mode==="stage"){if(!stageStart())return}else BM.st=null;BMT.classList.remove("on");soloStart()}else{ON.dk=BM.my;if(BM.mode==="random")onlRandom();else onlRoomMenu()}}
function bmatEdit(){const k=DKS.findIndex(d=>d.id===BM.my);SELD=k>=0?k:0;DKRET=1;BMT.classList.remove("on");$("dkb").classList.add("on");TOAST="";dkRender()}
BMT.onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled)return;pop(b);
  if(b.id==="bmbk")setTimeout(bmatBack,120);
  else if(b.dataset.s==="tab"){soloTab(b.dataset.id);bmatOpen(b.dataset.id)}
  else if(b.dataset.s){if(b.dataset.s==="my"){BM.my=b.dataset.id;ACT=BM.my;dkSave()}else if(b.dataset.s==="stage")stagePick(+b.dataset.id);else if(b.dataset.s==="lv"){BM.lv=+b.dataset.id;try{localStorage.setItem("cpuLv",BM.lv)}catch(e){}BMT.querySelector(".bmlb").style.setProperty("--v",BM.lv)}else BM.cpu=b.dataset.id;BMT.querySelectorAll(`[data-s="${b.dataset.s}"]`).forEach(x=>x.classList.toggle("on",x===b))}
  else if(b.dataset.a==="edit")setTimeout(bmatEdit,150);else if(b.dataset.a==="go")setTimeout(bmatGo,150)};
$("sresr").onclick=()=>{$("sres").classList.remove("on");init()};
$("sresb").onclick=()=>{$("sres").classList.remove("on");bmatOpen(BM.st?"stage":"solo")};

const onl=$("onl"),obox=$("obox");
const onlShow=h=>{obox.innerHTML=h;onl.classList.add("on")};
function onlClose(){ON.bye=1;if(ON.ws){try{ON.ws.close()}catch{}}ON.ws=null;ON.st=null;ON.go=null;ON.room=null;clearInterval(ON.timer);onl.classList.remove("on")}
const noSrv=()=>{if(SRV)return false;onlShow(`<h3>オンライン</h3><p class="os">このページ（プレビュー）からはサーバーに接続できません。<br>Cloudflareにデプロイした版でご利用ください。</p><div class="orow"><button class="obtn sub" data-a="close">閉じる</button></div>`);return true};
function wsOpen(path,onmsg,onend){const w=new WebSocket(wsUrl(path));let opened=0;w.onopen=()=>{opened=1};w.onmessage=e=>{try{onmsg(JSON.parse(e.data))}catch{}};w.onclose=()=>{clearInterval(w._k);onend(opened)};w._k=setInterval(()=>{if(w.readyState===1)w.send("ping")},25000);return w}
const wsSend=o=>{if(ON.ws&&ON.ws.readyState===1)ON.ws.send(JSON.stringify(o))};
const errView=m=>{clearInterval(ON.timer);onlShow(`<h3>オンライン</h3><p class="oe">${esc(m)}</p><div class="orow"><button class="obtn sub" data-a="close">閉じる</button></div>`)};
const menuView=err=>onlShow(`<h3>ルーム</h3><div class="orow col"><button class="obtn" data-a="create">🔑 ルームを作る</button><div class="oj"><input id="ocode" maxlength="4" placeholder="合言葉" autocomplete="off"><button class="obtn" data-a="join">入室</button></div>${err?`<p><span class="oe">${esc(err)}</span></p>`:""}</div><div class="orow"><button class="obtn sub" data-a="close">閉じる</button></div>`);
function onlRoomMenu(){if(noSrv())return;onlClose();ON.bye=0;menuView("");const i=$("ocode");if(i){i.oninput=()=>{i.value=i.value.toUpperCase().replace(/[^A-Z0-9]/g,"")};i.onkeydown=e=>{if(e.key==="Enter")OA.join()};setTimeout(()=>i.focus(),50)}}
function onlRandom(){
  if(noSrv())return;onlClose();ON.bye=0;ON.via="random";const t0=Date.now();
  onlShow(`<h3>対戦相手を探しています</h3><div class="osp"><i></i><i></i><i></i></div><p class="ot" id="oel">0秒</p><p class="os">${esc(PNAME)} ／ ${esc(deckLabel())}</p><div class="orow"><button class="obtn sub" data-a="close">キャンセル</button></div>`);
  ON.timer=setInterval(()=>{const e=$("oel");if(e)e.textContent=Math.floor((Date.now()-t0)/1000)+"秒"},500);
  const w=wsOpen("/ws/match",m=>{if(m.t==="matched"){clearInterval(ON.timer);ON.ws=null;w.onclose=null;try{w.close()}catch{}connectRoom(m.room,"random")}else if(m.t==="err")errView(m.msg)},o=>{if(ON.ws===w&&!ON.bye)errView(o?"接続が切れました。":"サーバーに接続できませんでした。")});
  ON.ws=w;w.onopen=()=>w.send(JSON.stringify({t:"queue",pid:PID,name:PNAME,deck:deckLabel()}));
}
function onRoomMsg(m){
  if(m.t==="state"){ON.st=m;if(NET.on)netState(m);else if(!ON.go)lobbyView()}
  else if(m.t==="start"){if(!NET.on&&!ON.go){ON.go=m;netStartGame(m)}}
  else if(m.t==="lobby")netToLobby();
  else if(m.t==="relay"||m.t==="plans"||m.t==="opp_left")netRecv(m);
  else if(m.t==="err"){ON.bye=1;ON.onfail?ON.onfail(m.msg):errView(m.msg)}
}
function connectRoom(code,via,onfail){
  ON.via=via;ON.room=code;ON.st=null;ON.go=null;ON.log=[];ON.bye=0;ON.onfail=onfail;NET.ack=0;NET.on=false;
  const w=wsOpen("/ws/room/"+code,onRoomMsg,o=>{if(ON.ws!==w||ON.bye)return;if(NET.on)netReconnect();else errView(o?"接続が切れました。":"サーバーに接続できませんでした。")});
  ON.ws=w;w.onopen=()=>w.send(JSON.stringify({t:"hello",pid:PID,name:PNAME,icon:PROF.icon,title:PROF.title,bk:deckBk(ON.dk),deck:deckLabel(),ack:0}));
}
const slot=(p,me)=>`<div class="osl${p?" on":""}${me?" me":""}"><b>${me?"あなた":"相手"}</b><span>${p?esc(p.name):"待機中…"}</span><em>${p?esc(p.deck||"")+(p.online===false?"（切断中）":""):"&nbsp;"}</em><i>${p&&p.ready?"✔ 準備OK":""}</i></div>`;
/* ランダムマッチ：対戦設定は出さない。使うデッキは★の使用中デッキ。見つかったら自動で準備OKにして、そのまま対戦へ */
function onlRandomDirect(){BM.mode="random";BM.my=(DKS.find(d=>d.id===ACT&&bmFull(d))||DKS.find(bmFull)||{}).id||null;if(BM.my){ACT=BM.my;dkSave()}ON.dk=BM.my;onlRandom()}
function lobbyView(){const s=ON.st;if(!s)return;const me=s.players[s.you],op=s.players[1-s.you],both=!!(me&&op),room=ON.via!=="random";
  if(!room){if(me&&me.deck!==deckLabel())wsSend({t:"deck",deck:deckLabel(),bk:deckBk(ON.dk)});else if(both&&me&&!me.ready)wsSend({t:"ready",v:true});
    onlShow(`<h3>対戦相手が見つかりました</h3><div class="osp"><i></i><i></i><i></i></div><p class="os">${esc(op?op.name:"")}</p><div class="orow"><button class="obtn sub" data-a="leave">キャンセル</button></div>`);return}
  const ds=DKS.filter(dkFull),cur=ON.dk&&ds.some(d=>d.id===ON.dk)?ON.dk:(ds.some(d=>d.id===ACT)?ACT:(ds[0]?ds[0].id:""));ON.dk=cur;
  const sel=ds.length?`<select id="odsel">${ds.map(d=>`<option value="${esc(d.id)}"${d.id===cur?" selected":""}>${esc(d.name)}</option>`).join("")}</select>`:`<span class="os">花デッキ（初期構成）</span>`;
  onlShow(`<h3>対戦設定</h3><div class="ocode">${esc(ON.room)}${room?`<button class="obtn sub mini" data-a="copy">コピー</button><button class="obtn sub mini" data-a="link">招待リンク</button>`:""}</div><div class="osls">${slot(me,1)}${slot(op,0)}</div><div class="odk"><label>使うデッキ</label>${sel}</div><p class="os">${both?"デッキを選んで、準備OKを押してください":"相手の参加を待っています…"}</p><div class="orow"><button class="obtn" data-a="ready" ${both?"":"disabled"}>${me&&me.ready?"準備を取り消す":"準備OK"}</button><button class="obtn sub" data-a="leave">退室</button></div>`);
  const e=$("odsel");if(e)e.onchange=()=>{ON.dk=e.value;wsSend({t:"deck",deck:deckLabel(),bk:deckBk(ON.dk)})};
  if(me&&me.deck!==deckLabel())wsSend({t:"deck",deck:deckLabel(),bk:deckBk(ON.dk)});
}
function startView(){const g=ON.go;if(!g)return;const s=ON.st,op=s&&s.players[1-g.you];
  onlShow(`<h3>対戦の準備ができました</h3><p>${esc(PNAME)} <b>VS</b> ${esc(op?op.name:"相手")}</p><p class="os">先攻：${g.first===g.you?"あなた":"相手"}　／　シード：${g.seed}</p><p class="os">対戦の同期は次のステップで実装します。いまは通信テストができます。</p><div class="orow"><button class="obtn" data-a="hi">👋 あいさつを送る</button><button class="obtn sub" data-a="leave">退室</button></div><p class="os" id="olog">${ON.log.slice(-3).join("<br>")}</p>`)}
const OA={
  close:()=>onlClose(),
  leave:()=>{wsSend({t:"leave"});onlClose()},
  create:async()=>{try{const r=await fetch(SRV+"/api/room/new",{method:"POST"});const j=await r.json();if(!j.code)throw 0;connectRoom(j.code,"room")}catch{menuView("ルームを作れませんでした。")}},
  join:()=>{const c=(($("ocode")||{}).value||"").toUpperCase();if(c.length!==4){menuView("合言葉は4文字です。");return}onlShow(`<h3>入室中…</h3><div class="osp"><i></i><i></i><i></i></div>`);connectRoom(c,"room",m=>{onlClose();ON.bye=0;menuView(m)})},
  ready:()=>{const s=ON.st;if(!s)return;const me=s.players[s.you];wsSend({t:"ready",v:!(me&&me.ready)})},
  copy:()=>{navigator.clipboard&&navigator.clipboard.writeText(ON.room).catch(()=>{})},
  link:()=>{navigator.clipboard&&navigator.clipboard.writeText(location.origin+location.pathname+"?room="+ON.room).catch(()=>{})},
  hi:()=>{wsSend({t:"relay",d:{hi:PNAME}});ON.log.push("あなた：👋 送信");startView()},
};
obox.onclick=e=>{const b=e.target.closest("[data-a]");if(!b||b.disabled)return;pop(b);const f=OA[b.dataset.a];if(f)f()};
(()=>{const q=new URLSearchParams(location.search).get("room");if(q&&/^[A-Za-z0-9]{4}$/.test(q)){setTimeout(()=>{bsetOpen();bsFlip(true,true);if(noSrv())return;ON.bye=0;onlShow(`<h3>入室中…</h3><div class="osp"><i></i><i></i><i></i></div>`);connectRoom(q.toUpperCase(),"room",m=>{onlClose();ON.bye=0;menuView(m)})},300)}})();


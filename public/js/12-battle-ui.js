/* ===== バトル画面のUI：相手・自分の名前／アイコン／二つ名、ログ画面、降参 =====
   02-battle.js の init()／06-online.js の initOnline() から bui() が呼ばれる（先に動くので typeof で守っている）。
   ログの書き込み（LG）は 02-battle.js。ここは表示だけ。 */

/* ---- 名前・アイコン・二つ名 ----
   icon は "e:🌱"（絵文字）か "c:キー"（カード絵。キーは ART の値）。b＝強さの帯（0弱い／1普通／2強い）
   ステージの相手は 11-solo.js の STAGES[].who、フリー対戦は強さの帯に合う中から毎回ランダム */
const CPU_WHO=[
  {name:"ワカバ",icon:"e:🌱",title:"芽吹きの見習い",b:0},{name:"ポポ",icon:"e:🌼",title:"綿毛の旅人",b:0},{name:"ミツバ",icon:"e:🍀",title:"幸運の探し手",b:0},
  {name:"モミジ",icon:"e:🍁",title:"紅葉の語り部",b:1},{name:"ヒナ",icon:"e:🌷",title:"春風の育て手",b:1},{name:"キノ",icon:"e:🍄",title:"木陰の収集家",b:1},
  {name:"オオキ",icon:"e:🌳",title:"森の大賢者",b:2},{name:"ハナノ",icon:"e:🌸",title:"千年桜の女王",b:2},{name:"ムラサキ",icon:"e:🪻",title:"紫苑の策士",b:2}];
const okIc=ic=>typeof ic==="string"&&/^(c:\w\w|e:.{1,8})$/u.test(ic)&&(!ic.startsWith("c:")||!!ART_N[ic.slice(2)]);
const whoMe=()=>({name:PROF.name,icon:PROF.icon,title:PROF.title});
function whoCpu(lv){if(BM.st&&BM.st.who)return BM.st.who;const L=CPU_WHO.filter(w=>w.b===(lv<.34?0:lv<.67?1:2));return L[Math.floor(Math.random()*L.length)]}
function whoOpp(){const op=ON.st&&ON.st.players&&ON.st.players[1-NET.you];return{name:NET.opp||"相手",icon:op&&okIc(op.icon)?op.icon:"e:🌿",title:op&&EPI.includes(op.title)?op.title:""}}
const plHTML=w=>`<i class="pav${w.icon.startsWith("e:")?" e":""}" style="${avStyle(w.icon)}">${esc(avTxt(w.icon))}</i><span class="ptx"><b>${esc(w.name)}</b>${w.title?`<em>${esc(w.title)}</em>`:""}</span>`;
function plShow(){[0,1].forEach(o=>{const e=$("pl"+o);if(e&&S.who&&S.who[o])e.innerHTML=plHTML(S.who[o])})}
/* only1＝相手だけ更新（オンラインで相手の情報が届いたとき） */
/* 相手の裏面：オンラインは相手が送った装着中の裏面、ソロはCPUの名前から決める（毎回同じ） */
function oppBk(){if(NET.on){const op=ON.st&&ON.st.players&&ON.st.players[1-NET.you];return op&&BKD[op.bk]?op.bk:"std"}const ks=Object.keys(BKD),n=S&&S.who&&S.who[1]?S.who[1].name:"";let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))>>>0;return n?ks[h%ks.length]:"std"}
function bui(only1){if(!S)return;if(!only1)S.who=[whoMe(),NET.on?whoOpp():whoCpu(S.lv[1])];else S.who[1]=whoOpp();plShow()}

/* ---- VS画面：バトル開始時、マリガンの前に互いのプレイヤー情報を数秒見せる（タップで早送り）。S.who は bui() が先に作る ---- */
function vsScreen(){return new Promise(res=>{const w=S&&S.who;if(!w||!w[0]||!w[1]){res();return}
  const old=$("vs");if(old)old.remove();const el=document.createElement("div");el.id="vs";
  const side=(p,c,tag)=>`<div class="vsp ${c}"><span class="vst">${tag}</span><i class="vsav${p.icon.startsWith("e:")?" e":""}" style="${avStyle(p.icon)}">${esc(avTxt(p.icon))}</i><b>${esc(p.name)}</b><em>${p.title?esc(p.title):"&nbsp;"}</em></div>`;
  el.innerHTML=`<div class="vsbg"></div>${side(w[0],"l","あなた")}<div class="vsv"><span>VS</span></div>${side(w[1],"r","対戦相手")}`;document.body.appendChild(el);
  const t0=Date.now();let done=0;const end=()=>{if(done)return;done=1;el.classList.add("out");setTimeout(()=>{el.remove();res()},450)};
  setTimeout(end,3200);el.onclick=()=>{if(Date.now()-t0>1000)end()}})}

/* ---- ログ画面 ---- */
const LGW=document.createElement("div");LGW.id="lgw";document.body.append(LGW);
const LGI={turn:"🌿",put:"🌱",clash:"⚔️",fx:"✨",act:"🎴",rm:"🍂",area:"🏁",pt:"⭐",end:"🏆"};
let LGN=null;
const lgNames=()=>LGN||(LGN=new RegExp([...new Set(CARDS.map(c=>c.n))].filter(n=>byN(n)).sort((a,b)=>b.length-a.length).map(escRe).join("|"),"g"));
/* 本文のカード名にホバー用の印を付ける（相手の名前の中は除く：「クズハ」の「クズ」など） */
const lgLink=h=>{const op=esc(OPN());return h.split(op).map(s=>s.replace(lgNames(),m=>`<u class="lgc" data-n="${m}">${m}</u>`)).join(op)};
const LGD=document.createElement("div");LGD.id="lgd";
const lgdHide=()=>LGD.classList.remove("on");
function lgHTML(){const L=(S&&S.lg)||[];if(!L.length)return'<p class="lge">まだ何も起きていません</p>';
  const by=[];L.forEach(e=>{let g=by[by.length-1];if(!g||g.t!==e.t){g={t:e.t,r:[]};by.push(g)}if(e.k!=="turn")g.r.push(e)});
  return by.map(g=>`<section class="lgg"><h4><span>ターン ${g.t}</span></h4>${g.r.map(e=>`<div class="lgr k-${e.k}${e.o===0?" me":e.o===1?" cp":""}"><i class="lgi">${LGI[e.k]||"・"}</i>${e.o===0||e.o===1?`<b class="lgt ${e.o?"cp":"me"}">${esc(OWN(e.o))}</b>`:""}<span class="lgx">${lgLink(e.h)}</span></div>`).join("")}</section>`).join("")}
function lgRender(keep){const b=LGW.querySelector(".lgb");if(!b)return;const st=b.scrollHeight-b.scrollTop-b.clientHeight<48;b.innerHTML=lgHTML();if(!keep||st)b.scrollTop=b.scrollHeight}
function lgLive(){if(LGW.classList.contains("on"))lgRender(true)}
function lgOpen(){LGW.innerHTML='<div class="lgp"><div class="lgh"><h3>ログ</h3><button class="lgx0" title="閉じる">✕</button></div><div class="lgb"></div></div>';LGW.append(LGD);lgRender();LGW.classList.add("on")}
const lgClose=()=>{lgdHide();LGW.classList.remove("on")};
LGW.onmouseover=e=>{const u=e.target.closest&&e.target.closest(".lgc"),c=u&&byN(u.dataset.n);if(!c){lgdHide();return}
  if(LGD._n!==c.n||!LGD.classList.contains("on")){LGD.style.setProperty("--ac",IC[c.d]);LGD.innerHTML=ibHTML(c,c.p,false);LGD._n=c.n;fitPF(LGD)}LGD.classList.add("on")};
LGW.onmouseleave=lgdHide;
LGW.onclick=e=>{if(e.target===LGW||e.target.closest(".lgx0"))lgClose()};
$("lgb").onclick=lgOpen;

/* ---- 降参 ---- */
const FFW=document.createElement("div");FFW.id="ffw";document.body.append(FFW);
FFW.innerHTML='<div class="ffp"><p>降参しますか？</p><div class="ffr"><button class="obtn sub" data-f="y">はい</button><button class="obtn" data-f="n">いいえ</button></div></div>';
const ffShut=()=>FFW.classList.remove("on");
function surrender(){if(!S||S.over)return;if(NET.on){netSend({k:"ff"});netOut({t:"done"})}LG("end",0,"降参しました");forceEnd("CPUの勝ち","降参しました",{nopay:1})}
FFW.onclick=e=>{const b=e.target.closest("[data-f]");if(b){pop(b);const y=b.dataset.f==="y";ffShut();if(y)surrender();return}if(e.target===FFW)ffShut()};
$("ffb").onclick=()=>{if(!S||S.over||$("mg"))return;FFW.classList.add("on")};
addEventListener("keydown",e=>{if(e.key==="Escape"){ffShut();lgClose()}});

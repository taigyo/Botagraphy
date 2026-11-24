/* ===== ホーム・デッキ構築 ===== */
const DK_KEY="botagraphy.decks2",isMn=c=>c.a.includes("メイン");
const POOL=CARDS.filter(c=>(c.d==="f"||c.d==="t")&&!c.tok),TOKS=CARDS.filter(c=>c.tok),MAINS=POOL.filter(isMn),NORM=POOL.filter(c=>!isMn(c)),byN=n=>POOL.find(c=>c.n===n)||TOKS.find(c=>c.n===n);
const dkNew=(name,s,emp)=>({id:"d"+Date.now().toString(36)+rnd(1e4),name,main:s?s.main:emp?null:(MAINS[0]?MAINS[0].n:null),k:s?[...s.k]:emp?[]:NORM.filter(c=>c.d==="f").map(c=>c.n)});
const BM={mode:"solo",my:null,cpu:"preset",lv:(()=>{try{const v=parseFloat(localStorage.getItem("cpuLv"));return v>=0&&v<=1?v:.5}catch(e){return .5}})()};let DKRET=0;
let DKS=[dkNew("花デッキ")],ACT=DKS[0].id,SELD=0,started=false,DKL=0,LP=null,TOAST="";
try{const j=JSON.parse(localStorage.getItem(DK_KEY)||"null");if(j&&Array.isArray(j.decks)&&j.decks.length){DKS=j.decks.map(d=>({id:String(d.id),name:String(d.name||"デッキ"),main:byN(d.main)&&isMn(byN(d.main))&&!byN(d.main).tok?d.main:null,k:[...new Set((d.k||[]).filter(n=>byN(n)&&!isMn(byN(n))&&!byN(n).tok))].slice(0,12)}));ACT=DKS.some(d=>d.id===j.act)?j.act:DKS[0].id}}catch(e){}
const dkSave=()=>{try{localStorage.setItem(DK_KEY,JSON.stringify({decks:DKS,act:ACT}))}catch(e){}};
const dkFull=d=>!!d.main&&d.k.length===12,dkCnt=d=>(d.main?1:0)+d.k.length*2;
function myDeck(id){let d=DKS.find(x=>x.id===(id||ACT));if(!d||!dkFull(d))d=dkNew("");
  return [byN(d.main),...d.k.flatMap(n=>[byN(n),byN(n)])].map(c=>({...c})).sort(()=>Math.random()-.5)}
function homeOpen(){$("dkb").classList.remove("on");$("dkdt").classList.remove("on");const d=DKS.find(x=>x.id===ACT);
  $("hmdt").classList.remove("on");homeRender();$("home").classList.add("on")}

/* ホーム：使用デッキを斜め上から見た盤に並べる */
function hmCard(n){const w=document.createElement("div");w.className="hmc";w.dataset.n=n;w.title=n;const e=cardEl(byN(n));e.classList.add("hm");e.removeAttribute("data-n");w.appendChild(e);return w}
function homeRender(){const d0=DKS.find(x=>x.id===ACT),d=d0&&dkFull(d0)?d0:dkNew("");
  const m=$("hmmain");m.innerHTML="";if(d.main)m.appendChild(hmCard(d.main));
  const g=$("hmcards");g.innerHTML="";d.k.forEach(n=>g.appendChild(hmCard(n)))}
function hmDetail(n){const c=byN(n);$("hmdt").innerHTML=detailHTML(c,c.p,"",true);$("hmdt").classList.add("on");fitPF($("hmdt"));introOn($("hmdt"));tiltKick()}
$("home").addEventListener("click",e=>{if(e.target.closest("#hmdt")){if(!e.target.closest(".dkw"))$("hmdt").classList.remove("on");return}const c=e.target.closest(".hmc[data-n]");if(c)hmDetail(c.dataset.n)});
/* デッキ構築：カード検索（スペース区切りでAND） */
let HITS=0;const dkTx=c=>String(c.t||"").replace(/<[^>]*>/g,"");
function dkMatch(c){const q=($("dksearch").value||"").normalize("NFKC").toLowerCase().trim();if(!q)return true;
  const hay=[c.n,c.sub||"",c.e,...c.a,isMn(c)?"メイン":"通常 通常カード",dkTx(c)].join(" ").normalize("NFKC").toLowerCase();
  return q.split(/\s+/).every(t=>{let m=t.match(/^(?:コスト|cost|c)(\d+)$/);if(m)return c.c===+m[1];m=t.match(/^(?:パワー|power|p)(\d+)$/);if(m)return c.p===+m[1];if(/^\d+$/.test(t))return c.c===+t||c.p===+t;return hay.includes(t)})}
$("dksearch").oninput=()=>dkRender();$("dksx").onclick=()=>{$("dksearch").value="";dkRender();$("dksearch").focus()};
function cardEl(c){const d=document.createElement("div");d.className="dkc hc"+(isMn(c)?" mn":"")+(ART[c.n]?" ill ac-"+ART[c.n]:"");d.dataset.n=c.n;d.style.setProperty("--ac",c.d==="f"?"#f4a6c0":"#8ccf9c");d.innerHTML=`<b class="hcc">${c.c}</b><i class="em">${c.e}</i><em>${c.n}</em><span class="tx"><span>${c.t}</span></span><small>${c.p==null?"✦":c.p}</small>`;return d}
function emptyEl(t){const d=document.createElement("div");d.className="dkc em";d.textContent=t;return d}
function dkRender(){
  const D=DKS[SELD],T=$("dkt");T.innerHTML="";
  DKS.forEach((d,i)=>{const b=document.createElement("button");b.className="dktab"+(i===SELD?" on":"");b.innerHTML='<span class="ts"></span><span class="tn"></span>';b.children[0].textContent=d.id===ACT?"★":"";b.children[1].textContent=d.name;b.onclick=()=>{SELD=i;TOAST="";dkRender()};T.appendChild(b)});
  const nb=document.createElement("button");nb.textContent="＋";nb.className="dktab add";nb.title="新規デッキ";nb.onclick=()=>{DKS.push(dkNew("デッキ"+(DKS.length+1),null,1));SELD=DKS.length-1;TOAST="";dkSave();dkRender()};T.appendChild(nb);
  if(document.activeElement!==$("dkname"))$("dkname").value=D.name;
  const full=dkFull(D);const ak=$("dkact");ak.textContent=D.id===ACT?"★":"☆";ak.classList.toggle("is",D.id===ACT);ak.title=D.id===ACT?"使用中のデッキ":full?"対戦で使う":"25枚そろうと使えます";ak.disabled=!full||D.id===ACT;$("dkdel").disabled=DKS.length<2;
  const n=dkCnt(D),c=$("dkc");c.textContent=`${n} / 25`;c.className=n===25?"ok":"ng";
  $("dkm").textContent=TOAST||(D.id===ACT&&!full?"未完成のため、対戦では初期構成のデッキを使います":"");
  const L=$("dkdk");L.innerHTML="";const mr=document.createElement("div");mr.className="dkmain";mr.appendChild(D.main?cardEl(byN(D.main)):emptyEl("メイン"));L.appendChild(mr);
  const g=document.createElement("div");g.className="dkgrid3";g.style.marginTop="8px";
  for(let i=0;i<12;i++){if(D.k[i]){g.appendChild(cardEl(byN(D.k[i])))}else g.appendChild(emptyEl("＋"))}
  L.appendChild(g);
  const cv={};let sum=0;dkCards(D).forEach(([x,m])=>{cv[x.c]=(cv[x.c]||0)+m;sum+=x.c*m});
  const mx=Math.max(1,...Object.values(cv)),top=Math.max(7,...Object.keys(cv).map(Number));let h="";
  for(let i=0;i<=top;i++){const v=cv[i]||0;h+=`<div class="dkcol"><span>${v||""}</span><i style="height:${v/mx*52}px"></i><em>${i}</em></div>`}
  $("dkcurve").innerHTML=h;$("dkavg").textContent=`平均コスト ${n?(sum/n).toFixed(1):"-"}`;
  const R=$("dkg"),st=R.scrollTop;R.innerHTML="";HITS=0;
  [["メイン",MAINS],["通常カード",NORM],["トークン",TOKS]].forEach(([t,a])=>{const hh=document.createElement("h3");hh.textContent=t;if(t==="メイン")hh.dataset.t="メイン";R.appendChild(hh);const gg=document.createElement("div");gg.className="dkgr";
    a.filter(dkMatch).forEach(c=>{HITS++;const e=cardEl(c);if(c.n===D.main||D.k.includes(c.n)){e.classList.add("in");e.insertAdjacentHTML("beforeend",'<b class="dkok">✓</b>')}gg.appendChild(e)});if(!gg.childElementCount)hh.remove();else R.appendChild(gg)});if(!HITS){const p=document.createElement("p");p.className="dkno";p.textContent="該当するカードがありません";R.appendChild(p)}
  R.scrollTop=st}
const dkCards=D=>[...(D.main?[[byN(D.main),1]]:[]),...D.k.map(n=>[byN(n),2])];
function dkToggle(n){const D=DKS[SELD],c=byN(n);TOAST="";if(c.tok){TOAST="トークンはデッキに入れられません";dkRender();return}
  if(isMn(c)){D.main=D.main===n?null:n}
  else if(D.k.includes(n))D.k.splice(D.k.indexOf(n),1);
  else if(D.k.length>=12)TOAST="通常カードは12種までです。先に1種抜いてください";
  else{D.k.push(n);D.k.sort((a,b)=>byN(a).c-byN(b).c)}
  dkSave();dkRender()}
function dkDetail(n){const c=byN(n),D=DKS[SELD],inn=c.n===D.main||D.k.includes(n),add=inn||c.tok?"":`<button class="dkadd" data-t="${n}">デッキに入れる</button>`;
  $("dkdt").innerHTML=detailHTML(c,c.p,add,true);
  $("dkdt").classList.add("on");fitPF($("dkdt"));introOn($("dkdt"));tiltKick()}
const dkb=$("dkb"),lpEnd=()=>{clearTimeout(LP);dkb.querySelectorAll(".dkc.hold").forEach(x=>x.classList.remove("hold"))};
dkb.addEventListener("pointerdown",e=>{DKL=0;const c=e.target.closest(".dkc[data-n]");if(!c)return;c.classList.add("hold");LP=setTimeout(()=>{c.classList.remove("hold");DKL=1;dkToggle(c.dataset.n)},450)});
dkb.addEventListener("pointerup",lpEnd);dkb.addEventListener("pointercancel",lpEnd);
dkb.addEventListener("pointerout",e=>{const c=e.target.closest(".dkc");if(c&&e.relatedTarget&&c.contains(e.relatedTarget))return;lpEnd()});
dkb.addEventListener("click",e=>{if(DKL){DKL=0;return}if(e.target.closest("#dkdt")){const b=e.target.closest("button[data-t]");if(b)dkToggle(b.dataset.t);if(b||!e.target.closest(".dkbig,.dkw,.gpn"))$("dkdt").classList.remove("on");return}const c=e.target.closest(".dkc[data-n]");if(c)dkDetail(c.dataset.n)});
$("dkname").oninput=e=>{DKS[SELD].name=e.target.value||"デッキ";dkSave()};$("dkname").onchange=dkRender;
$("dkact").onclick=()=>{ACT=DKS[SELD].id;dkSave();dkRender()};
$("dkdel").onclick=()=>{if(DKS.length<2)return;const d=DKS.splice(SELD,1)[0];if(d.id===ACT)ACT=DKS[0].id;SELD=0;dkSave();dkRender()};
$("hbD").onclick=()=>{DKRET=0;$("home").classList.remove("on");$("dkb").classList.add("on");SELD=Math.max(0,DKS.findIndex(d=>d.id===ACT));TOAST="";dkRender()};
$("dkbk").onclick=()=>{if(DKRET){DKRET=0;$("dkb").classList.remove("on");$("dkdt").classList.remove("on");bmatOpen()}else homeOpen()};
$("hm").onclick=homeOpen;


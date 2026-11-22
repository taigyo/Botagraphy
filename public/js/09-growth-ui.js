const FXSEL=".dkc,.card,.ib,[data-i]";new MutationObserver(rs=>{if(!rs.some(r=>{for(const n of r.addedNodes)if(n.nodeType===1&&!n.classList.contains("fxo")&&!n.classList.contains("fxl")&&(n.matches(FXSEL)||n.querySelector(FXSEL)))return true}))return;try{fxScan()}catch{}}).observe(document.body,{childList:true,subtree:true});
let GCUR=null;const FXTABS=["weather","particles","sparkle","light","sway","filter","unique"];
let CTAB=null,CNEW=null,CPOP=false,CTOP="fx",GSEL=null,RGPEND=null;/* RGPEND：レベルアップ演出が閉じるまで、ゲージは前の値で止めておく */
const GRES=document.createElement("div"),CUST=document.createElement("div");GRES.id="gres";CUST.id="cust";document.body.append(GRES,CUST);
/* 詳細・成長を開いている間は背面の演出を止める（CSSの body.ov と、FXEの描画対象の絞り込みに使う） */
{const E=["hmdt","dkdt","bdt","cust"].map(i=>document.getElementById(i)),sy=()=>document.body.classList.toggle("ov",E.some(e=>e&&e.classList.contains("on"))),mo=new MutationObserver(sy);E.forEach(e=>e&&mo.observe(e,{attributes:true,attributeFilter:["class"]}))}
function growCard(c){const g=gst(c.n);if(COIN<GNEED)return;COIN-=GNEED;coinSave();const l0=g.lv;g.lv++;RGPEND={from:(l0%10)*10,to:(g.lv%10)*10,wrap:g.lv%10===0};
  let got=null;const give=id=>{got={id,...FXG[id]};g.own.push(id);CNEW=id;CTAB=got.cat};
  /* 1レベルにつき1つ。10の倍数のレベルは固有（持っていない固有が無ければ一般） */
  if(g.lv%10===0){const u=fxUni(c.n).filter(id=>!g.own.includes(id));if(u.length)give(fxPick(u))}
  if(!got){const pool=fxGen(c.n).filter(id=>!g.own.includes(id));if(pool.length)give(fxPick(pool))}
  gsave();gup(c,l0,g.lv,got);if(CUST.classList.contains("on")){custLeft();custList()}}
/* 成長演出：光の放射・リング・紙吹雪 → LEVEL UP → 新しいエフェクトのお披露目 */
function gup(c,l0,l1,got){const cols=["#ffd36e","#ff8fb8","#8fd3ff","#a8e6a1","#c9a8ff","#ffffff"];let b="";
 for(let i=0;i<34;i++){const a=Math.random()*Math.PI*2,r=140+Math.random()*190;b+=`<i style="--tx:${(Math.cos(a)*r).toFixed(0)}px;--ty:${(Math.sin(a)*r-40).toFixed(0)}px;--c:${cols[i%cols.length]};--dl:${(Math.random()*.25).toFixed(2)}s;--rt:${(Math.random()*720-360).toFixed(0)}deg;--w:${6+(Math.random()*7|0)}px"></i>`}
 GRES.innerHTML=`<div class="gup"><div class="gu-rays"></div><div class="gu-ring"></div><div class="gu-ring r2"></div><div class="gu-burst">${b}</div><div class="gu-box"><div class="gu-title">LEVEL UP!</div><div class="gu-lv"><span>Lv.${l0}</span><em>→</em><b>Lv.${l1}</b></div><p class="gu-nm">${esc(c.n)}</p>${got?`<div class="gu-got"><div class="gu-ef">${fxHTML([got.id],c.n)}<u>${got.cat==="unique"?"固有":"NEW"}</u></div>${got.cat==="unique"?'<b class="gu-uq">固有</b>':""}<p class="gnm">${esc(got.name)}</p><p class="os">${esc(FX_CAT[got.cat][0])}　${esc(got.desc)}</p></div>`:'<p class="os gu-got">獲得できるエフェクトはもうありません</p>'}<button class="obtn gu-ok" data-r="ok" disabled>OK</button></div></div>`;
 GRES.dataset.rdy="";GRES.classList.add("on");const ok=GRES.querySelector(".gu-ok");ok.addEventListener("animationend",()=>{ok.disabled=false;GRES.dataset.rdy="1"},{once:true})}
/* OKが押せるようになるまでは何も受け付けない。押せるようになったら、OKでも外側でも閉じる。閉じてもカードは作り直さない */
const gClose=()=>{GRES.classList.remove("on");GRES.dataset.rdy="";tiltKick();const b=CUST.querySelector(".rg-num");if(b){b.classList.remove("lvp");void b.offsetWidth;b.classList.add("lvp")}
  if(RGPEND){const P=RGPEND,e=CUST.querySelector(".rg-r1");RGPEND=null;if(e)requestAnimationFrame(()=>requestAnimationFrame(()=>{e.style.setProperty("--p",P.wrap?100:P.to);if(P.wrap)setTimeout(()=>{e.style.transition="none";e.style.setProperty("--p",P.to)},1300)}))}};
GRES.onclick=e=>{if(GRES.dataset.rdy!=="1")return;const b=e.target.closest("[data-r]");if(b){pop(b);gClose();return}if(!e.target.closest(".gu-box"))gClose()};
const custCats=(c,g)=>FXTABS.filter(k=>!(FX_BAN[c.n]||[]).includes(k)).filter(k=>k!=="unique"||fxUni(c.n).length||g.own.some(id=>FXG[id].cat==="unique"));
function leftHTML(c,g){const n=COIN,ok=n>=GNEED,uq=fxUni(c.n),left=uq.filter(id=>!g.own.includes(id)).length,r=g.lv%10,k=++ORGN,
  hint=left?`<p class="rg-nx">固有エフェクトまで あと<b>${10-r}</b>レベル</p>`:(uq.length?'<p class="rg-nx">固有エフェクトはすべて獲得済みです</p>':"");
 return`<div class="rg-lv"><svg class="rg-ring" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="rgq${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3c46c"/><stop offset=".5" stop-color="#c8a24c"/><stop offset="1" stop-color="#9fbf98"/></linearGradient></defs><circle class="rg-r0" cx="80" cy="80" r="68"/><circle class="rg-r2" cx="80" cy="80" r="76"/><circle class="rg-r1${RGPEND?" hold":""}" cx="80" cy="80" r="68" pathLength="100" stroke="url(#rgq${k})" style="--p:${RGPEND?RGPEND.from:r*10}"/></svg><div class="rg-lt"><em>LEVEL</em><b class="rg-num${CPOP?" lvp":""}">${g.lv}</b></div></div>${hint}<div class="rg-coin"><i class="coin">B</i><b>${n}</b><span>ボタコイン</span></div><button class="rg-btn" data-c="grow"${ok?"":" disabled"}><span>成長</span><small>${ok?`<i class="coin s">B</i> ${GNEED} ボタコイン`:`ボタコインが足りません（${GNEED}必要）`}</small></button><button class="gdbg" data-c="dbg">テスト用：ボタコイン+10</button>`}
function genHTML(c,g){const ids=Object.keys(INV).filter(id=>INV[id]>0),can=id=>!g.own.includes(id)&&fxOk(id,c.n);if(GSEL&&(!INV[GSEL]||!can(GSEL)))GSEL=null;
 return`<p class="os">ショップで買ったアイテムです。選んで「このカードに使う」と、そのカード専用になります（1つ消費）。</p><div class="crows">${ids.length?ids.map(id=>{const d=FXG[id],ok=can(id);return`<div class="crow gen${GSEL===id?" on":""}${ok?"":" na"}"${ok?` data-c="gsel"`:""} data-id="${esc(id)}"><div class="cth">${fxHTML([id],c.n)}</div><div class="cinfo"><b>${esc(d.name)}</b><span>${esc(FX_CAT[d.cat][0])}　${esc(d.desc)}</span></div><span class="cst">×${INV[id]}${ok?"":g.own.includes(id)?"　所持済み":"　使えません"}</span></div>`}).join(""):'<p class="os">まだ持っていません。ショップで買えます。</p>'}</div><button class="gapply" data-c="gapply"${GSEL?"":" disabled"}>${GSEL?`「${esc(fxName(GSEL))}」をこのカードに使う`:"使うエフェクトを選んでください"}</button>`}
function listHTML(c,g){const tops=`<div class="ctabs1"><button class="${CTOP==="fx"?"on":""}" data-c="top" data-k="fx">エフェクト</button><button class="${CTOP==="gen"?"on":""}" data-c="top" data-k="gen">アイテム<small>${invTotal()}</small></button></div>`;if(CTOP==="gen")return tops+genHTML(c,g);const cats=custCats(c,g);if(!CTAB||!cats.includes(CTAB))CTAB=cats.find(k=>g.own.some(id=>FXG[id].cat===k))||cats[0];
 const own=g.own.filter(id=>FXG[id].cat===CTAB),cap=FX_CAT[CTAB][1];
 return`${tops}<div class="ctabs2">${cats.map(k=>{const o=g.own.filter(id=>FXG[id].cat===k).length;return`<button class="${k===CTAB?"on":""}" data-c="tab" data-k="${k}">${FX_CAT[k][0]}<small>${o}</small></button>`}).join("")}</div>
 <p class="os">${own.length?(CTAB==="unique"?"このカードだけのエフェクトです。":`このタイプは同時に${cap}つまで。`)+" クリックで付け外しできます。":"このタイプのエフェクトはまだありません。成長で手に入ります。"}</p>
 <div class="crows">${own.map(id=>{const d=FXG[id],on=g.eq.includes(id);return`<div class="crow${on?" on":""}${id===CNEW?" new":""}" data-c="tog" data-id="${esc(id)}"><div class="cth">${fxHTML([id],c.n)}</div><div class="cinfo"><b>${esc(fxName(id))}</b><span>${esc(d.desc)}</span></div>${id===CNEW?'<em class="cnw">NEW</em>':""}<span class="cst">${on?"✓ 装着中":""}</span></div>`}).join("")}</div>`}
const eqHTML=(c,g)=>`<h5>装着中</h5><div class="ceqs">${g.eq.filter(id=>fxOk(id,c.n)).length?g.eq.filter(id=>fxOk(id,c.n)).map(id=>`<button class="ceqc" data-c="tog" data-id="${esc(id)}" title="クリックで外す">${esc(fxName(id))}<i>×</i></button>`).join(""):"<em>なし</em>"}</div>`;
function custRender(){const c=GCUR,g=gst(c.n);
  CUST.innerHTML=`${bgRib()}<header class="rg-hd"><button class="bsb" data-c="close">← 戻る</button><div class="rg-ttl"><h2>成長</h2><p>${esc(c.n)}${c.sub?`<em>${esc(c.sub)}</em>`:""}</p></div><span></span></header><div class="rg-body"><section class="rg-li">${orgSvg(1)}<div class="rg-lc">${listHTML(c,g)}</div></section><section class="rg-mid"><div class="rg-stage"><div class="rg-halo" aria-hidden="true"></div><div class="dkw" style="--ac:${IC[c.d]}">${ibHTML(c,c.p,MODE==="i",true,true)}</div></div><div class="rg-dock">${orgSvg(2)}<div class="rg-ei">${eqHTML(c,g)}</div></div></section><section class="rg-lp">${orgSvg(0)}<div class="rg-pi">${leftHTML(c,g)}</div></section></div>`;CPOP=false;
  fitPF(CUST);introOn(CUST);tiltKick()}
const custList=()=>{const c=GCUR,g=gst(c.n);CUST.querySelector(".rg-lc").innerHTML=listHTML(c,g);CUST.querySelector(".rg-ei").innerHTML=eqHTML(c,g)},custLeft=()=>{const c=GCUR,g=gst(c.n);CUST.querySelector(".rg-pi").innerHTML=leftHTML(c,g)};
function custOpen(c){GCUR=c;CNEW=null;CTOP="fx";GSEL=null;custRender();CUST.classList.add("on")}
CUST.onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;const a=b.dataset.c,c=GCUR,g=gst(c.n);pop(b);
  if(a==="close"){CUST.classList.remove("on");if($("dkdt").classList.contains("on"))dkDetail(c.n)}
  else if(a==="tog"){const id=b.dataset.id;CNEW=null;if(g.eq.includes(id))g.eq=g.eq.filter(x=>x!==id);else if(g.own.includes(id))fxEquip(g,id);gsave();custList();fxScan()}
  else if(a==="tab"){CTAB=b.dataset.k;custList()}
  else if(a==="top"){CTOP=b.dataset.k;GSEL=null;custList()}
  else if(a==="gsel"){GSEL=GSEL===b.dataset.id?null:b.dataset.id;custList()}
  else if(a==="gapply"){const id=GSEL;if(!id||!INV[id]||g.own.includes(id)||!fxOk(id,c.n))return;INV[id]--;if(INV[id]<=0)delete INV[id];invSave();g.own.push(id);gsave();CNEW=id;CTAB=FXG[id].cat;CTOP="fx";GSEL=null;custList();toast(`「${esc(FXG[id].name)}」が${esc(c.n)}専用になりました`)}
  else if(a==="grow")growCard(c);
  else if(a==="dbg"){COIN+=10;coinSave();custLeft()}};
document.addEventListener("click",e=>{const b=e.target.closest("button[data-gr]");if(!b)return;e.stopPropagation();pop(b);custOpen(byN(b.dataset.gr))},true);
window.BG={add:n=>{COIN+=n|0;coinSave()},reset:()=>{GR={items:0,cards:{}};gsave()},get:()=>GR};
init();
homeOpen();

/* ===== 成長・カスタマイズ（土台） =====
   エフェクト＝カードを飾るアニメーション（Canvas描画。定義は FXG / FXCFG）。
   成長：アイテムを GNEED 個使うとレベルが上がり、エフェクトをランダムに1つ獲得。
   カスタマイズ：獲得したエフェクトをそのカードに付け外し。手札・盤面・一覧・詳細に反映。 */
const GK="bota_grow_v1",GNEED=10;
/* 成長エフェクトの定義（仕様：growth_effects_spec.md 第4版）
   一般＝FXG のカタログ。カテゴリごとに同時装着の上限があり（FX_CAT）、合計7種まで。
   固有＝FX_UNI に載っている植物だけが獲得でき、上の7種には数えない。
   「付き方」＝カードごとの書き出しJSON（animation）。FXCFG に入れると既定値より優先される。 */
const FX_CAT={weather:["天気",1],particles:["粒子",1],sparkle:["キラ",1],light:["ライト",1],sway:["揺れ",1],filter:["色加工",1]};
const FXG=(()=>{const P=(cat,name,desc,e)=>({cat,name,desc,e}),
  w=(type,count,x)=>({kind:"weather",type,layer:"back+front",count,speed:1,size:1.5,sway:1,loop:"seamless",...x}),
  pt=(type,count,x)=>({kind:"particles",type,color:"mix",layer:"back+front",count,speed:1,size:1.5,sway:1,loop:"seamless",...x}),
  sp=pattern=>({kind:"sparkle",pattern,layer:"back+front",count:14,speed:1,size:1.5,loop:"seamless"}),
  fl=type=>({kind:"filter",type,strength:.6});
 return{
  rain:P("weather","雨","しとしと雨が降ります",w("rain",40,{angleDeg:-4})),
  snow:P("weather","雪","雪がゆっくり降ります",w("snow",30)),
  fog:P("weather","霧","やわらかい霧が漂います",w("fog",6)),
  petals:P("particles","舞う花びら","花びらがひらひら舞います",pt("petals",14)),
  leaves:P("particles","舞う葉","葉っぱがひらひら舞います",pt("leaves",12)),
  glow:P("particles","光の粒","光の粒がふわっと昇ります",pt("glow",18,{layer:"front",color:undefined})),
  kira_star:P("sparkle","キラ（星）","星のきらめきが瞬きます",sp("star")),
  kira_cross:P("sparkle","キラ（十字）","十字のきらめきが瞬きます",sp("cross")),
  kira_dot:P("sparkle","キラ（ドット）","丸いきらめきが瞬きます",sp("dot")),
  kira_diamond:P("sparkle","キラ（ダイヤ）","ひし形のきらめきが瞬きます",sp("diamond")),
  leak:P("light","ライトリーク","暖かい光が端から差し込みます",{kind:"light",type:"lightLeak",strength:.6,speed:1,angle:45}),
  komorebi:P("light","木漏れ日","木漏れ日がゆらゆら揺れます",{kind:"light",type:"komorebi",strength:.6,speed:1,size:1.5}),
  sway:P("sway","揺れ","風でメインの絵がそよぎます",{kind:"sway",target:"main",deg:1,periodSec:7,pivot:"anchorY"}),
  f_sunset:P("filter","夕景","夕焼け色に染まります",fl("sunset")),
  f_mono:P("filter","白黒","白黒になります",fl("mono")),
  f_sepia:P("filter","セピア","古い写真のような色になります",fl("sepia")),
  f_cool:P("filter","クール","涼しげな青みになります",fl("cool")),
  f_vivid:P("filter","ビビッド","色が鮮やかになります",fl("vivid")),
  ume_petals:P("particles","花びら(ウメ)","ウメの花びらが舞います",pt("ume_petals",14)),
  momiji_leaves:P("particles","葉(もみじ)","もみじの葉が舞います",pt("momiji_leaves",12)),
  tanpopo_fluff:P("particles","たんぽぽの綿毛","綿毛がふわふわ漂います",pt("tanpopo_fluff",10,{color:undefined})),
  shinju_light:P("light","神樹の光","根の割れ目から光が脈打ち、光の粒が湧き上がります",{kind:"shinju",type:"shinju_light",pulse:{target:"sub",opacity:[.55,1],periodSec:4,scale:[1,1.02],pivot:"anchorY"},emitter:{source:"sub2",count:24,speed:.5,size:.8,direction:"up"}})}})();
const FX_UNI={"ウメ":["ume_petals"],"もみじ":["momiji_leaves"],"たんぽぽ":["tanpopo_fluff"],"神樹の根":["shinju_light"]};
/* カードごとの付き方（書き出しJSONの animation をそのまま入れる） */
const FXCFG={"モクセイ":{"effects":[{"kind":"particles","type":"petals","color":"orange","layer":"back+front","count":36,"speed":1,"size":2.55,"loop":"seamless","sway":1.3}],"unique":null},"クロッカス":{"effects":[{"kind":"weather","type":"snow","layer":"back+front","count":40,"speed":1,"size":1.5,"loop":"seamless","sway":1.3}],"unique":null},"チューリップ":{"effects":[{"kind":"particles","type":"petals","color":"pink","layer":"back+front","count":36,"speed":1,"size":2.7,"loop":"seamless","sway":1.3}],"unique":null},"ゆり":{"effects":[{"kind":"particles","type":"petals","color":"pink","layer":"back+front","count":36,"speed":1,"size":2.7,"loop":"seamless","sway":1.3}],"unique":null},"もみじ":{"effects":[],"unique":{"effects":[{"kind":"particles","type":"momiji_leaves","color":"mix","layer":"back+front","count":24,"speed":1,"size":3,"loop":"seamless","sway":1.5}]}},"たんぽぽ":{"effects":[],"unique":{"effects":[{"kind":"particles","type":"tanpopo_fluff","spriteSource":"effect-layer","spriteLayerId":75,"layer":"back+front","count":16,"speed":0.7,"size":1.5,"loop":"seamless","sway":1.3}]}},"ウメ":{"effects":[],"unique":{"effects":[{"kind":"particles","type":"ume_petals","color":"mix","spriteSource":"effect-layer","spriteLayerId":66,"layer":"back+front","count":24,"speed":0.85,"size":1.5,"loop":"seamless","sway":1.2}]}},"スギ":{"effects":[{"kind":"particles","type":"glow","layer":"front","count":30,"speed":1,"size":1.5,"loop":"seamless","sway":1.3}],"unique":null},"ハナミズキ":{"effects":[{"kind":"particles","type":"petals","color":"white","layer":"back+front","count":36,"speed":1,"size":2.25,"loop":"seamless","sway":1.3}],"unique":null},"桜":{"effects":[{"kind":"sway","target":"main","deg":1,"periodSec":7,"pivot":"anchorY"}],"unique":null},"ネモフィラ":{"effects":[{"kind":"weather","type":"fog","layer":"back+front","count":6,"speed":1.5,"size":2.25,"loop":"seamless","sway":2}],"unique":null}};
const FX_OLD={kira:"kira_star",petal:"petals"},fxMap=id=>FX_OLD[id]||id;
const fxEid=e=>e.kind==="sparkle"?"kira_"+e.pattern:e.kind==="filter"?"f_"+e.type:e.kind==="light"?(e.type==="lightLeak"?"leak":"komorebi"):e.kind==="sway"?"sway":e.type;
/* 花びらの色（カードごと）。ここに無いカードは、設定JSONの色か、カラフルな標準色 */
const FX_COLORFUL=["#ff8fb8","#ffd166","#b9a0ff","#7fd0ff","#ff9a76","#ffffff","#9be3a0","#ff6fae"],PURPLE=["#c6a8f0","#a07be0","#b890ea"];
const FX_PCOL={"牡丹":["#e8454f","#ff6b6b","#c92f3a","#ff8a8a"],"クロッカス":["#ffffff","#ffd84a","#b48cf0"],"たんぽぽ":["#ffd84a","#ffe680","#ffc928"],"ネモフィラ":["#bfe3ff","#8fcaf5","#a8d8ff","#d8efff"],"ラベンダー":PURPLE,"すみれ":PURPLE,"ゆり":["#ffffff","#f6f6f2","#fffbe8"],"桜":["#ffe3ec","#ffd0de","#fff0f4"],"ウメ":["#ffb3c9","#ff8fb0","#ffc6d6"],"チューリップ":FX_COLORFUL};
const fxEnt=(id,n)=>{const c=FXCFG[n],a=c?[...(c.effects||[]),...((c.unique&&c.unique.effects)||[])]:[];let e=a.find(e=>fxEid(e)===id)||(FXG[id]&&FXG[id].e);if(e&&FX_PCOL[n]&&(e.type==="petals"||e.type==="ume_petals"))e={...e,colors:FX_PCOL[n]};return e};
const fxUni=n=>{const c=FXCFG[n],u=c&&c.unique&&c.unique.effects?c.unique.effects.map(fxEid):[];return[...new Set([...(FX_UNI[n]||[]),...u])].filter(id=>FXG[id])};
const FX_BAN={"神樹の根":["particles","sway"]},fxOk=(id,n)=>!(FX_BAN[n]||[]).includes(FXG[id].cat);
/* 固有（そのカードだけが獲得できる）：カテゴリは一般と同じ（粒子・ライト）で、上限もそのカテゴリに従う */
const FX_UQ=new Set(Object.keys({...FX_UNI,...FXCFG}).flatMap(fxUni));
const fxGen=n=>Object.keys(FXG).filter(k=>!FX_UQ.has(k)&&fxOk(k,n));
/* 獲得の出やすさ（1が標準）。色や形の種類が多いものは少し多めに。 */
const FX_W={petals:2,leaves:1.5,kira_star:.8,kira_cross:.8,kira_dot:.8,kira_diamond:.8,f_sunset:.7,f_mono:.7,f_sepia:.7,f_cool:.7,f_vivid:.7,ume_petals:1.5,momiji_leaves:1.5,tanpopo_fluff:1.5};
const fxPick=a=>{const w=a.map(id=>FX_W[id]==null?1:FX_W[id]);let r=Math.random()*w.reduce((x,y)=>x+y,0);for(let i=0;i<a.length;i++){r-=w[i];if(r<0)return a[i]}return a[a.length-1]};
const fxEquip=(g,id)=>{const cat=FXG[id].cat,cap=FX_CAT[cat][1],same=g.eq.filter(x=>FXG[x]&&FXG[x].cat===cat);while(same.length>=cap){const o=same.shift();g.eq=g.eq.filter(x=>x!==o)}g.eq.push(id)};
const fxNorm=ids=>[...new Set((ids||[]).map(fxMap))].filter(id=>FXG[id]);
let GR=(()=>{try{const j=JSON.parse(localStorage.getItem(GK)||"null");if(j&&typeof j==="object"){const cards={};for(const[n,v]of Object.entries(j.cards||{})){const own=fxNorm(v.own),fo=[...new Set(Array.isArray(v.fo)?v.fo:[])].filter(id=>FRD[id]),g={lv:v.lv|0,own,eq:[],fo,fr:FRD[v.fr]&&fo.includes(v.fr)?v.fr:null};fxNorm(v.eq).filter(id=>own.includes(id)).forEach(id=>fxEquip(g,id));cards[n]=g}return{items:j.items|0,cards}}}catch{}return{items:0,cards:{}}})();
const gsave=()=>{try{localStorage.setItem(GK,JSON.stringify(GR))}catch{}};
const gst=n=>GR.cards[n]||(GR.cards[n]={lv:0,own:[],eq:[],fo:[],fr:null});
/* 読み込み時：Lvに見合う固有（floor(Lv/10)個、定義数が上限）が足りなければ付与 */
(()=>{let ch=0;for(const[n,g]of Object.entries(GR.cards)){const all=fxUni(n),want=Math.min(Math.floor((g.lv|0)/10),all.length);let have=g.own.filter(id=>FX_UQ.has(id)).length;
  while(have<want){const u=all.filter(id=>!g.own.includes(id));if(!u.length)break;g.own.push(fxPick(u));have++;ch=1}}if(ch)gsave()})();
if(GR.items>0){COIN+=GR.items;GR.items=0;gsave();coinSave()}
/* ---- 汎用エフェクト（ショップで買う）：レベルアップの獲得とは別の仕組み ---- */
const INV_K="bota_inv_v1";let INV=(()=>{try{const j=JSON.parse(localStorage.getItem(INV_K)||"{}")||{},o={};for(const[k,v]of Object.entries(j))if(FXG[k]&&!FX_UQ.has(k)&&v>0)o[k]=v|0;return o}catch{return{}}})();
const invSave=()=>{try{localStorage.setItem(INV_K,JSON.stringify(INV))}catch{}},invTotal=()=>Object.values(INV).reduce((a,b)=>a+b,0);
function toast(h){const d=document.createElement("div");d.className="ctoast";d.innerHTML=h;document.body.append(d);setTimeout(()=>d.remove(),2600)}
/* 日替わりの品ぞろえ：ローカルの日付で決まり、その日は誰が見ても同じ（価格も固定）。0時に入れ替わる */
const SHOP_K="bota_shop_v1";
const dayKey=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const hash32=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng32=a=>()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
/* 毎日15種：エフェクト・カード枠・カード裏面・アイコン・二つ名を3つずつ。品ぞろえと価格は種（日付）で決まる */
const SHOP_ORDER=["fx","fr","bk","ic","ti"];
function shopLineup(key){const r=rng32(hash32("botagraphy-shop3:"+key)),pool={fx:Object.keys(FXG).filter(k=>!FX_UQ.has(k)),fr:Object.keys(FRD),bk:Object.keys(BKD).filter(k=>k!=="std"),
  ic:[...ICON_E.map(e=>"e:"+e),...Object.keys(ART_N).map(k=>"c:"+k)].filter(x=>x!=="e:🌱"),ti:[...EPI]},out=[];
 for(const x of SHOP_ORDER){const p=pool[x];for(let i=0;i<3&&p.length;i++){const id=p.splice(Math.floor(r()*p.length),1)[0],[lo,hi]=x==="fx"?[15,30]:x==="fr"?FRD[id].p:x==="bk"?BKD[id].p:x==="ic"?(id[0]==="e"?[20,35]:[35,55]):[30,55];out.push({t:x,id,k:x+":"+id,price:lo+Math.floor(r()*(hi-lo+1))})}}
 return out}
let SHOP=(()=>{try{const j=JSON.parse(localStorage.getItem(SHOP_K)||"{}")||{};return{d:typeof j.d==="string"?j.d:"",n:j.n|0,sold:Array.isArray(j.sold)?j.sold.map(x=>String(x).includes(":")?x:"fx:"+x):[]}}catch{return{d:"",n:0,sold:[]}}})();
const shopSave=()=>{try{localStorage.setItem(SHOP_K,JSON.stringify(SHOP))}catch{}};
/* 品ぞろえの種：日付＋更新回数（更新回数はテスト用の「商品更新」で増える。日付が変わると0に戻る） */
const shopSync=()=>{const k=dayKey();if(SHOP.d!==k){SHOP={d:k,n:0,sold:[]};shopSave()}return k+(SHOP.n?":"+SHOP.n:"")};
const SH=document.createElement("div");SH.id="shop";document.body.append(SH);let SHT=0,SHN=null;
const SHT_N={fx:"エフェクト",fr:"カード枠",bk:"カード裏面",ic:"アイコン",ti:"二つ名"};
const shopOwned=it=>it.t==="bk"?BKO.includes(it.id):it.t==="ic"?ICO.includes(it.id):it.t==="ti"?TTO.includes(it.id):false;
function shopInfo(it){if(it.t==="fx"){const d=FXG[it.id];return{n:d.name,d:d.desc}}if(it.t==="fr"||it.t==="bk"){const d=(it.t==="fr"?FRD:BKD)[it.id];return{n:d.name,d:d.desc}}
 if(it.t==="ic")return{n:it.id[0]==="e"?"絵文字アイコン":(ART_N[it.id.slice(2)]||"")+"のイラスト",d:"プロフィールのアイコンになります"};return{n:it.id,d:"プロフィールの二つ名になります"}}
function shopPv(it){if(it.t==="fx")return`<div class="sp-pv">${fxHTML([it.id],"")}</div>`;
 if(it.t==="fr")return`<div class="sp-pv cardpv"><div class="pvf"><i>🌱</i>${frHTML(it.id)}</div></div>`;
 if(it.t==="bk")return`<div class="sp-pv cardpv">${bkHTML(it.id,"pvb")}</div>`;
 return`<i class="spav${it.id[0]==="e"?" e":""}" style="${avStyle(it.id)}">${esc(avTxt(it.id))}</i>`}
function shopCard(it){const d=shopInfo(it),own=shopOwned(it),sold=SHOP.sold.includes(it.k)||own,ok=COIN>=it.price,have=it.t==="fx"?INV[it.id]||0:it.t==="fr"?FRI[it.id]||0:0;
 return`<div class="spc t-${it.t}${sold?" sold":""}${it.k===SHN?" got":""}">${it.t==="ti"?"":`<div class="spv">${shopPv(it)}</div>`}<div class="spi"><b class="nm">${esc(d.n)}</b><p>${esc(d.d)}${have?`　<em class="own">所持 ${have}</em>`:""}</p></div><button class="shbuy" data-s="buy" data-k="${it.k}"${sold||!ok?" disabled":""}>${sold?(own?"所持済み":"売り切れ"):`<i class="coin s">B</i>${it.price}`}</button></div>`}
function shopRender(){const key=shopSync(),L=shopLineup(key);
 SH.innerHTML=`<div class="waves"><i></i><i></i><i></i><i></i><i></i></div><header><span class="shl"><button class="bsb" data-s="back">← 戻る</button><button class="bsb tst" data-s="refresh">商品更新（テスト）</button></span><h2>ショップ</h2><div class="shcb cbadge"><i class="coin">B</i><b class="cb-n">${COIN}</b><span>ボタコイン</span></div></header>
 <div class="shb">${SHOP_ORDER.map(x=>`<section class="shsec t-${x}"><h4>${SHT_N[x]}</h4><div class="shr">${L.filter(i=>i.t===x).map(shopCard).join("")}</div></section>`).join("")}
 <p class="shs">毎日0時に入れ替わります。エフェクトとカード枠は成長画面の「アイテム」から、カード裏面はデッキ構築画面から、アイコンと二つ名は設定画面から使えます。</p></div>`;SHN=null}
function shopTimer(){clearTimeout(SHT);const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,0,200);SHT=setTimeout(()=>{if(SH.classList.contains("on")){shopRender();shopTimer()}},Math.max(1000,m-n))}
function shopOpen(){shopRender();SH.classList.add("on");shopTimer();/* ショップが不透明になるまでホームを残す（背面のバトル画面が一瞬見えるのを防ぐ） */setTimeout(()=>{if(SH.classList.contains("on"))$("home").classList.remove("on")},300)}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&SH.classList.contains("on")){shopRender();shopTimer()}});
SH.onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
 if(b.dataset.s==="back"){SH.classList.remove("on");clearTimeout(SHT);homeOpen()}
 else if(b.dataset.s==="refresh"){SHOP.n=(SHOP.n||0)+1;SHOP.sold=[];shopSave();shopRender()}
 else if(b.dataset.s==="buy"){const k=b.dataset.k,it=shopLineup(shopSync()).find(x=>x.k===k);if(!it||SHOP.sold.includes(k)||COIN<it.price||shopOwned(it))return;
  COIN-=it.price;coinSave();
  if(it.t==="fx"){INV[it.id]=(INV[it.id]||0)+1;invSave()}else if(it.t==="fr"){FRI[it.id]=(FRI[it.id]||0)+1;friSave()}else if(it.t==="bk"){BKO.push(it.id);bkoSave()}else if(it.t==="ic"){ICO.push(it.id);icoSave()}else{TTO.push(it.id);ttoSave()}
  SHOP.sold.push(k);shopSave();SHN=k;shopRender();toast(`「${esc(shopInfo(it).n)}」を手に入れた`)}};
$("hbS").onclick=shopOpen;

const fxR=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)},fxX=(s,k)=>(6+fxR(s,k+500)*88).toFixed(1),
 fxSP=(s,k)=>`left:${(12+fxR(s,k+700)*76).toFixed(1)}%;top:${(10+fxR(s,k+900)*78).toFixed(1)}%;`;
const fxLite=(ids,n,mini)=>{let h="",f="",lk=0;const CK=performance.now()/1000,R=fxR;
 /* 周期・位相・何周目かは共通の時計から決める。再描画で作り直されても同じ位置から続き、周回ごとに位置が変わる */
 const Q=(i,q,d,m)=>{m=m||1;lk=Math.floor((CK+R(i,q+2)*d)/(d*m));return`--d:${d.toFixed(2)}s;--dl:${(-((CK+R(i,q+2)*d)%(d*m))).toFixed(2)}s;`};
 const FS={sunset:st=>`background:linear-gradient(180deg,rgba(255,150,70,.6),rgba(255,70,120,.55));opacity:${(.5*st).toFixed(2)}`,mono:st=>`background:#888;mix-blend-mode:saturation;opacity:${st}`,sepia:st=>`background:#b07a3a;mix-blend-mode:color;opacity:${(.8*st).toFixed(2)}`,cool:st=>`background:#4682ff;mix-blend-mode:soft-light;opacity:${st}`,vivid:st=>`background:#e03030;mix-blend-mode:saturation;opacity:${(.35*st).toFixed(2)}`};
 ids.forEach((id,q)=>{const e=fxEnt(id,n);if(!e||e.kind==="sway")return;const z=(e.size||1.5)/1.5,sp=e.speed||1,N=(a,b)=>mini?a:b,
  I=(c,k,fn,ex)=>{let o="";for(let i=0;i<k;i++){const t=fn(i);o+=`<i class="${c}" style="${t}" data-s="${q*31+i}" data-k="${lk}"${ex?" "+ex(i):""}></i>`}return o},
  P=(i,d,m)=>{const t=Q(i,q,d,m);return`--x:${fxX(q*31+i,lk)}%;`+t},
  X=i=>P(i,(5+R(i,q+1)*3)/sp),
  S=b=>`--s:${Math.max(3,Math.min(16,b*z)).toFixed(1)};`,
  st=Math.max(0,Math.min(1,e.strength==null?.6:e.strength));
  if(e.kind==="weather"){
   if(e.type==="rain"){const a=e.angleDeg||0;h+=I("lp-rain",N(3,6),i=>P(i,.9/sp+R(i,q)*.4)+`--dx:${(Math.tan(a*Math.PI/180)*126).toFixed(1)}cqh;rotate:${-a}deg`)}
   else if(e.type==="snow")h+=I("lp-snow",N(3,5),i=>X(i)+S(3.2)+`--dx:${((fxR(q*31+i,lk+300)-.5)*14).toFixed(1)}cqw`);
   else h+=I("lp-fog",N(1,2),i=>`bottom:${i*14-8}%;--w:${(100*z).toFixed(0)};`+Q(i,q,8/sp,2))}
  else if(e.kind==="particles"){
   if(e.type==="glow")h+=I("lp-glow",N(2,4),i=>X(i)+S(6.5));
   else if(e.type==="tanpopo_fluff")h+=I("lp-fluff",N(2,3),i=>X(i)+S(4.5));
   else{const c={petals:"lp-pet",ume_petals:"lp-ume",leaves:"lp-leaf",momiji_leaves:"lp-mj"}[e.type]||"lp-pet",b=c==="lp-pet"||c==="lp-ume"?6.5:7.5,pl=FXE.pal(e);
    h+=I(c,N(3,4),i=>X(i)+S(b)+`--c:${pl[(q*31+i+lk)%pl.length]};--dx:${((fxR(q*31+i,lk+300)-.4)*18).toFixed(1)}cqw;--r:${(180+fxR(q*31+i,lk+400)*300).toFixed(0)}deg`,i=>`data-pl="${pl.join(",")}"`)}}
  else if(e.kind==="sparkle")h+=I("lp-sp lp-"+e.pattern,N(3,4),i=>{const t=Q(i,q,2.6/sp);return fxSP(q*31+i,lk)+S(10)+t});
  else if(e.kind==="light"){
   if(e.type==="lightLeak"){const a=(e.angle||0)*Math.PI/180,cx=50+Math.sin(a)*62,cy=50-Math.cos(a)*62;h+=`<i class="lp-leak" style="animation-delay:${(-(CK%3.2)).toFixed(2)}s,${(-(CK%14)).toFixed(2)}s;background:radial-gradient(circle at ${cx}% ${cy}%,rgba(255,176,96,${(.85*st).toFixed(2)}),rgba(255,130,140,${(.34*st).toFixed(2)}) 45%,transparent 78%)"></i>`}
   else h+=I("lp-kmr",N(2,3),i=>`left:${(R(i,q)*60).toFixed(0)}%;top:${(R(i,q+5)*60).toFixed(0)}%;--s:${(34*z).toFixed(0)};--dl:${(-((CK+i*2)%4)).toFixed(2)}s;--dl2:${(-((CK+i*2)%16)).toFixed(2)}s;opacity:${(.4+.5*st).toFixed(2)}`)}
  else if(e.kind==="shinju")h+=`<i class="lp-vein" style="animation-delay:${(-(CK%4)).toFixed(2)}s"></i>`+I("lp-well",N(3,5),i=>P(i,5+R(i,q+1)*2)+S(5));
  else if(e.kind==="filter")f+=`<span class="fxo fxfo" style="${(FS[e.type]||FS.sunset)(st)}"></span>`});
 return(h?`<span class="fxo lt">${h}</span>`:"")+f};
document.addEventListener("animationiteration",e=>{const t=e.target;if(!t.dataset||t.dataset.s===undefined||!t.matches(".lp-rain,.lp-snow,.lp-pet,.lp-ume,.lp-leaf,.lp-mj,.lp-glow,.lp-fluff,.lp-sp,.lp-well"))return;
 const q=+t.dataset.s,k=(+t.dataset.k||0)+1;t.dataset.k=k;const st=t.style;
 if(t.classList.contains("lp-sp")){const m=fxSP(q,k).match(/left:([\d.]+)%;top:([\d.]+)%/);st.left=m[1]+"%";st.top=m[2]+"%";return}
 st.setProperty("--x",fxX(q,k)+"%");
 if(t.classList.contains("lp-snow"))st.setProperty("--dx",((fxR(q,k+300)-.5)*14).toFixed(1)+"cqw");
 const pl=t.dataset.pl;if(pl){const a=pl.split(",");st.setProperty("--c",a[(q+k)%a.length]);st.setProperty("--dx",((fxR(q,k+300)-.4)*18).toFixed(1)+"cqw");st.setProperty("--r",(180+fxR(q,k+400)*300).toFixed(0)+"deg")}});
const fxHTML=(ids,n,mini)=>fxLite(ids,n,mini);
const fxName=id=>(FXG[id]||{name:id}).name;
const eqOf=n=>((GR.cards[n]||{}).eq||[]).filter(id=>FXG[id]&&fxOk(id,n));

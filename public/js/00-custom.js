/* ===== カード枠・カード裏面（カスタマイズの土台） =====
   枠：ショップで買う → 成長画面の「アイテム」から1つ消費してそのカード専用に → 「枠」タブで着脱。カードごとに1つだけ装着。
   裏面：ショップで買うと永久に所持（消費しない）。デッキ構築画面でデッキごとに装着。
   見た目のCSSは tools/gencustom.py が style.css の @@CUSTOM ブロックに生成する。 */
const FRD={
 gild:{name:"金縁",desc:"金色の細い二重の縁を、光がゆっくり周ります",p:[26,40]},
 argent:{name:"銀月",desc:"角を落とした銀の縁が、静かに明滅します",p:[26,40]},
 sakura:{name:"桜花",desc:"花びら形の縁と、四隅に咲く桜",p:[30,45]},
 wakaba:{name:"若葉",desc:"四隅に若葉がのびる、みずみずしい緑の縁",p:[28,42]},
 tsuru:{name:"つる",desc:"うねる蔓のような縁を、金の光が流れます",p:[30,45]},
 arch:{name:"窓辺",desc:"アーチ窓のように上が丸い、ローズゴールドの縁",p:[32,48]},
 aurora:{name:"極光",desc:"虹色のオーロラが縁をぐるりと回ります",p:[36,50]},
 tomoshi:{name:"燈",desc:"炎の形の縁が、ゆらゆら揺らめきます",p:[34,48]},
 umi:{name:"深海",desc:"青い縁を、波のような光が流れます",p:[30,45]},
 ouka:{name:"王冠",desc:"冠のような飾りと金の菱形をあしらった紫の縁",p:[38,55]},
 koori:{name:"氷晶",desc:"切り子のように面取りした氷の縁と、きらめき",p:[32,48]},
 kintsugi:{name:"金継ぎ",desc:"白磁の縁に、金継ぎのひびが光ります",p:[34,50]}};
const BKD={
 std:{name:"標準",desc:"ボタグラフィの基本の裏面",p:[0,0]},
 moss:{name:"苔庭",desc:"格子の苔庭が、ゆっくり流れます",p:[40,60]},
 fubuki:{name:"桜吹雪",desc:"桜の花びらが斜めに降りしきります",p:[45,65]},
 hoshi:{name:"星月夜",desc:"アーチ窓の夜空に、星がまたたきます",p:[45,65]},
 karakusa:{name:"金唐草",desc:"黒地に金の唐草。光が横切ります",p:[55,80]},
 seigaiha:{name:"青海波",desc:"青海波の模様が、波のように流れます",p:[40,60]},
 asanoha:{name:"麻の葉",desc:"朱の麻の葉模様。面取りした縁に光が走ります",p:[45,65]},
 kyokko:{name:"極光",desc:"色が移ろうオーロラの裏面",p:[55,80]},
 washi:{name:"和紙",desc:"和紙に朱の印。印がほのかに光ります",p:[40,60]},
 kagaribi:{name:"篝火",desc:"炎形の縁と、揺れる篝火",p:[50,75]},
 hyouka:{name:"氷花",desc:"雪の結晶がきらめく、面取りした氷の裏面",p:[45,65]},
 sumi:{name:"墨流し",desc:"墨流しの渦が、ゆっくり回ります",p:[50,75]}};
const FRI_K="bota_fri_v1",BKO_K="bota_bko_v1";
let FRI=(()=>{try{const j=JSON.parse(localStorage.getItem(FRI_K)||"{}")||{},o={};for(const[k,v]of Object.entries(j))if(FRD[k]&&v>0)o[k]=v|0;return o}catch{return{}}})();
let BKO=(()=>{try{const j=JSON.parse(localStorage.getItem(BKO_K)||"[]");return["std",...(Array.isArray(j)?j:[]).filter(k=>BKD[k]&&k!=="std")]}catch{return["std"]}})();
const friSave=()=>{try{localStorage.setItem(FRI_K,JSON.stringify(FRI))}catch{}},bkoSave=()=>{try{localStorage.setItem(BKO_K,JSON.stringify(BKO))}catch{}};
const friTotal=()=>Object.values(FRI).reduce((a,b)=>a+b,0);
/* 演出の時計はページ共通（再描画しても同じ位置から続く。周期は60の約数にしてある） */
const frClock=()=>"--dl:-"+((performance.now()/1000)%60).toFixed(2)+"s";
const frHTML=(id,sm)=>`<span class="fro fr-${id}${sm?" sm":""}" style="${frClock()}"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i></span>`;
const bkCls=id=>({std:"",moss:"a-drift",fubuki:"a-drift",hoshi:"a-twinkle",karakusa:"a-sweep",seigaiha:"a-drift",asanoha:"a-sweep",kyokko:"a-hue",washi:"a-pulse",kagaribi:"a-pulse",hyouka:"a-twinkle",sumi:"a-spin"})[id]||"";
const bkHTML=(id,cls,st)=>{if(!BKD[id])id="std";return`<i class="bk bk-${id} ${bkCls(id)} ${cls||""}" style="${frClock()};${st||""}"><i class="p"></i><i class="r"></i><i class="e"></i><i class="s"></i></i>`};
/* カードごとの装着中の枠（成長データ GR は 07 で定義。実行時にだけ参照する） */
const frOf=n=>{const g=GR.cards[n];return g&&g.fr&&FRD[g.fr]&&(g.fo||[]).includes(g.fr)?g.fr:null};
/* デッキの裏面（持っていないものは標準に戻す） */
const deckBk=id=>{const d=DKS.find(x=>x.id===id)||DKS.find(x=>x.id===ACT);return d&&d.bk&&BKO.includes(d.bk)?d.bk:"std"};
/* 二つ名・アイコンの所持（ショップで買うと増える。「なし」と🌱は最初から所持。いま使っているものは 05 で所持扱いにする） */
const TTO_K="bota_tto_v1",ICO_K="bota_ico_v1";
let TTO=(()=>{try{const j=JSON.parse(localStorage.getItem(TTO_K)||"[]");return["",...(Array.isArray(j)?j:[]).filter(x=>typeof x==="string"&&x)]}catch{return[""]}})();
let ICO=(()=>{try{const j=JSON.parse(localStorage.getItem(ICO_K)||"[]");return["e:🌱",...(Array.isArray(j)?j:[]).filter(x=>typeof x==="string"&&x&&x!=="e:🌱")]}catch{return["e:🌱"]}})();
const ttoSave=()=>{try{localStorage.setItem(TTO_K,JSON.stringify(TTO.filter(Boolean)))}catch{}},icoSave=()=>{try{localStorage.setItem(ICO_K,JSON.stringify(ICO.filter(x=>x!=="e:🌱")))}catch{}};

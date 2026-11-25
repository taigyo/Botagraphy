/* ===== ソロステージ（土台）=====
   ステージを増やすときは STAGES に1行足すだけ（選択画面・解放・保存・強さは自動）。
   lv＝CPUの強さ(0〜1。10-cpu.js の CPULV 参照)／deck＝CPUのデッキ(メイン1＋種類12×2枚。BM.cpu 用の独自デッキ)。
   進行は localStorage(STAGE_KEY)：{cleared:{ステージid:1}}。解放＝直前のステージをクリア済み。 */
const STAGE_KEY="bota_stage_v1";
const STAGES=[
  {id:"s1",name:"ステージ 1",sub:"草デッキ",icon:"🌿",lv:.2,deck:{main:"クズ",k:["ギボウシ","アイビー","ナツヅタ","フジ","エノコログサ","アサガオ","カタバミ","ミント","クレマチス","ツルニチニチソウ","シロツメクサ","ドクダミ"]}},
  {id:"s2",name:"ステージ 2",sub:"花デッキ",icon:"🌸",lv:.5,deck:{main:"牡丹",k:["クロッカス","ポピー","カスミソウ","チューリップ","パンジー","たんぽぽ","ネモフィラ","ラベンダー","すみれ","マリーゴールド","スイートピー","ゆり"]}},
  {id:"s3",name:"ステージ 3",sub:"木デッキ",icon:"🌳",lv:.8,deck:{main:"スギ",k:["ハナミズキ","アカマツ","ツゲ","桜","モクセイ","もみじ","イチョウ","柳","剪定","ケヤキ","ウメ","ギボウシ"]}},
];
const stageDeck=st=>[byN(st.deck.main),...st.deck.k.flatMap(n=>[byN(n),byN(n)])].map(c=>({...c})).sort(()=>Math.random()-.5);
const stageProg=()=>{try{const j=JSON.parse(localStorage.getItem(STAGE_KEY)||"null");return j&&j.cleared?j:{cleared:{}}}catch(e){return{cleared:{}}}};
const stageOpen=i=>i===0||!!(STAGES[i-1]&&stageProg().cleared[STAGES[i-1].id]);
/* 選択の初期値＝いま挑戦できる未クリアの最初のステージ（全クリア済みなら最後） */
function stageInit(){if(BM.stage>=0&&BM.stage<STAGES.length&&stageOpen(BM.stage))return;
  const p=stageProg(),k=STAGES.findIndex((s,i)=>stageOpen(i)&&!p.cleared[s.id]);BM.stage=k>=0?k:STAGES.length-1}
function stageStart(){const st=STAGES[BM.stage];if(!st||!stageOpen(BM.stage))return false;BM.st=st;return true}
/* 対戦設定（mode=stage）の右列と強さバー */
function stageCol(){const p=stageProg();
  return `<section class="bmc"><h3>ステージ</h3><div class="bml">${STAGES.map((s,i)=>{const op=stageOpen(i),cl=!!p.cleared[s.id];
    return `<button class="bmd${i===BM.stage?" on":""}" data-s="stage" data-id="${i}"${op?"":" disabled"}><i class="bmi e">${op?s.icon:"🔒"}</i><span class="bmt"><b>${esc(s.name)}　${esc(s.sub)}</b><em>${op?"強さ："+cpuLvName(s.lv)+(cl?"　✓ クリア済み":""):"前のステージをクリアすると解放"}</em></span></button>`}).join("")}</div></section>`}
function stageLv(){const s=STAGES[BM.stage];return `<section class="bmc bmlv"><h3>相手の強さ：<span id="stgl">${cpuLvName(s.lv)}</span></h3><div class="bmlb" id="stgb" style="--v:${s.lv}"><i></i></div></section>`}
function stagePick(i){BM.stage=i;const s=STAGES[i];$("stgl").textContent=cpuLvName(s.lv);$("stgb").style.setProperty("--v",s.lv)}
/* ソロの入口は1つ。中のタブ（ステージ／フリー対戦）で切り替え、最後に開いた方を覚える */
const soloTab=v=>{try{if(v)localStorage.setItem("bota_solotab",v);else return localStorage.getItem("bota_solotab")==="solo"?"solo":"stage"}catch(e){}return v||"stage"};
const bmTabs=()=>BM.mode==="solo"||BM.mode==="stage"?`<div class="bmtabs">${[["stage",`ステージ　${STAGES.filter(s=>stageProg().cleared[s.id]).length}/${STAGES.length}`],["solo","フリー対戦"]].map(([k,n])=>`<button class="bmtab${BM.mode===k?" on":""}" data-s="tab" data-id="${k}">${n}</button>`).join("")}</div>`:"";
/* 結果パネル */
function stageUi(){$("sresb").textContent=BM.st?"ステージ選択へ":"対戦設定へ";$("sresn").style.display="none";$("sresm").textContent=""}
function stageEnd(r){const st=BM.st,i=STAGES.indexOf(st);if(!st)return;let msg="引き分け…もう一度挑戦しよう";
  if(r==="あなたの勝ち"){const p=stageProg(),first=!p.cleared[st.id],nx=STAGES[i+1];p.cleared[st.id]=1;try{localStorage.setItem(STAGE_KEY,JSON.stringify(p))}catch(e){}
    msg=`${st.name} クリア！`+(nx&&first?` ${nx.name}が解放されました`:"");if(nx){$("sresn").style.display="";BM.stage=i+1}}
  else if(r==="CPUの勝ち")msg="惜しい…もう一度挑戦しよう";
  $("sresm").textContent=msg}
(()=>{const R=$("sres"),n=document.createElement("button"),m=document.createElement("div");
  n.className="obtn";n.id="sresn";n.textContent="次のステージへ";n.style.display="none";m.id="sresm";R.prepend(n);R.append(m);
  n.onclick=()=>{const k=STAGES.indexOf(BM.st)+1;if(!STAGES[k])return;R.classList.remove("on");BM.stage=k;BM.st=STAGES[k];init()};
})();

/*旧カードデータ・効果（停止中）  タイミング r=公開時 e=ターン終了時 s=継続
const LBL={buff:v=>`同エリア味方+${v}`,debuff:v=>`同エリア敵-${v}`,self:v=>`自身+${v}`,grow:v=>`自身+${v}`,draw:v=>`${v}枚引く`,mana:v=>`マナ+${v}`,aura:v=>`同エリア味方+${v}`};
const TM={r:"公開時:",e:"終了時:",s:"継続:"};
const mk=([d,e,n,c,p,f=[],m])=>{const F=f.map(([w,a,v])=>({w,a,v}));return{d,e,n,c,p,f:F,m,t:F.map(x=>TM[x.w]+LBL[x.a](x.v)).join(" ")||"効果なし"}};
const CARDS=[
["f","🌱","つぼみ",0,1],["f","🌼","たんぽぽ",1,1,[["r","draw",1]]],["f","🍀","クローバー",1,2],["f","🪻","すみれ",2,2,[["r","buff",1]]],
["f","🌷","チューリップ",2,3],["f","🌺","あさがお",2,1,[["e","grow",1]]],["f","💮","コスモス",3,3,[["r","debuff",1]]],["f","🌻","ひまわり",3,4],
["f","💐","スイートピー",3,2,[["r","mana",1]]],["f","🌹","ばら",4,5],["f","🪷","はす",4,3,[["s","aura",1]]],["f","🌸","ゆり",5,5,[["r","self",1]]],
["f","🏵️","ぼたん",6,7,[["r","buff",2]],1],
["t","🌰","どんぐり",0,1],["t","🌿","わかば",1,2],["t","🍃","こけ",1,1,[["r","mana",1]]],["t","🎋","たけ",2,3],
["t","🍄","きのこ",2,2,[["r","draw",1]]],["t","🍁","かえで",3,4],["t","🌴","やし",3,3,[["r","buff",1]]],["t","🌲","まつ",4,5],
["t","🍂","ぶな",4,3,[["s","aura",1]]],["t","🪴","ぼんさい",4,4,[["e","grow",1]]],["t","🎄","もみ",5,6,[["r","debuff",1]]],["t","🪵","ひのき",6,6,[["e","grow",2]]],
["t","🌳","ごしんぼく",7,10,[["r","buff",2]],1]
].map(mk);
const mkDeck=d=>CARDS.filter(c=>c.d===d).flatMap(c=>c.m?[{...c}]:[{...c},{...c}]).sort(()=>Math.random()-.5);
const pw=(b,i)=>Math.max(0,b.card.p+(b.bonus||0)+S.board.reduce((a,x,j)=>a+(x&&j!==i&&x.o===b.o&&ar(j)===ar(i)?x.card.f.filter(f=>f.w==="s").reduce((s,f)=>s+f.v,0):0),0));
const EF={buff:(b,i,v)=>S.board.forEach((x,j)=>{if(x&&x!==b&&x.o===b.o&&ar(j)===ar(i))x.bonus=(x.bonus||0)+v}),
 debuff:(b,i,v)=>S.board.forEach((x,j)=>{if(x&&x.o!==b.o&&ar(j)===ar(i))x.bonus=(x.bonus||0)-v}),
 self:(b,i,v)=>{b.bonus=(b.bonus||0)+v},grow:(b,i,v)=>{b.bonus=(b.bonus||0)+v},
 draw:(b,i,v)=>{for(let k=0;k<v;k++)dr(b.o)},mana:(b,i,v)=>{S.mana[b.o]+=v},aura:()=>{}};
*/
// カード: [絵,名前,種類,コスト,力,属性[],効果[],メイン,デッキ] 効果 w: p=配置 l=自エリア敗北時 s=継続 t=他カード配置時の誘発
const adj=i=>{const r=i/6|0,c=i%6,a=[];if(r)a.push(i-6);if(r<5)a.push(i+6);if(c)a.push(i-1);if(c<5)a.push(i+1);return a};
const fl=x=>!!x&&x.card.a.includes("花");
const SEL={af:(b,i)=>adj(i).filter(j=>fl(S.board[j])),ao:(b,i)=>adj(i).filter(j=>S.board[j]&&S.board[j].o!==b.o),of:(b,i)=>S.board.map((x,j)=>j).filter(j=>j!==i&&fl(S.board[j])&&S.board[j].o===b.o),me:(b,i)=>[i]};
const B=(n,s,t,w="p")=>({w,t,s:(n>0?"+":"")+n,k:n>0?"up":"dn",tg:SEL[s],run:(b,i,T)=>T.forEach(j=>S.board[j].bonus=(S.board[j].bonus||0)+n)});
const D=(n,t,ok)=>({w:"p",t,s:"+"+n+"枚",k:"up",ok,run:b=>{for(let k=0;k<n;k++)dr(b.o)}});
const TODO=t=>({w:"p",t,off:1});
const TX={p:'<u class="bd">配置</u>',a:'<u class="bd ua">使用</u>',l:"",s:"",t:"",e:"",h:"",x:"",m:""};
const mk=([e,n,sub,c,p,a,f=[],m,d="f",tk,tok])=>({d,e,n,sub,c,p,a,f,m,tk,tok:!!tok,t:f.filter(x=>!x.hid).map(x=>TX[x.w]+x.t).join("<br>")||"効果なし"});
const adj8=i=>{const r=i/6|0,c=i%6,a=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const q=r+y,w=c+x;if((x||y)&&q>=0&&q<6&&w>=0&&w<6)a.push(q*6+w)}return a};
SEL.aa=(b,i)=>adj8(i).filter(j=>S.board[j]);
const isTr=x=>!!x&&x.card.a.includes("木");
SEL.at=()=>S.board.map((x,j)=>j).filter(j=>isTr(S.board[j]));
SEL.tn=(b,i)=>adj(i).filter(j=>isTr(S.board[j]));
const gm=(o,n)=>{S.mana[o]+=n;if(n>0)(S.mg||(S.mg=[0,0]))[o]=1;if(n>0)S.board.forEach((x,j)=>{if(x&&x.o===o&&x.card.f.some(f=>f.w==="m")){x.bonus=(x.bonus||0)+1;(S.mq=S.mq||[]).push(j)}})};
const guardSet=()=>[0,1].map(o=>S.board.some(x=>x&&x.o===o&&x.card.f.some(f=>f.w==="h")));
const fadeOut=async ix=>{ix.forEach(i=>{const el=document.querySelector(`#board [data-i="${i}"] .cd`);if(el)el.classList.add("fo")});await sleep(700)};
const mq=async()=>{const q=S.mq||[];S.mq=[];for(const j of q){if(!S.board[j])continue;S.fx={cell:j,k:"clash",c:"buff",txt:"+1"};render();await sleep(750)}};
const edge=i=>{const r=i/6|0,c=i%6;return r%5===0||c%5===0};
const CARDS=[
["🌷","クロッカス","ダッチ・クロッカス",1,1,["花"],[{w:"p",t:"マナ+1",s:"マナ+1",k:"up",run:b=>{gm(b.o,1)}}]],
["🌺","ポピー","アイスランドポピー",1,3,["花"],[B(-3,"me","このエリアが負けたとき-3","l")]],
["🤍","カスミソウ","アルタイル",2,1,["花"],[B(1,"af","隣接する花すべて+1")]],
["🌷","チューリップ","アペルドーン",2,2,["花"],[D(1,"隣接する花があれば、1枚引く",(b,i)=>SEL.af(b,i).length>0)]],
["🪻","パンジー","普及種",2,2,["花"],[{w:"s",t:"隣接する花が3つ以上あるとき+2",pw:(b,i)=>SEL.af(b,i).length>=3?2:0}]],
["🌼","たんぽぽ","セイヨウタンポポ",2,2,["花"],[{w:"p",t:"デッキ内のたんぽぽをすべて咲かせる",s:"咲かせる",k:"up",hvf:b=>S.deck[b.o].filter(c=>c.n==="たんぽぽ").length,run:async(b,i,T,k)=>{const L=[];if(NET.on&&b.o===1){S.deck[1].splice(0,k);for(let n=0;n<k;n++)L.push({...CARDS.find(c=>c.n==="たんぽぽ")})}else{L.push(...S.deck[b.o].filter(c=>c.n==="たんぽぽ"));S.deck[b.o]=S.deck[b.o].filter(c=>c.n!=="たんぽぽ")}for(const c of L){const em=S.board.map((x,j)=>j).filter(j=>!S.board[j]&&(!S.pl[j]||S.pl[j].every(x=>x!==b.o)));if(!em.length)break;const j=em[prnd(em.length)];S.board[j]={o:b.o,card:c};S.hide.delete(j);S.fx={cell:j,k:"drop"};render();await sleep(1350);S.q.push(j)}}}]],
["💙","ネモフィラ","インシグニスブルー",3,1,["花"],[D(1,"1枚引く"),{w:"s",t:"4~5ターン目の間、+5",pw:()=>S.turn>=4&&S.turn<=5?5:0}]],
["💜","ラベンダー","コスミックブルー",3,4,["花"],[{w:"p",t:"自分の手札を1枚選んでデッキに戻す",s:"戻す",k:"up",ok:b=>S.hand[b.o].length>0,run:async b=>{const H=S.hand[b.o],i=await pick(b.o,{hand:H.map((c,k)=>k),msg:"デッキに戻す手札を選んでください"});S.deck[b.o].push(H.splice(i,1)[0]);S.deck[b.o].sort(()=>Math.random()-.5)}},D(2,"2枚引く")]],
["🪻","すみれ","ゲンジスミレ",3,1,["花"],[{w:"t",n:2,t:"このエリアに配置した自分の他の花を+2する",on:(sb,si,nb,ni)=>nb.o===sb.o&&ar(ni)===ar(si)&&fl(nb)}]],
["🏵️","マリーゴールド","ボナンザ",4,4,["花"],[B(-1,"ao","隣接する相手すべて-1")]],
["🌸","スイートピー","ステラ",4,4,["花"],[{w:"p",t:"自分の他の花を1つ選び、+2して移動",s:"移動",k:"up",ok:(b,i)=>SEL.of(b,i).length>0,run:async(b,i)=>{const j=await pick(b.o,{cells:SEL.of(b,i),msg:"+2して移動する花を選んでください"});S.board[j].bonus=(S.board[j].bonus||0)+2;S.fx=null;render();const em=S.board.map((x,k)=>k).filter(k=>!S.board[k]&&(!S.pl[k]||S.pl[k].every(x=>x!==b.o)));if(!em.length)return;const k=await pick(b.o,{cells:em,msg:"移動先のマスを選んでください"});S.board[k]=S.board[j];S.board[j]=null;S.hide.delete(k);S.fx={cell:k,k:"drop"};render();await sleep(1425)}}]],
["🤍","ゆり","カサブランカ",6,5,["花"],[D(2,"2枚引く"),B(1,"me","このエリアが負けたとき+1","l")]],
["🌺","牡丹","花王",7,8,["花","メイン"],[B(2,"of","他の自分の花をすべて+2")],1,"f","牡丹のはなびら"],
["🌸","牡丹のはなびら","トークン",0,null,["アクション","花"],[{w:"a",t:"自分の花を1つ選び+2",msg:"+2する花を選んでください",cells:o=>S.board.map((x,j)=>j).filter(j=>fl(S.board[j])&&S.board[j].o===o),use:async(o,j)=>{if(!S.board[j])return;S.board[j].bonus=(S.board[j].bonus||0)+2;render();const el=document.querySelector(`#board [data-i="${j}"]`);if(el)el.classList.add("up");await sleep(900)}}],0,"f",void 0,1]
,["🤍","ハナミズキ","クラウドナイン",2,2,["木"],[{w:"p",t:"自分の手札の木を1つ選び、-1コスト",s:"-1コスト",k:"up",hvf:b=>S.hand[b.o].some(c=>c.a.includes("木")&&c.c>0),run:async b=>{const H=S.hand[b.o],ix=H.map((c,k)=>k).filter(k=>H[k].hid||(H[k].a.includes("木")&&H[k].c>0));const i=await pick(b.o,{hand:ix,msg:"-1コストにする木を選んでください"});if(H[i]&&!H[i].hid&&H[i].c>0)H[i].c--}}],void 0,"t"],
["🌲","アカマツ","多行松",3,1,["木"],[{w:"h",t:"自分の木が撤去されたとき、代わりにそれを-1コストして手札に加える"}],void 0,"t"],
["🌿","ツゲ","キンメツゲ",2,2,["木"],[{w:"x",t:"端にいる間、隣接するカードが撤去されたとき、+1マナ",on:j=>edge(j)}],void 0,"t"],
["🌸","桜","ソメイヨシノ",2,2,["木","花"],[{w:"p",t:"次ターン終了時、これを撤去し、+2マナ",s:"撤去予約",k:"up",run:b=>{b.rm=S.turn+1}},{w:"e",hid:1,tg:SEL.me,ok:b=>b.rm===S.turn,steps:[{run:async(b,i)=>{await fadeOut([i]);const r=await rm([i]);if(!r.length)return false}},{s:"+2マナ",k:"up",run:b=>{gm(b.o,2)}}]}],void 0,"t"],
["🌼","モクセイ","キンモクセイ",3,2,["木","花"],[B(-1,"aa","周囲のカードすべて-1")],void 0,"t"],
["🍁","もみじ","イロハモミジ",4,5,["木"],[{w:"t",t:"このエリアに自分の木を配置したとき、+1マナ",s:"+1マナ",on:(sb,si,nb,ni)=>nb.o===sb.o&&ar(ni)===ar(si)&&nb.card.a.includes("木"),run:sb=>{gm(sb.o,1)}}],void 0,"t"],
["🍂","イチョウ","藤九郎",5,5,["木"],[{w:"e",t:"ターン終了時、+1マナ",s:"+1マナ",k:"up",run:b=>{gm(b.o,1)}}],void 0,"t"]
,["🍃","柳","シダレヤナギ",3,3,["木"],[{w:"l",t:"このエリアが負けたとき、-2し、1枚引き、+1マナ",tg:SEL.me,steps:[{s:"-2",k:"dn",hl:1,run:b=>{b.bonus=(b.bonus||0)-2}},{s:"1枚引く",k:"up",run:b=>{if(!S.deck[b.o].length)return false;dr(b.o)}},{s:"+1マナ",k:"up",run:b=>{gm(b.o,1)}}]}],void 0,"t"],
["✂️","剪定","せんてい",1,null,["アクション","木"],[{w:"a",t:"1つの木を+2し、+1マナ",msg:"+2する木を選んでください",cells:()=>SEL.at(),use:async(o,j)=>{const x=S.board[j];if(!x)return;S.fx={cell:j,k:"clash",c:"buff",txt:"+2"};render();await sleep(900);x.bonus=(x.bonus||0)+2;S.fx=null;render();const el=document.querySelector(`#board [data-i="${j}"]`);if(el)el.classList.add("up");await sleep(700);S.fx={cell:j,k:"clash",c:"buff",txt:"+1マナ"};render();await sleep(900);gm(o,1);S.fx=null;render()}}],void 0,"t"],
["🪴","ギボウシ","パトリオット",1,1,["草"],[{w:"s",t:"隣接する木がある間、+2",pw:(b,i)=>SEL.tn(b,i).length?2:0}],void 0,"t"],
["🌳","ケヤキ","会津欅",6,3,["木"],[{w:"p",t:"自ポイントの数だけ+1マナ",s:"+マナ",k:"up",ok:b=>S.pts[b.o]>0,run:b=>{gm(b.o,S.pts[b.o])}},{w:"m",t:"効果によって自分のマナが増えたとき、+1"}],void 0,"t"],
["🌲","スギ","屋久杉",10,10,["木","メイン"],[{w:"p",t:"周囲のカードをすべて撤去し、そこに「神樹の根」を生やす",s:"撤去",k:"dn",tg:SEL.aa,run:async(b,i,T)=>{const g=guardSet(),root=CARDS.find(c=>c.n==="神樹の根");S.fx=null;render();for(const j of T){if(!S.board[j])continue;await fadeOut([j]);const r=await rm([j],g);if(!r.length)continue;S.board[j]={o:b.o,card:{...root}};S.fx={cell:j,k:"drop"};render();await sleep(900);S.fx=null;render();S.q.push(j)}}}],1,"t","神樹の根"],
["🌱","神樹の根","トークン",1,2,["木"],[{w:"e",t:"ターン終了時、-1し、+1マナ",tg:SEL.me,steps:[{s:"-1",k:"dn",hl:1,run:b=>{b.bonus=(b.bonus||0)-1}},{s:"+1マナ",k:"up",run:b=>{gm(b.o,1)}}]}],0,"t",void 0,1],
["🌺","ウメ","南高梅",2,5,["木","花"],[{w:"e",t:"ターン終了時、ターン中効果によって自分のマナが増えていなければ、-2",s:"-2",k:"dn",tg:SEL.me,ok:b=>!(S.mg&&S.mg[b.o]),run:b=>{b.bonus=(b.bonus||0)-2}}],void 0,"t"]
].map(mk);
const mkDeck=d=>CARDS.filter(c=>c.d===d).flatMap(c=>c.m?[{...c}]:[{...c},{...c}]).sort(()=>Math.random()-.5);
const pw=(b,i)=>Math.max(0,(b.card.p||0)+(b.bonus||0)+b.card.f.filter(f=>f.w==="s").reduce((s,f)=>s+f.pw(b,i),0));
const AN=["左上","右上","左下","右下"];
const $=i=>document.getElementById(i),rnd=n=>Math.floor(Math.random()*n),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dr=o=>{const c=S.deck[o].pop();if(c&&S.hand[o].length<7){c.nw=Date.now();S.hand[o].push(c)}else if(c&&o===0)setTimeout(()=>vanish2(c),600)};
const ar=i=>(i>=18?2:0)+(i%6>=3?1:0);
let S;
function init(){$("pp").classList.remove("on");const og=$("mg");if(og)og.remove();
  const win=Math.max(1,Math.min(20,+$("win").value||5));$("win").value=win;
  S={win,max:win*3,turn:0,mana:[0,0],hand:[[],[]],board:Array(36).fill(null),pts:[0,0],st:[],sel:null,over:false,busy:false,log:"",res:"",hide:new Set(),fx:null,jq:[],pop:null,ini:0,nm:[0,0],stk:null,deck:[myDeck(),mkDeck("f").filter(c=>c.m!==0)]};
  const MN=[0,1].map(o=>S.deck[o].find(c=>c.m===1));for(let i=0;i<3;i++){dr(0);dr(1)}
  const s0=S;S.busy=true;mulligan().then(()=>{if(S!==s0)return;const tkf=o=>CARDS.find(c=>c.n===(MN[o]&&MN[o].tk||"牡丹のはなびら"));S.hand[0].push({...tkf(0),nw:Date.now()});S.hand[1].push({...tkf(1)});S.busy=false;next()});
}
async function next(){
  const s0=S;S.busy=true;S.turn++;banner(S.turn);const g=S.turn>=4?3:2;S.mana[0]+=g+S.nm[0];S.mana[1]+=g+S.nm[1];S.nm=[0,0];
  if(S.turn>1){render();await sleep(1400);if(S!==s0)return;await sweep();if(S!==s0)return;S.ini^=1;dr(0);dr(1)}
  S.st=[];S.sel=null;S.busy=false;if(NET.on)NET.t0=Date.now();render();
}
const left=()=>S.mana[0]-S.st.reduce((a,s)=>a+s.card.c,0);
function sums(){const s=[[0,0],[0,0],[0,0],[0,0]];S.board.forEach((b,i)=>{if(b)s[ar(i)][b.o]+=pw(b,i)});return s}
function wins(){return sums().map(([a,b])=>a>b?0:b>a?1:2)}
function cpu(){
  let rem=S.mana[1],plan=[];const w=wins();
  [...S.hand[1]].sort(()=>Math.random()-.5).forEach(card=>{
    if(card.c>rem||Math.random()>.85)return;
    if(isAct(card)){const T=actT(1,card);if(!T.length)return;plan.push({card,cell:-1,tg:T[rnd(T.length)]});rem-=card.c;S.hand[1].splice(S.hand[1].indexOf(card),1);return}
    const em=S.board.map((b,i)=>b||plan.some(p=>p.cell===i)?-1:i).filter(i=>i>=0);
    if(!em.length)return;
    const wt=em.map(i=>w[ar(i)]===0?3:w[ar(i)]===2?2:1),tot=wt.reduce((a,b)=>a+b);
    let r=Math.random()*tot,k=0;while(r>wt[k]){r-=wt[k];k++}
    plan.push({card,cell:em[k]});rem-=card.c;S.hand[1].splice(S.hand[1].indexOf(card),1);
  });
  return plan;
}
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
const selectAct=async ac=>{const f=ac.f.find(x=>x.w==="a"),T=f.cells(0);if(!T.length)return;const j=await pick(0,{cells:T,msg:f.msg+"（別の場所をクリックで取消）",cancel:true});if(j<0){render();return}const k=S.hand[0].indexOf(ac);if(k<0||ac.c>left()){render();return}S.st.push({card:ac,cell:-1,h:k,tg:j});S.hand[0].splice(k,1);S.sel=null;render()};
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
const sweep=async()=>{const d=[];S.board.forEach((b,i)=>{if(b&&pw(b,i)<=0)d.push(i)});if(!d.length)return;d.forEach(i=>{const el=document.querySelector(`#board [data-i="${i}"] .cd`);if(el)el.classList.add("fo")});await sleep(700);await rm(d)};
const rm=async(ix,gs)=>{ix=ix.filter(i=>S.board[i]);if(!ix.length)return[];
 const g=gs||guardSet(),tr=[];
 ix.forEach(i=>adj(i).forEach(j=>{const x=S.board[j];if(x&&!ix.includes(j)&&x.card.f.some(f=>f.w==="x"&&f.on(j)))tr.push([x,j])}));
 ix.forEach(i=>{const b=S.board[i];S.board[i]=null;if(g[b.o]&&b.card.a.includes("木")){const c={...b.card,c:Math.max(0,b.card.c-1)};if(S.hand[b.o].length<7){c.nw=Date.now();S.hand[b.o].push(c)}else if(b.o===0)setTimeout(()=>vanish2(c),600)}else(S.yard||(S.yard=[[],[]]))[b.o].push(b.card)});
 render();for(const[x,j]of tr)if(S.board[j]===x)await fire(x,j,{s:"+1マナ",k:"up",run:()=>{gm(x.o,1)}});return ix};
const isAct=c=>!!c&&c.a.includes("アクション");
const pick=(o,{cells,hand,msg,cancel})=>new Promise(res=>{const L=cells||hand,sync=NET.on&&S.busy;if(o===1){if(sync)return netWait("choice").then(res);return res(L[rnd(L.length)])}S.pk={cells,hand,res:sync?v=>{netSend({k:"ch",v});res(v)}:res,cancel};$("pp").textContent=msg;$("pp").classList.add("on");render()});
document.addEventListener("click",e=>{if(!S.pk)return;if(JD){e.stopPropagation();return}const c=e.target.closest("#board [data-i]"),h=e.target.closest("[data-h]");let v=null;
  if(c&&S.pk.cells&&S.pk.cells.includes(+c.dataset.i))v=+c.dataset.i;else if(h&&S.pk.hand&&S.pk.hand.includes(+h.dataset.h))v=+h.dataset.h;
  if(v===null){if(!S.pk.cancel)return;v=-1}e.stopPropagation();const t=c||h;if(v>=0&&t){const q=t.getBoundingClientRect(),p=document.createElement("i");p.className="rp";p.style.left=q.left+q.width/2+"px";p.style.top=q.top+q.height/2+"px";document.body.appendChild(p);setTimeout(()=>p.remove(),800)}const r=S.pk.res;S.pk=null;$("pp").classList.remove("on");render();r(v)},true);
const useAct=async s=>{const f=s.card.f.find(x=>x.w==="a");if(!f||!f.cells(s.o).length)return;S.eff=1;showCard(s.card,null,1);castAt(s.o);S.fx=null;render();await sleep(1300);await f.use(s.o,await pick(s.o,{cells:f.cells(s.o),msg:f.msg}));await mq();S.fx=null;render();await sweep()};
const fire=async(b,i,f)=>{
  if(f.off)return;const T=f.tg?f.tg(b,i):[];if(f.tg&&!T.length)return;let hv;
  if(f.hvf){if(NET.on&&b.o===1)hv=await netWait("out");else{hv=f.hvf(b,i);if(NET.on)netSend({k:"out",v:hv})}if(!hv)return}else if(f.ok&&!f.ok(b,i))return;
  const cc=(s,k)=>k==="dn"?"debuff":/移動|戻/.test(s)?"mv":"buff";
  S.eff=1;showCard(b.card,pw(b,i),1);
  const T0=T.map(j=>S.board[j]),hl=k=>T.forEach((j,n)=>{if(S.board[j]!==T0[n])return;const el=document.querySelector(`#board [data-i="${j}"]`);if(el)el.classList.add(k==="dn"?"dn":"up")});
  if(f.steps){
    for(const st of f.steps){let r;
      if(st.s){S.fx={cell:i,k:"clash",c:cc(st.s,st.k),txt:st.s};render();await sleep(1000)}
      r=await st.run(b,i,T);await mq();S.fx=null;render();if(st.hl)hl(st.k);await sleep(st.hl?800:300);if(r===false)break}
    await sleep(300);await sweep();return}
  S.fx={cell:i,k:"clash",c:cc(f.s,f.k),txt:f.s};render();await sleep(1100);
  await f.run(b,i,T,hv);await mq();S.fx=null;render();hl(f.k);await sleep(900);await sweep()};
const onPlace=async cell=>{
  const nb=S.board[cell];
  for(let j=0;j<36;j++){const sb=S.board[j];if(!sb||sb===nb)continue;
    for(const f of sb.card.f)if(f.w==="t"&&f.on(sb,j,nb,cell))await fire(sb,j,f.run?{s:f.s,k:"up",run:()=>f.run(sb)}:{s:"+"+f.n,k:"up",tg:()=>[cell],run:()=>{nb.bonus=(nb.bonus||0)+f.n}})}
  for(const f of nb.card.f)if(f.w==="p")await fire(nb,cell,f);
  while(S.q.length)await onPlace(S.q.shift())};
async function commit(){
  if(S.over||S.busy)return;
  S.busy=true;S.mg=[0,0];render();
  const all=[...S.st.map(s=>({...s,o:0})),...(NET.on?await netPlans():cpu()).map(s=>({...s,o:1}))];
  S.st=[];if(NET.on)NET.pr=mul(NET.seed^Math.imul(S.turn+1,0x9E3779B1));all.forEach(s=>{S.mana[s.o]-=s.card.c;S.hide.add(s.cell)});
  S.stk=[all.filter(s=>s.o===0),[]];render();await battle();const th=all.filter(s=>s.o===1);for(let k=0;k<th.length;k++){S.stk=[S.stk[0],th.slice(0,k+1)];render();const e=document.querySelector('#sk1 [data-n="'+k+'"]');if(e)e.animate(SKIN,{duration:620,easing:"cubic-bezier(.2,.85,.25,1)"});await sleep(380)}await sleep(450);
  const sd=NET.on?relO(NET.pr()<.5?0:1):(Math.random()<.5?0:1);for(const s of[...all.filter(s=>s.cell<0&&s.o===sd),...all.filter(s=>s.cell<0&&s.o!==sd)]){S.stk=S.stk.map(L=>L.filter(x=>x!==s));await useAct(s)}
  const cs=[...new Set(all.filter(s=>s.cell>=0).map(s=>s.cell))].sort((a,b)=>a-b);S.pend=new Set(cs);S.q=[];S.pl={};all.forEach(s=>{if(s.cell>=0)(S.pl[s.cell]=S.pl[s.cell]||[]).push(s.o)});
  for(const cell of cs){S.pend.delete(cell);delete S.pl[cell];const oc=S.board[cell];S.board[cell]=null;const cp=s=>s.b?pw(s.b,cell):s.card.p;
    const l=[...(oc?[{o:oc.o,card:oc.card,b:oc,ex:1}]:[]),...all.filter(s=>s.cell===cell)];let win=l[0];
    S.stk=S.stk.map(L=>L.filter(s=>!l.includes(s)));
    if(l.length>1){
      const[a,b]=l[0].o===0?l:[l[1],l[0]];win=cp(a)>cp(b)?a:cp(b)>cp(a)?b:null;
      l.forEach(s=>{if(s!==win&&!s.ex)S.mana[s.o]+=s.card.c});
      const ta=`${a.card.e}${cp(a)}⚔${b.card.e}${cp(b)}`;S.eff=1;S.fx={cell,k:"clash",c:"clash",txt:ta};render();showCard(a.card,cp(a),1);await sleep(1100);showCard(b.card,cp(b),1);await sleep(1100);S.fx={cell,k:"clash",c:win?"buff":"debuff",txt:win?`${win.card.e}${cp(win)} 勝利`:"相打ち"};render();await sleep(1300)}
    const gone=l.filter(s=>s!==win).map(s=>s.card.e).join("");
    S.hide.delete(cell);if(win)S.board[cell]=win.b||{o:win.o,card:win.card};S.eff=1;if(win){const bb=S.board[cell];showCard(bb.card,pw(bb,cell),1)}
    S.fx={cell,k:"drop",gone};render();await sleep(win?1500:1350);
    if(win&&!win.ex)await onPlace(cell)}
  S.fx=null;S.hide.clear();S.stk=null;S.eff=0;if(!PIN)info.classList.remove("on");finfo.classList.remove("on");render();await sleep(300);
  const sm=sums(),w=wins();
  for(let i=0;i<4;i++){S.jq[i]={t:`${sm[i][0]}–${sm[i][1]}`,w:w[i],n:true};render();areaAt(i,w[i]);await sleep(750)}
  const c0=w.filter(x=>x===0).length,c1=w.filter(x=>x===1).length;
  await sleep(300);
  let msg="引き分けのターン（得点なし）";
  if(c0>c1){S.pts[0]++;S.pop=0;msg="あなたが1点"}else if(c1>c0){S.pts[1]++;S.pop=1;msg=OPN()+"が1点"}
  S.log=`エリア ${c0} – ${c1}：${msg}`;if(c0!==c1){flyPt(c0>c1?0:1);await sleep(1250)}render();await sleep(900);
  const over=S.pts[0]>=S.win||S.pts[1]>=S.win||S.turn>=S.max;
  if(!over){S.jq.forEach(q=>q&&(q.out=1));render();await sleep(700);S.jq=[];render();await sleep(200);for(let i=0;i<36;i++){const b=S.board[i];if(b&&w[ar(i)]===1-b.o)for(const f of b.card.f)if(f.w==="l")await fire(b,i,f)}for(let i=0;i<36;i++){const b=S.board[i];if(b)for(const f of b.card.f)if(f.w==="e")await fire(b,i,f)}S.eff=0;if(!PIN)info.classList.remove("on");finfo.classList.remove("on")}
  S.jq=[];if(NET.on)netSum(over);
  if(over){
    const t=sm.reduce((a,[x,y])=>[a[0]+x,a[1]+y],[0,0]);
    let r="引き分け";for(const[x,y]of[S.pts,[c0,c1],t]){if(x!==y){r=x>y?"あなたの勝ち":"CPUの勝ち";break}}
    S.over=true;S.res=r;S.busy=false;render();finale(r);
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
  puff(mkI("as",`left:${L}px;top:${T}px;width:${W*.45}px;height:${H}px`),[{transform:`translateX(${-W*.5}px)`,opacity:0},{opacity:.8,offset:.4},{transform:`translateX(${W*1.05}px)`,opacity:0}],{duration:1100,easing:"ease-in-out"});
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
$("sk0").onclick=e=>{const t=e.target.closest("[data-k]");if(!t||S.busy||S.over||S.pk)return;const k=+t.dataset.k,s=S.st[k];if(!s)return;S.hand[0].splice(Math.min(s.h,S.hand[0].length),0,s.card);S.st.splice(k,1);S.sel=null;render()};$("rs").onclick=init;$("win").onchange=init;$("dk").onchange=init;
const info=$("info"),INFO=info,finfo=$("finfo"),IC={f:"#f4a6c0",t:"#8ccf9c"};
const PF='<svg class="pf" width="242" height="334" viewBox="0 0 242 334"><defs><linearGradient id="pfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#fff6c0"/><stop offset="1" stop-color="#f2b020"/></linearGradient></defs><rect x="1.5" y="1.5" width="239" height="331" rx="20" pathLength="1"/></svg>';
const showCard=(c,p,F)=>{const info=F?finfo:INFO;if(F){finfo._c=c;finfo._p=p}else clearTimeout(unpin.t);info.classList.remove("un");info.classList.toggle("pin",!F&&PIN===c);info.style.setProperty("--ac",IC[c.d]);info.innerHTML=ibHTML(c,p,false);fitPF(info);info.classList.add("on");tiltKick()};
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
function render(){
  $("board").classList.toggle("sel",S.sel!==null);$("board").style.setProperty("--pv",S.sel!==null&&S.hand[0][S.sel]?'"'+S.hand[0][S.sel].e+'"':'""');$("board").style.setProperty("--pi",S.sel!==null&&S.hand[0][S.sel]&&ART[S.hand[0][S.sel].n]?"var(--i-"+ART[S.hand[0][S.sel].n]+")":"none");$("turn").textContent=`ターン ${S.turn} / ${S.max}　先に${S.win}点　`;
  $("p0").textContent="あなた "+S.pts[0];$("p1").textContent=OPN()+" "+S.pts[1];
  $("p0").className="me"+(S.pop===0?" pop":"");$("p1").className="cp"+(S.pop===1?" pop":"");$("gl").innerHTML=gauge(0,S.pop===0);$("gr").innerHTML=gauge(1,S.pop===1);S.pop=null;
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
  $("hand").innerHTML=S.hand[0].map((c,i)=>{const m=i-(hn-1)/2;return`<button class="card${ART[c.n]?" ill ac-"+ART[c.n]:""}${S.sel===i?" on":""}${S.pk&&S.pk.hand&&S.pk.hand.includes(i)?" pk":""}${c.nw&&Date.now()-c.nw<1800?" nw":""}" data-h="${i}" style="--x:${(m*stp).toFixed(1)}px;--y:${(m*m*2.4).toFixed(1)}px;--r:${(m*4).toFixed(1)}deg;z-index:${i};animation-delay:${(i*.09-(c.nw?(Date.now()-c.nw)/1000:0)).toFixed(2)}s;--ac:${c.d==="f"?"#f4a6c0":"#8ccf9c"}" ${DIS.has(c)?(prevD.has(c)?"data-dis":"data-dis data-fd"):""}><b>${c.c}</b><i class="em">${c.e}</i><em>${c.n}</em><span class="tx"><span>${c.t}</span></span><small>${c.p==null?"✦":c.p}</small></button>`}).join("");
  if(S.fx&&!S.fx.fd){S.fx.fd=1;if(S.fx.k==="drop")windAt(S.fx.cell);else if(S.fx.k==="clash"&&/⚔/.test(S.fx.txt))clashAt(S.fx.cell)}
  $("end").textContent="";
  $("sk0").innerHTML=skh(S.stk?S.stk[0]:S.st,0);$("sk1").innerHTML=skh(S.stk?S.stk[1]:[],1);
  $("go").disabled=dis;$("cc").disabled=dis||!S.st.length;
  if(S.over&&!S.paid){S.paid=1;coinAdd(10)}
  const R=$("res"),k=S.over?(S.res==="あなたの勝ち"?"win":S.res==="CPUの勝ち"?"lose":"draw"):"";if(R.dataset.k!==k){R.dataset.k=k;R.className=k?"on "+k:"";R.textContent=k.toUpperCase()}
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
document.addEventListener("mouseover",e=>{const c=e.target.closest&&e.target.closest("#board .cell");if(!c)return;const j=c.querySelector(".ej.ic");if(!j||j.classList.contains("shn"))return;j.classList.add("shn");if(!j._sh){j._sh=1;j.addEventListener("animationend",ev=>{if(ev.animationName==="icsh")j.classList.remove("shn")})}});
setInterval(()=>{const c=$("cn");c.classList.add("sw");setTimeout(()=>c.classList.remove("sw"),3200)},30000);
/* ===== カードイラスト（レイヤー重ね＋傾き視差）===== */
const ART={"クロッカス":"cr","チューリップ":"tl","牡丹":"bt","ネモフィラ":"nm","カスミソウ":"ks","すみれ":"sm","たんぽぽ":"tp","ゆり":"yr","スイートピー":"sp","パンジー":"pn","ポピー":"po","マリーゴールド":"mg","ラベンダー":"lv","牡丹のはなびら":"bh","ハナミズキ":"hm","イチョウ":"gk","桜":"sk","アカマツ":"am","ツゲ":"tg","モクセイ":"mk","もみじ":"mj","柳":"yn","剪定":"sn","ギボウシ":"gb","ケヤキ":"kk","スギ":"sg","神樹の根":"nk","ウメ":"um"},ARTL={};
/* v2形式: 背景は地平線グラデーション視差。値はlayout.jsonの厳密値(%はキャンバス基準)。bgは左右75px・上下49pxを反射パディング済み */
const ARTV=(()=>{const base={hz:.5,persp:700,pref:520,fw:.86,bands:10,exp:1.25,sky:[-.75,-.5],gs:[-7.5,-3.25]};
  /* L: [名前, 視差x%, 視差y%, 位置x%, 位置y%, 拡大%] — 値はlayout.jsonの最終値(尺度適用済み・掛け直さない)。hz=地平線(0-1) */
  return{cr:{...base,hz:0.52, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.34,-0.99,-15,-7,95,5.5,83]]},tl:{...base,hz:0.65, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.76,-1.41,-11,6.63,86,0,95],["sub",-7.5,-2.22,0,1.5,140,0,100]]},bt:{...base,hz:0.3, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.56,-1.35,0,6,126,0,88],["sub",-8.22,-2.44,0,1.5,114,0,99],["fx",-0.84,-0.25,0,0,100,0,45]]},nm:{...base,hz:0.28,gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.69,-1.39,0,1,121,0,89],["sub",-7.5,-2.22,0,5,116,0,100]]},ks:{...base,hz:0.63, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.13,-0.93,0,7,105,0,82],["sub",-5.77,-1.71,0,0,105,0,100]]},sm:{...base,hz:0.52, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.03,-1.19,-9,0,100,0,88]]},tp:{...base,hz:0.28,tilt:8, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.5,-1.33,-6,-0.5,135,0,87]]},yr:{...base,hz:0.61, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-5.77,-1.71,0,-3.5,100,0,100],["sub",-8.08,-2.39,0,13.5,102,0,100],["fx",0,0,19.5,10.5,100,0,50]]},sp:{...base,hz:0.5, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-5.34,-1.58,-6,0,100,0,97],["main",-5.06,-1.5,-6,0,100,0,95]]},pn:{...base,hz:0.6, gs:[-6.63,-1.97],sky:[-0.58,-0.26],L:[["main",-3.5,-1.04,0,4,95,0,84]]},po:{...base,hz:0.15, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.85,-1.44,0,0,100,0,89],["sub",-6.35,-1.88,0,2.5,106,0,100]]},mg:{...base,hz:0.55, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.77,-1.12,0,0,100,0,87],["sub",-4.88,-1.45,-2,4,100,0,89]]},lv:{...base,hz:0.3, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-4.76,-1.41,0,4,110,0,90],["main",-4.66,-1.38,0,0,82,0,89]]},bh:{...base,hz:0.3, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-3.93,-1.16,0,0,100,0,76],["main",-7.63,-2.26,0,0,100,0,95],["fx",-2.41,-0.71,0,0,120,0,50]]},hm:{...base,hz:0.74, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",0,0,0,0,100,0,50],["sub",-5.77,-1.71,0,2,105,0,100]]},gk:{...base,hz:0.57, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-3.08,-0.91,0,0,100,0,83],["main",-3.53,-1.05,0,0,125,0,86],["sub2",-5.77,-1.71,0,-1,110,0,100]]},sk:{...base,hz:0.36, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.51,-1.04,2.5,0,110,0,79],["sub",-5.21,-1.55,0,0,100,0,95],["fx",-0.75,-0.22,0,-0.45,109,0,45]]},am:{...base,hz:0.27, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-4.45,-1.32,5,0,100,0,82],["sub",-5.81,-1.72,11,0,100,0,95]]},tg:{...base,hz:0.34, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.98,-1.18,0,0,100,0,83],["sub",-8.65,-2.57,7.5,17,170,-6,100]]},mk:{...base,hz:0.5, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-4.92,-1.46,0,0,100,0,94],["main",-10.11,-3,-9.5,17,110,5,95],["fx",0,0,17,4.5,100,45,50]]},mj:{...base,hz:0.52, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-3.51,-1.04,0,0,100,0,83],["sub",-5.85,-1.74,0,0,100,0,97]]},yn:{...base,hz:0.58, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-2.83,-0.84,0,0,100,0,80],["sub",-4.92,-1.46,0,0,100,0,95],["fx",0,0,-0.5,-3.5,100,0,45]]},sn:{...base,hz:0.51, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-2.49,-0.74,0,0,100,0,76],["sub2",-4.06,-1.2,-23,-0.5,100,6,88],["main",-6.3,-1.87,3.5,-7.5,105,0,95]]},gb:{...base,hz:0.53, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-1.71,-0.51,0,0,100,0,67],["main",-2.91,-0.86,0,0,100,0,70],["sub2",-5.77,-1.71,-23,40,173,0,100]]},nk:{...base,hz:0.27, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-1.36,-0.4,0,0,100,0,50],["sub",-1.44,-0.43,0,0,100,0,51],["sub2",-2.08,-0.62,-2.5,0.5,75,-9.5,58]]},kk:{...base,hz:0.5, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["sub",-1.86,-0.55,0,0,103,-3,73],["sub2",-2.53,-0.75,-0.5,-16,80,0,95],["main",-3,-0.89,0,0,100,0,74],["sub3",-5.77,-1.71,0,3.5,100,0,100]]},sg:{...base,hz:0.5, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",-5.48,-1.63,0,0,100,0,98],["sub",-5.56,-1.65,0,0,100,0,95],["fx",0,0,-8.5,0,105,0,50]]},um:{...base,hz:1, gs:[-5.77,-1.71],sky:[-0.58,-0.26],L:[["main",0,0,0,0,100,0,64],["sub",0,0,0,0,100,0,40]]}}})();
function stkV(k,V){return`<div class="stk"><div class="cv"><canvas class="bgc"></canvas>${V.L.map(([l,sx,sy,ox,oy,sc,rt,ay])=>{const b=`translate(${ox}cqw,${oy}cqh)${rt?` rotate(${rt}deg)`:""} scale(${sc/100})`;return`<div class="ly al-${k}-${l}" data-sx="${sx}" data-sy="${sy}" data-b="${b}" style="transform:${b}${ay!=null?`;transform-origin:50% ${ay}%`:""}"></div>`}).join("")}</div><i class="wg"></i></div>`}
/* 背景: 行単位の連続ずらし(逆写像)。空は一定、地面は d^1.25 でyに連続。反射パディング済み画像から描く */
const BGI={};
function drawBG(ib,V,s){const cv=ib.querySelector(".cv"),c=cv&&cv.querySelector(".bgc");if(!c)return;const k=ib.dataset.k;
  if(!BGI[k]){const e=document.createElement("div");e.className="al-"+k+"-bg";e.style.display="none";document.body.appendChild(e);const u=getComputedStyle(e).backgroundImage.slice(5,-2);e.remove();const im=new Image();im.onload=tiltKick;im.src=u;BGI[k]=im}
  const im=BGI[k];if(!im.complete||!im.naturalWidth)return;
  const dpr=(devicePixelRatio||1)*Math.max(1,Math.round(cv.getBoundingClientRect().width/cv.offsetWidth*20)/20),W=cv.clientWidth,H=cv.clientHeight,pw=Math.round(W*dpr),ph=Math.round(H*dpr);
  if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph}
  const g=c.getContext("2d",{alpha:false}),st=Math.max(2,Math.round(dpr*1.5)),kx=im.naturalWidth/(W*(1+150/832)),ky=im.naturalHeight/(H*(1+98/1216)),ox=75/832*W*kx,oy=49/1216*H*ky,hz=V.hz;
  const row=(r,h,dx,dy)=>g.drawImage(im,ox-dx*kx,oy+(r/dpr-dy)*ky,W*kx,h/dpr*ky,0,r,pw,h),sky=Math.round(hz*ph);
  row(0,sky,V.sky[0]/100*W*s.x,V.sky[1]/100*H*s.y);
  g.imageSmoothingQuality="low";for(let r=sky;r<ph;r+=st){const d=((r+1)/ph-hz)/(1-hz),f=Math.pow(Math.max(d,0),V.exp);row(r,Math.min(st,ph-r),V.gs[0]/100*W*f*s.x,V.gs[1]/100*H*f*s.y)}}
let MODE="i",PX=null,tiltRaf=0;
(()=>{let lv=0;addEventListener("mouseout",()=>{lv=performance.now()},true);
document.addEventListener("transitionrun",e=>{if(performance.now()-lv>400)return;const el=e.target;if(!el.matches||el.matches(":hover")||(el.closest&&el.closest("#home .hmc,#home .hmb")))return;
 for(const a of document.getAnimations()){if(a.transitionProperty===e.propertyName&&a.effect&&a.effect.target===el&&(a.effect.pseudoElement||"")===(e.pseudoElement||"")&&a.playbackRate===1)a.playbackRate=1/1.5}},true)})();const TL=new WeakMap(),INTRO=new WeakMap();
const stk=c=>{const k=ART[c.n];if(ARTV[k])return stkV(k,ARTV[k]);const L=ARTL[k],mo=Math.max(...L.map(x=>x[2]));return`<div class="stk">${L.map(([n,a,o,pv])=>`<div class="ly al-${k}-${n}" data-p="${pv!=null?pv:n==="bg"?.25:(.35+o/mo*.65+a/100*.35).toFixed(3)}" data-bg="${n==="bg"?1:0}"></div>`).join("")}</div>`};
const mdBtns=c=>`<div class="md"><button data-m="t" title="テキストモード"${MODE==="t"?' class="on"':""}>📝</button><button data-m="i" title="イラストモード"${MODE==="i"?' class="on"':""}>🖼️</button>${c&&ART[c.n]?`<button data-gr="${esc(c.n)}" title="成長画面を開く">🌱 成長</button>`:""}</div>`;
const ibHTML=(c,p,im,nt,nb)=>`<div class="ib${ART[c.n]?" ill"+(im?" im":""):""}${nt?" nt":""}${nb?" nb":""}" data-k="${ART[c.n]||""}" data-n="${c.n}"${c.fx?` data-xf="${c.fx.join(",")}"`:""}>${PF}<b>${c.c}</b>${ART[c.n]?stk(c):""}<span class="art">${c.e}</span><h3>${c.n}</h3><div class="sub">${c.sub}</div>${ART[c.n]?'<div class="tw">':""}<div class="tx"><span>${c.t}</span></div>${c.m===1?`<div class="mn">ゲーム開始時、手札に「${c.tk||"牡丹のはなびら"}」を1枚加える。</div>`:""}<div class="at">${c.a.map(x=>`<i data-t="${x}">${x}</i>`).join("")}</div>${ART[c.n]?"</div>":""}<div class="pwr ${p>c.p?"up":p<c.p?"dn":""}">${p==null?"✦":p}</div></div>`;
/* ---- クリックで開く詳細表示：左にカード（文字なし）、右にテキストパネル ---- */
const escRe=x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
function linkText(html,cur){const names=[...new Set(CARDS.map(c=>c.n))].filter(n=>n===cur||byN(n)).sort((a,b)=>b.length-a.length),re=new RegExp(names.map(escRe).join("|"),"g"),d=document.createElement("div");d.innerHTML=html;
 const walk=n=>{for(const ch of[...n.childNodes]){if(ch.nodeType===3){const t=ch.nodeValue;re.lastIndex=0;if(!re.test(t))continue;re.lastIndex=0;const f=document.createDocumentFragment();let last=0,m;
   while((m=re.exec(t))){f.append(t.slice(last,m.index));if(m[0]===cur)f.append(m[0]);else{const a=document.createElement("a");a.className="cl";a.dataset.cl=m[0];a.textContent=m[0];f.append(a)}last=m.index+m[0].length}
   f.append(t.slice(last));ch.replaceWith(f)}else if(ch.nodeType===1)walk(ch)}};walk(d);return d.innerHTML}
const grBtn=c=>`<div class="md"><button data-gr="${esc(c.n)}" title="成長画面を開く">🌱 成長</button></div>`;
/* ---- 有機的なレイヤー：ガラスのシート＋流れるリボン＋金の細線。背景装飾はコンテンツと独立 ---- */
function blobPathD(seed,amp,pw){const R=i=>{const x=Math.sin(seed*91.7+i*37.3)*43758.5453;return x-Math.floor(x)},N=14,pt=[];
 for(let i=0;i<N;i++){const t=i/N*Math.PI*2,c=Math.cos(t),sn=Math.sin(t),k=1-amp*R(i);pt.push([.5+.5*Math.sign(c)*Math.pow(Math.abs(c),2/pw)*k,.5+.5*Math.sign(sn)*Math.pow(Math.abs(sn),2/pw)*k])}
 const f=v=>v.toFixed(4);let d=`M${f(pt[0][0])},${f(pt[0][1])}`;
 for(let i=0;i<N;i++){const a=pt[(i-1+N)%N],b=pt[i],c=pt[(i+1)%N],e=pt[(i+2)%N];d+=` C${f(b[0]+(c[0]-a[0])/6)},${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)},${f(c[1]-(e[1]-b[1])/6)} ${f(c[0])},${f(c[1])}`}
 return d+"Z"}
(()=>{const sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("width","0");sv.setAttribute("height","0");sv.setAttribute("aria-hidden","true");sv.style.cssText="position:absolute;width:0;height:0";
 let h="<defs>";for(let i=0;i<4;i++)h+=`<clipPath id="cpS${i}" clipPathUnits="objectBoundingBox"><path d="${blobPathD(i+3,.12,3.1)}"/></clipPath><clipPath id="cpB${i}" clipPathUnits="objectBoundingBox"><path d="${blobPathD(i+11,.16,2.1)}"/></clipPath>`;
 h+='<clipPath id="cpRow" clipPathUnits="objectBoundingBox"><path d="M0.02,0.30 C0.10,0.05 0.30,0.02 0.50,0.07 C0.70,0.12 0.90,-0.01 0.98,0.22 C1.01,0.45 0.99,0.70 0.97,0.82 C0.88,1.02 0.70,0.95 0.50,0.93 C0.30,0.91 0.12,1.03 0.03,0.80 C-0.01,0.62 0.00,0.45 0.02,0.30Z"/></clipPath></defs>';
 sv.innerHTML=h;document.body.prepend(sv)})();
const OG_F=["","scale(-1,1) translate(-100,0)","scale(1,-1) translate(0,-100)","scale(-1,-1) translate(-100,-100)"];
const ogRib=(f)=>`<g transform="${f}"><path d="M-6 72 C 18 58, 42 90, 66 72 S 100 58, 108 66 L108 92 C 86 102, 60 84, 36 96 S 4 100 -6 90Z" fill="rgba(168,192,164,.34)"/><path d="M-6 16 C 24 30, 40 4, 68 18 S 100 26, 108 14 L108 32 C 90 42, 62 26, 40 38 S 8 46 -6 36Z" fill="rgba(242,212,210,.44)"/><path d="M-6 46 C 22 38, 50 58, 78 44 S 100 40 108 48 L108 62 C 88 70, 60 56, 36 66 S 6 70 -6 62Z" fill="rgba(244,220,192,.38)"/></g>`;
const ogGold=(f)=>`<g transform="${f}" fill="none" stroke="#c8a24c"><path vector-effect="non-scaling-stroke" stroke-opacity=".7" d="M-6 72 C 18 58, 42 90, 66 72 S 100 58, 108 66"/><path vector-effect="non-scaling-stroke" stroke-opacity=".5" d="M-6 16 C 24 30, 40 4, 68 18 S 100 26, 108 14"/></g>`;
const og=(v=0)=>{const f=OG_F[v%4];return`<div class="og v${v%4}" aria-hidden="true"><svg class="og-b" viewBox="0 0 100 100" preserveAspectRatio="none">${ogRib(f)}</svg><div class="og-s"></div><svg class="og-g" viewBox="0 0 100 100" preserveAspectRatio="none">${ogGold(f)}</svg></div>`};
const bgRib=()=>`<svg class="cbg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M-5 70 C 15 60 30 85 55 72 S 90 55 105 68 L105 105 L-5 105Z" fill="rgba(176,202,170,.2)"/><path d="M-5 82 C 20 72 40 96 62 84 S 92 74 105 82 L105 105 L-5 105Z" fill="rgba(246,214,178,.28)"/><path d="M-5 16 C 18 28 36 5 62 18 S 92 28 105 14 L105 -5 L-5 -5Z" fill="rgba(244,208,206,.3)"/><path d="M-5 28 C 20 38 40 16 64 28 S 94 36 105 26 L105 -5 L-5 -5Z" fill="rgba(176,202,170,.14)"/><g fill="none" stroke="#c8a24c" stroke-opacity=".55"><path vector-effect="non-scaling-stroke" d="M-5 70 C 15 60 30 85 55 72 S 90 55 105 68"/><path vector-effect="non-scaling-stroke" d="M-5 28 C 20 38 40 16 64 28 S 94 36 105 26"/></g></svg>`;
const dwv='<svg class="dwv" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M0 5 C 12 0, 24 10, 38 5 S 62 0, 76 5 S 92 9, 100 4" fill="none" stroke="#c8a24c" stroke-opacity=".8"/><path vector-effect="non-scaling-stroke" d="M0 7 C 14 3, 26 11, 42 7 S 70 3, 100 8" fill="none" stroke="#a8c0a4" stroke-opacity=".7"/></svg>';
/* ===== 有機的シート（詳細表示・成長画面の共通背景） ===== */
let ORGN=0;
const ORG_P=["M62 40 C 120 14, 250 30, 340 14 C 410 2, 466 30, 468 96 C 470 160, 452 210, 466 276 C 478 340, 452 408, 380 420 C 300 434, 214 408, 136 424 C 70 436, 14 398, 20 330 C 26 270, 8 220, 20 160 C 30 104, 20 60, 62 40Z","M40 58 C 90 20, 190 36, 270 20 C 360 4, 462 22, 470 110 C 476 170, 440 226, 462 292 C 480 352, 430 424, 340 424 C 260 424, 180 440, 110 420 C 40 400, 22 346, 28 290 C 34 232, 6 182, 16 122 C 22 90, 24 74, 40 58Z","M70 30 C 150 8, 230 34, 320 20 C 400 8, 462 50, 464 120 C 466 190, 478 240, 462 306 C 446 374, 396 428, 316 418 C 236 408, 170 438, 100 418 C 34 400, 14 344, 26 276 C 36 218, 12 168, 22 112 C 28 70, 40 44, 70 30Z"];
const orgSvg=v=>{const k=++ORGN,p=ORG_P[v%3],id=t=>`og${k}${t}`,sg=p.replace("Z","").split("C").map(x=>x.trim()),sv=[];let cu=sg[0].slice(1).trim();for(let i=1;i<sg.length;i++){sv.push(`M${cu} C${sg[i]}`);cu=sg[i].split(",").pop().trim()}
 const dec=[[.965,.7],[.93,.36]].map(([sc,o])=>`<g transform="translate(240 220) scale(${sc}) translate(-240 -220)" fill="none" stroke="#c8a24c" stroke-opacity="${o}" stroke-linecap="round"><path vector-effect="non-scaling-stroke" d="${sv[1]}"/><path vector-effect="non-scaling-stroke" d="${sv[5]}"/></g>`).join("");

 return`<svg class="og2" viewBox="0 0 480 440" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id("a")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffefa"/><stop offset=".6" stop-color="#f9f2e2"/><stop offset="1" stop-color="#f2ebdb"/></linearGradient><linearGradient id="${id("b")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8dcd9"/><stop offset="1" stop-color="#f4e6d2"/></linearGradient><linearGradient id="${id("c")}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0c8"/><stop offset="1" stop-color="#e6eed9"/></linearGradient><clipPath id="${id("k")}"><path d="${p}"/></clipPath></defs><path class="og-w1" d="${p}" fill="url(#${id("c")})"/><path class="og-w2" d="${p}" fill="url(#${id("b")})"/><path d="${p}" fill="url(#${id("a")})" opacity=".96"/><g clip-path="url(#${id("k")})"><path d="M-10 336 C 90 304, 170 374, 262 342 S 420 304, 500 336 L500 460 L-10 460Z" fill="#b9d0b2" opacity=".2"/><path d="M-10 376 C 110 350, 190 412, 290 382 S 430 354, 500 382 L500 460 L-10 460Z" fill="#f0cfa6" opacity=".24"/></g>${dec}</svg>`};
const RD_DV='<svg class="rd-dv" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M0 5 C 14 0, 28 10, 44 5 S 78 1, 100 6" fill="none" stroke="#c8a24c" stroke-opacity=".75"/><path vector-effect="non-scaling-stroke" d="M0 8 C 18 4, 34 11, 54 7 S 84 4, 100 8" fill="none" stroke="#a8c0a4" stroke-opacity=".8"/></svg>';
const RD_LEAF='<svg class="rd-lf" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" fill="rgba(255,255,255,.35)" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 19c3-5 6-8 10-10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
function detailHTML(c,p,bar,gr){const up=p>c.p?"up":p<c.p?"dn":"",mn=c.m===1?`ゲーム開始時、手札に「${c.tk||"牡丹のはなびら"}」を1枚加える。`:"",lv=gr?gst(c.n).lv:0;
 return`<div class="dkw dtl rd" style="--ac:${IC[c.d]}"><div class="dcard">${ibHTML(c,p,true,true,true)}${bar?`<div class="dkbar">${bar}</div>`:""}</div><div class="rd-sheet">${orgSvg(0)}<div class="rd-in"><div class="rd-hd"><div class="rd-cost"><b>${c.c}</b><em>コスト</em></div><div class="rd-nm"><h2>${esc(c.n)}</h2>${c.sub?`<div class="rd-sub">${esc(c.sub)}</div>`:""}<div class="rd-ty">${c.a.map(x=>`<i data-t="${esc(x)}">${esc(x)}</i>`).join("")}</div></div></div>${RD_DV}<div class="rd-tx">${linkText(c.t,c.n)}</div>${mn?`<div class="rd-mn">${linkText(mn,c.n)}</div>`:""}<div class="rd-ft">${gr?`<button class="rd-gr" data-gr="${esc(c.n)}" title="成長画面を開く">${RD_LEAF}<span>成長</span><small>Lv.${lv}</small></button>`:"<span></span>"}<div class="rd-pw ${up}"><b>${p==null?"✦":p}</b><em>パワー</em></div></div></div></div></div>`}
/* カード名リンク：クリックで、いま開いている詳細をそのカードに切り替える */
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a.cl[data-cl]");if(!a)return;e.stopPropagation();e.preventDefault();const n=a.dataset.cl,c=byN(n),h=a.closest("#hmdt,#dkdt,#bdt");if(!c||!h)return;
 if(h.id==="hmdt")hmDetail(n);else if(h.id==="dkdt")dkDetail(n);else openBd(c,c.p)},true);
function fitPF(host){const ib=host.querySelector(".ib"),pf=ib&&ib.querySelector(".pf");if(!pf)return;const W=ib.offsetWidth+10,H=ib.offsetHeight+10,r=pf.querySelector("rect");
  pf.setAttribute("width",W);pf.setAttribute("height",H);pf.setAttribute("viewBox",`0 0 ${W} ${H}`);r.setAttribute("width",W-3);r.setAttribute("height",H-3)}
function setMode(m){MODE=m;document.querySelectorAll(".ib.ill").forEach(ib=>{if(!ib.closest("#finfo,#info"))ib.classList.toggle("im",m==="i")});document.querySelectorAll(".md button[data-m]").forEach(x=>x.classList.toggle("on",x.dataset.m===m))}
document.addEventListener("pointerdown",e=>{const t=e.target.closest("#dkb button:not(:disabled),#dkb .dkc[data-n],#hmdt .md button,#bdt .md button,#hmd button");if(!t)return;const r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.7,p=document.createElement("span");p.className="rpl";p.style.cssText=`left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px;width:${d}px;height:${d}px`;t.appendChild(p);setTimeout(()=>p.remove(),650)});
document.addEventListener("click",e=>{const b=e.target.closest(".md button[data-m]");if(b)setMode(b.dataset.m);const l=e.target.closest(".dkmd button[data-l]");if(l){$("dkb").classList.toggle("notx",l.dataset.l==="i");document.querySelectorAll(".dkmd button").forEach(x=>x.classList.toggle("on",x===l))}});
/* 傾き: カードに近づいたときだけ反応し、補間してなめらかに動かす */
const introOn=host=>{const ib=host.querySelector(".ib.ill");if(ib)INTRO.set(ib,performance.now())};
const tiltKick=()=>{if(!tiltRaf)tiltRaf=requestAnimationFrame(tiltTick)};
function tiltTick(){tiltRaf=0;const g0=document.getElementById("gres");if(g0&&g0.classList.contains("on"))return;let busy=0;const cl=v=>Math.max(-1,Math.min(1,v));
  document.querySelectorAll(".ib.ill").forEach(ib=>{const h=ib.closest("#info,#finfo,#dkdt,#hmdt,#bdt,#mg,#cust");if(!h||(h.id!=="mg"&&!h.classList.contains("on"))||!ib.offsetParent)return;
    let s=TL.get(ib);if(!s)TL.set(ib,s={x:0,y:0});let tx=0,ty=0;
    if(PX&&h.id!=="mg"){const o=ib.offsetParent.getBoundingClientRect(),w=ib.offsetWidth,hh=ib.offsetHeight,cx=o.left+ib.offsetLeft+w/2,cy=o.top+ib.offsetTop+hh/2,M=28,
      d=Math.hypot(Math.max(Math.abs(PX[0]-cx)-w/2,0),Math.max(Math.abs(PX[1]-cy)-hh/2,0)),f=d>=M?0:1-d/M;
      tx=cl((PX[0]-cx)/(w/2))*f;ty=cl((PX[1]-cy)/(hh/2))*f}
    const lk=.14/(tx===0&&ty===0?1.5:1);s.x+=(tx-s.x)*lk;s.y+=(ty-s.y)*lk;if(Math.abs(tx-s.x)<.002&&Math.abs(ty-s.y)<.002){s.x=tx;s.y=ty}else busy=1;
    let mult=1,sc=1;const t0=INTRO.get(ib);if(t0!==undefined){const t=performance.now()-t0;if(t>=1000)INTRO.delete(ib);else{const u=t/1000,e=1-Math.pow(1-u,3),a=1-e,ph=165*Math.PI/180;s.x=Math.cos(ph)*a;s.y=Math.sin(ph)*a;mult=1+3*a;sc=.78+.22*e;busy=1}}
    const V=ARTV[ib.dataset.k],T=V&&V.tilt||7,ry=s.x*T*mult,rx=-s.y*T*mult;
    ib.style.transformOrigin=V?"50% 50%":"";ib.style.transform=s.x||s.y?`perspective(${V?(V.persp*(ib.querySelector(".cv")||ib).offsetWidth*V.fw/V.pref).toFixed(0):900}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)${sc<1?" scale("+sc.toFixed(3)+")":""}`:"";
    if(V)drawBG(ib,V,s);ib.querySelectorAll(".ly").forEach(l=>{if(l.dataset.sx!==undefined){const cv=ib.querySelector(".cv")||ib;l.style.transform=`translate3d(${(+l.dataset.sx/100*cv.clientWidth*s.x).toFixed(2)}px,${(+l.dataset.sy/100*cv.clientHeight*s.y).toFixed(2)}px,0) ${l.dataset.b||""}`;return}const p=+l.dataset.p;l.style.transform=`translate3d(${(-ry*1.2*p).toFixed(1)}px,${(rx*1.2*p).toFixed(1)}px,0)${l.dataset.bg==="1"?" scale(1.12)":""}`})});
  if(busy)tiltKick()}
addEventListener("pointermove",e=>{PX=[e.clientX,e.clientY];tiltKick()},{passive:true});
document.documentElement.addEventListener("mouseleave",()=>{PX=null;tiltKick()});
/* ===== ホーム・デッキ構築 ===== */
const DK_KEY="botagraphy.decks2",isMn=c=>c.a.includes("メイン");
const POOL=CARDS.filter(c=>(c.d==="f"||c.d==="t")&&!c.tok),TOKS=CARDS.filter(c=>c.tok),MAINS=POOL.filter(isMn),NORM=POOL.filter(c=>!isMn(c)),byN=n=>POOL.find(c=>c.n===n)||TOKS.find(c=>c.n===n);
const dkNew=(name,s,emp)=>({id:"d"+Date.now().toString(36)+rnd(1e4),name,main:s?s.main:emp?null:(MAINS[0]?MAINS[0].n:null),k:s?[...s.k]:emp?[]:NORM.filter(c=>c.d==="f").map(c=>c.n)});
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
  $("dkcurve").innerHTML=h;$("dkavg").textContent=`マナカーブ（コスト別の枚数）　平均コスト ${n?(sum/n).toFixed(1):"-"}`;
  const R=$("dkg"),st=R.scrollTop;R.innerHTML="";HITS=0;
  [["メイン",MAINS],["通常カード（1種につき2枚）",NORM],["トークン",TOKS]].forEach(([t,a])=>{const hh=document.createElement("h3");hh.textContent=t;if(t==="メイン")hh.dataset.t="メイン";R.appendChild(hh);const gg=document.createElement("div");gg.className="dkgr";
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
$("hbD").onclick=()=>{$("home").classList.remove("on");$("dkb").classList.add("on");SELD=Math.max(0,DKS.findIndex(d=>d.id===ACT));TOAST="";dkRender()};
$("dkbk").onclick=homeOpen;
$("hm").onclick=homeOpen;

/* ===== バトル設定／オンライン対戦（土台） ===== */
const NMK="bota_name",PID=sessionStorage.getItem("bota_pid")||(()=>{const v=Math.random().toString(36).slice(2,12);sessionStorage.setItem("bota_pid",v);return v})();

/* ---- プロフィール（アイコン・名前・称号）とボタコイン。どちらもlocalStorageに保存 ---- */
const PROF_K="bota_prof_v1",EPI=["芽吹きの園丁","深緑の守り人","花嵐の使者","朝露の詩人","巨木の継承者","緑陰の放浪者","開花の導き手","常緑の覇者","根源に触れし者","千花の歌い手"],ICON_E=["🌱","🌸","🌻","🍀","🌳","🍁","🌷","🍄","🪻","🌿"],ART_N=Object.fromEntries(Object.entries(ART).map(([n,k])=>[k,n]));
let PROF=(()=>{let j={};try{j=JSON.parse(localStorage.getItem(PROF_K)||"{}")||{}}catch{}const old=(localStorage.getItem(NMK)||"").slice(0,12),ok=/^(c:(\w\w)|e:.+)$/.exec(j.icon||"");
 return{icon:ok&&(ok[2]?!!ART_N[ok[2]]:true)?j.icon:"e:🌱",name:(typeof j.name==="string"?j.name:old).trim().slice(0,12)||"プレイヤー",title:EPI.includes(j.title)?j.title:""}})();
const profSave=()=>{try{localStorage.setItem(PROF_K,JSON.stringify(PROF));localStorage.setItem(NMK,PROF.name)}catch{}};
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
function bsetOpen(){$("home").classList.remove("on");$("bset").classList.add("on");bsFlip(false,true);$("bsnm").value=PNAME}
function bsetClose(){$("bset").classList.remove("on");homeOpen()}

/* ---- 設定画面：アイコン（絵文字／カードのイラスト）・名前・称号 ---- */
const PS=document.createElement("div");PS.id="pset";document.body.append(PS);
function psOpen(){$("home").classList.remove("on");PS.innerHTML=`<div class="waves"><i></i><i></i><i></i><i></i><i></i></div><header><button id="psbk" class="bsb">← 戻る</button><h2>設定</h2><span></span></header><div class="psb">
 <div class="pssec"><div class="pprev"><div class="av"></div><div class="tx"><b></b><span></span></div></div></div>
 <div class="pssec"><h3>アイコン</h3><div class="picons">${ICON_E.map(e=>`<button class="pic e" data-ic="e:${e}">${e}</button>`).join("")}${Object.keys(ART_N).map(k=>`<button class="pic" data-ic="c:${k}" title="${esc(ART_N[k])}" style="background:var(--i-${k}) center/cover no-repeat"></button>`).join("")}</div></div>
 <div class="pssec"><h3>名前</h3><input id="psnm" maxlength="12" autocomplete="off" placeholder="プレイヤー"></div>
 <div class="pssec"><h3>称号</h3><div class="pepis"><button class="pep" data-ep="">なし</button>${EPI.map(t=>`<button class="pep" data-ep="${esc(t)}">${esc(t)}</button>`).join("")}</div></div></div>`;
 $("psnm").value=PROF.name;PS.classList.add("on");psSync()}
function psSync(){const p=PS.querySelector(".pprev .av");p.style.cssText=avStyle(PROF.icon);p.textContent=avTxt(PROF.icon);p.classList.toggle("e",PROF.icon.startsWith("e:"));
 PS.querySelector(".pprev .tx b").textContent=PROF.name;const t=PS.querySelector(".pprev .tx span");t.textContent=PROF.title||"称号なし";t.classList.toggle("none",!PROF.title);
 PS.querySelectorAll(".pic").forEach(b=>b.classList.toggle("on",b.dataset.ic===PROF.icon));PS.querySelectorAll(".pep").forEach(b=>b.classList.toggle("on",b.dataset.ep===PROF.title))}
PS.onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.id==="psbk"){PS.classList.remove("on");homeOpen();return}
 if(b.dataset.ic){PROF.icon=b.dataset.ic;profSave();profShow();psSync()}else if(b.dataset.ep!==undefined){PROF.title=b.dataset.ep;profSave();profShow();psSync()}};
PS.addEventListener("input",e=>{if(e.target.id==="psnm"){PROF.name=e.target.value.trim().slice(0,12)||"プレイヤー";PNAME=PROF.name;profSave();profShow();psSync()}});
PS.addEventListener("change",e=>{if(e.target.id==="psnm")e.target.value=PROF.name});
$("hpset").onclick=psOpen;profShow();coinShow();

function soloStart(){NET.on=false;document.body.classList.remove("net");$("bset").classList.remove("on");$("home").classList.remove("on");started=true;init()}
$("hbB").onclick=bsetOpen;
$("bsbk").onclick=()=>{if(bsFl)bsFlip(false);else bsetClose()};
$("bsc1").onclick=()=>{pop($("bsc1"));if(!bsFl)setTimeout(soloStart,260);else onlRandom()};
$("bsc2").onclick=()=>{pop($("bsc2"));if(!bsFl)bsFlip(true);else onlRoomMenu()};
$("bsnm").oninput=e=>{if(e.target.value.trim())setName(e.target.value)};
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
  ON.ws=w;w.onopen=()=>w.send(JSON.stringify({t:"hello",pid:PID,name:PNAME,deck:deckLabel(),ack:0}));
}
const slot=(p,me)=>`<div class="osl${p?" on":""}${me?" me":""}"><b>${me?"あなた":"相手"}</b><span>${p?esc(p.name):"待機中…"}</span><em>${p?esc(p.deck||"")+(p.online===false?"（切断中）":""):"&nbsp;"}</em><i>${p&&p.ready?"✔ 準備OK":""}</i></div>`;
function lobbyView(){const s=ON.st;if(!s)return;const me=s.players[s.you],op=s.players[1-s.you],both=!!(me&&op),room=ON.via!=="random";
  const ds=DKS.filter(dkFull),cur=ON.dk&&ds.some(d=>d.id===ON.dk)?ON.dk:(ds.some(d=>d.id===ACT)?ACT:(ds[0]?ds[0].id:""));ON.dk=cur;
  const sel=ds.length?`<select id="odsel">${ds.map(d=>`<option value="${esc(d.id)}"${d.id===cur?" selected":""}>${esc(d.name)}</option>`).join("")}</select>`:`<span class="os">花デッキ（初期構成）</span>`;
  onlShow(`<h3>対戦設定</h3><div class="ocode">${esc(ON.room)}${room?`<button class="obtn sub mini" data-a="copy">コピー</button><button class="obtn sub mini" data-a="link">招待リンク</button>`:""}</div><div class="osls">${slot(me,1)}${slot(op,0)}</div><div class="odk"><label>使うデッキ</label>${sel}</div><p class="os">${both?"デッキを選んで、準備OKを押してください":"相手の参加を待っています…"}</p><div class="orow"><button class="obtn" data-a="ready" ${both?"":"disabled"}>${me&&me.ready?"準備を取り消す":"準備OK"}</button><button class="obtn sub" data-a="leave">退室</button></div>`);
  const e=$("odsel");if(e)e.onchange=()=>{ON.dk=e.value;wsSend({t:"deck",deck:deckLabel()})};
  if(me&&me.deck!==deckLabel())wsSend({t:"deck",deck:deckLabel()});
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

/* ===== オンライン対戦エンジン連携 =====
   公開情報（盤面・マナ・得点）は両端末が同じ計算をする。手札・山札は持ち主の端末だけが持ち、
   相手側は「枚数だけ分かる伏せカード」で扱う。持ち主しか知らない情報に依存する効果は、持ち主が結果を送る。 */
const NET={on:false,you:0,seed:0,ack:0,q:{},w:{},sums:{},mine:{},sent:[],nw:0,nwt:0,os:0,dead:false,pr:()=>0.5,tsec:90,psec:30,pkr:null,pt0:0,wk:"",t0:0,off:0,opp:"",rc:0};
const mul=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const prnd=n=>NET.on?Math.floor(NET.pr()*n):rnd(n);
const absO=o=>o===0?NET.you:1-NET.you,relO=a=>a===NET.you?0:1;
const OPN=()=>NET.on?(NET.opp||"相手"):"CPU";
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
  else{const d=m.d||{};if(d.k==="ch")netPush("choice",d.v);else if(d.k==="out")netPush("out",d.v);else if(d.k==="mull")netPush("mull",1);else if(d.k==="sum"){NET.sums[d.t]=d.h;netCheck(d.t)}}
}
function netState(m){const op=m.players[1-m.you];NET.opp=op?op.name:NET.opp;NET.off=op&&op.online===false?(NET.off||Date.now()):0;netEndUpdate()}
function netStartGame(g){ON.go=g;onl.classList.remove("on");initOnline(g)}
function initOnline(g){
  $("pp").classList.remove("on");const og=$("mg");if(og)og.remove();
  Object.assign(NET,{on:true,you:g.you,seed:g.seed,q:{},w:{},sums:{},mine:{},sent:[],nw:0,os:0,dead:false,off:0,desync:0,t0:0,endAt:0,oppGone:0});NE.style.display="none";NE.dataset.on="";
  const o=(ON.st&&ON.st.players[1-g.you]);NET.opp=o?o.name:"相手";
  NET.pr=mul(g.seed);
  $("bset").classList.remove("on");$("home").classList.remove("on");started=true;document.body.classList.add("net");
  const mine=myDeck(ON.dk);
  S={win:5,max:15,turn:0,mana:[0,0],hand:[[],[]],board:Array(36).fill(null),pts:[0,0],st:[],sel:null,over:false,busy:false,log:"",res:"",hide:new Set(),fx:null,jq:[],pop:null,ini:0,nm:[0,0],stk:null,deck:[mine,mine.map(PH)]};
  const MN0=S.deck[0].find(c=>c.m===1);for(let i=0;i<3;i++){dr(0);dr(1)}
  const s0=S;S.busy=true;
  mulligan().then(async()=>{if(S!==s0)return;const tk=CARDS.find(c=>c.n===(MN0&&MN0.tk||"牡丹のはなびら"));S.hand[0].push({...tk,nw:Date.now()});S.hand[1].push(PH());netSend({k:"mull"});await netWait("mull");if(S!==s0)return;S.busy=false;next()});
}
function netForfeitWin(msg){if(!NET.on||NET.dead||!S||S.over)return;NET.oppGone=1;NET.dead=true;S.over=true;S.res="あなたの勝ち";S.busy=false;S.log=msg+"（不戦勝）";render();finale("あなたの勝ち");netBanner("")}
function netLeave(){if(NET.on){netFlush({t:"leave"})}NE.style.display="none";NE.dataset.on="";NET.on=false;NET.dead=true;ON.bye=1;try{ON.ws&&ON.ws.close()}catch{}ON.ws=null;document.body.classList.remove("net");netBanner("")}
function netReconnect(){
  if(NET.rc||!NET.on||NET.dead)return;NET.rc=1;let n=0;
  const go=()=>{if(!NET.on||ON.bye||NET.dead){NET.rc=0;return}if(++n>40){NET.rc=0;netBanner("接続できません。ホームに戻ってください。");return}
    netBanner("再接続中…");
    const w=wsOpen("/ws/room/"+ON.room,onRoomMsg,()=>{if(ON.ws===w&&!ON.bye)setTimeout(go,2000)});ON.ws=w;
    w.onopen=()=>{NET.rc=0;netBanner("");w.send(JSON.stringify({t:"hello",pid:PID,name:PNAME,deck:deckLabel(),ack:NET.ack}));NET.sent.forEach(netFlush)};
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
$("hm").onclick=()=>{netLeave();homeOpen()};

(()=>{const hide=()=>{const l=document.getElementById("ld");if(!l)return;l.classList.add("out");setTimeout(()=>l.remove(),1000)};
 const loaded=new Promise(r=>document.readyState==="complete"?r():addEventListener("load",r));
 const bar=document.querySelector("#ld .ld-bar b"),played=new Promise(r=>{if(!bar)return r();bar.addEventListener("animationend",r,{once:true});setTimeout(r,7000)});
 Promise.all([loaded,document.fonts?document.fonts.ready:0,played]).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).then(()=>setTimeout(hide,500))})();

/* ===== 成長・カスタマイズ（土台） =====
   エフェクト＝カードを飾るアニメーション（Canvas描画。定義は FXG / FXCFG）。
   成長：アイテムを GNEED 個使うとレベルが上がり、エフェクトをランダムに1つ獲得。
   カスタマイズ：獲得したエフェクトをそのカードに付け外し。手札・盤面・一覧・詳細に反映。 */
const GK="bota_grow_v1",GNEED=10;
/* 成長エフェクトの定義（仕様：growth_effects_spec.md 第4版）
   一般＝FXG のカタログ。カテゴリごとに同時装着の上限があり（FX_CAT）、合計7種まで。
   固有＝FX_UNI に載っている植物だけが獲得でき、上の7種には数えない。
   「付き方」＝カードごとの書き出しJSON（animation）。FXCFG に入れると既定値より優先される。 */
const FX_CAT={weather:["天気",1],particles:["粒子",2],sparkle:["キラ",1],light:["ライト",1],sway:["揺れ",1],filter:["色加工",1],unique:["固有",9]};
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
  ume_petals:P("unique","花びら(ウメ)","ウメの花びらが舞います",pt("ume_petals",14)),
  momiji_leaves:P("unique","葉(もみじ)","もみじの葉が舞います",pt("momiji_leaves",12)),
  tanpopo_fluff:P("unique","たんぽぽの綿毛","綿毛がふわふわ漂います",pt("tanpopo_fluff",10,{color:undefined})),
  shinju_light:P("unique","神樹の光","根の割れ目から光が脈打ち、光の粒が湧き上がります",{kind:"shinju",type:"shinju_light",pulse:{target:"sub",opacity:[.55,1],periodSec:4,scale:[1,1.02],pivot:"anchorY"},emitter:{source:"sub2",count:24,speed:.5,size:.8,direction:"up"}})}})();
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
const fxGen=n=>Object.keys(FXG).filter(k=>FXG[k].cat!=="unique"&&fxOk(k,n));
/* 獲得の出やすさ（1が標準）。色や形の種類が多いものは少し多めに。 */
const FX_W={petals:2,leaves:1.5,kira_star:.8,kira_cross:.8,kira_dot:.8,kira_diamond:.8,f_sunset:.7,f_mono:.7,f_sepia:.7,f_cool:.7,f_vivid:.7,ume_petals:1.5,momiji_leaves:1.5,tanpopo_fluff:1.5};
const fxPick=a=>{const w=a.map(id=>FX_W[id]==null?1:FX_W[id]);let r=Math.random()*w.reduce((x,y)=>x+y,0);for(let i=0;i<a.length;i++){r-=w[i];if(r<0)return a[i]}return a[a.length-1]};
const fxEquip=(g,id)=>{const cat=FXG[id].cat,cap=FX_CAT[cat][1],same=g.eq.filter(x=>FXG[x]&&FXG[x].cat===cat);while(same.length>=cap){const o=same.shift();g.eq=g.eq.filter(x=>x!==o)}g.eq.push(id)};
const fxNorm=ids=>[...new Set((ids||[]).map(fxMap))].filter(id=>FXG[id]);
let GR=(()=>{try{const j=JSON.parse(localStorage.getItem(GK)||"null");if(j&&typeof j==="object"){const cards={};for(const[n,v]of Object.entries(j.cards||{})){const own=fxNorm(v.own),g={lv:v.lv|0,own,eq:[]};fxNorm(v.eq).filter(id=>own.includes(id)).forEach(id=>fxEquip(g,id));cards[n]=g}return{items:j.items|0,cards}}}catch{}return{items:0,cards:{}}})();
const gsave=()=>{try{localStorage.setItem(GK,JSON.stringify(GR))}catch{}};
const gst=n=>GR.cards[n]||(GR.cards[n]={lv:0,own:[],eq:[]});
/* 読み込み時：Lvに見合う固有（floor(Lv/10)個、定義数が上限）が足りなければ付与 */
(()=>{let ch=0;for(const[n,g]of Object.entries(GR.cards)){const all=fxUni(n),want=Math.min(Math.floor((g.lv|0)/10),all.length);let have=g.own.filter(id=>FXG[id].cat==="unique").length;
  while(have<want){const u=all.filter(id=>!g.own.includes(id));if(!u.length)break;g.own.push(fxPick(u));have++;ch=1}}if(ch)gsave()})();
if(GR.items>0){COIN+=GR.items;GR.items=0;gsave();coinSave()}
/* ---- 汎用エフェクト（ショップで買う）：レベルアップの獲得とは別の仕組み ---- */
const INV_K="bota_inv_v1";let INV=(()=>{try{const j=JSON.parse(localStorage.getItem(INV_K)||"{}")||{},o={};for(const[k,v]of Object.entries(j))if(FXG[k]&&FXG[k].cat!=="unique"&&v>0)o[k]=v|0;return o}catch{return{}}})();
const invSave=()=>{try{localStorage.setItem(INV_K,JSON.stringify(INV))}catch{}},invTotal=()=>Object.values(INV).reduce((a,b)=>a+b,0);
function toast(h){const d=document.createElement("div");d.className="ctoast";d.innerHTML=h;document.body.append(d);setTimeout(()=>d.remove(),2600)}
/* 日替わりの品ぞろえ：ローカルの日付で決まり、その日は誰が見ても同じ（価格も固定）。0時に入れ替わる */
const SHOP_K="bota_shop_v1";
const dayKey=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const hash32=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng32=a=>()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
function shopLineup(key){const r=rng32(hash32("botagraphy-shop:"+key)),ids=Object.keys(FXG).filter(k=>FXG[k].cat!=="unique"),pk=[];for(let i=0;i<3;i++)pk.push(ids.splice(Math.floor(r()*ids.length),1)[0]);return pk.map(id=>({id,price:15+Math.floor(r()*16)}))}
let SHOP=(()=>{try{const j=JSON.parse(localStorage.getItem(SHOP_K)||"{}")||{};return{d:typeof j.d==="string"?j.d:"",sold:Array.isArray(j.sold)?j.sold:[]}}catch{return{d:"",sold:[]}}})();
const shopSave=()=>{try{localStorage.setItem(SHOP_K,JSON.stringify(SHOP))}catch{}};
const shopSync=()=>{const k=dayKey();if(SHOP.d!==k){SHOP={d:k,sold:[]};shopSave()}return k};
const SH=document.createElement("div");SH.id="shop";document.body.append(SH);let SHT=0,SHN=null;
function shopRender(){const key=shopSync(),L=shopLineup(key);
 SH.innerHTML=`<div class="waves"><i></i><i></i><i></i><i></i><i></i></div><header><button class="bsb" data-s="back">← 戻る</button><h2>ショップ</h2><div class="shcb cbadge"><i class="coin">B</i><b class="cb-n">${COIN}</b><span>ボタコイン</span></div></header>
 <div class="shb"><p class="shn">本日のエフェクト<small>　毎日0時に入れ替わります</small></p><div class="shi">${L.map(it=>{const d=FXG[it.id],sold=SHOP.sold.includes(it.id),ok=COIN>=it.price,own=INV[it.id]||0;
  return`<div class="spc${sold?" sold":""}${it.id===SHN?" got":""}"><div class="sp-pv">${fxHTML([it.id],"")}</div><b class="nm">${esc(d.name)}</b><span class="ct">${esc(FX_CAT[d.cat][0])}</span><p>${esc(d.desc)}</p>${own?`<em class="own">所持 ${own}</em>`:""}<button class="shbuy" data-s="buy" data-id="${it.id}"${sold||!ok?" disabled":""}>${sold?"売り切れ":`<i class="coin s">B</i>${it.price}`}</button>${!sold&&!ok?'<small class="shno">ボタコインが足りません</small>':""}</div>`}).join("")}</div>
 <p class="shs">買ったエフェクトは、成長画面の「汎用エフェクト」から好きなカードに使えます（使うと、そのカード専用になります）。</p></div>`;SHN=null}
function shopTimer(){clearTimeout(SHT);const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,0,200);SHT=setTimeout(()=>{if(SH.classList.contains("on")){shopRender();shopTimer()}},Math.max(1000,m-n))}
function shopOpen(){$("home").classList.remove("on");shopRender();SH.classList.add("on");shopTimer()}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&SH.classList.contains("on")){shopRender();shopTimer()}});
SH.onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
 if(b.dataset.s==="back"){SH.classList.remove("on");clearTimeout(SHT);homeOpen()}
 else if(b.dataset.s==="buy"){const id=b.dataset.id,it=shopLineup(shopSync()).find(x=>x.id===id);if(!it||SHOP.sold.includes(id)||COIN<it.price)return;
  COIN-=it.price;coinSave();INV[id]=(INV[id]||0)+1;invSave();SHOP.sold.push(id);shopSave();SHN=id;shopRender();toast(`「${esc(FXG[id].name)}」を手に入れた`)}};
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
/* ---- 描画エンジン：Canvas 2D。粒子の合計は上限240、画面外は停止、動きを減らす設定では粒子を出さない ---- */
/* 固有エフェクトの実スプライト：元の絵のレイヤー(832x1216)から連結成分で切り出し、アトラス化したもの。r=[x,y,w,h,元の幅,元の高さ]、ref=元の大きさの中央値 */
const FXSPR={"ume_petals":{"u":"img/fx-ume_petals-f7d70e.png","r":[[0,0,45,63,45,63],[47,0,72,45,110,69],[121,0,69,46,69,46],[192,0,48,71,48,71],[242,0,49,72,60,88],[293,0,72,47,141,93],[367,0,71,72,96,98],[0,74,72,53,75,55],[74,74,72,46,117,75],[148,74,72,44,143,88],[222,74,72,66,162,149],[296,74,72,71,104,102],[370,74,72,59,115,94],[0,147,72,66,142,131],[74,147,72,65,88,80],[148,147,66,72,71,77],[216,147,52,55,52,55],[270,147,52,55,52,55],[324,147,65,72,114,126],[391,147,72,49,140,96],[0,221,72,49,96,65],[74,221,53,50,53,50]],"ref":97.0},"momiji_leaves":{"u":"img/fx-momiji_leaves-c8fbca.png","r":[[0,0,72,59,95,78],[74,0,72,63,118,103],[148,0,72,66,104,95],[222,0,63,72,87,99],[287,0,68,72,131,138],[357,0,66,72,101,110],[425,0,66,72,104,114],[0,74,66,72,102,112],[68,74,72,69,105,100],[142,74,72,65,127,115],[216,74,72,60,127,106],[290,74,72,69,115,110],[364,74,70,72,120,123],[436,74,71,72,120,122],[0,148,71,72,144,147]],"ref":115.0},"tanpopo_fluff":{"u":"img/fx-tanpopo_fluff-a44b01.png","r":[[0,0,65,95,65,95],[67,0,65,89,65,89],[134,0,48,70,48,70],[184,0,77,66,77,66],[263,0,95,89,95,89],[360,0,74,47,74,47],[0,97,84,112,178,238],[86,97,79,54,79,54],[167,97,40,40,40,40],[209,97,55,37,55,37],[266,97,36,36,36,36],[304,97,79,112,136,194],[385,97,96,110,96,110],[0,211,100,112,163,182],[102,211,112,100,172,153]],"ref":89.0}};
const LIO=window.IntersectionObserver?new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle("off",!x.isIntersecting))):null;
const FXE=(()=>{
const ST=new Set(),RM=matchMedia("(prefers-reduced-motion: reduce)").matches,CAPN=240,EXT=1.28,TAU=Math.PI*2;
const io=window.IntersectionObserver?new IntersectionObserver(es=>es.forEach(x=>{const s=x.target._fx;if(s)s.vis=x.isIntersecting})):null;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const PAL={pink:["#ffd6e6","#f6a6c4","#ffc1d9"],purple:["#e0ccff","#b48cf0"],orange:["#ffc58a","#ff9a4d"],white:["#ffffff","#f1f1f1"],green:["#bfe58f","#7cc060"],red:["#ff9a9a","#e4504e"],yellow:["#fff0a0","#ffd24a"],blue:["#c4e2ff","#7db7ff"],black:["#666","#2a2a2a"]};
const DP={petals:["#ff8fb8","#ffd166","#b9a0ff","#7fd0ff","#ff9a76","#ffffff","#9be3a0","#ff6fae"],ume_petals:["#fff4f7","#ffd6e2","#ffbfd1"],leaves:["#a8d878","#7fbf5a","#d7e58a","#f2b45e"],momiji_leaves:["#ff6a3a","#e8402e","#ff9a3a","#c92f2a"],glow:["#fff2b0","#ffe27a"],tanpopo_fluff:["#ffffff"]};
const pal=e=>e.colors||PAL[e.color]||DP[e.type]||PAL.white;
const LF={f:{s:1.2,a:1,v:1.1},b:{s:.75,a:.62,v:.8}};
const SPR={};const spr=(k,rgb,mid)=>{if(SPR[k])return SPR[k];const c=document.createElement("canvas");c.width=c.height=96;const g=c.getContext("2d"),r=g.createRadialGradient(48,48,0,48,48,48);
 r.addColorStop(0,`rgba(${rgb},1)`);if(mid)r.addColorStop(.4,`rgba(${rgb},.5)`);r.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=r;g.fillRect(0,0,96,96);return SPR[k]=c};
const COUNTED=e=>e.kind==="weather"||e.kind==="particles"||e.kind==="sparkle"||e.kind==="emitter";
const SPI={},SPK={ume_petals:1.7,momiji_leaves:2,tanpopo_fluff:2.2};
const spImg=ty=>{const d=FXSPR[ty];if(!d)return null;let o=SPI[ty];if(!o){o=SPI[ty]={im:new Image(),ok:false};o.im.onload=()=>{o.ok=true};o.im.src=d.u}return o.ok?o.im:null};
/* 読み込み済みなら、(0,0)中心に実スプライトを描く。元の大きさの比率は保つ */
function spDraw(ctx,ty,p,sz){const im=spImg(ty);if(!im)return false;const D=FXSPR[ty],r=D.r[p.si%D.r.length],k=Math.max(r[4],r[5])/D.ref*sz*SPK[ty]/Math.max(r[2],r[3]);
 ctx.drawImage(im,r[0],r[1],r[2],r[3],-r[2]*k/2,-r[3]*k/2,r[2]*k,r[3]*k);return true}
let raf=0,last=0,lastDraw=0,LOAD=1,EMA=0;const MINDT=1000/30,FXPB=(()=>{try{return localStorage.getItem("fxBlur")!=="0"}catch(e){return true}})(),OVS="#hmdt,#dkdt,#bdt,#cust";
const fcss=e=>{const s=Math.max(0,Math.min(1,e.strength==null?.6:e.strength));let bf,bg="none";
 switch(e.type){case"mono":bf=`grayscale(${s})`;break;case"sepia":bf=`sepia(${s})`;break;case"vivid":bf=`saturate(${1+.8*s}) contrast(${1+.12*s})`;break;
  case"cool":bf=`hue-rotate(${-25*s}deg) saturate(${1-.1*s})`;bg=`rgba(70,130,255,${.14*s})`;break;
  default:bf=`sepia(${.3*s}) saturate(${1+.4*s})`;bg=`linear-gradient(180deg,rgba(255,150,70,${.26*s}),rgba(255,70,120,${.24*s}))`}
 return`backdrop-filter:${bf};-webkit-backdrop-filter:${bf};background:${bg}`};
function mkStage(ids,n){const s={ents:[],fl:[],vis:true,ib:0};
 for(const id of ids){const e=fxEnt(id,n);if(!e)continue;
  if(e.kind==="filter"){const d=document.createElement("i");d.className="fxfl";d.style.cssText=fcss(e);s.fl.push(d);continue}
  if(e.kind==="shinju"){if(!RM){s.pulse=e.pulse;s.ents.push({e:{...e.emitter,kind:"emitter",type:"emitter",layer:"front"},ps:[]})}continue}
  if(RM)continue;if(e.kind==="sway"){s.sw=e;continue}s.ents.push({e,ps:[]})}
 s.ents.sort((a,b)=>(b.e.kind==="light")-(a.e.kind==="light"));return s}
function reg(s){ST.add(s);if(io){io.observe(s.host);s.host._fx=s}if(!raf)raf=requestAnimationFrame(tick)}
/* 放出：レイヤー(sub2)の明るい不透明ピクセルからサンプリングして湧き出す。取れない間は根元の中央付近 */
const SMP={};
function sampleFor(s,src){const k=s.host.dataset.k,key=k+"|"+src;s.skey=key;if(key in SMP)return;
 const L=typeof ARTV!=="undefined"&&ARTV[k]&&ARTV[k].L.find(l=>l[0]===src),el=s.cv.querySelector(".ly.al-"+k+"-"+src);if(!L||!el){SMP[key]=[];return}
 s.ay=L[7];const bg=getComputedStyle(el).backgroundImage,u=bg.slice(bg.indexOf('"')+1,bg.lastIndexOf('"'));if(u.length<30){SMP[key]=[];return}
 SMP[key]=null;const im=new Image();im.onerror=()=>{SMP[key]=[]};
 im.onload=()=>{try{const w=104,h=152,c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0,w,h);const d=g.getImageData(0,0,w,h).data,arr=[];
  for(let i=0;i<w*h;i++)if(d[i*4+3]>=170)arr.push([(d[i*4]+d[i*4+1]+d[i*4+2])/3,i]);if(arr.length<30){SMP[key]=[];return}
  arr.sort((a,b)=>b[0]-a[0]);const top=arr.slice(0,Math.max(40,Math.floor(arr.length*.3))),A=1216/832,sc=L[5]/100,th=L[6]*Math.PI/180,ay=(L[7]==null?50:L[7])/100,tx=L[3]/100,ty=L[4]/100;
  SMP[key]=top.map(([,i])=>{const x=((i%w)+.5)/w-.5,y=(((i/w)|0)+.5)/h-ay,X=x*sc,Y=y*A*sc,rx=X*Math.cos(th)-Y*Math.sin(th),ry=X*Math.sin(th)+Y*Math.cos(th);return[.5+tx+rx,ay+ty+ry/A]})}catch(e){SMP[key]=[]}};
 im.src=u}
function emitPt(s,p){const pts=SMP[s.skey];let x,y;if(pts&&pts.length){const q=pts[Math.floor(Math.random()*pts.length)];x=(q[0]+(EXT-1)/2)*s.cw;y=(q[1]+(EXT-1)/2)*s.ch}
 else{x=(.5+(EXT-1)/2+rnd(-.06,.06))*s.cw;y=((s.ay||58)/100+(EXT-1)/2)*s.ch+rnd(-.02,.02)*s.ch}p.x=x;p.y=y;p.x0=x}
function spawn(s,e){const p={x:rnd(0,s.W),y:rnd(0,s.H),ph:rnd(0,TAU),k:rnd(.7,1.3),r:rnd(0,TAU),v:rnd(-1,1),d:rnd(.4,1)*(Math.random()<.7?1:-1),t:Math.random(),l:e.layer==="front"||Math.random()<.5?"f":"b"};
 p.c=pick(pal(e));if(e.type==="fog")p.y=rnd(.5,1.05)*s.H;if(e.kind==="emitter"){emitPt(s,p)}p.si=Math.floor(Math.random()*64);return p}
function sizeOf(s){let W,H,U,dens=1;
 if(s.ib){const cw=s.cv.clientWidth,ch=s.cv.clientHeight;if(!cw||!ch)return 0;W=cw*EXT;H=ch*EXT;U=cw*.86;dens=(W*H)/(U*ch*.9512)}
 else{W=s.host.clientWidth;H=s.host.clientHeight;U=W}
 if(!W||!H)return 0;const dpr=Math.min(devicePixelRatio||1,1),pw=Math.round(W*dpr),ph=Math.round(H*dpr);
 for(const c of[s.front,s.back])if(c&&(c.width!==pw||c.height!==ph)){c.width=pw;c.height=ph}
 s.W=W;s.H=H;s.U=U;s.dens=dens;s.dpr=dpr;if(s.ib){s.cw=W/EXT;s.ch=H/EXT}return 1}
function light(s,ctx,e,t){const W=s.W,H=s.H,U=s.U,st=Math.max(0,Math.min(1,e.strength==null?.6:e.strength)),sp=e.speed||1;ctx.globalAlpha=1;
 if(e.type==="lightLeak"){const a=(e.angle||0)*Math.PI/180,m=Math.max(W,H),cx=W/2+Math.sin(a)*m*.62+Math.sin(t*sp*.6)*m*.12,cy=H/2-Math.cos(a)*m*.62,pu=.5+.4*Math.sin(t*sp*1.8)+.15*Math.sin(t*sp*3.6+1),al=st*pu,g=ctx.createRadialGradient(cx,cy,0,cx,cy,m*.95);
  g.addColorStop(0,`rgba(255,176,96,${al*.9})`);g.addColorStop(.45,`rgba(255,130,140,${al*.38})`);g.addColorStop(1,"rgba(255,130,140,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 else{const z=(e.size||1.5)/1.5;for(let i=0;i<7;i++){const x=(((i*.37+t*.012*sp*(.6+i*.1))%1.2)-.1)*W,y=(.12+((i*.53)%.8))*H+Math.sin(t*sp*.5+i)*H*.04,r=U*.24*z*(.7+.5*((i*.61)%1)),a=st*.34*(.4+.6*Math.sin(t*sp*1.4+i*1.7));
  ctx.globalAlpha=a;ctx.drawImage(spr("warm","255,244,196"),x-r,y-r,2*r,2*r)}}}
function wrapXY(p,s,m){if(p.x<-m)p.x=s.W+m;else if(p.x>s.W+m)p.x=-m;if(p.y>s.H+m){p.y=-m;p.x=rnd(0,s.W)}else if(p.y<-m){p.y=s.H+m;p.x=rnd(0,s.W)}}
function step(s,ctx,e,p,dt,t){const W=s.W,H=s.H,U=s.U,L=LF[p.l],z=(e.size/1.5)*L.s,sp=(e.speed||1)*L.v,sw=e.sway==null?1:e.sway,ty=e.type;
 if(e.kind==="sparkle"){p.t+=dt*(e.speed||1)/1.9;if(p.t>=1){p.t=0;p.x=rnd(0,W);p.y=rnd(0,H);p.k=rnd(.7,1.3)}
  const pu=Math.sin(Math.PI*p.t),r=U*.03*z*p.k*(.55+.45*pu);
  ctx.globalAlpha=pu*L.a*.75;ctx.drawImage(spr("gold","255,220,130"),p.x-r*2.4,p.y-r*2.4,r*4.8,r*4.8);
  ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#fffdf0";ctx.beginPath();
  if(e.pattern==="cross"){ctx.rect(-r,-r*.14,2*r,r*.28);ctx.rect(-r*.14,-r,r*.28,2*r)}
  else if(e.pattern==="dot")ctx.arc(0,0,r*.5,0,TAU);
  else if(e.pattern==="diamond"){ctx.moveTo(0,-r);ctx.lineTo(r*.6,0);ctx.lineTo(0,r);ctx.lineTo(-r*.6,0);ctx.closePath()}
  else{ctx.moveTo(0,-r);ctx.quadraticCurveTo(0,0,r,0);ctx.quadraticCurveTo(0,0,0,r);ctx.quadraticCurveTo(0,0,-r,0);ctx.quadraticCurveTo(0,0,0,-r)}
  ctx.fill();ctx.restore();return}
 if(e.kind==="emitter"){const sp2=e.speed||1;p.t+=dt*sp2/2.5;if(p.t>=1){p.t=0;emitPt(s,p)}p.y-=H*.09*sp2*dt;p.x=p.x0+Math.sin(t*.9+p.ph)*U*.015;
  const r=U*.045*(e.size||1)*L.s,pu=Math.sin(Math.PI*p.t);ctx.globalAlpha=pu*.9;ctx.drawImage(spr("glow","255,238,160",1),p.x-r,p.y-r,2*r,2*r);return}
 switch(ty){
 case"rain":{const a=(e.angleDeg||0)*Math.PI/180,v=H*.95*sp*p.k,len=U*.11*z*p.k,m=len+10;p.x+=Math.sin(a)*v*dt;p.y+=Math.cos(a)*v*dt;
  if(p.y>H+m){p.y=-m;p.x=rnd(0,W)}if(p.x<-m)p.x+=W+2*m;else if(p.x>W+m)p.x-=W+2*m;
  ctx.globalAlpha=.5*L.a;ctx.strokeStyle="#dcecff";ctx.lineWidth=Math.max(.8,U*.0045*z);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-Math.sin(a)*len,p.y-Math.cos(a)*len);ctx.stroke();break}
 case"snow":{p.y+=H*.075*sp*p.k*dt;p.x+=Math.sin(t*.7+p.ph)*U*.05*sw*dt;wrapXY(p,s,10);
  ctx.globalAlpha=.85*L.a;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.8,U*.015*z*p.k),0,TAU);ctx.fill();break}
 case"fog":{const r=U*.32*z*p.k;p.x+=U*.07*sp*p.d*dt;if(p.x>W+r)p.x=-r;else if(p.x<-r)p.x=W+r;
  const y=p.y+Math.sin(t*.5+p.ph)*U*.06*sw,a=.5*(.6+.4*Math.sin(t*.6+p.ph));
  ctx.globalAlpha=a;ctx.drawImage(spr("fog","236,240,246"),p.x-r,y-r,2*r,2*r);break}
 case"petals":case"ume_petals":case"leaves":case"momiji_leaves":{const lf=ty==="leaves"||ty==="momiji_leaves",sz=U*(lf?.04:.034)*z*p.k;
  p.y+=H*.1*sp*p.k*dt;p.x+=(Math.sin(t*.8+p.ph)*U*.07*sw-U*.015*sp)*dt;p.r+=p.v*dt*(ty==="momiji_leaves"?3.4:2.2)*sp;wrapXY(p,s,sz*2);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.scale(1,.55+.45*Math.cos(t*1.6+p.ph));ctx.globalAlpha=.92*L.a;ctx.fillStyle=p.c;if(FXSPR[ty]&&spDraw(ctx,ty,p,sz)){ctx.restore();return}ctx.beginPath();
  if(ty==="ume_petals")ctx.arc(0,0,sz*.8,0,TAU);
  else if(ty==="momiji_leaves"){for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rr=i%2?sz*.42:sz;ctx[i?"lineTo":"moveTo"](Math.cos(an)*rr,Math.sin(an)*rr)}ctx.closePath()}
  else if(lf){ctx.moveTo(0,-sz);ctx.quadraticCurveTo(sz*.8,-sz*.2,0,sz);ctx.quadraticCurveTo(-sz*.8,-sz*.2,0,-sz)}
  else{ctx.moveTo(0,-sz);ctx.bezierCurveTo(sz*.9,-sz*.5,sz*.7,sz*.6,0,sz*.9);ctx.bezierCurveTo(-sz*.7,sz*.6,-sz*.9,-sz*.5,0,-sz)}
  ctx.fill();if(lf){ctx.strokeStyle="rgba(0,0,0,.18)";ctx.lineWidth=Math.max(.6,sz*.06);ctx.beginPath();ctx.moveTo(0,-sz);ctx.lineTo(0,sz);ctx.stroke()}ctx.restore();break}
 case"glow":{p.y-=H*.06*sp*p.k*dt;p.x+=Math.sin(t*.6+p.ph)*U*.02*sw*dt;wrapXY(p,s,20);
  const r=U*.028*z*p.k,a=(.55+.45*Math.sin(t*1.7+p.ph))*L.a;
  ctx.globalAlpha=a;ctx.drawImage(spr("glow","255,238,160",1),p.x-r,p.y-r,2*r,2*r);break}
 case"tanpopo_fluff":{const sz=U*.03*z*p.k;p.x+=(U*.05*sp+Math.sin(t*.9+p.ph)*U*.03*sw)*dt;p.y+=(-H*.04*sp+Math.cos(t*.7+p.ph)*U*.02*sw)*dt;
  if(p.x>W+sz*3){p.x=-sz*3;p.y=rnd(0,H)}if(p.y<-sz*3){p.y=H+sz*3;p.x=rnd(0,W)}
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r*.25+Math.sin(t+p.ph)*.4);ctx.globalAlpha=.9*L.a;ctx.strokeStyle="rgba(255,255,255,.92)";ctx.fillStyle="#fff";ctx.lineWidth=Math.max(.6,sz*.07);if(spDraw(ctx,ty,p,sz)){ctx.restore();return}
  ctx.beginPath();for(let i=0;i<9;i++){const an=-Math.PI*(.05+.9*i/8);ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*sz,Math.sin(an)*sz)}ctx.stroke();
  for(let i=0;i<9;i++){const an=-Math.PI*(.05+.9*i/8);ctx.beginPath();ctx.arc(Math.cos(an)*sz,Math.sin(an)*sz,sz*.08,0,TAU);ctx.fill()}
  ctx.strokeStyle="#d9cfa5";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,sz*.9);ctx.stroke();ctx.restore()}}}
function draw(s,t,dt,k){const cf=s.front.getContext("2d"),cb=s.back?s.back.getContext("2d"):cf;
 for(const c of s.back?[cf,cb]:[cf]){c.setTransform(s.dpr,0,0,s.dpr,0,0);c.clearRect(0,0,s.W,s.H)}
 for(const x of s.ents){const e=x.e;if(e.kind==="light"){light(s,cf,e,t);continue}if(!COUNTED(e))continue;
  const want=Math.max(0,Math.round(e.count*s.dens*k));while(x.ps.length<want)x.ps.push(spawn(s,e));if(x.ps.length>want)x.ps.length=want;
  for(const p of x.ps)step(s,p.l==="b"?cb:cf,e,p,dt,t)}
 cf.globalAlpha=1;cb.globalAlpha=1}
function tick(now){raf=0;if(FXPB&&!document.hasFocus()){raf=-1;setTimeout(()=>{raf=0;if(ST.size)raf=requestAnimationFrame(tick)},400);return}if(now-lastDraw<MINDT-2){raf=requestAnimationFrame(tick);return}lastDraw=now;const ov=document.body.classList.contains("ov"),dt=Math.min(.05,Math.max(0,(now-last)/1000)||.016);last=now;const t=now/1000,live=[];let total=0;
 for(const s of ST){if(!s.host.isConnected){ST.delete(s);if(io)io.unobserve(s.host);continue}
  if(!s.vis||(s.ib&&!s.host.offsetParent)||(ov&&!s.host.closest(OVS))||!sizeOf(s))continue;live.push(s);for(const x of s.ents)if(COUNTED(x.e))total+=x.e.count*s.dens}
 const k=(total>CAPN?CAPN/total:1)*LOAD,w0=performance.now();for(const s of live)draw(s,t,dt,k);if(live.length){EMA=EMA*.9+(performance.now()-w0)*.1;LOAD=EMA>12?Math.max(.4,LOAD-.02):EMA<5?Math.min(1,LOAD+.01):LOAD}
 if(ST.size){if(live.length)raf=requestAnimationFrame(tick);else{raf=-1;setTimeout(()=>{raf=0;if(ST.size)raf=requestAnimationFrame(tick)},300)}}}
return{
 addIb(ib,ids,n){const cv=ib.querySelector(".cv");if(!cv)return;const s=mkStage(ids,n);s.ib=1;s.host=ib;s.cv=cv;
  const mk=(cls,sx,sy)=>{const c=document.createElement("canvas");c.className="ly fxl "+cls;c.dataset.sx=sx;c.dataset.sy=sy;c.style.cssText=`position:absolute;left:${-(EXT-1)/2*100}%;top:${-(EXT-1)/2*100}%;width:${EXT*100}%;height:${EXT*100}%;right:auto;bottom:auto;pointer-events:none`;return c};
  s.back=mk("fxb",-2,-.8);const bg=cv.querySelector(".bgc");if(bg)bg.after(s.back);else cv.prepend(s.back);
  s.front=mk("fxf",-12,-4.6);cv.append(s.front);
  if(s.pulse){const m=ib.querySelector(".ly.al-"+ib.dataset.k+"-"+s.pulse.target);if(m){s.pl=m;m.style.setProperty("--p0",s.pulse.opacity[0]);m.style.setProperty("--p1",s.pulse.opacity[1]);m.style.setProperty("--s1",s.pulse.scale[1]);m.style.animation=`fxpl ${s.pulse.periodSec}s ease-in-out infinite`}}
  const em=s.ents.find(x=>x.e.kind==="emitter");if(em)sampleFor(s,em.e.source);
  if(s.sw){const m=ib.querySelector(".ly.al-"+ib.dataset.k+"-main");if(m){s.main=m;m.style.setProperty("--sd",(s.sw.deg||1)+"deg");m.style.animation=`fxsw ${s.sw.periodSec||7}s ease-in-out infinite`}}
  if(s.fl.length){const o=document.createElement("span");o.className="fxo";o.dataset.on="1";s.fl.forEach(d=>o.append(d));ib.append(o)}
  reg(s)},
 col:(e,i)=>{const p=pal(e);return p[i%p.length]},pal:e=>pal(e),
 drop(el){for(const s of[...ST])if(s.host===el||s.host.parentNode===el){ST.delete(s);if(io)io.unobserve(s.host);
   if(s.ib){[s.front,s.back].forEach(c=>c&&c.remove());[s.main,s.pl].forEach(m=>{if(m)m.style.animation=""})}}
  el.querySelectorAll(":scope>.fxo").forEach(o=>{if(LIO)LIO.unobserve(o);o.remove()})}}})();
function fxSet(el,ids,n){const sig=ids.join(",")+"|"+(n||"");if((el.dataset.fx||"")===sig)return;el.dataset.fx=sig;FXE.drop(el);if(!ids.length)return;
  if(el.matches(".ib")&&el.querySelector(".cv"))FXE.addIb(el,ids,n);else{el.insertAdjacentHTML("beforeend",fxHTML(ids,n,el.matches(".dkc:not(.hm)")));const o=el.querySelector(":scope>.fxo.lt");if(o&&LIO)LIO.observe(o)}}
function fxScan(){
  document.querySelectorAll(".dkc[data-n]").forEach(el=>fxSet(el,eqOf(el.dataset.n),el.dataset.n));
  document.querySelectorAll(".hmc[data-n]").forEach(w=>{const e=w.firstElementChild;if(e)fxSet(e,eqOf(w.dataset.n),w.dataset.n)});
  if(typeof S!=="undefined"&&S&&S.hand){
    document.querySelectorAll("#hand .card[data-h]").forEach(el=>{const c=S.hand[0][+el.dataset.h];fxSet(el,c?eqOf(c.n):[],c?c.n:"")});
    document.querySelectorAll("#board [data-i]").forEach(el=>{const b=S.board[+el.dataset.i];fxSet(el,b?(b.o===0?eqOf(b.card.n):fxNorm(b.card.fx).slice(0,10)):[],b?b.card.n:"")})}
  document.querySelectorAll(".ib[data-n]").forEach(el=>{const x=el.dataset.xf;fxSet(el,x!==undefined?fxNorm(x.split(",")).slice(0,10):eqOf(el.dataset.n),el.dataset.n)});}
const FXSEL=".dkc,.card,.ib,[data-i]";new MutationObserver(rs=>{if(!rs.some(r=>{for(const n of r.addedNodes)if(n.nodeType===1&&!n.classList.contains("fxo")&&!n.classList.contains("fxl")&&(n.matches(FXSEL)||n.querySelector(FXSEL)))return true}))return;try{fxScan()}catch{}}).observe(document.body,{childList:true,subtree:true});
let GCUR=null;const FXTABS=["weather","particles","sparkle","light","sway","filter","unique"];
let CTAB=null,CNEW=null,CPOP=false,CTOP="fx",GSEL=null;
const GRES=document.createElement("div"),CUST=document.createElement("div");GRES.id="gres";CUST.id="cust";document.body.append(GRES,CUST);
/* 詳細・成長を開いている間は背面の演出を止める（CSSの body.ov と、FXEの描画対象の絞り込みに使う） */
{const E=["hmdt","dkdt","bdt","cust"].map(i=>document.getElementById(i)),sy=()=>document.body.classList.toggle("ov",E.some(e=>e&&e.classList.contains("on"))),mo=new MutationObserver(sy);E.forEach(e=>e&&mo.observe(e,{attributes:true,attributeFilter:["class"]}))}
function growCard(c){const g=gst(c.n);if(COIN<GNEED)return;COIN-=GNEED;coinSave();const l0=g.lv;g.lv++;
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
const gClose=()=>{GRES.classList.remove("on");GRES.dataset.rdy="";tiltKick();const b=CUST.querySelector(".rg-num");if(b){b.classList.remove("lvp");void b.offsetWidth;b.classList.add("lvp")}};
GRES.onclick=e=>{if(GRES.dataset.rdy!=="1")return;const b=e.target.closest("[data-r]");if(b){pop(b);gClose();return}if(!e.target.closest(".gu-box"))gClose()};
const custCats=(c,g)=>FXTABS.filter(k=>!(FX_BAN[c.n]||[]).includes(k)).filter(k=>k!=="unique"||fxUni(c.n).length||g.own.some(id=>FXG[id].cat==="unique"));
function leftHTML(c,g){const n=COIN,ok=n>=GNEED,uq=fxUni(c.n),left=uq.filter(id=>!g.own.includes(id)).length,r=g.lv%10,k=++ORGN,
  hint=left?`<p class="rg-nx">固有エフェクトまで あと<b>${10-r}</b>レベル</p>`:(uq.length?'<p class="rg-nx">固有エフェクトはすべて獲得済みです</p>':"");
 return`<div class="rg-lv"><svg class="rg-ring" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="rgq${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3c46c"/><stop offset=".5" stop-color="#c8a24c"/><stop offset="1" stop-color="#9fbf98"/></linearGradient></defs><circle class="rg-r0" cx="80" cy="80" r="68"/><circle class="rg-r2" cx="80" cy="80" r="76"/><circle class="rg-r1" cx="80" cy="80" r="68" pathLength="100" stroke="url(#rgq${k})" style="--p:${r*10}"/></svg><div class="rg-lt"><em>LEVEL</em><b class="rg-num${CPOP?" lvp":""}">${g.lv}</b></div></div>${hint}<div class="rg-coin"><i class="coin">B</i><b>${n}</b><span>ボタコイン</span></div><button class="rg-btn" data-c="grow"${ok?"":" disabled"}><span>成長させる</span><small>${ok?`<i class="coin s">B</i> ${GNEED} ボタコイン`:`ボタコインが足りません（${GNEED}必要）`}</small></button><p class="os">成長するとレベルが上がり、エフェクトを1つ獲得できます。</p><button class="gdbg" data-c="dbg">テスト用：ボタコイン+10</button>`}
function genHTML(c,g){const ids=Object.keys(INV).filter(id=>INV[id]>0),can=id=>!g.own.includes(id)&&fxOk(id,c.n);if(GSEL&&(!INV[GSEL]||!can(GSEL)))GSEL=null;
 return`<p class="os">ショップで買った汎用エフェクトです。選んで「このカードに使う」と、そのカード専用のエフェクトになります（使うと1つ消費）。</p><div class="crows">${ids.length?ids.map(id=>{const d=FXG[id],ok=can(id);return`<div class="crow gen${GSEL===id?" on":""}${ok?"":" na"}"${ok?` data-c="gsel"`:""} data-id="${esc(id)}"><div class="cth">${fxHTML([id],c.n)}</div><div class="cinfo"><b>${esc(d.name)}</b><span>${esc(FX_CAT[d.cat][0])}　${esc(d.desc)}</span></div><span class="cst">×${INV[id]}${ok?"":g.own.includes(id)?"　所持済み":"　使えません"}</span></div>`}).join(""):'<p class="os">まだ持っていません。ショップで買えます。</p>'}</div><button class="gapply" data-c="gapply"${GSEL?"":" disabled"}>${GSEL?`「${esc(fxName(GSEL))}」をこのカードに使う`:"使うエフェクトを選んでください"}</button>`}
function listHTML(c,g){const tops=`<div class="ctabs1"><button class="${CTOP==="fx"?"on":""}" data-c="top" data-k="fx">エフェクト</button><button class="${CTOP==="gen"?"on":""}" data-c="top" data-k="gen">汎用エフェクト<small>${invTotal()}</small></button></div>`;if(CTOP==="gen")return tops+genHTML(c,g);const cats=custCats(c,g);if(!CTAB||!cats.includes(CTAB))CTAB=cats.find(k=>g.own.some(id=>FXG[id].cat===k))||cats[0];
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

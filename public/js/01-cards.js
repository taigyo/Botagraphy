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

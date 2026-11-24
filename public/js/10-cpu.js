/* ===== CPU（強さ lv：0〜1 の連続値）=====
   BM.lv が強さ。選択肢は CPULV の3つだが、中間値もそのまま動く（ソロステージは BM.lv に好きな値を入れるだけ）。
   lv が上がるほど：見落とし↓・候補の読み↑・評価のブレ↓・カード効果の理解↑・相手の次の一手の想定あり。
   公平のため、CPUは相手の今ターンの予定(S.st)と手札を見ない（盤面・自分の手札/デッキ・相手のマナだけ）。 */
const CPULV={weak:.12,mid:.5,strong:.92};
const cpuClamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const cpuLvName=v=>v<.3?"弱い":v<.7?"普通":"強い";
/* syn＝手札・盤面とのシナジー／塞ぎの読み（0で無効）、ord＝同ターンはマス番号の小さい順に解決される事を読む。弱いほど両方オフ */
const cpuP=(lv,opt)=>Object.assign({lv,miss:.3*Math.pow(1-lv,1.6),K:1+Math.round(lv*lv*24),T:.4+(1-lv)*5,fx:cpuClamp(lv*1.3),opp:lv>.3,cm:6+Math.round(lv*lv*24),look:lv,syn:cpuClamp((lv-.25)/.6),ord:lv>.4},opt||{});
function cpu(){return aiPlan(1,S.lv?S.lv[1]:.5,S.opt&&S.opt[1])}

/* 効果の価値（スコア単位）。数値つきの効果は盤面に仮適用して面の差に反映するので、ここは「盤面に出ない価値」だけ */
const AI_V={mana:1.6,draw:1.4,cost:.55};
const AI_S={"撤去予約":1.2,"移動":1.5,"-1コスト":.9,"+トレリス":1,"相手の手札へ":-1.2,"増殖予約":2,"増殖?":1.2,"戻す":.2};
const aiOwn=(c,j)=>S.board[j]&&S.board[j].o===c.o;
const aiTop=(c,L)=>L.filter(j=>S.board[j]&&S.board[j].o!==c.o).sort((a,b)=>pw(S.board[b],b)-pw(S.board[a],a))[0];
/* 名前ごとの上書き（自動で読めない効果）。戻り値＝盤面に出ない価値 */
const CPU_FX={
  "クレマチス|-1 / -4":(c,b,i)=>{SEL.mo(b,i).sort((x,y)=>pw(S.board[x],x)-pw(S.board[y],y)).slice(0,2).forEach(j=>c.vb(j,-1));const j=aiTop(c,SEL.op(b,i));if(j!==undefined)c.vb(j,-4);return 0},
  "ドクダミ|撤去":(c,b,i)=>{const L=dkL(b,i),j=aiTop(c,L);c.vs(j!==undefined?j:L.sort((x,y)=>pw(S.board[x],x)-pw(S.board[y],y))[0],null);return 0},
  "スイートピー|移動":(c,b,i)=>{const L=SEL.of(b,i);if(L.length)c.vb(L[0],2);return 0},
};
function aiGather(f){const L=[f.s,...(f.steps||[]).map(x=>x.s)].filter(Boolean);let n=0,v=0;
  for(const s of L){let m;if(m=/^([+-]\d+)$/.exec(s))n+=+m[1];else if(m=/マナ([+-]\d)|([+-]\d)マナ/.exec(s))v+=AI_V.mana*(+(m[1]||m[2]));else if(m=/^\+(\d)枚$|^(\d)枚引く$/.exec(s))v+=AI_V.draw*(+(m[1]||m[2]));else if(/^\+1枚$/.test(s))v+=AI_V.draw}
  return{n,v}}
/* 1つの効果を評価：数値は仮適用（面の差に反映）、それ以外は価値を返す */
function aiEff(c,X,b,i,f){const P=c.P,w=f.w,s=f.s||"",num=/^[+-]\d+$/.test(s)?+s:null,fx=P.fx,tl=Math.min(c.tl,4);
  try{
  if(w==="p"){
    if(f.ok&&!f.ok(b,i))return 0;
    const ov=CPU_FX[b.card.n+"|"+s];if(ov&&fx>.25)return ov(c,b,i);
    if(num!==null&&f.tg){f.tg(b,i).forEach(j=>c.vb(j,num));return 0}
    if(num!==null&&f.k==="dn"&&fx>.25){const L=adj(i).filter(k=>S.board[k]),j=aiTop(c,L);c.vb(j!==undefined?j:L.sort((x,y)=>pw(S.board[x],x)-pw(S.board[y],y))[0],num);return 0}
    if(s==="撤去"&&f.tg){const root=/神樹の根/.test(f.t);f.tg(b,i).forEach(j=>c.vs(j,root?{o:b.o,card:byCard("神樹の根"),bonus:0}:null));return 0}
    if(s==="+マナ")return AI_V.mana*S.pts[b.o]*fx;
    if(s==="咲かせる")return 1.2*(f.hvf?f.hvf(b,i)||0:0)*fx;
    const g=aiGather(f);if(g.v)return g.v*fx;
    return(AI_S[s]??.8)*fx}
  if(w==="e"){if(f.hid)return 0;const g=aiGather(f);return(g.v*tl+(g.n<0?g.n*.5*Math.min(tl,3):0))*fx}
  if(w==="l"){const g=aiGather(f),a=ar(i),d=c.d(a),pl=1/(1+Math.exp(1.7*d/X.sg));return(g.n*.9+g.v)*pl*fx}
  if(w==="t")return(f.n?f.n*.5:1)*fx;
  if(w==="g")return .8*fx;
  if(w==="x"||w==="m")return .5*fx;
  if(w==="z")return(.4+.5*adj(i).filter(k=>S.board[k]&&S.board[k].o!==b.o).length)*fx;
  if(w==="h")return .6*fx;
  if(w==="d")return .7*fx;
  }catch(e){}
  return 0}
/* 配置誘発（すみれ等）。実際は同ターンならマス番号の小さい順に解決されるので、その順で効くものだけ反映（ord）。
   盤面にある誘発側→今置くカード／今置くカードが誘発側→同ターンに後から解決される自軍カード */
const aiT1=(c,f,sb,nb,cell)=>{if(f.run)return(sb.o===c.o?1:-1)*1.2*c.P.fx;if(f.n)c.vb(cell,f.n);return 0};
function aiTrig(c,b,i){let r=0;
  try{for(let j=0;j<36;j++){const sb=S.board[j];if(!sb||sb===b)continue;
      if(sb.vt&&c.P.ord&&j>i)continue;
      for(const f of sb.card.f)if(f.w==="t"&&f.on(sb,j,b,i))r+=aiT1(c,f,sb,b,i)}
    if(c.P.ord)for(let j=i+1;j<36;j++){const nb=S.board[j];if(!nb||!nb.vt)continue;
      for(const f of b.card.f)if(f.w==="t"&&f.on(b,i,nb,j))r+=aiT1(c,f,b,nb,j)}}catch(e){}
  return r}
/* 場に出す（仮）。b.vt＝今ターンに仮置きしたもの */
function aiPlace(c,X,card,i){const b={o:c.o,card,bonus:0,vt:1};c.vs(i,b);let r=aiTrig(c,b,i);
  for(const f of card.f)if(!f.off)r+=aiEff(c,X,b,i,f);return r}

/* シナジー・塞ぎ：手札の「周りに左右されるカード」(aiDep) が、今後いちばん良いマスで出せたときの上積み。
   aiPot＝そのマスに仮置きしたときの 効果＋パワー増減（自身のパワーは除く）。
   ある手を打つと、その周囲8マスだけ潜在価値が変わる（上積みが増える＝相性が良い／最良マスが埋まる＝塞ぐ）ので、差分だけ見る */
const aiDep=card=>card.f.some(f=>!f.off&&(f.w==="s"||f.w==="t"||(f.w==="p"&&(f.tg||f.s==="撤去"))));
const aiPotCells=o=>{const L=[];for(let e=0;e<36;e++){if(S.board[e])continue;const n=adj8(e).filter(k=>S.board[k]);if(n.length)L.push([n.filter(k=>S.board[k].o===o).length+n.length*.3+Math.random()*.1,e])}
  return L.sort((a,b)=>b[0]-a[0]).slice(0,20).map(x=>x[1])};
function aiPot(c,X,h,e){const m=c.U.length,d0=c.dsum();let v=0;try{v=aiPlace(c,X,h,e)+c.dsum()-d0-(h.p||0)}catch(_){}c.undo(m);return v}
function aiSynD(c,X,mv,dep,pc,cache){const hs=dep.filter(h=>h!==mv.card);if(!hs.length||mv.cell<0)return 0;
  const N=new Set([mv.cell,...adj8(mv.cell)]),m0=c.U.length;aiPlace(c,X,mv.card,mv.cell);
  const nn=[...N].filter(e=>!S.board[e]);let d=0;
  for(const h of hs){const cc=cache.get(h);let rest=0,old=0;
    pc.forEach((e,k)=>{if(N.has(e))old=Math.max(old,cc[k]);else rest=Math.max(rest,cc[k])});
    let nw=0;for(const e of nn)nw=Math.max(nw,aiPot(c,X,h,e));
    d+=Math.max(rest,nw)-Math.max(rest,old)}
  c.undo(m0);return d}
const AI_SYN=.35;   // 潜在パワー1あたりのスコア

/* アクション（牡丹のはなびら・剪定・トレリス）。t＝対象マス（rndは-1） */
function aiAct(c,card,t){const f=card.f.find(x=>x.w==="a"),n=/\+(\d)(?!マナ|枚)/.exec(f.t),mn=/\+(\d)マナ/.exec(f.t);let r=0;
  if(!f.rnd&&t>=0&&n)c.vb(t,+n[1]);if(mn)r+=AI_V.mana*mn[1]*c.P.fx;if(f.rnd)r+=2.2*c.P.fx;return r}
const aiSample=(L,n)=>{if(L.length<=n)return L;const a=[...L];for(let k=0;k<n;k++){const j=k+rnd(a.length-k);[a[k],a[j]]=[a[j],a[k]]}return a.slice(0,n)};
const aiGauss=()=>(Math.random()+Math.random()+Math.random()-1.5)*1.4;

/* 面の評価：4つの面それぞれの勝ち/負け/引き分けの確率 → 「今ターンに取れる点の差」の期待値 ＋ 面の優勢（今後も効く） */
function aiScore(o,X){const s=sums(),pr=[];let sh=0;
  for(let a=0;a<4;a++){const v=(o?s[a][1]-s[a][0]:s[a][0]-s[a][1])-X.mu[a],z=v/X.sg,t=.14*Math.exp(-z*z),w=(1-t)/(1+Math.exp(-1.7*z));pr.push([w,1-t-w,t]);sh+=Math.tanh(v/7)}
  let E=0;for(let m=0;m<81;m++){let p=1,df=0,k=m;for(let a=0;a<4;a++){const r=k%3;k=(k-r)/3;p*=pr[a][r];df+=r===0?1:r===1?-1:0}E+=p*(df>0?X.wW:df<0?-X.wL:0)}
  return 11*E+X.sh*sh}

function aiPlan(o,lv,opt){
  const P=cpuP(lv,opt),H=S.hand[o],U=[],t0=performance.now();
  const vs=(j,v)=>{const w=S.board[j];S.board[j]=v;U.push(()=>{S.board[j]=w})};
  const vb=(j,n)=>{const x=S.board[j];if(!x||(n>0&&noUp(j)))return;const w=x.bonus;x.bonus=(w||0)+n;U.push(()=>{x.bonus=w})};
  const undo=m=>{while(U.length>m)U.pop()()};
  let plan=[];
  try{
    const s0=sums(),df0=a=>o?s0[a][1]-s0[a][0]:s0[a][0]-s0[a][1];
    const oa=P.opp?Math.min(S.mana[1-o],10)*.7:0,wt=[0,1,2,3].map(a=>1/(1+Math.abs(df0(a))/4)),ws=wt.reduce((x,y)=>x+y);
    const X={mu:wt.map(v=>oa*v/ws),sg:2.5+.3*oa,wW:1+.6*S.pts[o]/S.win,wL:1+.9*S.pts[1-o]/S.win,sh:P.look*Math.min(1,(S.max-S.turn+1)/5)*1.2};
    const c={o,P,vs,vb,tl:Math.max(1,S.max-S.turn),d:a=>{const s=sums();return(o?s[a][1]-s[a][0]:s[a][0]-s[a][1])-X.mu[a]},U,undo,dsum:()=>{const s=sums();let d=0;for(let a=0;a<4;a++)d+=o?s[a][1]-s[a][0]:s[a][0]-s[a][1];return d}};
    let best=null;
    for(let run=0;run<P.K;run++){
      if(run>0&&performance.now()-t0>450)break;
      const m0=U.length,skip=new Set(H.filter(()=>Math.random()<P.miss)),used=new Set(),items=[];let rem=S.mana[o],res=0;
      for(let step=0;step<8;step++){if(run>0&&performance.now()-t0>450)break;
        const mv=[{sc:aiScore(o,X)+res,pass:1}],empty=S.board.map((b,i)=>b?-1:i).filter(i=>i>=0);
        for(const card of H){if(used.has(card)||skip.has(card)||card.c>rem||card.hid)continue;
          const act=isAct(card);let T;
          if(act){const f=card.f.find(x=>x.w==="a");T=actT(o,card);if(!T.length)continue;T=f.rnd?[T[0]]:aiSample(T,P.cm)}else T=aiSample(empty,P.cm);
          for(const t of T){const m1=U.length;const r=(act?aiAct(c,card,t):aiPlace(c,X,card,t))-AI_V.cost*card.c;mv.push({sc:aiScore(o,X)+res+r,r,card,cell:act?-1:t,tg:act&&t>=0?t:undefined});undo(m1)}}
        if(P.syn>0&&mv.length>2){   // 有望な手だけ、手札とのシナジー・自分の今後の手を塞ぐか を足し引き
          const dep=H.filter(h=>!used.has(h)&&aiDep(h));
          if(dep.length){const pc=aiPotCells(o),cache=new Map();dep.forEach(h=>cache.set(h,pc.map(e=>aiPot(c,X,h,e))));
            mv.filter(m=>!m.pass&&m.cell>=0).sort((a,b)=>b.sc-a.sc).slice(0,3+Math.round(4*P.syn)).forEach(m=>{m.sc+=P.syn*AI_SYN*aiSynD(c,X,m,dep,pc,cache)})}}
        const mx=Math.max(...mv.map(m=>m.sc)),wgt=mv.map(m=>Math.exp((m.sc-mx)/P.T));let q=Math.random()*wgt.reduce((x,y)=>x+y),k=0;while(k<mv.length-1&&q>wgt[k]){q-=wgt[k];k++}
        const m=mv[k];if(m.pass)break;
        if(isAct(m.card))aiAct(c,m.card,m.tg===undefined?-1:m.tg);else aiPlace(c,X,m.card,m.cell);
        res+=m.r;rem-=m.card.c;used.add(m.card);items.push({card:m.card,cell:m.cell,tg:m.tg});
      }
      const tot=aiScore(o,X)+res+aiGauss()*P.T*.4;
      if(!best||tot>best.t)best={t:tot,items:items.slice()};
      undo(m0)}
    plan=best?best.items:[];
  }finally{undo(0)}
  plan.forEach(p=>S.hand[o].splice(S.hand[o].indexOf(p.card),1));
  return plan.map(({card,cell,tg})=>tg===undefined?{card,cell}:{card,cell,tg});
}

/* 効果の「選択」（対象を選ぶ）。メッセージの語から意図を読む：+n＝味方を強く／-n・撤去＝相手を弱く／手札＝いちばん要らないカード */
function cpuPick(o,L,{cells,hand,msg}={}){
  const lv=S.lv?S.lv[o]:.5;if(Math.random()<.5*Math.pow(1-lv,2)||L.length<2)return L[rnd(L.length)];
  if(hand){const H=S.hand[o];return L.slice().sort((a,b)=>((H[a].p||0)-H[a].c*.6)-((H[b].p||0)-H[b].c*.6))[0]}
  const m=msg||"",bad=/-\d|撤去/.test(m),good=/\+\d/.test(m),s=sums(),d=j=>{const a=ar(j);return o?s[a][1]-s[a][0]:s[a][0]-s[a][1]};
  const sc=j=>{const x=S.board[j],mine=x&&x.o===o,p=x?pw(x,j):0,cl=4/(1+Math.abs(d(j))/3);
    if(bad)return(mine?-12:0)+p*.6+cl;if(good)return(mine?6:-12)+cl-(d(j)>6?4:0);return Math.random()};
  return L.map(j=>[sc(j),j]).sort((a,b)=>b[0]-a[0])[0][1]}

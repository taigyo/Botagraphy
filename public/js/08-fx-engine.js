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
/* カード枠：装着中の枠をカードの上にかぶせる（FXとは別の層。.fro）。pre＝盤面のマスは軽い簡易版 */
function frSet(el,id,sm){id=id&&FRD[id]?id:"";if((el.dataset.fr||"")===id&&(!id||el.querySelector(":scope>.fro")))return;el.dataset.fr=id;el.querySelectorAll(":scope>.fro").forEach(x=>x.remove());if(id)el.insertAdjacentHTML("beforeend",frHTML(id,sm))}
function frScan(){
  document.querySelectorAll(".dkc[data-n]").forEach(el=>frSet(el,frOf(el.dataset.n)));
  document.querySelectorAll(".hmc[data-n]").forEach(w=>{const e=w.firstElementChild;if(e)frSet(e,frOf(w.dataset.n))});
  if(typeof S!=="undefined"&&S&&S.hand){
    document.querySelectorAll("#hand .card[data-h]").forEach(el=>{const c=S.hand[0][+el.dataset.h];frSet(el,c?frOf(c.n):null)});
    document.querySelectorAll("#board [data-i]").forEach(el=>{const b=S.board[+el.dataset.i];frSet(el,b?(b.o===0?frOf(b.card.n):b.card.fr):null,1)})}
  document.querySelectorAll(".ib[data-n]").forEach(el=>{const x=el.dataset.xr;frSet(el,x!==undefined?x:frOf(el.dataset.n))})}
function fxScan(){frScan();
  document.querySelectorAll(".dkc[data-n]").forEach(el=>fxSet(el,eqOf(el.dataset.n),el.dataset.n));
  document.querySelectorAll(".hmc[data-n]").forEach(w=>{const e=w.firstElementChild;if(e)fxSet(e,eqOf(w.dataset.n),w.dataset.n)});
  if(typeof S!=="undefined"&&S&&S.hand){
    document.querySelectorAll("#hand .card[data-h]").forEach(el=>{const c=S.hand[0][+el.dataset.h];fxSet(el,c?eqOf(c.n):[],c?c.n:"")});
    document.querySelectorAll("#board [data-i]").forEach(el=>{const b=S.board[+el.dataset.i];fxSet(el,b?(b.o===0?eqOf(b.card.n):fxNorm(b.card.fx).slice(0,10)):[],b?b.card.n:"")})}
  document.querySelectorAll(".ib[data-n]").forEach(el=>{const x=el.dataset.xf;fxSet(el,x!==undefined?fxNorm(x.split(",")).slice(0,10):eqOf(el.dataset.n),el.dataset.n)});}

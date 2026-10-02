const cv=document.getElementById('c'),g=cv.getContext('2d'),W=640,H=400;
let VW=640,VH=400,VT=0,VB=0,SC=1,OX=0,OY=0,SW=1;
let S={money:5,xp:0};
try{const s=JSON.parse(localStorage.getItem('pp-arcade')||'null');if(s&&typeof s.money==='number')S=s}catch(e){}
S.own=S.own||{};S.hi=S.hi||{};if(typeof S.cr!=='number')S.cr=3;S.eq=Object.assign({hat:'',shirt:'#3fe0d0',skin:'#f2c09a',hair:'#ff4f9a'},S.eq);
const save=()=>{try{localStorage.setItem('pp-arcade',JSON.stringify(S))}catch(e){}};
const lvl=()=>1+Math.floor(S.xp/40);
const $=id=>document.getElementById(id);
function hud(){$('cr').textContent=S.cr;$('m').textContent=S.money;$('l').textContent=lvl();$('x').textContent=S.xp;$('xb').style.width=(S.xp%40)/40*100+'%'}
const keys={};let mode='walk',G={},P={x:320,y:270,f:0},toast='',tt=0;
let WW=2400;const WH=760,SK=['#f2c09a','#d9a074','#a8693d','#6b4226'],HR=['#ff4f9a','#2b1b4d','#ffd23f','#c0392b','#eeeeee'];
const IT=[{id:'cap',t:'hat',n:'Red cap',p:15},{id:'wiz',t:'hat',n:'Wizard hat',p:30},{id:'crown',t:'hat',n:'Crown',p:50},{id:'#ff4f9a',t:'shirt',n:'Pink shirt',p:10},{id:'#7bd957',t:'shirt',n:'Green shirt',p:10},{id:'#ffd23f',t:'shirt',n:'Gold shirt',p:25},{id:'luck',t:'perk',n:'Lucky charm +20% $',p:60}];
const M=[{n:'Coin Catch',c:'#ffd23f'},{n:'Reaction Rush',c:'#3fe0d0'},{n:'Whack-a-Mole',c:'#ff4f9a'},{n:'Simon Lights',c:'#7bd957'},{n:'Dance Beat',c:'#b98aff'},{n:'Hoop Shot',c:'#ff9a3f'},{n:'Prize Counter',c:'#ff9a3f',k:'shop'},{n:'Dressing Room',c:'#b98aff',k:'closet'}];
M.forEach((m,i)=>m.x=150+i*210+(i>5?60:0));
M.forEach(m=>m.r=0);M[6].cats=['hat','shirt','perk'];
M.push({n:'Token Machine',c:'#3fe0d0',k:'token',r:0,x:1900},{n:'Snack Bar',c:'#ff9a3f',k:'door',to:1,sx:200,r:0,x:2120},{n:'Pet Shop',c:'#7bd957',k:'door',to:2,sx:200,r:0,x:2280},{n:'Snack Counter',c:'#ff9a3f',k:'shop',cats:['snack'],r:1,x:450},{n:'Lobby',c:'#ff4f9a',k:'door',to:0,sx:2120,r:1,x:150},{n:'Pet Counter',c:'#7bd957',k:'shop',cats:['pet','trail'],r:2,x:450},{n:'Lobby',c:'#ff4f9a',k:'door',to:0,sx:2280,r:2,x:150});
IT.push({id:'party',t:'hat',n:'Party hat',p:20},{id:'bunny',t:'hat',n:'Bunny ears',p:40},{id:'halo',t:'hat',n:'Halo',p:70},{id:'#4a90ff',t:'shirt',n:'Blue shirt',p:10},{id:'#ff9a3f',t:'shirt',n:'Orange shirt',p:10},{id:'#b98aff',t:'shirt',n:'Purple shirt',p:15},{id:'#c0392b',t:'shirt',n:'Red shirt',p:15},{id:'#ffffff',t:'shirt',n:'White shirt',p:20},{id:'xpb',t:'perk',n:'XP booster +20%',p:80},{id:'soda',t:'snack',n:'Soda: next game x1.5',p:4},{id:'pizza',t:'snack',n:'Pizza: 3 games x1.25',p:10},{id:'cake',t:'snack',n:'Cake: +40 XP',p:15},{id:'cookie',t:'snack',n:'Lucky cookie: 0-3 credits',p:8},{id:'frog',t:'pet',n:'Pet frog',p:30},{id:'cat',t:'pet',n:'Pet cat',p:40},{id:'dog',t:'pet',n:'Pet dog',p:60},{id:'bot',t:'pet',n:'Robo pet',p:100},{id:'tg',t:'trail',n:'Gold sparkle trail',p:25},{id:'tp',t:'trail',n:'Pink sparkle trail',p:25},{id:'tc',t:'trail',n:'Cyan sparkle trail',p:25},{id:'tr',t:'trail',n:'Rainbow trail',p:60});
const SAY=['Nice shirt!','Beat my score!','So many games','Need more coins','Wow, a crown!','Insert coin...'],NP=Array.from({length:4},(_,i)=>({x:200+i*350,y:300+Math.random()*250,tx:200+i*350,ty:380,f:0,w:Math.random()*2,say:'',st:0,e:{hat:['','cap','wiz','crown'][i],shirt:['#ff4f9a','#7bd957','#ffd23f','#b98aff'][i],skin:SK[i],hair:HR[(i+2)%5]}}));
let sel=0,note='',parts=[],GW=640,AH=400,room=0,SL=[],cur=null,CX=0,CY=0;const FT=[],PT={x:320,y:270};
const ROOMS=[{n:'PIXEL PALACE',ww:2400,w:'#0f0a22',w2:'#3a1f66',f1:'#2b1b4d',f2:'#33225a'},{n:'SNACK BAR',ww:900,w:'#3a1208',w2:'#8a3b12',f1:'#5a3a1e',f2:'#6a4626'},{n:'PET SHOP',ww:900,w:'#082a2a',w2:'#126a6a',f1:'#10403f',f2:'#175050'}];
const BN=[{n:'Daily free credit (1)',p:0,c:1},{n:'3 credits',p:5,c:3},{n:'8 credits',p:12,c:8},{n:'20 credits (best deal)',p:25,c:20}];
const COST=[1,1,2,2,3,2],PAY=[1,1,1.5,1.5,2,1.5],PC={cat:'#ff9a3f',dog:'#a8693d',frog:'#7bd957',bot:'#3fe0d0'};
const DESC=[['Catch falling coins with the paddle','Dodge the pink bombs (-2 points)','Chain catches for COMBO bonus points','Arrows / A-D, or tap and drag'],['3 rounds: wait for GREEN, then hit Space','Faster reaction = more points (max 10)','Too early scores 0'],['Hit the moles as they pop up (15 sec)','Keys 1-9 or tap','Chain hits for COMBO, a miss resets it'],['Watch the pattern, then repeat it','Keys 1-4 or tap. Each round adds one','One mistake ends the run'],['Hit arrows in the gold zone (20 sec)','Arrow keys or tap the lanes','Chain hits for COMBO'],['5 shots: stop the marker in the green','Space or tap. Green = 5, gold = 3','Gets faster every shot']];
const TC=t=>t==='tg'?'#ffd23f':t==='tp'?'#ff4f9a':t==='tc'?'#3fe0d0':t==='tr'?['#ff4f9a','#ffd23f','#3fe0d0','#7bd957'][Math.floor(Math.random()*4)]:'#6a4bb0';
const ft=(x,y,s,c)=>FT.push({x,y,s,c,l:1});
function cmb(x,y){G.cb=(G.cb||0)+1;const m=1+Math.floor(G.cb/5);G.s+=m;if(G.cb%5===0)ft(x,y-18,'COMBO x'+G.cb+'  +'+m,'#ffd23f');else if(m>1)ft(x,y-18,'+'+m,'#3fe0d0')}
let AC=null,mute=false,shake=0,crt=true;
function snd(f,d=.1,t='square',v=.05,s=0){if(mute)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),a=AC.createGain(),n=AC.currentTime;o.type=t;o.frequency.setValueAtTime(f,n);if(s)o.frequency.exponentialRampToValueAtTime(s,n+d);a.gain.setValueAtTime(v,n);a.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(a);a.connect(AC.destination);o.start(n);o.stop(n+d)}catch(e){}}
const pop=(x,y,c)=>{const bad=c==='#ff4f9a';for(let i=0;i<16;i++)parts.push({x,y,vx:(Math.random()-.5)*260,vy:(Math.random()-.8)*260,l:.6,c});shake=Math.max(shake,bad?.25:.1);snd(bad?140:700+Math.random()*300,.12,bad?'sawtooth':'square',.05,bad?70:0)};
function fs(){const d=document.documentElement;document.fullscreenElement?document.exitFullscreen():d.requestFullscreen&&d.requestFullscreen().catch(()=>{})}
function fit(){const d=Math.min(devicePixelRatio||1,2),c=$('ctl');cv.width=innerWidth*d;cv.height=innerHeight*d;VW=cv.width;VH=cv.height;VT=$('hud').offsetHeight*d;VB=getComputedStyle(c).display==='none'?0:(c.offsetHeight+20)*d;const ah=AH=VH-VT-VB;SC=Math.max(.2,Math.min(VW/640,ah/400));OX=(VW-640*SC)/2;OY=VT+(ah-400*SC)/2;SW=Math.min(VH/400,VW/480)}
const cellXY=i=>({x:220+(i%3)*100,y:130+Math.floor(i/3)*85}),sp=q=>({x:225+(q%2)*100,y:100+Math.floor(q/2)*100}),DN=['left','up','down','right'];
const near=()=>M.findIndex(m=>Math.abs(P.x-m.x)<(m.k==='shop'?85:60)&&P.y<150);
const rows=['hat','shirt','skin','hair'];
const opts=r=>r==='skin'?SK:r==='hair'?HR:(r==='hat'?['']:['#3fe0d0']).concat(IT.filter(i=>i.t===r&&S.own[i.id]).map(i=>i.id));
function buy(){
  if(mode==='token'){const b=BN[sel];if(!b.p){const d=new Date().toDateString();if(S.fd===d)note='Come back tomorrow!';else{S.fd=d;S.cr+=b.c;note='+1 free credit!'}}else if(S.money>=b.p){S.money-=b.p;S.cr+=b.c;note='+'+b.c+' credits!';snd(660,.1,'square',.05,1320)}else note='Not enough $';save();hud();return}
  const it=SL[sel];
  if(it.t==='snack'){if(S.money<it.p){note='Not enough $';return}S.money-=it.p;
    if(it.id==='soda'){S.bf={n:1,m:1.5};note='Soda! Next game pays x1.5'}else if(it.id==='pizza'){S.bf={n:3,m:1.25};note='Pizza! 3 games pay x1.25'}else if(it.id==='cake'){S.xp+=40;note='Cake! +40 XP'}else{const c=Math.floor(Math.random()*4);S.cr+=c;note='Cookie: +'+c+' credits'}
    snd(500,.1,'triangle',.06,900);save();hud();return}
  if(S.own[it.id]){if(['hat','shirt','pet','trail'].includes(it.t)){S.eq[it.t]=it.id;note='Equipped '+it.n;save()}else note='Already yours'}
  else if(S.money>=it.p){S.money-=it.p;S.own[it.id]=1;if(it.t!=='perk')S.eq[it.t]=it.id;note='Bought '+it.n+'!';snd(660,.1,'square',.05,1320);save();hud()}else note='Not enough $'}
function nav(k){
  const n=mode==='shop'?SL.length:mode==='token'?BN.length:mode==='set'?3:4;
  if(k==='up')sel=(sel+n-1)%n;if(k==='down')sel=(sel+1)%n;
  if(mode==='closet'&&(k==='left'||k==='right')){const r=rows[sel],o=opts(r),i=Math.max(0,o.indexOf(S.eq[r]));S.eq[r]=o[(i+(k==='right'?1:o.length-1))%o.length];save()}
}
function drawP(x,y,sc,f,e){
  g.save();g.translate(x,y);g.scale(sc,sc);const b=Math.sin(f)*3;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-9,10,18,4);
  g.fillStyle='#fff4e0';g.fillRect(-5,-1+b,4,10);g.fillRect(1,-1-b,4,10);
  g.fillStyle=e.shirt;g.fillRect(-7,-14,14,15);
  g.fillStyle=e.skin;g.fillRect(-6,-26,12,12);
  g.fillStyle=e.hair;g.fillRect(-7,-28,14,5);
  if(e.hat==='cap'){g.fillStyle='#c0392b';g.fillRect(-7,-32,14,6);g.fillRect(2,-27,9,3)}
  if(e.hat==='wiz'){g.fillStyle='#7a4cc4';g.beginPath();g.moveTo(-9,-27);g.lineTo(9,-27);g.lineTo(0,-50);g.fill()}
  if(e.hat==='crown'){g.fillStyle='#ffd23f';g.fillRect(-7,-33,14,6);g.fillRect(-7,-38,3,5);g.fillRect(-1,-38,3,5);g.fillRect(4,-38,3,5)}
  if(e.hat==='party'){g.fillStyle='#ff4f9a';g.beginPath();g.moveTo(-5,-27);g.lineTo(5,-27);g.lineTo(0,-42);g.fill()}if(e.hat==='bunny'){g.fillStyle='#fff4e0';g.fillRect(-6,-42,4,14);g.fillRect(2,-42,4,14)}if(e.hat==='halo'){g.fillStyle='#ffd23f';g.fillRect(-7,-36,14,3)}
  g.restore();
}
function ask(i){mode='info';G={info:i};note=''}
function play(i){if(S.cr<COST[i]){ask(i);note='Not enough credits! Visit the Token Machine';return}S.cr-=COST[i];hud();start(i)}
const soff=()=>Math.max(0,Math.min(SL.length-7,sel-3));
function start(i){if(i>5){const m=M[i];if(m.k==='door'){room=m.to;WW=ROOMS[room].ww;P.x=m.sx;P.y=220;PT.x=P.x;PT.y=P.y;return}cur=m;mode=m.k;if(m.k==='shop')SL=IT.filter(t=>m.cats.includes(t.t));sel=0;note='';return}
  mode=i;
  if(i==0)G={t:15,s:0,items:[],sp:0,px:320};
  if(i==1)G={r:0,s:0,st:'wait',w:1+Math.random()*2,t0:0,msg:'',tm:0};
  if(i==2)G={t:15,s:0,mole:-1,mt:0,gap:.3};
  if(i==3)G={s:0,seq:[Math.floor(Math.random()*4)],st:'show',idx:0,tm:.8,lit:-1,inp:0,pf:0,pl:-1};
  if(i==4)G={t:20,s:0,ar:[],sp:0};
  if(i==5)G={r:0,s:0,ph:0,st:'aim',tm:0,msg:''};
}
function finish(){
  G.done=true;const bf=S.bf&&S.bf.n>0?S.bf.m:1,mult=(1+.1*(lvl()-1))*(S.own.luck?1.2:1)*bf*PAY[mode],mon=Math.round(G.s*mult),xp=Math.round(G.s*2*(S.own.xpb?1.2:1)),before=lvl();if(bf>1)S.bf.n--;
  S.money+=mon;S.xp+=xp;G.mon=mon;G.xp=xp;G.up=lvl()>before;G.nb=G.s>(S.hi[mode]||0);if(G.nb)S.hi[mode]=G.s;shake=.5;snd(G.up?880:520,.3,'triangle',.07,G.up?1320:780);save();hud();
}
function interact(){
  if(mode==='walk'){const i=near();if(i>=0)ask(i);return}
  if(mode==='info'){play(G.info);return}
  if(typeof mode==='number'&&G.done)play(mode);
}
function action(){if(mode===1)react();else if(mode===5)shoot();else if(mode==='shop'||mode==='token')buy();else if(mode==='info')play(G.info);else if(mode==='set'){if(sel===0)mute=!mute;else if(sel===1)crt=!crt;else if(note==='Press again to RESET'){try{localStorage.removeItem('pp-arcade')}catch(e){}location.reload()}else note='Press again to RESET'}}
function leave(){mode='walk'}
function simon(q){if(mode!==3||G.done||G.st!=='in')return;G.pl=q;G.pf=.25;if(q===G.seq[G.inp]){G.inp++;if(G.inp>=G.seq.length){G.s=G.seq.length*2;G.seq.push(Math.floor(Math.random()*4));G.st='show';G.idx=0;G.tm=.9;G.lit=-1}}else finish()}
function dance(d){if(mode!==4||G.done||d<0||d>3)return;let b=null;G.ar.forEach(a=>{if(a.d===d&&Math.abs(a.y-330)<38&&(!b||a.y>b.y))b=a});if(b){G.ar.splice(G.ar.indexOf(b),1);cmb(220+d*70,320);pop(220+d*70,330,'#ffd23f')}else G.cb=0}
function shoot(){if(mode!==5||G.done||G.st!=='aim')return;const m=Math.abs((Math.sin(G.ph)+1)/2-.5),p=m<.06?5:m<.15?3:m<.3?1:0;G.s+=p;G.msg=p?'+'+p:'Miss';G.st='show';G.tm=.9;if(p)pop(320,110,'#ffd23f')}
function react(){
  if(G.st==='wait'){G.msg='Too early!';G.pts=0;G.st='show';G.tm=1.2}
  else if(G.st==='go'){const ms=Math.round(performance.now()-G.t0);G.pts=Math.max(0,Math.min(10,Math.round((600-ms)/50)));G.s+=G.pts;G.msg=ms+' ms  +'+G.pts;G.st='show';G.tm=1.2}
}
function whack(i){
  if(mode!==2||G.done)return;
  if(i===G.mole){cmb(cellXY(i).x,cellXY(i).y);pop(cellXY(i).x,cellXY(i).y,'#ff4f9a');G.mole=-1;G.gap=.2}else G.cb=0
}
function update(dt){if(typeof mode!=='number'&&mode!=='walk')return;
  if(mode==='walk'){
    let dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0);
    if(dx||dy){const n=Math.hypot(dx,dy);P.x+=dx/n*150*dt;P.y+=dy/n*150*dt;P.f+=dt*10;if(Math.random()<.3)parts.push({x:P.x-CX,y:P.y-CY+12,vx:(Math.random()-.5)*30,vy:-20,l:.45,c:TC(S.eq.trail)})}
    P.x=Math.max(20,Math.min(WW-20,P.x));P.y=Math.max(130,Math.min(WH-140,P.y));
    PT.x+=(P.x-30-PT.x)*Math.min(1,dt*4);PT.y+=(P.y+4-PT.y)*Math.min(1,dt*4);if(room===0)NP.forEach(n=>{n.w-=dt;if(n.w<=0){n.tx=60+Math.random()*(WW-120);n.ty=160+Math.random()*(WH-320);n.w=3+Math.random()*4;if(Math.random()<.5){n.say=SAY[Math.floor(Math.random()*SAY.length)];n.st=2.5}}n.st-=dt;const d=Math.hypot(n.tx-n.x,n.ty-n.y);if(d>4){n.x+=(n.tx-n.x)/d*60*dt;n.y+=(n.ty-n.y)/d*60*dt;n.f+=dt*8}});
    return;
  }
  if(G.done)return;
  if(mode===0){
    G.t-=dt;
    if(keys.left)G.px-=300*dt;if(keys.right)G.px+=300*dt;
    G.px=Math.max(30,Math.min(GW-30,G.px));
    G.sp-=dt;
    if(G.sp<=0){G.sp=.45;G.items.push({x:30+Math.random()*(GW-60),y:-10,v:(120+Math.random()*90)*(1+.06*(lvl()-1)),b:Math.random()<.22})}
    for(const it of G.items){it.y+=it.v*dt;
      if(it.y>340&&it.y<370&&Math.abs(it.x-G.px)<36&&!it.got){it.got=1;if(it.b){G.cb=0;G.s=Math.max(0,G.s-2);pop(it.x,it.y,'#ff4f9a')}else{cmb(it.x,it.y);pop(it.x,it.y,'#ffd23f')}}}
    G.items=G.items.filter(it=>it.y<H&&!it.got);
    if(G.t<=0)finish();
  }
  if(mode===1){
    if(G.st==='wait'){G.w-=dt;if(G.w<=0){G.st='go';G.t0=performance.now()}}
    if(G.st==='show'){G.tm-=dt;if(G.tm<=0){G.r++;if(G.r>=3)finish();else{G.st='wait';G.w=1+Math.random()*2.2;G.msg=''}}}
  }
  if(mode===3){if(G.pf>0)G.pf-=dt;
    if(G.st==='show'){G.tm-=dt;if(G.tm<=0){if(G.lit>=0){G.lit=-1;G.tm=.2}else if(G.idx<G.seq.length){G.lit=G.seq[G.idx++];G.tm=.5}else{G.st='in';G.inp=0}}}}
  if(mode===4){G.t-=dt;G.sp-=dt;if(G.sp<=0){G.sp=.55;G.ar.push({d:Math.floor(Math.random()*4),y:-20})}
    G.ar.forEach(a=>a.y+=170*(1+.05*(lvl()-1))*dt);G.ar=G.ar.filter(a=>{if(a.y>=400){G.cb=0;return false}return true});if(G.t<=0)finish()}
  if(mode===5){if(G.st==='aim')G.ph+=dt*(3+G.r*.8);else{G.tm-=dt;if(G.tm<=0){G.r++;if(G.r>=5)finish();else G.st='aim'}}}
  if(mode===2){
    G.t-=dt;G.mt-=dt;
    if(G.mole>=0&&G.mt<=0){G.cb=0;G.mole=-1;G.gap=.2}
    else if(G.mole<0){G.gap-=dt;if(G.gap<=0){G.mole=Math.floor(Math.random()*9);G.mt=Math.max(.5,1.1-G.s*.03)}}
    if(G.t<=0)finish();
  }
}
function tx(s,x,y,sz,c,a){g.font=sz+'px "Press Start 2P",ui-monospace,monospace';g.fillStyle=c||'#fff4e0';g.textAlign=a||'center';g.fillText(s,x,y)}
function drawWalk(){
  const R=ROOMS[room],sw=VW/SW,sh=VH/SW,cx=sw>=WW?(WW-sw)/2:Math.max(0,Math.min(WW-sw,P.x-sw/2)),cy=sh>=WH?(WH-sh)/2:Math.max(0,Math.min(WH-sh,P.y-sh/2)),n=near(),t=performance.now()/400;
  CX=cx;CY=cy;g.save();g.translate(-cx,-cy);
  const wg=g.createLinearGradient(0,0,0,120);wg.addColorStop(0,R.w);wg.addColorStop(1,R.w2);g.fillStyle=wg;g.fillRect(0,0,WW,120);
  for(let x=0;x<WW;x+=30){g.fillStyle=Math.sin(t+x)>0?['#ffd23f','#ff4f9a','#3fe0d0'][(x/30)%3]:'#4a2f80';g.fillRect(x,4+Math.sin(x/40)*3,6,6)}
  for(let y=120;y<WH;y+=40)for(let x=0;x<WW;x+=40){g.fillStyle=((x+y)/40)%2?R.f1:R.f2;g.fillRect(x,y,40,40);if(((x+y)/40)%5===0){g.fillStyle='#6a4bb0';g.fillRect(x+18,y+18,4,4)}}
  g.fillStyle='#ff4f9a';g.fillRect(0,120,WW,4);g.fillStyle='#3fe0d0';g.fillRect(0,WH-150,WW,3);
  g.fillStyle='#4a2f80';g.fillRect(WW/2-260,330,520,130);g.strokeStyle='#ff4f9a';g.lineWidth=3;g.strokeRect(WW/2-250,340,500,110);
  tx(R.n,WW/2,408,18,'#ffd23f');
  for(let i=0;i<(room?0:Math.floor(WW/130));i++){const x=70+i*130,c=['#ffd23f','#3fe0d0','#ff4f9a'][i%3];g.fillStyle='#0f0a22';g.fillRect(x-30,WH-100,60,90);g.fillStyle=Math.sin(t+i*2)>-.3?c:'#5a3d99';g.fillRect(x-22,WH-92,44,30);g.fillStyle='#5a3d99';g.fillRect(x-22,WH-54,44,6)}
  M.forEach((m,i)=>{
    if(m.r!==room)return;g.shadowColor=m.c;g.shadowBlur=i===n?30:14;
    if(m.k==='door'){g.fillStyle='#0f0a22';g.fillRect(m.x-40,10,80,108);g.fillStyle=m.c;g.fillRect(m.x-32,18,64,92);g.fillStyle='#0f0a22';g.fillRect(m.x-6,60,12,50)}else if(m.k==='token'){g.fillStyle='#0f0a22';g.fillRect(m.x-36,18,72,96);g.fillStyle=m.c;g.fillRect(m.x-28,26,56,30);tx('TOKENS',m.x,46,7,'#0f0a22');g.fillStyle='#5a3d99';g.fillRect(m.x-10,70,20,6)}else if(m.k==='shop'){g.fillStyle='#8a4b12';g.fillRect(m.x-80,60,160,54);g.fillStyle='#0f0a22';g.fillRect(m.x-80,22,160,38);['#ffd23f','#ff4f9a','#3fe0d0','#7a4cc4','#7bd957'].forEach((c,k)=>{g.fillStyle=c;g.fillRect(m.x-68+k*30,30,20,20)});g.fillStyle=m.c;g.fillRect(m.x-80,56,160,6)}
    else if(m.k==='closet'){g.fillStyle='#0f0a22';g.fillRect(m.x-36,18,72,96);g.fillStyle='#b98aff';g.fillRect(m.x-28,26,56,76);g.fillStyle='#e9dcff';g.fillRect(m.x-20,34,12,50)}
    else{g.fillStyle='#0f0a22';g.fillRect(m.x-36,18,72,96);
      g.fillStyle=m.c;g.globalAlpha=.75+.25*Math.sin(t*2+i);g.fillRect(m.x-28,26,56,40);g.globalAlpha=1;
      tx('$!#^*?'[i],m.x,56,22,'#0f0a22');
      g.fillStyle='#5a3d99';g.fillRect(m.x-28,74,56,8);
      g.fillStyle=Math.sin(t*3+i)>0?m.c:'#5a3d99';g.fillRect(m.x-32,22,4,88);g.fillRect(m.x+28,22,4,88);
      g.fillStyle=m.c;g.fillRect(m.x-18,88,8,8);g.fillRect(m.x+10,88,8,8)}
    g.shadowBlur=0;
    tx(m.n,m.x,134,8,i===n?m.c:'#c9b8f0');if(i<6)tx('BEST '+(S.hi[i]||0),m.x,148,7,'#8e78c4');
  });
  if(room===0)NP.forEach(n=>{drawP(n.x,n.y,1,n.f,n.e);if(n.st>0){g.fillStyle='#0f0a22';g.fillRect(n.x-72,n.y-76,144,18);tx(n.say,n.x,n.y-63,7,'#ffd23f')}});
  for(let i=0;i<40;i++){const x=(i*173+t*8*(1+i%3))%WW,y=130+(i*97)%(WH-250);if(Math.sin(t*2+i)>.3){g.fillStyle='#c9b8f0';g.fillRect(x,y,2,2)}}
  if(S.eq.pet){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(PT.x-6,PT.y+8,12,3);g.fillStyle=PC[S.eq.pet]||'#fff';g.fillRect(PT.x-6,PT.y-4+Math.sin(P.f),12,10);g.fillRect(PT.x-6,PT.y-8,3,4);g.fillRect(PT.x+3,PT.y-8,3,4)}
  drawP(P.x,P.y,1,P.f,S.eq);
  g.restore();
  if(n>=0){const m=M[n];tx('E: '+(n<6?'play '+m.n+' ('+COST[n]+' cr)':m.k==='door'?'go: '+m.n:'enter '+m.n),sw/2,sh-14-VB/SW,9,m.c)}
  else tx('Walk to a cabinet and press E',sw/2,sh-14-VB/SW,9,'#8e78c4');
}
function drawInfo(){const i=G.info,m=M[i];frame(m.c);tx(m.n.toUpperCase(),W/2,50,16,m.c);DESC[i].forEach((l,k)=>tx(l,W/2,100+k*24,9,'#fff4e0'));
  tx('COST: '+COST[i]+' CREDIT'+(COST[i]>1?'S':''),W/2,210,12,'#ffd23f');tx('PAYS: $'+PAY[i]+' PER POINT (+level bonus)',W/2,236,9,'#3fe0d0');
  tx('You have '+S.cr+' credits',W/2,270,9,S.cr>=COST[i]?'#c9b8f0':'#ff4f9a');tx(note,W/2,296,9,'#ff4f9a');tx('Space / E / tap: PLAY     Esc: back',W/2,360,9,'#c9b8f0')}
function drawToken(){frame('#3fe0d0');tx('TOKEN MACHINE',W/2,32,13,'#3fe0d0');tx('$'+S.money+'   CR '+S.cr,W/2,60,10,'#ffd23f');
  BN.forEach((b,i)=>{const y=110+i*50,on=i===sel;if(on){g.fillStyle='#2b1b4d';g.fillRect(60,y-22,520,36)}tx((on?'> ':'  ')+b.n,80,y,10,on?'#ffd23f':'#fff4e0','left');tx(b.p?'$'+b.p:'FREE',560,y,10,'#fff4e0','right')});
  tx(note,W/2,336,10,'#ff4f9a');tx('Up/Down pick - Space buy - Esc leave',W/2,376,8,'#c9b8f0')}
function drawSet(){frame('#b98aff');tx('SETTINGS',W/2,40,14,'#b98aff');['Sound: '+(mute?'OFF':'ON'),'Scanlines: '+(crt?'ON':'OFF'),'Reset save'].forEach((s,i)=>{const y=120+i*50;if(i===sel){g.fillStyle='#2b1b4d';g.fillRect(140,y-24,360,36)}tx((i===sel?'> ':'  ')+s,160,y,11,i===sel?'#ffd23f':'#fff4e0','left')});tx(note,W/2,300,9,'#ff4f9a');tx('Up/Down - Space toggle - Esc back',W/2,370,8,'#c9b8f0')}
function drawShop(){
  frame(cur.c);tx(cur.n.toUpperCase(),W/2,32,13,cur.c);tx('$'+S.money,590,32,11,'#ffd23f','right');
  SL.forEach((it,i)=>{const o=soff();if(i<o||i>=o+7)return;const y=80+(i-o)*34,on=i===sel;if(on){g.fillStyle='#2b1b4d';g.fillRect(30,y-18,580,28)}
    tx((on?'> ':'  ')+it.n,48,y,10,on?'#ffd23f':'#fff4e0','left');
    tx(S.own[it.id]?'OWNED':'$'+it.p,590,y,10,S.own[it.id]?'#3fe0d0':'#fff4e0','right')});
  tx(note,W/2,336,10,'#ff4f9a');tx('Up/Down pick - Space buy - Esc or tap top to leave',W/2,376,8,'#c9b8f0');
}
function drawCloset(){
  frame('#b98aff');tx('DRESSING ROOM',W/2,32,13,'#b98aff');
  drawP(470,230,5,0,S.eq);
  rows.forEach((r,i)=>{const y=100+i*60,on=i===sel,v=S.eq[r];if(on){g.fillStyle='#2b1b4d';g.fillRect(30,y-24,250,44)}
    tx((on?'> ':'  ')+r.toUpperCase(),48,y,10,on?'#ffd23f':'#fff4e0','left');
    if(r==='skin'||r==='hair'||r==='shirt'){g.fillStyle=v;g.fillRect(200,y-14,40,20)}
    else tx((IT.find(x=>x.id===v)||{n:'None'}).n,262,y,8,'#c9b8f0','right')});
  tx('Up/Down row - Left/Right change - Esc leave',W/2,376,8,'#c9b8f0');tx('Buy hats and shirts at the Prize Counter',W/2,352,8,'#8e78c4');
}
function frame(c){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14092b');gr.addColorStop(1,'#3a1f66');g.fillStyle=gr;g.fillRect(-3000,-3000,7000,7000);const t=performance.now()/500;for(let i=0;i<40;i++){g.fillStyle=Math.sin(t+i)>0?'#c9b8f0':'#5a3d99';g.fillRect((i*97)%W,(i*53)%H,2,2)}g.shadowColor=c;g.shadowBlur=16;g.strokeStyle=c;g.lineWidth=4;g.strokeRect(6,6,W-12,H-12);g.shadowBlur=0}
function drawGame(){
  const m=M[mode];frame(m.c);
  if(mode===0){
    tx('Catch coins, dodge bombs',GW/2,34,10,m.c);
    tx('Score '+G.s+'   Time '+Math.max(0,Math.ceil(G.t)),GW/2,58,10);
    for(const it of G.items){g.fillStyle=it.b?'#ff4f9a':'#ffd23f';g.beginPath();g.arc(it.x,it.y,it.b?11:9,0,7);g.fill();if(it.b){g.fillStyle='#0f0a22';g.fillRect(it.x-2,it.y-5,4,10)}}
    g.fillStyle='#3fe0d0';g.fillRect(G.px-34,350,68,12);g.fillRect(G.px-34,336,6,14);g.fillRect(G.px+28,336,6,14);
  }
  if(mode===1){
    tx('Hit SPACE or tap when it goes green',W/2,34,9,m.c);
    tx('Round '+Math.min(3,G.r+1)+'/3   Score '+G.s,W/2,58,10);
    g.fillStyle=G.st==='go'?'#3fe0d0':(G.st==='show'&&G.pts===0?'#5a3d99':'#ff4f9a');
    g.beginPath();g.arc(W/2,205,80,0,7);g.fill();
    tx(G.st==='wait'?'WAIT':G.st==='go'?'NOW!':G.msg,W/2,210,12,'#0f0a22');
  }
  if(mode===2){
    tx('Whack the moles (tap or keys 1-9)',W/2,34,9,m.c);
    tx('Score '+G.s+'   Time '+Math.max(0,Math.ceil(G.t)),W/2,58,10);
    for(let i=0;i<9;i++){const p=cellXY(i);g.fillStyle='#2b1b4d';g.fillRect(p.x-34,p.y-26,68,60);
      if(i===G.mole){g.fillStyle='#c98a5a';g.fillRect(p.x-22,p.y-18,44,44);g.fillStyle='#0f0a22';g.fillRect(p.x-12,p.y-6,6,6);g.fillRect(p.x+6,p.y-6,6,6);g.fillStyle='#ff4f9a';g.fillRect(p.x-5,p.y+6,10,6)}}
  }
  if(mode===3){
    tx('Repeat the pattern (tap or keys 1-4)',W/2,34,9,m.c);tx('Round '+G.seq.length+'   '+(G.st==='show'?'Watch...':'Your turn'),W/2,58,10);
    ['#ff4f9a','#ffd23f','#3fe0d0','#7bd957'].forEach((c,q)=>{const p=sp(q),on=G.lit===q||(G.pf>0&&G.pl===q);g.globalAlpha=on?1:.35;g.fillStyle=c;if(on){g.shadowColor=c;g.shadowBlur=25}g.fillRect(p.x,p.y,90,90);g.shadowBlur=0;g.globalAlpha=1;tx(q+1,p.x+45,p.y+55,16,'#0f0a22')});
  }
  if(mode===4){
    tx('Hit arrows in the gold zone (arrow keys or tap)',W/2,34,8,m.c);tx('Score '+G.s+'   Time '+Math.max(0,Math.ceil(G.t)),W/2,58,10);
    const gl=['<','^','v','>'],cl=['#ff4f9a','#3fe0d0','#ffd23f','#7bd957'];
    g.fillStyle='rgba(255,210,63,.18)';g.fillRect(185,292,280,76);
    for(let d=0;d<4;d++)tx(gl[d],220+d*70,340,22,'#5a3d99');
    G.ar.forEach(a=>{g.shadowColor=cl[a.d];g.shadowBlur=12;tx(gl[a.d],220+a.d*70,a.y,26,cl[a.d]);g.shadowBlur=0});
  }
  if(mode===5){
    tx('SPACE or tap when the marker is in the green',W/2,34,8,m.c);tx('Shot '+Math.min(5,G.r+1)+'/5   Score '+G.s,W/2,58,10);
    g.fillStyle='#e9dcff';g.fillRect(270,70,100,40);g.fillStyle='#ff9a3f';g.fillRect(290,112,60,6);
    const sc=G.st==='show'&&G.msg!=='Miss';g.fillStyle='#ff9a3f';g.beginPath();g.arc(320,sc?122:290,14,0,7);g.fill();
    g.fillStyle='#2b1b4d';g.fillRect(140,340,360,18);g.fillStyle='#ffd23f';g.fillRect(266,340,108,18);g.fillStyle='#7bd957';g.fillRect(298,340,44,18);
    g.fillStyle='#fff4e0';g.fillRect(140+(Math.sin(G.ph)+1)/2*360-3,334,6,30);
    if(G.st==='show')tx(G.msg,W/2,210,18,'#fff4e0');
  }
  if(G.done){
    g.save();g.translate((GW-640)/2,0);g.fillStyle='rgba(15,10,34,.88)';g.fillRect(120,110,400,190);g.strokeStyle='#ffd23f';g.strokeRect(120,110,400,190);
    tx('GAME OVER',W/2,150,14,'#ffd23f');
    tx('Score '+G.s+(G.nb?'  NEW BEST!':'  Best '+(S.hi[mode]||0)),W/2,185,11,G.nb?'#ffd23f':'#fff4e0');
    tx('+$'+G.mon+'   +'+G.xp+' XP',W/2,215,12,'#3fe0d0');
    if(G.up)tx('LEVEL UP! Payouts go up',W/2,245,9,'#ff4f9a');
    tx('E: play again ('+COST[mode]+' cr)   ESC: leave',W/2,278,8,'#c9b8f0');g.restore();
  }
}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);g.setTransform(1,0,0,1,0,0);g.fillStyle='#14092b';g.fillRect(0,0,VW,VH);g.save();if(shake>0){g.translate((Math.random()-.5)*shake*24,(Math.random()-.5)*shake*24);shake=Math.max(0,shake-dt)}if(mode==='walk')g.scale(SW,SW);else if(mode===0){const f=AH/400;GW=VW/f;g.translate(0,VT);g.scale(f,f)}else{GW=640;g.translate(OX,OY);g.scale(SC,SC)}mode==='walk'?drawWalk():mode==='info'?drawInfo():mode==='token'?drawToken():mode==='set'?drawSet():mode==='shop'?drawShop():mode==='closet'?drawCloset():drawGame();for(const q of parts){q.l-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=400*dt;g.globalAlpha=Math.max(0,q.l/.6);g.fillStyle=q.c;g.fillRect(q.x,q.y,4,4)}g.globalAlpha=1;for(const q of FT){q.l-=dt;q.y-=30*dt;g.globalAlpha=Math.max(0,q.l);tx(q.s,q.x,q.y,10,q.c)}g.globalAlpha=1;for(let k=FT.length-1;k>=0;k--)if(FT[k].l<=0)FT.splice(k,1);parts=parts.filter(q=>q.l>0);g.restore();if(crt){g.fillStyle='rgba(0,0,0,.14)';const L=Math.ceil(SC);for(let y=0;y<VH;y+=3*L)g.fillRect(0,y,VW,L)}requestAnimationFrame(loop)}
const map={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
  if(map[e.code]){keys[map[e.code]]=1;e.preventDefault();if(!e.repeat){if(['shop','closet','token','set'].includes(mode))nav(map[e.code]);if(mode===4)dance(DN.indexOf(map[e.code]))}}
  else if(e.code==='KeyE'){if(!e.repeat)interact()}
  else if(e.code==='Space'){e.preventDefault();if(!e.repeat)action()}
  else if(e.code==='KeyP'&&mode==='walk'){mode='set';sel=0;note=''}
  else if(e.code==='KeyM')mute=!mute
  else if(e.code==='KeyC')crt=!crt
  else if(e.code==='KeyF')fs()
  else if(e.code==='Escape')leave()
  else if(mode===3&&/^Digit[1-4]$/.test(e.code))simon(+e.code.slice(5)-1)
  else if(mode===2&&/^Digit[1-9]$/.test(e.code)){const d=+e.code.slice(5)-1;whack((2-Math.floor(d/3))*3+d%3)}
});
addEventListener('keyup',e=>{if(map[e.code])keys[map[e.code]]=0});
document.querySelectorAll('#pad button').forEach(b=>{
  const k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1;if(['shop','closet','token','set'].includes(mode))nav(k);if(mode===4)dance(DN.indexOf(k))});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>keys[k]=0));
});
$('act').addEventListener('pointerdown',e=>{e.preventDefault();interact()});
$('bk').addEventListener('pointerdown',e=>{e.preventDefault();leave()});
function pt(e){const r=cv.getBoundingClientRect(),f=mode===0,c=f?AH/400:SC,ox=f?0:OX,oy=f?VT:OY;return{x:((e.clientX-r.left)/r.width*VW-ox)/c,y:((e.clientY-r.top)/r.height*VH-oy)/c}}
cv.addEventListener('pointerdown',e=>{
  const p=pt(e);
  if(mode==='walk')return;
  if(mode==='info'){if(p.y<45)leave();else play(G.info);return}
  if(mode==='token'){if(p.y<45){leave();return}const r=Math.floor((p.y-88)/50);if(r>=0&&r<BN.length){if(sel===r)buy();else sel=r}return}
  if(mode==='set'){if(p.y<45){leave();return}const r=Math.floor((p.y-96)/50);if(r>=0&&r<3){if(sel===r)action();else sel=r}return}
  if(mode==='shop'||mode==='closet'){if(p.y<45){mode='walk';return}const r=Math.floor((p.y-(mode==='shop'?62:76))/(mode==='shop'?34:60));const o=mode==='shop'?soff():0;if(r>=0&&r<(mode==='shop'?Math.min(7,SL.length):4)){if(sel===r+o&&mode==='shop')buy();else sel=r+o}return}
  if(G.done){leave();return}
  if(mode===0)G.px=p.x;
  if(mode===1)react();
  if(mode===5)shoot();
  if(mode===4)dance(Math.floor((p.x-185)/70));
  if(mode===3)for(let q=0;q<4;q++){const c=sp(q);if(p.x>c.x&&p.x<c.x+90&&p.y>c.y&&p.y<c.y+90)simon(q)}
  if(mode===2)for(let i=0;i<9;i++){const c=cellXY(i);if(Math.abs(p.x-c.x)<36&&Math.abs(p.y-c.y)<32)whack(i)}
});
cv.addEventListener('pointermove',e=>{if(mode===0&&!G.done&&e.buttons)G.px=pt(e).x});
$('fsb').addEventListener('click',fs);$('setb').addEventListener('click',()=>{if(mode==='walk'){mode='set';sel=0;note=''}});hud();fit();addEventListener('resize',fit);document.fonts&&document.fonts.ready.then(fit);requestAnimationFrame(loop);

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const levelEl=document.getElementById("level"),xpEl=document.getElementById("xp"),scoreEl=document.getElementById("score");
const interaction=document.getElementById("interaction"),interactionText=document.getElementById("interactionText");
const toast=document.getElementById("toast"),modal=document.getElementById("modal"),gameTitle=document.getElementById("gameTitle"),gameContent=document.getElementById("gameContent");
const closeBtn=document.getElementById("close");

const world={w:3200,h:2100};
const player={x:1600,y:1570,r:17,dir:0,walk:0};
const keys=new Set();
const cam={x:0,y:0};
let near=null,last=0,toastTimer=0;

const saveState={
  xp:Number(localStorage.getItem("r21_xp")||0),
  score:Number(localStorage.getItem("r21_score")||0),
  level:Number(localStorage.getItem("r21_level")||1)
};

const zones=[
 {x:130,y:130,w:860,h:620,name:"THE ARCADE",accent:"#efb84b"},
 {x:1110,y:130,w:930,h:750,name:"GAME LOUNGE",accent:"#8aa7ff"},
 {x:2160,y:130,w:910,h:750,name:"CHALLENGE WING",accent:"#d88bff"},
 {x:130,y:960,w:860,h:900,name:"SOCIAL HALL",accent:"#68d6bb"},
 {x:1110,y:1090,w:930,h:770,name:"EVENT FLOOR",accent:"#ff8f70"},
 {x:2160,y:1090,w:910,h:770,name:"PRIZE GALLERY",accent:"#72c8ff"}
];

const machines=[
 {x:300,y:360,name:"TARGET LAB",type:"target",kind:"cabinet",accent:"#ef6f68"},
 {x:520,y:360,name:"MEMORY GRID",type:"memory",kind:"cabinet",accent:"#6da7ff"},
 {x:740,y:360,name:"REACTION X",type:"reaction",kind:"cabinet",accent:"#b47cff"},
 {x:1370,y:330,name:"HOOP SHOT",type:"hoops",kind:"cabinet",accent:"#6ed98c"},
 {x:1640,y:330,name:"MINI RACER",type:"race",kind:"cabinet",accent:"#f08c62"},
 {x:1870,y:330,name:"LUCKY WHEEL",type:"wheel",kind:"wheel",accent:"#f5c84c"},
 {x:2380,y:330,name:"BREAKOUT",type:"breakout",kind:"cabinet",accent:"#67d4df"},
 {x:2670,y:330,name:"SNAKE",type:"snake",kind:"cabinet",accent:"#7bdc78"},
 {x:2920,y:330,name:"DICE DASH",type:"dice",kind:"cabinet",accent:"#e8e2d1"},
 {x:410,y:1310,name:"QUIZ BOOTH",type:"quiz",kind:"booth",accent:"#d98cff"},
 {x:760,y:1310,name:"CARD MATCH",type:"memory",kind:"booth",accent:"#ff9ab1"},
 {x:1360,y:1440,name:"HOLO TARGET",type:"target",kind:"holo",accent:"#66d6ff"},
 {x:1650,y:1440,name:"REACTION WALL",type:"reaction",kind:"holo",accent:"#ff7e9d"},
 {x:1900,y:1440,name:"SCORE ATTACK",type:"hoops",kind:"holo",accent:"#8be27e"},
 {x:2400,y:1330,name:"TROPHY RUN",type:"race",kind:"booth",accent:"#f5c84c"}
];

const npcs=[
 {x:430,y:570,c:"#e8a67b",hair:"#37261e",shirt:"#5e78c9",speed:38,tx:700,ty:610},
 {x:1230,y:590,c:"#c88765",hair:"#15171b",shirt:"#d66c6c",speed:31,tx:1710,ty:590},
 {x:2250,y:610,c:"#f0b38e",hair:"#b77c3d",shirt:"#62a6a8",speed:34,tx:2800,ty:620},
 {x:1190,y:1280,c:"#a86e54",hair:"#2a2020",shirt:"#9a67c8",speed:27,tx:1800,ty:1700},
 {x:2280,y:1570,c:"#e0a47d",hair:"#111317",shirt:"#4e8ac9",speed:30,tx:2880,ty:1680},
 {x:730,y:1660,c:"#d39570",hair:"#5d3425",shirt:"#6fb27e",speed:26,tx:360,ty:1510}
];

const decor=[
 {x:1060,y:430,type:"plant"},{x:2080,y:430,type:"plant"},{x:2080,y:1460,type:"plant"},
 {x:1040,y:1460,type:"plant"},{x:560,y:840,type:"sofa"},{x:1710,y:980,type:"sofa"},
 {x:2620,y:960,type:"sofa"},{x:900,y:440,type:"bench"},{x:2010,y:600,type:"bench"},
 {x:2100,y:1760,type:"bench"},{x:1030,y:1770,type:"plant"}
];

function resize(){
 canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio;
 canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";
}
addEventListener("resize",resize);resize();

addEventListener("keydown",e=>{
 const k=e.key.toLowerCase(); keys.add(k);
 if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
 if(k==="e"&&!e.repeat)interact();
 if(k==="escape")closeGame();
});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
closeBtn.addEventListener("click",closeGame);
modal.addEventListener("click",e=>{if(e.target===modal)closeGame();});

function save(){localStorage.setItem("r21_xp",saveState.xp);localStorage.setItem("r21_score",saveState.score);localStorage.setItem("r21_level",saveState.level);updateHud()}
function updateHud(){levelEl.textContent=saveState.level;xpEl.textContent=saveState.xp;scoreEl.textContent=saveState.score}
function reward(points,xp){
 saveState.score+=points; saveState.xp+=xp;
 while(saveState.xp>=saveState.level*100){saveState.xp-=saveState.level*100;saveState.level++}
 save();showToast(`+${points} score  •  +${xp} XP`);
}
function showToast(t){toast.textContent=t;toast.style.display="block";clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.style.display="none",1800)}
function d2(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}

function circleRect(cx,cy,r,rect){
 const nx=Math.max(rect.x,Math.min(cx,rect.x+rect.w)),ny=Math.max(rect.y,Math.min(cy,rect.y+rect.h));
 return Math.hypot(cx-nx,cy-ny)<r;
}
function blocked(x,y){
 const margin=26;
 if(x<margin||y<margin||x>world.w-margin||y>world.h-margin)return true;
 for(const z of zones){
   if(x>z.x-18&&x<z.x+z.w+18&&y>z.y-18&&y<z.y+z.h+18){
     // zones are open interior spaces; only outer walls are solid.
   }
 }
 // solid machine footprints
 for(const m of machines){
   if(circleRect(x,y,17,{x:m.x-52,y:m.y-42,w:104,h:84}))return true;
 }
 return false;
}

function move(dt){
 let dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
 let dy=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
 if(!dx&&!dy)return;
 const len=Math.hypot(dx,dy);dx/=len;dy/=len;
 const speed=235;
 const nx=player.x+dx*speed*dt,ny=player.y+dy*speed*dt;
 if(!blocked(nx,player.y))player.x=nx;
 if(!blocked(player.x,ny))player.y=ny;
 player.dir=Math.atan2(dy,dx);player.walk+=dt*10;
}

function interact(){if(near)openGame(near)}
function openGame(o){
 modal.classList.remove("hidden");gameTitle.textContent=o.name;gameContent.innerHTML="";
 ({target:targetGame,memory:memoryGame,reaction:reactionGame,hoops:hoopsGame,race:raceGame,wheel:wheelGame,breakout:breakoutGame,snake:snakeGame,dice:diceGame,quiz:quizGame}[o.type]||targetGame)();
}
function closeGame(){modal.classList.add("hidden");gameContent.innerHTML=""}
function btn(text,fn){const b=document.createElement("button");b.type="button";b.textContent=text;b.addEventListener("click",fn);return b}

function targetGame(){
 const wrap=document.createElement("div");wrap.className="mini";
 wrap.innerHTML="<p>Hit as many moving targets as you can before the timer ends.</p><div class='target' id='ta'></div><b id='hits'>Hits: 0</b>";
 gameContent.appendChild(wrap);
 const area=wrap.querySelector("#ta"),label=wrap.querySelector("#hits");let hits=0,end=Date.now()+15000,active=true;
 function spawn(){
  if(!active)return;
  if(Date.now()>=end){active=false;area.innerHTML="<div class='big' style='padding-top:80px'>TIME!</div>";reward(hits*15,hits*6);return}
  const b=btn("×",()=>{hits++;label.textContent="Hits: "+hits;b.remove();spawn()});
  b.style.left=Math.random()*86+"%";b.style.top=Math.random()*72+"%";area.appendChild(b);
 }
 spawn();const timer=setInterval(()=>{if(Date.now()>=end||!active){clearInterval(timer);return}spawn()},900);
}

function memoryGame(){
 const vals=["◆","●","▲","★","■","✦","◆","●","▲","★","■","✦"].sort(()=>Math.random()-.5);
 const wrap=document.createElement("div");wrap.className="mini";const grid=document.createElement("div");grid.className="memoryGrid";wrap.appendChild(grid);gameContent.appendChild(wrap);
 let open=[],matched=0;
 vals.forEach(v=>{
  const b=btn("?",()=>{
   if(open.length>=2||b.disabled||b.classList.contains("flipped"))return;
   b.classList.add("flipped");b.textContent=v;open.push({b,v});
   if(open.length===2)setTimeout(()=>{
    if(open[0].v===open[1].v){open.forEach(x=>{x.b.disabled=true});matched+=2}
    else open.forEach(x=>{x.b.classList.remove("flipped");x.b.textContent="?"});
    open=[];
    if(matched===vals.length){reward(120,70);wrap.insertAdjacentHTML("beforeend","<b>BOARD CLEARED.</b>")}
   },430);
  });
  grid.appendChild(b);
 });
}

function reactionGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<p>Wait for the signal, then hit GO as quickly as possible.</p>";
 const b=btn("WAIT...",()=>{const ms=Date.now()-start;b.disabled=true;b.textContent=ms+" ms";reward(Math.max(20,Math.floor(7000/ms)*25),Math.max(8,Math.floor(1800/ms)))});
 wrap.appendChild(b);gameContent.appendChild(wrap);
 let start=0;setTimeout(()=>{if(!modal.classList.contains("hidden")){b.textContent="GO!";start=Date.now()}},900+Math.random()*2300);
}

function hoopsGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<p>Take five shots. Your accuracy is based on timing.</p>";
 const b=btn("SHOOT",()=>{shots++;if(Math.random()<.62)made++;b.textContent=shots<5?"SHOOT":`RESULT  ${made}/5`;if(shots>=5){b.disabled=true;reward(made*35,made*15)}});
 wrap.appendChild(b);gameContent.appendChild(wrap);let shots=0,made=0;
}

function raceGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<p>Tap boost to fill the meter before the timer expires.</p><div class='progress'><i></i></div>";
 const b=btn("BOOST",()=>{p=Math.min(1,p+.08+Math.random()*.1);bar.style.width=(p*100)+"%";if(p>=1){b.disabled=true;reward(150,80);b.textContent="FINISH!"}});
 wrap.appendChild(b);gameContent.appendChild(wrap);const bar=wrap.querySelector("i");let p=0;
}

function wheelGame(){
 const wrap=document.createElement("div");wrap.className="mini";const out=document.createElement("div");out.className="big";out.textContent="◎";
 const b=btn("SPIN",()=>{const icons=["★","✦","◆","●","⚡","🏆"];out.textContent=icons[Math.floor(Math.random()*icons.length)];b.disabled=true;reward(40,20)});
 wrap.append(out,b);gameContent.appendChild(wrap);
}

function breakoutGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<p>Break the practice wall with ten clean hits.</p>";
 let n=0;const b=btn("HIT",()=>{n++;b.textContent=`HIT ${n}/10`;if(n===10){b.disabled=true;reward(110,55)}});wrap.appendChild(b);gameContent.appendChild(wrap);
}
function snakeGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<p>Collect eight moves to complete the route.</p>";
 let n=0;const b=btn("MOVE",()=>{n++;b.textContent=`MOVE ${n}/8`;if(n===8){b.disabled=true;reward(100,50)}});wrap.appendChild(b);gameContent.appendChild(wrap);
}
function diceGame(){
 const wrap=document.createElement("div");wrap.className="mini";const out=document.createElement("div");out.className="big";out.textContent="🎲";
 const b=btn("ROLL",()=>{const a=1+Math.floor(Math.random()*6),c=1+Math.floor(Math.random()*6);out.textContent=`${a}  +  ${c}  =  ${a+c}`;reward((a+c)*8,(a+c)*4)});
 wrap.append(out,b);gameContent.appendChild(wrap);
}
function quizGame(){
 const wrap=document.createElement("div");wrap.className="mini";wrap.innerHTML="<b>Which key opens a nearby arcade machine?</b>";
 const choices=document.createElement("div");choices.className="choices";
 ["E","Q","SPACE"].forEach(x=>{const b=btn(x,()=>{wrap.innerHTML=x==="E"?"<b>Correct. +80 score.</b>":"<b>Not quite. Keep exploring.</b>";reward(x==="E"?80:5,x==="E"?40:2)});choices.appendChild(b)});
 wrap.appendChild(choices);gameContent.appendChild(wrap);
}

function drawFloor(){
 ctx.fillStyle="#080a0f";ctx.fillRect(0,0,world.w,world.h);
 // marble-like grid
 for(let x=0;x<world.w;x+=80){for(let y=0;y<world.h;y+=80){
  ctx.fillStyle=((x/80+y/80)%2===0)?"#121722":"#10141d";ctx.fillRect(x,y,80,80);
 }}
 ctx.strokeStyle="rgba(255,255,255,.035)";ctx.lineWidth=1;
 for(let x=0;x<world.w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,world.h);ctx.stroke()}
 for(let y=0;y<world.h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(world.w,y);ctx.stroke()}
}

function drawZone(z){
 ctx.save();
 ctx.fillStyle="rgba(255,255,255,.018)";ctx.fillRect(z.x,z.y,z.w,z.h);
 ctx.strokeStyle="rgba(255,255,255,.18)";ctx.lineWidth=8;ctx.strokeRect(z.x,z.y,z.w,z.h);
 ctx.strokeStyle=z.accent;ctx.globalAlpha=.35;ctx.lineWidth=2;ctx.strokeRect(z.x+9,z.y+9,z.w-18,z.h-18);
 ctx.globalAlpha=1;
 // header sign
 ctx.fillStyle="rgba(5,7,11,.78)";roundRect(z.x+24,z.y+20,190,42,12,true,false);
 ctx.fillStyle=z.accent;ctx.font="900 13px system-ui";ctx.letterSpacing="2px";ctx.fillText(z.name,z.x+40,z.y+46);
 ctx.restore();
}

function roundRect(x,y,w,h,r,fill,stroke=true){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill)ctx.fill();if(stroke)ctx.stroke();
}

function drawMachine(m){
 ctx.save();
 const x=m.x,y=m.y;
 ctx.shadowColor=m.accent;ctx.shadowBlur=18;ctx.globalAlpha=.12;ctx.fillStyle=m.accent;ctx.fillRect(x-65,y-58,130,116);ctx.globalAlpha=1;ctx.shadowBlur=0;
 if(m.kind==="wheel"){
  ctx.fillStyle="#161b25";roundRect(x-62,y-50,124,100,18,true,false);
  ctx.fillStyle="#2b3444";roundRect(x-49,y-39,98,78,12,true,false);
  ctx.strokeStyle=m.accent;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y-2,28,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="#fff";ctx.lineWidth=2;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+26*Math.cos(a),y-2+26*Math.sin(a));ctx.stroke()}
 }else if(m.kind==="holo"){
  ctx.fillStyle="#171d29";roundRect(x-60,y+15,120,28,10,true,false);
  ctx.strokeStyle=m.accent;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-20,48,24,0,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=.22;ctx.fillStyle=m.accent;ctx.beginPath();ctx.ellipse(x,y-20,45,20,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle="#d9e5ff";ctx.font="900 12px system-ui";ctx.textAlign="center";ctx.fillText("HOLO",x,y-15);
 }else if(m.kind==="booth"){
  ctx.fillStyle="#242b38";roundRect(x-62,y-48,124,96,16,true,false);
  ctx.fillStyle="#10141c";roundRect(x-45,y-30,90,48,10,true,false);
  ctx.fillStyle=m.accent;ctx.fillRect(x-31,y-20,62,7);
  ctx.fillStyle="#aab3c4";ctx.fillRect(x-25,y-5,50,5);
  ctx.fillStyle="#0b0e14";ctx.fillRect(x-48,y+27,96,8);
 }else{
  // detailed arcade cabinet
  ctx.fillStyle="#1a202b";roundRect(x-55,y-50,110,104,13,true,false);
  ctx.fillStyle="#252d3a";roundRect(x-46,y-42,92,63,9,true,false);
  ctx.fillStyle=m.accent;ctx.globalAlpha=.15;roundRect(x-40,y-36,80,51,6,true,false);ctx.globalAlpha=1;
  ctx.strokeStyle=m.accent;ctx.lineWidth=2;roundRect(x-40,y-36,80,51,6,false,true);
  ctx.fillStyle="#f2f0e8";ctx.font="900 9px system-ui";ctx.textAlign="center";ctx.fillText(m.name,x,y-10);
  ctx.fillStyle="#30394a";roundRect(x-38,y+27,76,15,5,true,false);
  ctx.fillStyle=m.accent;ctx.beginPath();ctx.arc(x-18,y+34,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#e5e8ed";ctx.beginPath();ctx.arc(x+12,y+34,4,0,Math.PI*2);ctx.fill();
 }
 ctx.fillStyle="rgba(255,255,255,.55)";ctx.font="800 10px system-ui";ctx.textAlign="center";ctx.fillText(m.name,x,y+73);
 ctx.restore();
}

function drawDecor(d){
 ctx.save();const x=d.x,y=d.y;
 if(d.type==="plant"){
  ctx.fillStyle="#18201b";roundRect(x-25,y+18,50,30,8,true,false);
  for(let i=0;i<7;i++){ctx.fillStyle=["#3d7956","#4f9664","#2e6b4d"][i%3];ctx.beginPath();ctx.ellipse(x+(i-3)*6,y-5-Math.abs(i-3)*3,9,25,(i-3)*.25,0,Math.PI*2);ctx.fill()}
 }else if(d.type==="sofa"){
  ctx.fillStyle="#242936";roundRect(x-70,y-30,140,60,16,true,false);ctx.fillStyle="#323a4a";roundRect(x-58,y-22,116,45,12,true,false);ctx.fillStyle="#f5c84c";ctx.fillRect(x-65,y-8,8,28)
 }else{
  ctx.fillStyle="#252b37";roundRect(x-70,y-13,140,26,8,true,false);ctx.fillStyle="#3b4352";ctx.fillRect(x-58,y+10,8,25);ctx.fillRect(x+50,y+10,8,25)
 }
 ctx.restore();
}

function drawNPC(n){
 const bob=Math.sin(performance.now()/250+n.x)*1.5;
 ctx.save();ctx.translate(n.x,n.y+bob);
 ctx.fillStyle="rgba(0,0,0,.3)";ctx.beginPath();ctx.ellipse(0,20,16,7,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=n.shirt;roundRect(-13,-2,26,27,8,true,false);
 ctx.fillStyle=n.c;ctx.beginPath();ctx.arc(0,-13,11,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=n.hair;ctx.beginPath();ctx.arc(0,-17,11,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle="#20242c";ctx.beginPath();ctx.arc(-4,-14,1.3,0,Math.PI*2);ctx.arc(4,-14,1.3,0,Math.PI*2);ctx.fill();
 ctx.restore();
}

function drawPlayer(){
 const bob=(Math.abs(Math.sin(player.walk))*2);
 ctx.save();ctx.translate(player.x,player.y+bob);
 ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(0,20,17,7,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#4e7cff";roundRect(-14,-2,28,31,9,true,false);
 ctx.fillStyle="#e7ae88";ctx.beginPath();ctx.arc(0,-15,12,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#25202a";ctx.beginPath();ctx.arc(0,-20,12,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(-4,-15,1.7,0,Math.PI*2);ctx.arc(4,-15,1.7,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#f5c84c";ctx.fillRect(-10,25,8,5);ctx.fillRect(2,25,8,5);
 ctx.restore();
}

function drawWorld(){
 const sw=innerWidth,sh=innerHeight;
 const scale=Math.min(1,Math.max(.72,Math.min(sw/1200,sh/800)));
 cam.x+=(player.x-sw/2/scale-cam.x)*.1;cam.y+=(player.y-sh/2/scale-cam.y)*.1;
 cam.x=Math.max(0,Math.min(world.w-sw/scale,cam.x));cam.y=Math.max(0,Math.min(world.h-sh/scale,cam.y));
 ctx.setTransform(devicePixelRatio*scale,0,0,devicePixelRatio*scale,-cam.x*devicePixelRatio*scale,-cam.y*devicePixelRatio*scale);
 drawFloor();
 zones.forEach(drawZone);decor.forEach(drawDecor);machines.forEach(drawMachine);npcs.forEach(drawNPC);drawPlayer();
 // interaction halo
 if(near){ctx.strokeStyle=near.accent;ctx.globalAlpha=.4;ctx.lineWidth=2;ctx.beginPath();ctx.arc(near.x,near.y,65+Math.sin(performance.now()/180)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
 ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
 const vignette=ctx.createRadialGradient(sw/2,sh/2,Math.min(sw,sh)*.25,sw/2,sh/2,Math.max(sw,sh)*.72);
 vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(0,0,0,.5)");ctx.fillStyle=vignette;ctx.fillRect(0,0,sw,sh);
}

function updateNear(){
 let best=999,bestObj=null;
 for(const m of machines){const d=d2(player,m);if(d<105&&d<best){best=d;bestObj=m}}
 near=bestObj;
 if(near){interactionText.textContent=`PLAY ${near.name}`;interaction.style.display="flex"}else interaction.style.display="none";
}

function tick(t){
 const dt=Math.min(.033,(t-last)/1000||0);last=t;
 if(modal.classList.contains("hidden")){move(dt);updateNear()}
 // simple NPC wandering
 for(const n of npcs){
  const dx=n.tx-n.x,dy=n.ty-n.y,dd=Math.hypot(dx,dy);
  if(dd<30){const choices=zones[Math.floor(Math.random()*zones.length)];n.tx=choices.x+100+Math.random()*(choices.w-200);n.ty=choices.y+100+Math.random()*(choices.h-200)}
  else{n.x+=dx/dd*n.speed*dt;n.y+=dy/dd*n.speed*dt}
 }
 drawWorld();requestAnimationFrame(tick);
}
updateHud();requestAnimationFrame(tick);

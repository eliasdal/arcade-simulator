(() => {
"use strict";
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const levelEl=document.getElementById("level"),xpEl=document.getElementById("xp"),scoreEl=document.getElementById("score");
const promptEl=document.getElementById("prompt"),menu=document.getElementById("menu"),toastEl=document.getElementById("toast");
let W=innerWidth,H=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
const world={w:2200,h:1400};
const player={x:1100,y:930,r:18,speed:245,face:"down"};
const keys=new Set(); let last=performance.now(),near=null,game=null;
const state={xp:Number(localStorage.getItem("r21_xp")||0),score:Number(localStorage.getItem("r21_score")||0),level:Number(localStorage.getItem("r21_level")||1)};
const objects=[
{x:330,y:310,w:250,h:155,type:"room",label:"ARCADE",color:"#192a35"},
{x:700,y:285,w:250,h:155,type:"room",label:"CHALLENGES",color:"#202b35"},
{x:1070,y:285,w:250,h:155,type:"room",label:"GAME HALL",color:"#30261b"},
{x:1440,y:285,w:420,h:155,type:"room",label:"LOUNGE",color:"#20232b"},
{x:420,y:730,w:160,h:95,type:"target",label:"TARGET TOSS",icon:"🎯"},
{x:680,y:730,w:160,h:95,type:"memory",label:"MEMORY",icon:"🧠"},
{x:940,y:730,w:160,h:95,type:"reaction",label:"REACTION",icon:"⚡"},
{x:1200,y:730,w:160,h:95,type:"basket",label:"HOOPS",icon:"🏀"},
{x:1460,y:730,w:160,h:95,type:"race",label:"MINI RACE",icon:"🏎️"},
{x:1720,y:730,w:160,h:95,type:"wheel",label:"LUCKY WHEEL",icon:"🎡"},
{x:420,y:1050,w:160,h:95,type:"breakout",label:"BREAKOUT",icon:"🧱"},
{x:680,y:1050,w:160,h:95,type:"snake",label:"SNAKE",icon:"🐍"},
{x:940,y:1050,w:160,h:95,type:"dice",label:"DICE DASH",icon:"🎲"},
{x:1200,y:1050,w:160,h:95,type:"cards",label:"CARD MATCH",icon:"🃏"},
{x:1460,y:1050,w:160,h:95,type:"quiz",label:"QUIZ BOOTH",icon:"❓"},
{x:1720,y:1050,w:160,h:95,type:"prize",label:"PRIZE ROOM",icon:"🏆"}
];
const solid=objects.filter(o=>o.type==="room");

function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();
addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d","W","A","S","D","e","E","Escape"].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if((e.key==="e"||e.key==="E")&&!menu.classList.contains("hidden"))return;if((e.key==="e"||e.key==="E")&&near)openGame(near);if(e.key==="Escape"&&!menu.classList.contains("hidden"))closeGame()});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));

function save(){localStorage.setItem("r21_xp",state.xp);localStorage.setItem("r21_score",state.score);localStorage.setItem("r21_level",state.level)}
function reward(points){state.score+=points;state.xp+=Math.max(5,Math.floor(points/2));const nl=1+Math.floor(state.xp/500);if(nl>state.level){state.level=nl;toast("⭐ Level "+nl+" unlocked!")}save();updateHud()}
function updateHud(){levelEl.textContent=state.level;xpEl.textContent=state.xp;scoreEl.textContent=state.score}
function toast(s){toastEl.textContent=s;toastEl.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>toastEl.classList.remove("show"),1800)}
function rectHitCircle(r,cx,cy,cr){const nx=Math.max(r.x,Math.min(cx,r.x+r.w)),ny=Math.max(r.y,Math.min(cy,r.y+r.h));return (cx-nx)**2+(cy-ny)**2<cr**2}
function move(dt){
 let dx=0,dy=0;if(keys.has("a")||keys.has("arrowleft"))dx--;if(keys.has("d")||keys.has("arrowright"))dx++;if(keys.has("w")||keys.has("arrowup"))dy--;if(keys.has("s")||keys.has("arrowdown"))dy++;
 if(dx||dy){const len=Math.hypot(dx,dy);dx/=len;dy/=len;player.face=Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up")}
 const nx=Math.max(player.r,Math.min(world.w-player.r,player.x+dx*player.speed*dt)),ny=Math.max(player.r,Math.min(world.h-player.r,player.y+dy*player.speed*dt));
 if(!solid.some(o=>rectHitCircle(o,nx,player.y,player.r)))player.x=nx;
 if(!solid.some(o=>rectHitCircle(o,player.x,ny,player.r)))player.y=ny;
}
function nearest(){let best=null,bd=999;for(const o of objects.filter(x=>x.type!=="room")){const d=Math.hypot(player.x-(o.x+o.w/2),player.y-(o.y+o.h/2));if(d<bd&&d<115){best=o;bd=d}}return best}
function draw(){
 ctx.clearRect(0,0,W,H);const camX=Math.max(0,Math.min(world.w-W,player.x-W/2)),camY=Math.max(0,Math.min(world.h-H,player.y-H/2));
 ctx.save();ctx.translate(-camX,-camY);
 ctx.fillStyle="#0b1016";ctx.fillRect(0,0,world.w,world.h);
 ctx.fillStyle="#101720";for(let x=0;x<world.w;x+=70)for(let y=0;y<world.h;y+=70)ctx.fillRect(x+1,y+1,68,68);
 // decorative floor
 ctx.strokeStyle="#27303a";ctx.lineWidth=2;for(let x=0;x<world.w;x+=140){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,world.h);ctx.stroke()}for(let y=0;y<world.h;y+=140){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(world.w,y);ctx.stroke()}
 for(const o of objects){if(o.type==="room"){ctx.fillStyle=o.color;ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle="#3b4652";ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.fillStyle="#d9b85d";ctx.font="900 22px system-ui";ctx.textAlign="center";ctx.fillText(o.label,o.x+o.w/2,o.y+o.h/2)}else{ctx.fillStyle="#151c25";ctx.fillRect(o.x,o.y,o.w,o.h);ctx.strokeStyle=near===o?"#e0b957":"#343e4b";ctx.lineWidth=near===o?3:1;ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.font="38px system-ui";ctx.textAlign="center";ctx.fillText(o.icon,o.x+o.w/2,o.y+42);ctx.fillStyle="#d8dee7";ctx.font="800 12px system-ui";ctx.fillText(o.label,o.x+o.w/2,o.y+72)}}
 // player shadow/body
 ctx.fillStyle="#0008";ctx.beginPath();ctx.ellipse(player.x,player.y+19,22,8,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#dcb75b";ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#151b24";ctx.beginPath();ctx.arc(player.x,player.y-5,13,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle="#fff";ctx.font="800 11px system-ui";ctx.textAlign="center";ctx.fillText("YOU",player.x,player.y-28);
 ctx.restore();
 if(near){promptEl.textContent=`[E]  ${near.label}`;promptEl.classList.remove("hidden")}else promptEl.classList.add("hidden");
}
function openGame(o){
 menu.className="modal";game=o.type;
 if(game==="target")targetGame();else if(game==="memory")memoryGame();else if(game==="reaction")reactionGame();else if(game==="basket")basketGame();else if(game==="race")raceGame();else if(game==="wheel")wheelGame();else if(game==="breakout")simpleGame("🧱 BREAKOUT","Tap the ball to break 10 blocks.",["START","+10 POINTS"]);else if(game==="snake")simpleGame("🐍 SNAKE","Press the button repeatedly to grow.",["START","GROW"]);else if(game==="dice")diceGame();else if(game==="cards")cardsGame();else if(game==="quiz")quizGame();else prizeRoom()
}
function closeGame(){menu.className="hidden";menu.innerHTML="";game=null}
function shell(title,sub,inner){menu.innerHTML=`<div class="box"><h1>${title}</h1><p>${sub}</p>${inner}<div><button class="bigbtn secondary" id="leave">LEAVE</button></div></div>`;document.getElementById("leave").onclick=closeGame}
function targetGame(){let score=0,time=15;let cells=Array(9).fill(0);shell("🎯 Target Toss","Hit as many targets as possible in 15 seconds.",`<div class="arena"><b id="tg">15.0</b><div class="targets">${cells.map((_,i)=>`<button class="target" data-i="${i}">🎯</button>`).join("")}</div><b id="ts">0</b></div>`);const buttons=[...menu.querySelectorAll(".target")];let active=Math.floor(Math.random()*9);buttons.forEach((b,i)=>b.onclick=()=>{if(i!==active)return;score++;b.classList.add("hit");setTimeout(()=>b.classList.remove("hit"),220);active=Math.floor(Math.random()*9);buttons.forEach(x=>x.textContent="");buttons[active].textContent="🎯";document.getElementById("ts").textContent=score});buttons[active].textContent="🎯";const iv=setInterval(()=>{time-=.1;document.getElementById("tg").textContent=Math.max(0,time).toFixed(1);if(time<=0){clearInterval(iv);reward(score*20+50);toast("🎯 +"+(score*20+50)+" points");}},100)}
function memoryGame(){const seq=Array.from({length:4},()=>Math.floor(Math.random()*4));let input=[],show=true;shell("🧠 Memory","Watch the sequence, then repeat it.",`<div class="sequence">${[0,1,2,3].map(i=>`<button class="seq" data-i="${i}">●</button>`).join("")}</div><div id="ms" class="small">Watch...</div>`);const bs=[...menu.querySelectorAll(".seq")];let i=0;function flash(){bs.forEach(b=>b.classList.remove("on"));if(i<seq.length){bs[seq[i]].classList.add("on");setTimeout(()=>{bs[seq[i]].classList.remove("on");i++;setTimeout(flash,220)},380)}else{show=false;document.getElementById("ms").textContent="Your turn!"}}flash();bs.forEach(b=>b.onclick=()=>{if(show)return;input.push(+b.dataset.i);const n=input.length;if(input[n-1]!==seq[n-1]){reward(15);document.getElementById("ms").textContent="Close! +15 points";bs.forEach(x=>x.disabled=true)}else if(n===seq.length){reward(100);document.getElementById("ms").textContent="Perfect! +100 points";bs.forEach(x=>x.disabled=true)}})}
function reactionGame(){let ready=false,start=0;shell("⚡ Reaction","Wait for GO, then press the button as fast as possible.",`<button class="bigbtn" id="react">WAIT...</button><div id="rt">Get ready...</div>`);const b=document.getElementById("react");setTimeout(()=>{ready=true;start=performance.now();b.textContent="GO!";},1000+Math.random()*2000);b.onclick=()=>{if(!ready){toast("Too early!");return}const ms=Math.round(performance.now()-start);reward(Math.max(25,150-Math.floor(ms/3)));document.getElementById("rt").textContent=ms+" ms — nice!";b.disabled=true}}
function basketGame(){let score=0,shots=10;shell("🏀 Hoops","Make 10 quick shots. Every click is a shot.",`<div class="basket" id="hoop">🏀</div><b id="bs">Shots: 10 • Made: 0</b>`);document.getElementById("hoop").onclick=()=>{if(shots<=0)return;shots--;if(Math.random()<.6)score++;document.getElementById("bs").textContent=`Shots: ${shots} • Made: ${score}`;if(!shots){reward(score*25+25);toast("🏀 +"+(score*25+25)+" points")}}}
function raceGame(){let p=0,finish=100;shell("🏎️ Mini Race","Mash the button to reach the finish.",`<div class="race"><div class="lane" style="top:55%"></div><div class="car" id="car" style="top:43%">🏎️</div></div><button class="bigbtn" id="go">ACCELERATE</button><div id="raceText">0%</div>`);document.getElementById("go").onclick=()=>{p+=5+Math.random()*9;document.getElementById("car").style.left=Math.min(88,p)+"%";document.getElementById("raceText").textContent=Math.min(100,Math.floor(p))+"%";if(p>=finish){reward(150);toast("🏎️ Race complete! +150 points");document.getElementById("go").disabled=true}}}
function wheelGame(){let spins=0;shell("🎡 Lucky Wheel","A simple free spin. No betting—just a random score bonus.",`<div class="wheel" id="freeWheel">🎡</div><button class="bigbtn" id="spinWheel">SPIN</button><div id="wt"></div>`);document.getElementById("spinWheel").onclick=()=>{if(spins)return;spins=1;const p=[25,50,75,100,150][Math.floor(Math.random()*5)];document.getElementById("freeWheel").style.transform="rotate(1080deg)";setTimeout(()=>{reward(p);document.getElementById("wt").textContent="+"+p+" points!";},800)}}
function diceGame(){let n=0;shell("🎲 Dice Dash","Roll three times and try to reach 12 or more.",`<div class="dice" id="die">🎲</div><button class="bigbtn" id="roll">ROLL</button><div id="dt">Total: 0</div>`);document.getElementById("roll").onclick=()=>{if(n>=3)return;const r=1+Math.floor(Math.random()*6);n++;document.getElementById("die").textContent=["⚀","⚁","⚂","⚃","⚄","⚅"][r-1];const t=(+document.getElementById("dt").dataset.t||0)+r;document.getElementById("dt").dataset.t=t;document.getElementById("dt").textContent="Total: "+t;if(n===3){reward(t>=12?100:30);toast(t>=12?"🎲 Great roll!":"🎲 Challenge complete!")}}}
function cardsGame(){let first=null,matched=0,deck=["♠","♥","♦","♣","♠","♥","♦","♣"].sort(()=>Math.random()-.5);shell("🃏 Card Match","Find all four matching pairs.",`<div class="sequence" id="cards">${deck.map((_,i)=>`<button class="seq" data-i="${i}">?</button>`).join("")}</div><div id="ct">Pairs: 0/4</div>`);const bs=[...menu.querySelectorAll("#cards .seq")];bs.forEach((b,i)=>b.onclick=()=>{if(b.textContent!=="?"||matched===4)return;b.textContent=deck[i];if(first===null){first=i;return}if(deck[first]===deck[i]){matched++;bs[first].disabled=true;b.disabled=true;first=null;document.getElementById("ct").textContent="Pairs: "+matched+"/4";if(matched===4){reward(150);toast("🃏 All pairs! +150 points")}}else{const old=first;first=null;setTimeout(()=>{bs[old].textContent="?";b.textContent="?"},450)}})}
function quizGame(){const qs=[["What key interacts with arcade machines?","E"],["How do you move?","WASD"],["What does XP unlock?","LEVELS"]];let q=qs[Math.floor(Math.random()*qs.length)];shell("❓ Quiz Booth",q[0],`<div class="sequence">${[q[1],q[1]==="E"?"SPACE":"Q",q[1]==="WASD"?"ARROWS":"X"].map(a=>`<button class="seq answer">${a}</button>`).join("")}</div>`);menu.querySelectorAll(".answer").forEach(b=>b.onclick=()=>{if(b.textContent===q[1]){reward(75);toast("Correct! +75 points")}else toast("Not quite!")})}
function simpleGame(title,sub,buttons){let n=0;shell(title,sub,`<button class="bigbtn" id="simple">${buttons[0]}</button><div id="simpleText">Ready?</div>`);document.getElementById("simple").onclick=()=>{n++;if(n>=10){reward(100);document.getElementById("simpleText").textContent="Complete! +100 points";document.getElementById("simple").disabled=true}else{document.getElementById("simpleText").textContent=n+"/10"}}}
function prizeRoom(){shell("🏆 Prize Room","Your points are your progress. Keep exploring and unlock higher levels.",`<p>Level ${state.level}</p><p>${state.score.toLocaleString()} total points</p><p>Next level: ${500-(state.xp%500)} XP</p>`)}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;if(menu.classList.contains("hidden")){move(dt);near=nearest()}else near=null;draw();requestAnimationFrame(loop)}
updateHud();requestAnimationFrame(loop);
})();
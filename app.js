const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const levelEl=document.getElementById("level"),xpEl=document.getElementById("xp"),scoreEl=document.getElementById("score");
const promptEl=document.getElementById("prompt"),toastEl=document.getElementById("toast");
const modal=document.getElementById("modal"),gameTitle=document.getElementById("gameTitle"),gameContent=document.getElementById("gameContent"),closeBtn=document.getElementById("close");

const W=2200,H=1400;
let keys={},last=0,near=null,toastTimer=0;
let state={x:1100,y:1110,xp:Number(localStorage.r21_xp||0),score:Number(localStorage.r21_score||0),level:Number(localStorage.r21_level||1)};
const rooms=[
 {x:80,y:110,w:560,h:450,name:"ARCADE"},
 {x:720,y:110,w:680,h:450,name:"CHALLENGES"},
 {x:1480,y:110,w:640,h:450,name:"GAME HALL"},
 {x:80,y:700,w:700,h:500,name:"LOUNGE"},
 {x:900,y:700,w:1200,h:500,name:"PRIZE ROOM"}
];
const objects=[
 {x:230,y:260,name:"TARGET TOSS",type:"target",color:"#e95"},
 {x:480,y:260,name:"MEMORY",type:"memory",color:"#8cf"},
 {x:880,y:260,name:"REACTION",type:"reaction",color:"#f77"},
 {x:1190,y:260,name:"HOOPS",type:"hoops",color:"#7e7"},
 {x:1690,y:260,name:"MINI RACE",type:"race",color:"#c8f"},
 {x:1950,y:260,name:"LUCKY WHEEL",type:"wheel",color:"#fc5"},
 {x:350,y:900,name:"BREAKOUT",type:"breakout",color:"#7cf"},
 {x:620,y:900,name:"SNAKE",type:"snake",color:"#6f6"},
 {x:1110,y:900,name:"DICE DASH",type:"dice",color:"#fff"},
 {x:1510,y:900,name:"CARD MATCH",type:"memory",color:"#f9b"},
 {x:1870,y:900,name:"QUIZ BOOTH",type:"quiz",color:"#b9f"}
];
const walls=[
 {x:0,y:0,w:W,h:70},{x:0,y:1330,w:W,h:70},{x:0,y:0,w:70,h:H},{x:2130,y:0,w:70,h:H},
 ...rooms.map(r=>({x:r.x-12,y:r.y-12,w:r.w+24,h:12})),
 ...rooms.map(r=>({x:r.x-12,y:r.y+r.h,w:r.w+24,h:12})),
 ...rooms.map(r=>({x:r.x-12,y:r.y,w:12,h:r.h})),
 ...rooms.map(r=>({x:r.x+r.w,y:r.y,w:12,h:r.h}))
];
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
addEventListener("resize",resize);resize();
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==="e"&&!e.repeat)interact();if(e.key==="Escape")closeGame()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
closeBtn.onclick=closeGame;modal.addEventListener("click",e=>{if(e.target===modal)closeGame()});

function save(){localStorage.r21_xp=state.xp;localStorage.r21_score=state.score;localStorage.r21_level=state.level;updateHud()}
function addReward(points,xp){state.score+=points;state.xp+=xp;while(state.xp>=state.level*100){state.xp-=state.level*100;state.level++}save();showToast(`+${points} points  •  +${xp} XP`)}
function updateHud(){levelEl.textContent=state.level;xpEl.textContent=state.xp;scoreEl.textContent=state.score}
function showToast(t){toastEl.textContent=t;toastEl.style.display="block";clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.style.display="none",1800)}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function collides(x,y){return x<85||x>2115||y<85||y>1315}
function move(dt){
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 if(dx||dy){let l=Math.hypot(dx,dy);dx/=l;dy/=l;let sp=270;let nx=state.x+dx*sp*dt,ny=state.y+dy*sp*dt;if(!collides(nx,state.y))state.x=nx;if(!collides(state.x,ny))state.y=ny}
}
function interact(){if(near)openGame(near)}
function openGame(o){
 gameTitle.textContent=o.name;modal.classList.remove("hidden");gameContent.innerHTML="";
 if(o.type==="target")targetGame();
 if(o.type==="memory")memoryGame();
 if(o.type==="reaction")reactionGame();
 if(o.type==="hoops")hoopsGame();
 if(o.type==="race")raceGame();
 if(o.type==="wheel")wheelGame();
 if(o.type==="breakout")breakoutGame();
 if(o.type==="snake")snakeGame();
 if(o.type==="dice")diceGame();
 if(o.type==="quiz")quizGame();
}
function closeGame(){modal.classList.add("hidden");gameContent.innerHTML=""}
function button(t,fn){let b=document.createElement("button");b.textContent=t;b.onclick=fn;return b}
function targetGame(){
 const d=document.createElement("div");d.className="mini";d.innerHTML="<p>Hit the target as it moves. You have 15 seconds.</p><div class='target' id='targetArea'></div><b id='tScore'>Hits: 0</b>";gameContent.appendChild(d);
 let area=d.querySelector("#targetArea"),score=0,end=Date.now()+15000;
 function spawn(){if(Date.now()>=end){addReward(score*10,score*5);return}let b=document.createElement("button");b.textContent="+";b.style.left=Math.random()*85+"%";b.style.top=Math.random()*72+"%";b.onclick=()=>{score++;b.remove();spawn()};area.appendChild(b);d.querySelector("#tScore").textContent="Hits: "+score}
 spawn();let timer=setInterval(()=>{if(!modal.classList.contains("hidden")){if(Date.now()>=end){clearInterval(timer);area.innerHTML="<b class='big'>TIME!</b>";addReward(score*10,score*5)}else spawn()}},500);
}
function memoryGame(){
 const vals=["★","◆","●","▲","★","◆","●","▲"].sort(()=>Math.random()-.5);let open=[],matched=0;
 let wrap=document.createElement("div");wrap.className="mini";let grid=document.createElement("div");grid.className="memoryGrid";wrap.appendChild(grid);gameContent.appendChild(wrap);
 vals.forEach(v=>{let b=button("?",()=>{if(open.length>=2||b.classList.contains("flipped"))return;b.classList.add("flipped");b.textContent=v;open.push({b,v});if(open.length===2){setTimeout(()=>{if(open[0].v===open[1].v){matched+=2;open.forEach(x=>x.b.disabled=true)}else open.forEach(x=>{x.b.classList.remove("flipped");x.b.textContent="?"});open=[];if(matched===vals.length){addReward(100,60);wrap.insertAdjacentHTML("beforeend","<b>You cleared it!</b>")}},450)} });grid.appendChild(b)})
}
function reactionGame(){
 let d=document.createElement("div");d.className="mini";d.innerHTML="<p>Wait for GO, then click as fast as you can.</p>";let b=button("WAIT...",()=>{let ms=Date.now()-start;addReward(Math.max(10,Math.floor(5000/ms)*20),Math.max(5,Math.floor(1000/ms)));b.disabled=true;b.textContent=`${ms} ms`});d.appendChild(b);gameContent.appendChild(d);let start;setTimeout(()=>{b.textContent="GO!";start=Date.now()},1000+Math.random()*2500)}
function hoopsGame(){let d=document.createElement("div");d.className="mini";d.innerHTML="<p>Make 5 quick shots. Each click is a shot.</p>";let n=0,hit=0;let b=button("SHOOT",()=>{n++;if(Math.random()<.6)hit++;b.textContent=n<5?"SHOOT":`RESULT: ${hit}/5`;if(n>=5){b.disabled=true;addReward(hit*30,hit*12)}});d.appendChild(b);gameContent.appendChild(d)}
function raceGame(){let d=document.createElement("div");d.className="mini";let bar=document.createElement("div");bar.style.height="28px";bar.style.background="#202635";let car=document.createElement("div");car.style.height="100%";car.style.width="5%";car.style.background="#f4c84b";bar.appendChild(car);d.appendChild(bar);let b=button("TAP TO BOOST",()=>{p+=Math.random()*.14;car.style.width=Math.min(100,p*100)+"%";if(p>=1){b.disabled=true;addReward(120,70)}});d.appendChild(b);gameContent.appendChild(d);let p=.05}
function wheelGame(){let d=document.createElement("div");d.className="mini";let out=document.createElement("div");out.className="big";out.textContent="🎡";let b=button("SPIN",()=>{let r=Math.floor(Math.random()*6)+1;out.textContent=["⭐","⚡","🏆","🎯","💎","🔥"][r-1];addReward(r*20,r*10);b.disabled=true});d.append(out,b);gameContent.appendChild(d)}
function breakoutGame(){let d=document.createElement("div");d.className="mini";d.innerHTML="<p>Clear the challenge by pressing the button 10 times.</p>";let n=0,b=button("BREAK",()=>{n++;b.textContent=`BREAK ${n}/10`;if(n>=10){b.disabled=true;addReward(100,50)}});d.appendChild(b);gameContent.appendChild(d)}
function snakeGame(){let d=document.createElement("div");d.className="mini";d.innerHTML="<p>Collect 8 points. Each move attempt earns progress.</p>";let n=0,b=button("MOVE",()=>{n++;b.textContent=`SNAKE ${n}/8`;if(n>=8){b.disabled=true;addReward(90,45)}});d.appendChild(b);gameContent.appendChild(d)}
function diceGame(){let d=document.createElement("div");d.className="mini";let out=document.createElement("div");out.className="big";out.textContent="🎲";let b=button("ROLL",()=>{let a=1+Math.floor(Math.random()*6),c=1+Math.floor(Math.random()*6),sum=a+c;out.textContent=`${a} + ${c} = ${sum}`;addReward(sum*10,sum*4)});d.append(out,b);gameContent.appendChild(d)}
function quizGame(){let d=document.createElement("div");d.className="mini";d.innerHTML="<b>Which key opens a nearby game?</b>";let choices=document.createElement("div");choices.className="choices";["E","Q","SPACE"].forEach(x=>{let b=button(x,()=>{if(x==="E"){addReward(80,40);d.innerHTML="<b>Correct!</b>"}else{addReward(5,2);d.innerHTML="<b>Not quite.</b>"}});choices.appendChild(b)});d.appendChild(choices);gameContent.appendChild(d)}

function draw(){
 const sw=innerWidth,sh=innerHeight,camX=Math.max(0,Math.min(W-sw,state.x-sw/2)),camY=Math.max(0,Math.min(H-sh,state.y-sh/2));
 ctx.clearRect(0,0,sw,sh);ctx.save();ctx.translate(-camX,-camY);
 ctx.fillStyle="#0a0c13";ctx.fillRect(0,0,W,H);
 ctx.strokeStyle="rgba(255,255,255,.035)";ctx.lineWidth=1;for(let x=70;x<W;x+=70){ctx.beginPath();ctx.moveTo(x,70);ctx.lineTo(x,H-70);ctx.stroke()}for(let y=70;y<H;y+=70){ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(W-70,y);ctx.stroke()}
 rooms.forEach(r=>{ctx.fillStyle="#101521";ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle="#293246";ctx.lineWidth=3;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.fillStyle="#657087";ctx.font="700 18px system-ui";ctx.fillText(r.name,r.x+22,r.y+34)});
 objects.forEach(o=>{ctx.fillStyle=o.color;ctx.globalAlpha=.16;ctx.beginPath();ctx.arc(o.x,o.y,42,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle="#171b26";ctx.fillRect(o.x-34,o.y-24,68,48);ctx.strokeStyle=o.color;ctx.strokeRect(o.x-34,o.y-24,68,48);ctx.fillStyle="#fff";ctx.font="700 11px system-ui";ctx.textAlign="center";ctx.fillText(o.name,o.x,o.y+5);ctx.textAlign="left"});
 ctx.fillStyle="#f4c84b";ctx.beginPath();ctx.arc(state.x,state.y,18,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(state.x-6,state.y-3,3,0,Math.PI*2);ctx.arc(state.x+6,state.y-3,3,0,Math.PI*2);ctx.fill();ctx.restore();
 near=null;let best=999;objects.forEach(o=>{let d=dist(state,o);if(d<85&&d<best){best=d;near=o}});if(near){promptEl.textContent=`E  •  PLAY ${near.name}`;promptEl.style.display="block"}else promptEl.style.display="none";
}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;if(modal.classList.contains("hidden"))move(dt);draw();requestAnimationFrame(loop)}
updateHud();requestAnimationFrame(loop);
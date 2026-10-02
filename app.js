import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas=document.getElementById("game");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x06080d);
scene.fog=new THREE.FogExp2(0x06080d,0.009);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.65,.55,.78);composer.addPass(bloom);

const hemi=new THREE.HemisphereLight(0x8ea4c5,0x17120e,1.15);scene.add(hemi);
const mainLight=new THREE.DirectionalLight(0xffead0,2.1);mainLight.position.set(30,45,20);mainLight.castShadow=true;mainLight.shadow.mapSize.set(2048,2048);mainLight.shadow.camera.left=-90;mainLight.shadow.camera.right=90;mainLight.shadow.camera.top=90;mainLight.shadow.camera.bottom=-90;scene.add(mainLight);

const world=new THREE.Group();scene.add(world);
const interactive=[];const colliders=[];const npcs=[];let current=null;
const clock=new THREE.Clock();

const state={xp:+localStorage.getItem("r21_xp")||0,score:+localStorage.getItem("r21_score")||0,level:+localStorage.getItem("r21_level")||1};
const levelEl=document.getElementById("level"),xpEl=document.getElementById("xp"),scoreEl=document.getElementById("score");
function hud(){levelEl.textContent=state.level;xpEl.textContent=state.xp;scoreEl.textContent=state.score}
function reward(s,x){state.score+=s;state.xp+=x;while(state.xp>=state.level*100){state.xp-=state.level*100;state.level++}localStorage.setItem("r21_xp",state.xp);localStorage.setItem("r21_score",state.score);localStorage.setItem("r21_level",state.level);hud();toast(`+${s} SCORE  •  +${x} XP`)}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",1700)}
hud();

function mat(c,rough=.55,metal=0){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal})}
const gold=mat(0xe8b83f,.3,.65),dark=mat(0x111722,.42,.35),black=mat(0x07090d,.65,.05),floorMat=mat(0x171b24,.72,.12);
function box(name,x,y,z,sx,sy,sz,material,shadow=true){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.name=name;m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;world.add(m);return m;
}
function cyl(x,y,z,r,h,material,radial=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,radial),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;world.add(m);return m}
function textSprite(text,color="#ffffff",size=52){
 const c=document.createElement("canvas");c.width=1024;c.height=180;const x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.font=`900 ${size}px Arial`;x.textAlign="center";x.textBaseline="middle";x.shadowColor=color;x.shadowBlur=18;x.fillStyle=color;x.fillText(text,512,90);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(7.2,1.27,1);return s}

function addGlowLight(x,y,z,color,intensity=4,dist=13){
 const l=new THREE.PointLight(color,intensity,dist,2);l.position.set(x,y,z);l.castShadow=false;world.add(l);return l;
}

function buildBuilding(){
 // floor
 box("floor",0,-.15,0,110,0.3,82,floorMat,false);
 // ceiling beams
 for(let x=-50;x<=50;x+=10)box("beam",x,7.8,0,.25,.25,78,mat(0x202632,.5,.25),false);
 // outer walls with large openings at entrance
 box("backwall",0,4,-40,110,8,.6,mat(0x0c1017,.72),false);
 box("leftwall",-54,4,0,.6,8,82,mat(0x0c1017,.72),false);
 box("rightwall",54,4,0,.6,8,82,mat(0x0c1017,.72),false);
 box("frontL",-39,4,40,30,8,.6,mat(0x0c1017,.72),false);
 box("frontR",39,4,40,30,8,.6,mat(0x0c1017,.72),false);
 // neon ceiling panels
 for(let x=-45;x<=45;x+=15){const p=box("ceiling",x,7.45,-2,8,.08,3,mat(0x3a2e1d,.3,.2),false);const l=addGlowLight(x,7,-2,x%30===0?0x5e7cff:0xf4c74f,3,16)}
 // central carpet
 box("carpet",0,.02,7,70,.04,22,mat(0x241d27,.9),false);
 // entrance carpet
 box("entry",0,.025,31,34,.04,14,mat(0x1e1c27,.88),false);
 // reception
 box("reception",0,1.2,-28,22,2.4,3.8,mat(0x151b26,.4,.3));
 box("receptionGold",0,2.43,-28,19,.08,3.4,gold,false);
 const logo=textSprite("ROYAL 21","#f4c74f",58);logo.position.set(0,5.2,-39);logo.scale.set(11,1.95,1);world.add(logo);
 // side wall signs
 for(const [x,t,c] of [[-39,"ARCADE","#64a4ff"],[0,"GAME LOUNGE","#f4c74f"],[39,"CHALLENGE","#d58aff"]]){
   const s=textSprite(t,c,42);s.position.set(x,6.2,-39.5);s.scale.set(6,1.05,1);world.add(s);
 }
 // columns
 for(const x of [-45,-28,-11,11,28,45]){cyl(x,4,-35,0.65,8,mat(0x252a35,.34,.4));cyl(x,7.8,-35,.78,.12,gold)}
}
buildBuilding();

function addArcade(x,z,name,color,type){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 const body=box("cabinet",0,1.55,0,2.2,3.1,1.55,mat(0x151b26,.35,.35));body.position.set(x,1.55,z);
 // remove duplicate from world hierarchy and make local-ish by using world coords
 world.remove(body);g.add(body);body.position.set(0,1.55,0);
 const top=box("top",x,3.05,z,2.35,.28,1.65,mat(color,.25,.55));world.remove(top);g.add(top);top.position.set(0,3.05,0);
 const screen=box("screen",x,2.05,z-.82,1.55,1.1,.08,black,false);world.remove(screen);g.add(screen);screen.position.set(0,2.05,-.82);
 const glow=box("screenGlow",x,2.05,z-.86,1.42,.96,.025,mat(color,.18,.05),false);world.remove(glow);g.add(glow);glow.position.set(0,2.05,-.86);
 const button=box("panel",x,1.12,z-.65,1.55,.18,.72,mat(0x252d3a,.4,.25));world.remove(button);g.add(button);button.position.set(0,1.12,-.65);
 const b1=cyl(0,0,0,.12,.09,gold);g.add(b1);b1.rotation.x=Math.PI/2;b1.position.set(-.42,1.2,-1.02);
 const b2=cyl(0,0,0,.09,.08,mat(color,.25,.5));g.add(b2);b2.rotation.x=Math.PI/2;b2.position.set(.12,1.2,-1.02);
 const sign=textSprite(name,color,38);sign.position.set(x,3.65,z-.15);sign.scale.set(3.5,.62,1);world.add(sign);
 addGlowLight(x,2.2,z-.95,color,2.2,8);
 interactive.push({x,z,name,type,object:g});
 colliders.push({x,z,w:2.5,d:2});
}
const arcades=[
[-38,-24,"TARGET LAB",0x4d9cff,"target"],[-31,-24,"MEMORY GRID",0xa76cff,"memory"],[-24,-24,"REACTION X",0xff6c93,"reaction"],
[-10,-24,"HOOP SHOT",0x61d88c,"hoops"],[-3,-24,"MINI RACER",0xff8a5b,"race"],[10,-24,"BREAKOUT",0x62d8e6,"breakout"],
[24,-24,"SNAKE",0x75df76,"snake"],[37,-24,"DICE DASH",0xf0e7ce,"dice"],
[-35,-4,"QUIZ BOOTH",0xd98cff,"quiz"],[-27,-4,"CARD MATCH",0xff91b0,"memory"],[27,-4,"SCORE ATTACK",0x67d6ff,"hoops"],[35,-4,"TROPHY RUN",0xf4c74f,"race"],
[-28,19,"REACTION WALL",0xff7399,"reaction"],[-18,19,"TARGET PRO",0x5ce0ff,"target"],[18,19,"HOLO HOOPS",0x8de27b,"hoops"],[28,19,"RACE LAB",0xf4c74f,"race"]
];
arcades.forEach(a=>addArcade(...a));

function addTable(x,z){
 const top=cyl(x,.9,z,2.25,.18,mat(0x243225,.5,.25),32);const leg=cyl(x,.45,z,.45,.9,mat(0x151920,.4,.5));const rim=cyl(x,1.02,z,2.32,.12,gold,32);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;const chair=cyl(x+Math.cos(a)*3,.45,z+Math.sin(a)*3,.65,.8,mat(0x202632,.4,.2),20);cyl(x+Math.cos(a)*3,.98,z+Math.sin(a)*3,.7,.12,mat(0x2c3443,.4,.2),20)}
 addGlowLight(x,2,z,0xffb44d,1.4,9);
}
addTable(-12,5);addTable(12,5);

function addPlant(x,z){
 const pot=cyl(x,.65,z,.7,1.2,mat(0x222a31,.55,.15));for(let i=0;i<6;i++){const leaf=cyl(x+(Math.random()-.5)*.5,1.9,z+(Math.random()-.5)*.5,.18,2.3,mat(0x2d754f,.7));leaf.rotation.z=(Math.random()-.5)*.7;leaf.rotation.x=(Math.random()-.5)*.5}
}
[[-46,-7],[-46,15],[46,-7],[46,15],[-5,30],[5,30]].forEach(p=>addPlant(...p));

// glowing strips and wall art
for(const z of [-36,36])for(let x=-42;x<=42;x+=14){const s=box("strip",x,4.2,z,.1,.08,8,gold,false);addGlowLight(x,4,z,x%28===0?0x7f8cff:0xf4c74f,1.3,7)}
for(const [x,z,c] of [[-49,-28,0x4d9cff],[49,-28,0xff6b8e],[-49,25,0x72d5ff],[49,25,0xd58aff]]){const art=box("art",x,3.8,z,.08,3.4,6,mat(c,.25,.2),false);addGlowLight(x,4,z,c,2.2,8)}

function makePlayer(){
 const g=new THREE.Group();g.position.set(0,0,29);scene.add(g);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.0,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.32,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;g.add(shadow);
 const torso=new THREE.Mesh(new THREE.BoxGeometry(.95,1.45,.58),mat(0x426be0,.55,.05));torso.position.y=1.15;torso.castShadow=true;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.42,20,16),mat(0xd8a27e,.75));head.position.y=2.15;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.43,20,12,0,Math.PI*2,0,Math.PI*.55),mat(0x211b1b,.9));hair.position.y=2.3;hair.castShadow=true;g.add(hair);
 const leg1=new THREE.Mesh(new THREE.BoxGeometry(.32,.9,.34),dark);leg1.position.set(-.24,.45,0);leg1.castShadow=true;g.add(leg1);
 const leg2=leg1.clone();leg2.position.x=.24;g.add(leg2);
 const shoe=mat(0x111318,.35,.2);for(const x of [-.24,.24]){const s=new THREE.Mesh(new THREE.BoxGeometry(.4,.18,.65),shoe);s.position.set(x,.05,-.08);s.castShadow=true;g.add(s)}
 return {g,leg1,leg2,torso,walk:0};
}
const player=makePlayer();

const key={};addEventListener("keydown",e=>{key[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==="e"&&!e.repeat)interact();if(e.key==="Escape"){document.exitPointerLock?.();closeModal()}});
addEventListener("keyup",e=>key[e.key.toLowerCase()]=false);
canvas.addEventListener("click",()=>{if(document.getElementById("gameModal").classList.contains("hidden"))canvas.requestPointerLock?.()});
let yaw=0,pitch=.18;document.addEventListener("mousemove",e=>{if(document.pointerLockElement===canvas){yaw-=e.movementX*.0022;pitch-=e.movementY*.0016;pitch=Math.max(-.05,Math.min(.55,pitch))}});

function move(dt){
 let f=(key.w||key.arrowup?1:0)-(key.s||key.arrowdown?1:0),r=(key.d||key.arrowright?1:0)-(key.a||key.arrowleft?1:0);
 if(!f&&!r)return;
 const v=new THREE.Vector3(Math.sin(yaw)*f+Math.cos(yaw)*r,0,Math.cos(yaw)*f-Math.sin(yaw)*r).normalize().multiplyScalar(6.3*dt);
 const np=player.g.position.clone().add(v);
 np.x=Math.max(-48,Math.min(48,np.x));np.z=Math.max(-34,Math.min(34,np.z));
 let blocked=false;for(const c of colliders){if(Math.abs(np.x-c.x)<c.w/2+.7&&Math.abs(np.z-c.z)<c.d/2+.7)blocked=true}
 if(!blocked)player.g.position.copy(np);
 player.g.rotation.y=Math.atan2(v.x,v.z);player.walk+=dt*10;
 player.leg1.rotation.x=Math.sin(player.walk)*.55;player.leg2.rotation.x=-Math.sin(player.walk)*.55;player.torso.position.y=1.15+Math.abs(Math.sin(player.walk))*.035;
}

function nearest(){
 let best=null,bd=3.1;for(const i of interactive){const d=Math.hypot(player.g.position.x-i.x,player.g.position.z-i.z);if(d<bd){bd=d;best=i}}
 return best;
}

function updateCamera(dt){
 const target=player.g.position.clone();target.y=1.65;
 const desired=new THREE.Vector3(
 target.x-Math.sin(yaw)*7.3,
 target.y+2.7+pitch*2.5,
 target.z-Math.cos(yaw)*7.3
 );
 camera.position.lerp(desired,1-Math.pow(.001,dt));
 const look=target.clone().add(new THREE.Vector3(Math.sin(yaw)*1.5,pitch*2.0,Math.cos(yaw)*1.5));camera.lookAt(look);
}

function interact(){if(current)openGame(current)}

function openGame(i){
 const modal=document.getElementById("gameModal"),body=document.getElementById("gameBody");document.getElementById("gameName").textContent=i.name;modal.classList.remove("hidden");document.exitPointerLock?.();body.innerHTML="";
 ({target:targetGame,memory:memoryGame,reaction:reactionGame,hoops:hoopsGame,race:raceGame,breakout:breakoutGame,snake:snakeGame,dice:diceGame,quiz:quizGame}[i.type]||targetGame)(body);
}
function closeModal(){document.getElementById("gameModal").classList.add("hidden");document.getElementById("gameBody").innerHTML=""}
document.getElementById("closeGame").onclick=closeModal;

function button(t,fn){const b=document.createElement("button");b.textContent=t;b.onclick=fn;return b}
function targetGame(b){const w=document.createElement("div");w.className="mini";w.innerHTML="<p>Tap the target as quickly as you can.</p><div class='meter'><i></i></div>";let n=0;const q=button("HIT TARGET",()=>{n++;w.querySelector("i").style.width=Math.min(100,n*10)+"%";if(n>=10){q.disabled=true;q.textContent="COMPLETE";reward(120,60)}});w.append(q);b.append(w)}
function memoryGame(b){const w=document.createElement("div");w.className="mini";const vals=["◆","●","▲","★","◆","●","▲","★"].sort(()=>Math.random()-.5);let open=[],hit=0;const grid=document.createElement("div");grid.className="choices";vals.forEach(v=>{const q=button("?",()=>{q.textContent=v;open.push({q,v});if(open.length===2){if(open[0].v===open[1].v){hit++;open=[]}else setTimeout(()=>{open.forEach(x=>x.q.textContent="?");open=[]},350)}if(hit===4){reward(130,65);w.insertAdjacentHTML("beforeend","<b>BOARD CLEARED.</b>")}});grid.append(q)});w.append(grid);b.append(w)}
function reactionGame(b){const w=document.createElement("div");w.className="mini";w.innerHTML="<p>Wait for GO, then click.</p>";const q=button("WAIT...",()=>{if(!start)return;const ms=Date.now()-start;q.disabled=true;q.textContent=ms+" ms";reward(Math.max(30,9000-Math.floor(ms/2)),Math.max(10,Math.floor(1600/ms*40)))});w.append(q);b.append(w);let start=0;setTimeout(()=>{q.textContent="GO!";start=Date.now()},1000+Math.random()*1800)}
function hoopsGame(b){const w=document.createElement("div");w.className="mini";let n=0,m=0;w.innerHTML="<p>Take five practice shots.</p>";const q=button("SHOOT",()=>{n++;if(Math.random()<.65)m++;q.textContent=n<5?"SHOOT":`${m}/5 MADE`;if(n>=5){q.disabled=true;reward(m*35,m*15)}});w.append(q);b.append(w)}
function raceGame(b){const w=document.createElement("div");w.className="mini";w.innerHTML="<p>Boost the meter to finish.</p><div class='meter'><i></i></div>";let p=0;const q=button("BOOST",()=>{p=Math.min(1,p+.1+Math.random()*.12);w.querySelector("i").style.width=p*100+"%";if(p>=1){q.disabled=true;reward(150,75)}});w.append(q);b.append(w)}
function breakoutGame(b){const w=document.createElement("div");w.className="mini";let n=0;const q=button("BREAK BLOCK",()=>{n++;q.textContent=`BLOCK ${n}/10`;if(n>=10){q.disabled=true;reward(110,55)}});w.append(q);b.append(w)}
function snakeGame(b){const w=document.createElement("div");w.className="mini";let n=0;const q=button("MOVE",()=>{n++;q.textContent=`MOVE ${n}/8`;if(n>=8){q.disabled=true;reward(100,50)}});w.append(q);b.append(w)}
function diceGame(b){const w=document.createElement("div");w.className="mini";const out=document.createElement("div");out.className="big";out.textContent="🎲";const q=button("ROLL",()=>{const a=1+Math.floor(Math.random()*6),c=1+Math.floor(Math.random()*6);out.textContent=`${a} + ${c}`;reward((a+c)*8,(a+c)*4)});w.append(out,q);b.append(w)}
function quizGame(b){const w=document.createElement("div");w.className="mini";w.innerHTML="<b>Which key interacts with an arcade machine?</b>";const c=document.createElement("div");c.className="choices";["E","Q","SPACE"].forEach(v=>{const q=button(v,()=>{if(v==="E")reward(80,40);else reward(5,2);w.innerHTML=v==="E"?"<b>Correct.</b>":"<b>Try exploring the controls.</b>"});c.append(q)});w.append(c);b.append(w)}

function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
 if(document.getElementById("gameModal").classList.contains("hidden"))move(dt);
 updateCamera(dt);
 current=nearest();const p=document.getElementById("prompt");if(current){p.style.display="flex";document.getElementById("promptText").textContent=`PLAY ${current.name}`}else p.style.display="none";
 composer.render();
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);bloom.resolution.set(innerWidth,innerHeight)});
setTimeout(()=>{const l=document.getElementById("loading");l.style.opacity=0;setTimeout(()=>l.remove(),700)},1700);
animate();

const KEY="royal21_v2";
const defaultState={name:"Royal Player",balance:10000,xp:0,level:1,wins:0,losses:0,plays:0,streak:0,bestStreak:0,achievements:[],lastBonus:null,theme:"royal",favorite:"slots"};
let state=JSON.parse(localStorage.getItem(KEY)||"null")||defaultState;
let bet=10,bj={p:[],d:[],deck:[],active:false,wager:0},roulettePick=null,dicePick=null;

const $=id=>document.getElementById(id);
const fmt=n=>Math.floor(n).toLocaleString();
function save(){localStorage.setItem(KEY,JSON.stringify(state));updateBalance()}
function updateBalance(){if($("balance"))$("balance").textContent=fmt(state.balance)}
function toast(s){const t=$("toast");t.textContent=s;t.className="show";setTimeout(()=>t.className="",2400)}
function gainXP(n){let before=state.level;state.xp+=n;state.level=1+Math.floor(state.xp/500);if(state.level>before)toast("⭐ Level "+state.level+" unlocked!");save()}
function unlock(a){if(!state.achievements.includes(a)){state.achievements.push(a);toast("🏆 "+a+" unlocked!");save()}}
function won(){state.wins++;state.plays++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);gainXP(25);if(state.wins>=1)unlock("First Win");if(state.streak>=5)unlock("Hot Streak");save()}
function lost(){state.losses++;state.plays++;state.streak=0;gainXP(8)}
function checkBet(){let b=getBet();if(!Number.isFinite(b)||b<1||b>state.balance){toast("Choose a valid virtual-chip bet.");return null}if(b>=1000)unlock("High Roller");return b}
function getBet(){const c=$("customBet");return c&&c.value?Math.floor(+c.value):bet}
function setBet(n,el){bet=n;document.querySelectorAll(".bet").forEach(x=>x.classList.remove("active"));if(el)el.classList.add("active")}
function betUI(){return `<div class="bet-row"><span class="muted">Bet</span>${[10,50,100,500,1000].map(n=>`<button class="bet ${n===10?"active":""}" onclick="setBet(${n},this)">${n}</button>`).join("")}<input id="customBet" class="bet" type="number" min="1" placeholder="Custom"></div>`}
function view(v){if(v==="lobby")lobby();if(v==="slots")slots();if(v==="blackjack")blackjack();if(v==="roulette")roulette();if(v==="dice")dice();if(v==="profile")profile()}
function daily(){
const today=new Date().toDateString();
if(state.lastBonus===today){toast("🎁 Daily bonus already claimed today.");return}
const reward=500+state.level*50;state.balance+=reward;state.lastBonus=today;gainXP(50);toast("🎁 Daily bonus: +"+fmt(reward)+" chips");save();lobby()
}
function lobby(){
document.body.dataset.theme=state.theme;
$("app").innerHTML=`<section class="hero"><div class="eyebrow">WELCOME BACK, ${state.name.toUpperCase()}</div><h1>ROYAL <span class="gold">21</span></h1><p>A polished virtual casino playground with classic games, progression, themes, achievements, and daily rewards.</p><button class="btn primary" onclick="view('slots')">🎰 PLAY NOW</button></section>
<section class="section"><div class="daily"><div><h3>🎁 Daily Bonus</h3><div class="muted">Claim ${fmt(500+state.level*50)} virtual chips once per day.</div></div><button class="btn primary" onclick="daily()">CLAIM BONUS</button></div>
<h2>Featured Games</h2><div class="games">
<div class="game-card" onclick="view('slots')"><div class="game-icon">🎰</div><h3>Royal Slots</h3><p>Multiple symbols, big multipliers, animated reels.</p><div class="play">PLAY →</div></div>
<div class="game-card" onclick="view('blackjack')"><div class="game-icon">🃏</div><h3>Blackjack</h3><p>Hit, stand, double, and chase 21.</p><div class="play">PLAY →</div></div>
<div class="game-card" onclick="view('roulette')"><div class="game-icon">🎡</div><h3>Royal Roulette</h3><p>A spinning wheel with red, black, green, and numbers.</p><div class="play">PLAY →</div></div>
<div class="game-card" onclick="view('dice')"><div class="game-icon">🎲</div><h3>Lucky Dice</h3><p>Pick high or low and roll for a quick round.</p><div class="play">PLAY →</div></div>
</div><div class="stats"><div class="stat"><strong>${fmt(state.balance)}</strong><span>CHIPS</span></div><div class="stat"><strong>${state.level}</strong><span>LEVEL</span></div><div class="stat"><strong>${state.wins}</strong><span>WINS</span></div><div class="stat"><strong>${state.bestStreak}</strong><span>BEST STREAK</span></div></div></section>
<section class="section"><h2>Quick Stats</h2><div class="dashboard"><div class="tile"><strong>${state.plays}</strong><span>ROUNDS PLAYED</span></div><div class="tile"><strong>${state.losses}</strong><span>LOSSES</span></div><div class="tile"><strong>${state.xp}</strong><span>XP</span></div><div class="tile"><strong>${state.achievements.length}/8</strong><span>ACHIEVEMENTS</span></div></div></section>`;
updateBalance()
}
function gameShell(title,sub,body){return `<div class="game-wrap"><button class="back" onclick="view('lobby')">← Back to Lobby</button><div class="game-title"><div class="eyebrow">ROYAL 21</div><h1>${title}</h1><p>${sub}</p></div>${body}</div>`}
const syms=["🍒","🍋","🔔","💎","7️⃣","⭐","🍀"];
function slots(){
$("app").innerHTML=gameShell("🎰 Royal Slots","Choose a bet and spin the reels.",`<div class="panel">${betUI()}<div class="reels"><div id="r1" class="reel">🍒</div><div id="r2" class="reel">💎</div><div id="r3" class="reel">7️⃣</div></div><div class="actions"><button class="btn primary" onclick="spin()">SPIN</button></div><div class="payouts"><span>7️⃣ 25×</span><span>💎 12×</span><span>⭐ 10×</span><span>🍀 8×</span><span>Other triple 5×</span><span>Pair 2×</span></div><div id="slotResult" class="result"></div></div>`)
}
function spin(){
let b=checkBet();if(b===null)return;state.balance-=b;lost();["r1","r2","r3"].forEach(id=>$(id).classList.add("spin"));
setTimeout(()=>{let a=[0,0,0].map(()=>syms[Math.floor(Math.random()*syms.length)]);["r1","r2","r3"].forEach((id,i)=>{$(id).textContent=a[i];$(id).classList.remove("spin")});
let mult=0;if(a.every(x=>x==="7️⃣")){mult=25;unlock("Lucky Seven")}else if(a.every(x=>x==="💎"))mult=12;else if(a.every(x=>x==="⭐"))mult=10;else if(a.every(x=>x==="🍀"))mult=8;else if(a[0]===a[1]&&a[1]===a[2])mult=5;else if(a[0]===a[1]||a[1]===a[2]||a[0]===a[2])mult=2;
const r=$("slotResult");if(mult){let p=b*mult;state.balance+=p;state.wins++;state.plays++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);gainXP(35);if(state.balance>=20000)unlock("Chip Collector");document.querySelectorAll(".reel").forEach(x=>x.classList.add("winflash"));setTimeout(()=>document.querySelectorAll(".reel").forEach(x=>x.classList.remove("winflash")),1900);r.className="result win";r.textContent=`🎉 ${a.join(" ")} — ${fmt(p)} chips (${mult}×)`}else{r.className="result lose";r.textContent=`${a.join(" ")} — No match`};save()},550)
}
function makeDeck(){let d=[];for(const s of ["♠","♥","♦","♣"])for(const r of ["A","2","3","4","5","6","7","8","9","10","J","Q","K"])d.push({s,r});return d.sort(()=>Math.random()-.5)}
function cardVal(cs){let n=0,a=0;for(const c of cs){if(c.r==="A"){n+=11;a++}else n+=["J","Q","K"].includes(c.r)?10:+c.r}while(n>21&&a){n-=10;a--}return n}
function card(c,hidden=false){return `<div class="card ${hidden?"hidden-card":(["♥","♦"].includes(c.s)?"red":"")}">${hidden?"♠":c.r+c.s}</div>`}
function blackjack(){
$("app").innerHTML=gameShell("🃏 Blackjack","Beat the dealer without going over 21.",`<div class="panel">${betUI()}<div class="hand"><h3>DEALER <span id="dv"></span></h3><div id="dealerCards" class="cards"></div></div><div class="hand"><h3>YOU <span id="pv"></span></h3><div id="playerCards" class="cards"></div></div><div class="actions"><button class="btn primary" onclick="deal()">DEAL</button><button class="btn secondary" onclick="hit()">HIT</button><button class="btn secondary" onclick="stand()">STAND</button><button class="btn secondary" onclick="dbl()">DOUBLE</button></div><div id="bjResult" class="result"></div></div>`)
}
function renderBJ(){if(!bj.p.length)return;$("playerCards").innerHTML=bj.p.map(c=>card(c)).join("");$("dealerCards").innerHTML=(bj.active?bj.d:[...bj.d]).map((c,i)=>bj.active&&i===1?card(c,true):card(c)).join("");$("pv").textContent=cardVal(bj.p);$("dv").textContent=bj.active?cardVal([bj.d[0]]):cardVal(bj.d)}
function deal(){let b=checkBet();if(b===null)return;state.balance-=b;const d=makeDeck();bj={p:[d[0],d[1]],d:[d[2],d[3]],deck:d.slice(4),active:true,wager:b};lost();renderBJ();if(cardVal(bj.p)===21)finish("blackjack")}
function hit(){if(!bj.active)return;bj.p.push(bj.deck.pop());renderBJ();if(cardVal(bj.p)>21)finish("bust")}
function stand(){if(!bj.active)return;while(cardVal(bj.d)<17)bj.d.push(bj.deck.pop());finish("stand")}
function dbl(){if(!bj.active||state.balance<bj.wager){toast("Not enough chips to double.");return}state.balance-=bj.wager;bj.wager*=2;bj.p.push(bj.deck.pop());renderBJ();if(cardVal(bj.p)<=21)stand();else finish("bust")}
function finish(type){bj.active=false;let p=cardVal(bj.p),d=cardVal(bj.d),r=$("bjResult"),msg="",good=false;if(type==="blackjack"){state.balance+=bj.wager*2.5;state.wins++;state.plays++;state.streak++;good=true;unlock("Blackjack");msg="🃏 BLACKJACK! Paid 2.5×"}else if(p>21){state.losses++;state.plays++;state.streak=0;msg="Bust — dealer wins."}else if(d>21||p>d){state.balance+=bj.wager*2;state.wins++;state.plays++;state.streak++;good=true;msg="🎉 You win!"}else if(p===d){state.balance+=bj.wager;state.plays++;msg="Push — bet returned."}else{state.losses++;state.plays++;state.streak=0;msg="Dealer wins."}gainXP(good?35:8);save();renderBJ();r.className="result "+(good?"win":"lose");r.textContent=msg}
const reds=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function roulette(){
roulettePick=null;$("app").innerHTML=gameShell("🎡 Royal Roulette","Pick a color, zero, or a number.",`<div class="panel"><div class="roulette-layout"><div class="wheel-wrap"><div class="pointer">▼</div><div id="wheel" class="wheel"><div id="wn" class="wheel-center">?</div></div></div><div>${betUI()}<div class="choice-grid"><button class="choice" onclick="pickR('red',this)">🔴 RED · 2×</button><button class="choice" onclick="pickR('black',this)">⚫ BLACK · 2×</button><button class="choice" onclick="pickR('zero',this)">🟢 ZERO · 14×</button></div><div class="number-grid">${Array.from({length:37},(_,i)=>`<button class="num" onclick="pickR(${i},this)">${i}</button>`).join("")}</div><div class="actions"><button class="btn primary" onclick="spinR()">SPIN WHEEL</button></div><div id="rr" class="result"></div></div></div></div>`)
}
function pickR(p,el){roulettePick=p;document.querySelectorAll(".choice,.num").forEach(x=>x.classList.remove("selected"));el.classList.add("selected")}
function spinR(){if(roulettePick===null){toast("Choose a roulette bet first.");return}let b=checkBet();if(b===null)return;state.balance-=b;lost();let n=Math.floor(Math.random()*37),color=n===0?"zero":reds.has(n)?"red":"black";let angle=360*5+(n*9.73);$("wheel").style.transform=`rotate(${angle}deg)`;setTimeout(()=>{ $("wn").textContent=n;let m=roulettePick===n?35:roulettePick===color?(color==="zero"?14:2):0,r=$("rr");if(m){let p=b*m;state.balance+=p;state.wins++;state.plays++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);gainXP(30);r.className="result win";r.textContent=`🎉 ${n} ${color} — +${fmt(p)} chips`}else{r.className="result lose";r.textContent=`${n} ${color} — no win`};save()},2500)}
function dice(){
dicePick=null;$("app").innerHTML=gameShell("🎲 Lucky Dice","Guess whether the roll is low or high.",`<div class="panel">${betUI()}<div id="diceFace" class="dice-face">🎲</div><div class="choice-grid"><button id="lo" class="choice" onclick="dicePick='low';this.classList.add('selected');$('hi').classList.remove('selected')">LOW · 1–3</button><button id="hi" class="choice" onclick="dicePick='high';this.classList.add('selected');$('lo').classList.remove('selected')">HIGH · 4–6</button></div><div class="actions"><button class="btn primary" onclick="roll()">ROLL</button></div><div id="dr" class="result"></div></div>`)
}
function roll(){if(!dicePick){toast("Choose high or low.");return}let b=checkBet();if(b===null)return;state.balance-=b;lost();let n=1+Math.floor(Math.random()*6),good=(dicePick==="low"&&n<=3)||(dicePick==="high"&&n>=4);$("diceFace").textContent=["⚀","⚁","⚂","⚃","⚄","⚅"][n-1];let r=$("dr");if(good){let p=Math.floor(b*1.8);state.balance+=p;state.wins++;state.plays++;state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);gainXP(20);r.className="result win";r.textContent=`🎉 ${n} — +${fmt(p)} chips`}else{r.className="result lose";r.textContent=`${n} — lost ${fmt(b)} chips`}save()}
function profile(){
let need=state.level*500,prog=Math.min(100,Math.floor((state.xp%500)/500*100));
$("app").innerHTML=gameShell("👤 Player Profile","Customize your casino identity and track your progress.",`<div class="panel"><div class="profile-head"><div class="avatar">♠</div><div style="flex:1"><h2 style="margin:0">${state.name}</h2><div class="muted">Level ${state.level} • ${state.xp}/${need} XP</div><div class="progress"><div style="width:${prog}%"></div></div></div><button class="btn secondary" onclick="editName()">EDIT NAME</button></div><div class="dashboard"><div class="tile"><strong>${fmt(state.balance)}</strong><span>CHIPS</span></div><div class="tile"><strong>${state.wins}</strong><span>WINS</span></div><div class="tile"><strong>${state.plays}</strong><span>ROUNDS</span></div><div class="tile"><strong>${state.bestStreak}</strong><span>BEST STREAK</span></div></div><h2 style="margin-top:30px">🏆 Achievements</h2><div class="achievements">${ach("First Win","Win any game","🎉",state.wins>=1)}${ach("Hot Streak","Win 5 in a row","🔥",state.bestStreak>=5)}${ach("Lucky Seven","Hit triple 7","7️⃣",state.achievements.includes("Lucky Seven"))}${ach("Blackjack","Get a natural 21","🃏",state.achievements.includes("Blackjack"))}${ach("High Roller","Bet 1,000+ chips","👑",state.achievements.includes("High Roller"))}${ach("Chip Collector","Reach 20,000 chips","💎",state.balance>=20000)}</div><h2 style="margin-top:30px">🎨 Themes</h2><div class="themes"><button class="theme ${state.theme==="royal"?"active":""}" onclick="theme('royal')">Royal Gold</button><button class="theme ${state.theme==="emerald"?"active":""}" onclick="theme('emerald')">Emerald</button><button class="theme ${state.theme==="crimson"?"active":""}" onclick="theme('crimson')">Crimson</button></div></div>`)
}
function ach(n,d,i,on){return `<div class="achievement ${on?"":"locked"}"><b>${i} ${n}</b><span>${d}${on?" • UNLOCKED":""}</span></div>`}
function editName(){const n=prompt("Casino display name:",state.name);if(n&&n.trim()){state.name=n.trim().slice(0,20);save();profile()}}
function theme(t){state.theme=t;document.body.dataset.theme=t;save();profile()}
view("lobby");

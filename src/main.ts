import './styles.css';
import { initialState, step, installMotor, transferReserve, setPressPosition, swingPickaxe } from './game/simulation';
import { PointerControls } from './input/pointerControls';
import { render } from './render/canvasRenderer';
import { MaterialTrail } from './render/materialTrail';
import { Sound } from './audio/sound';
import { load, save as saveState } from './storage/save';
import { factoryMarkup } from './ui/template';
import { tutorial } from './ui/tutorial';
import { unlocks } from './ui/unlocks';
import { BALANCE as B } from './config/balance';
import { WorkshopPanel } from './ui/workshopPanel';
import { PRESS_RECIPES, currentRecipe, selectPressRecipe, PROJECTS } from './game/workshop';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = factoryMarkup;
const el = (id: string) => document.getElementById(id)!;
const dialog = (id: string) => el(id) as HTMLDialogElement;
const canvas = document.querySelector('canvas')!;
for (const surface of [el('wheel'),el('lever'),el('route'),el('pickaxe')]) {
 surface.addEventListener('contextmenu',e=>e.preventDefault());
 surface.addEventListener('dragstart',e=>e.preventDefault());
}
let state = load();
setPressPosition(state,0);
swingPickaxe(state,0);
if(!unlocks(state).routing) { state.route = 'gears'; transferReserve(state); }
const sound = new Sound();
const materialTrail = new MaterialTrail();
let paused = false, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let debug = false, guide = true, turnKey = 0, mineImpact = 0, pendingMineTransition = false;
try { sound.muted = localStorage.getItem('crank-muted') === 'true'; } catch { /* Optional preferences. */ }

function canOperate() { return !paused; }
function turn(delta: number) {
 if (canOperate() && !state.automatic && state.active === 'furnace') state.furnace.impulse += delta;
}
function pull(position: number) {
 if (!canOperate() || state.active !== 'press' || state.workshop.beltDrive&&state.automatic) return;
 const parts = state.gears+state.springs+state.frames;
 if (setPressPosition(state, position)) sound.clank();
 if (state.gears+state.springs+state.frames > parts) {sound.ping(550);materialTrail.emit(state.pressRecipe);}
}
function returnLever() { setPressPosition(state, 0); }
function swing(position: number) {
 if(!canOperate() || state.active!=='mine') return;
 const hadFurnace = unlocks(state).furnace;
 if(swingPickaxe(state,position)) { sound.strike(); mineImpact = .4; }
 if(!hadFurnace && unlocks(state).furnace) pendingMineTransition = true;
}
function returnPickaxe() {
 swingPickaxe(state,0);
 if(pendingMineTransition) { pendingMineTransition = false; state.active = 'furnace'; }
}
const controls = new PointerControls(el('wheel'), el('route'), {
 turn,
 route: value => { if (canOperate()) state.route = value; },
 gesture: () => sound.unlock(),
 lever: pull,
 leverRelease: returnLever,
 swing,
 swingRelease: returnPickaxe,
}, el('lever'), el('pickaxe'));
const workshop = new WorkshopPanel(()=>state,()=>{sound.unlock();sound.ping(760);save();});
el('workshop-launch').onclick=()=>{releaseControls();workshop.open();};
for(const recipe of PRESS_RECIPES) el(`die-${recipe.id}`).onclick=()=>{releaseControls();if(selectPressRecipe(state,recipe.id)){sound.unlock();save();}};
function releaseControls() { turnKey = 0; controls.reset(); }
function setPaused(value: boolean) { releaseControls(); paused = value; save(); }
function save() {
 saveState(state);
 try { localStorage.setItem('crank-muted', String(sound.muted)); } catch { /* Storage may be disabled. */ }
}
function reset() {
 releaseControls(); state = initialState(); paused = false; mineImpact = 0; pendingMineTransition = false; materialTrail.clear();
 for (const id of ['results','options','workshop']) if(dialog(id).open) dialog(id).close();
 save();
}
function showTutorial() { setPaused(true); dialog('welcome').showModal(); }
function closeTutorial(skip: boolean) {
 guide = !skip; dialog('welcome').close(); paused = false;
 try { localStorage.setItem('crank-intro-mechanical-v2', 'seen'); } catch { /* Optional preferences. */ }
}
el('start-tutorial').onclick = () => closeTutorial(false);
el('skip-tutorial').onclick = () => closeTutorial(true);
dialog('welcome').addEventListener('close', () => paused = false);
el('show-tutorial').onclick = () => { dialog('options').close(); showTutorial(); };
// Machines introduce themselves through production, without an opening modal.
el('mute').onclick = () => { sound.unlock(); sound.muted = !sound.muted; save(); };
el('pause').onclick = () => setPaused(!paused);
el('install').onclick = () => {
 if (installMotor(state)) { releaseControls(); sound.ping(760); save(); }
};
el('transfer').onclick = () => transferReserve(state);
el('to-gears').onclick = () => state.route = 'gears';
el('to-reserve').onclick = () => state.route = 'reserve';
for (const machine of ['mine','furnace','press'] as const) el(machine).onclick = () => {
 releaseControls(); state.active = machine;
};
el('settings').onclick = () => { setPaused(true); dialog('options').showModal(); };
el('resume').onclick = () => dialog('options').close();
dialog('options').addEventListener('close', () => paused = false);
(el('motion') as HTMLInputElement).checked = reduced;
el('motion').onchange = () => reduced = (el('motion') as HTMLInputElement).checked;
el('debug-toggle').onchange = () => debug = (el('debug-toggle') as HTMLInputElement).checked;
el('restart').onclick = reset; el('replay').onclick = reset;
el('close-stats').onclick=()=>dialog('results').close();
el('show-stats').onclick=()=>{dialog('options').close();el('stats').textContent=`${state.gearsMade} gears, ${state.springsMade} springs and ${state.framesMade} frames made. ${PROJECTS.filter(p=>state.workshop[p.id]).length} projects built. ${state.autoOutput} automatic plates and ${state.autoParts} automatic press parts. ${Math.floor(state.elapsed/60)}m ${Math.floor(state.elapsed%60)}s elapsed.`;dialog('results').showModal();};
window.addEventListener('keydown', e => {
 if (document.querySelector('dialog[open]')) return;
 if (!canOperate() || !['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.code)) return;
 if(e.target instanceof HTMLInputElement) return;
 if(e.target instanceof HTMLButtonElement && !['wheel','lever','pickaxe'].includes(e.target.id)) return;
 e.preventDefault(); sound.unlock();
 if(state.active==='furnace') turnKey = e.code==='ArrowRight'?1:e.code==='ArrowLeft'?-1:0;
 else if(!e.repeat) {
  if(e.code==='ArrowDown') state.active==='mine'?swing(1):pull(1);
  if(e.code==='ArrowUp') state.active==='mine'?returnPickaxe():returnLever();
 }
});
window.addEventListener('keyup', e => { if(['ArrowLeft','ArrowRight'].includes(e.code)) turnKey = 0; });
window.addEventListener('blur', () => setPaused(true));
document.addEventListener('visibilitychange', () => { if(document.hidden) setPaused(true); });
function bottleneck() {
 if(state.active==='mine') return 'SWING DOWN ↓ · BREAK ORE FROM ROCK';
 if(state.active==='press') { const recipe=currentRecipe(state); return state.plates<recipe.plates?`NEEDS ${recipe.plates} PLATE${recipe.plates>1?'S':''} · ROUTE OR TRANSFER RESERVE`:state.workshop.beltDrive&&state.automatic?`BELT DRIVE → ${recipe.name.toUpperCase()} · ${Math.round(state.pressProgress*100)}%`:state.press.position>=.9?'RETURN THE LEVER · THEN PULL AGAIN':`PULL LEVER ↓ · FORM A ${recipe.name.toUpperCase()}`; }
 return !state.ore?((state.workshop.oreHoist||state.workshop.crawler&&state.crawlerJob==='haul')?'ORE DELIVERY ON THE WAY':'HOPPER EMPTY · MINE MORE ORE'):state.temperature<35?'MORE AIR → MORE HEAT · TURN BLOWER':state.temperature>80?'TOO HOT · LET THE BLOWER COAST':'FIRE IN THE BAND · SMELTING IRON';
}
function updateHud(fps: number) {
 el('gears').textContent = el('gear-count').textContent = String(state.gears);
 el('ore').textContent = String(state.ore); el('plates').textContent = String(state.plates+state.reserve);
 const unlocked = unlocks(state);
 app.classList.toggle('starting',!unlocked.press);
 const mining = state.active==='mine';
 app.classList.toggle('mining',mining); app.classList.toggle('no-routing',!unlocked.routing);
 document.querySelector('.scene')!.toggleAttribute('hidden',mining);
 el('station-tabs').hidden = !unlocked.furnace; el('press').hidden = !unlocked.press;
 el('stock-plates').hidden = !unlocked.plates; el('stock-gears').hidden = !unlocked.gears;
 el('decision-controls').hidden = !unlocked.routing || mining; el('allocation').hidden = !unlocked.routing;
 document.querySelector('.motor')!.toggleAttribute('hidden',!unlocked.motor||state.automatic);
 app.classList.toggle('has-workshop',unlocked.gears);app.classList.toggle('has-bench',state.workshop.toolBench);
 document.querySelector('.scene-label')!.textContent = unlocked.press?'ORE → HEAT → PLATES → FORCE → GEARS':'ORE HOPPER → FURNACE → IRON PLATE';
 const builds=PROJECTS.filter(p=>state.workshop[p.id]).length;
 const goalCount = mining?state.ore:unlocked.gears?builds:unlocked.press?0:state.firstPlate===null?0:1;
 const goalTotal = mining?B.miningUnlockOre:unlocked.gears?PROJECTS.length:1;
 el('gears').textContent = String(goalCount);
 el('goal-label').textContent = mining?(unlocked.furnace?' ORE':` / ${B.miningUnlockOre} ORE`):unlocked.gears?' BUILDS':unlocked.press?' / 1 GEAR':' / 1 PLATE';
 el('goal-fill').style.width = `${Math.min(1,goalCount/goalTotal)*100}%`;
 el('status').textContent = paused?'PAUSED · TAKE A BREATHER':bottleneck();
 el('live').textContent = state.automatic?'● MOTOR ONLINE':'● MANUAL';
 el('springs').textContent=String(state.springs);el('frames').textContent=String(state.frames);
 el('extra-parts').hidden=!state.workshop.toolBench;
 el('press-dies').hidden=state.active!=='press'||!state.workshop.toolBench;
 el('milestone').hidden=!state.finished;
 el('material-path').hidden=!unlocked.gears;el('material-path').textContent=`YOUR IRON: ORE → PLATE → ${currentRecipe(state).name.toUpperCase()}`;
 el('workshop-launch').hidden=!unlocked.gears;el('footer-brand').hidden=unlocked.gears;
 if(unlocked.gears)workshop.update(state);
 for(const recipe of PRESS_RECIPES)el(`die-${recipe.id}`).setAttribute('aria-pressed',String(recipe.id===state.pressRecipe));
 const feed=(state.workshop.oreHoist?B.deliveryOre:0)+(state.workshop.crawler&&state.crawlerJob==='haul'?B.crawlerOre*(state.workshop.signalMast?B.mastMultiplier:1):0);
 const summary=[feed?`Ore +${feed} / ${B.deliverySeconds}s`:null,state.automatic?'Blower auto':null,state.workshop.beltDrive?`Press ${state.automatic?'auto':'needs motor'}`:null].filter(Boolean);
 el('factory-summary').hidden=summary.length===0;el('factory-summary').textContent=summary.join(' · ');
 el('spokes').setAttribute('transform',`rotate(${state.furnace.angle*180/Math.PI} 90 90)`);
 el('control-fan').setAttribute('transform',`rotate(${state.furnace.angle*360/Math.PI} 145 51)`);
 const poweredPress=state.workshop.beltDrive&&state.automatic;
 const pose=poweredPress?(reduced?0:.5-.5*Math.cos(state.pressProgress*Math.PI*2)):state.press.position;
 el('lever-arm').setAttribute('transform',`rotate(${pose*85} 104 68)`);
 el('lever-ram').setAttribute('transform',`translate(0 ${pose*22})`);
 el('lever-link').setAttribute('d',`M68 ${80+pose*22}L104 68`);
 const swingPose = Math.max(state.mine.position,Math.min(1,mineImpact/.18));
 el('pickaxe-tool').setAttribute('transform',`rotate(${-55*swingPose} 228 226)`);
 el('mining-impact').setAttribute('opacity',String(mineImpact/.4));
 el('mining-impact').setAttribute('transform',`translate(0 ${-10*(1-mineImpact/.4)})`);
 el('rock-cracks').setAttribute('opacity',String(Math.min(1,state.mine.strikes/3)));
 el('press-stock').style.opacity = state.plates>=currentRecipe(state).plates?'1':'.2';
 const pressActive = state.active==='press';
 document.querySelector('.machine-panel')!.toggleAttribute('hidden',pressActive&&poweredPress);
 app.classList.toggle('press-automated',pressActive&&poweredPress);
 el('lever').classList.toggle('is-automatic',poweredPress);
 el('lever').setAttribute('aria-disabled',String(poweredPress));
 el('lever').setAttribute('aria-label',poweredPress?`Automatic ${currentRecipe(state).name.toLowerCase()} press. The belt drives the ram; choose a die to change output.`:`${currentRecipe(state).name} press lever. Drag down to shape plates. Release to return. Down Arrow pulls; Up Arrow returns.`);
 el('pickaxe').hidden = !mining; el('wheel').hidden = pressActive || mining; el('lever').hidden = !pressActive || mining;
 el('mechanism-label').textContent = mining?'THE MINE / IRON SEAM':pressActive?`${currentRecipe(state).name.toUpperCase()} DIE / ${poweredPress?'BELT DRIVEN':'RAM & DIE'}`:'FURNACE / BLOWER DRIVE';
 el('wheel-caption').textContent = mining?'SWING ↓ → BREAK ROCK → COLLECT ORE':pressActive?(poweredPress?'BELT → RAM → PARTS · HANDS FREE':'PULL ↓ → FORCE → SHAPED METAL'):state.automatic?'MOTOR → AIR → STEADY FIRE':'TURN ↻ → AIR → HOTTER FIRE';
 el('wheel').setAttribute('aria-disabled',String(state.automatic));
 el('to-gears').classList.toggle('selected',state.route==='gears');
 el('to-reserve').classList.toggle('selected',state.route==='reserve');
 el('mine').classList.toggle('active',mining); el('furnace').classList.toggle('active',!pressActive&&!mining); el('press').classList.toggle('active',pressActive);
 el('transfer').textContent = `Reserve: ${state.reserve} · send to press ↗`;
 (el('install') as HTMLButtonElement).disabled = !state.kit||state.automatic;
 el('motor-label').innerHTML = state.automatic?'⚡ <b>THE MOTOR DRIVES YOUR BLOWER</b><br>Air keeps feeding the fire. Hands free.':state.kit?'⚡ <b>YOUR MOTOR KIT IS READY</b><br>Install it on the blower drive.':`⚡ <b>THE FIRST UPGRADE</b><br>${state.gearsMade} / 3 gears made to earn a motor kit.`;
 const instruction = tutorial(state);
 el('next-action').textContent = guide?instruction.action:'From ore to more.';
 el('hint').textContent = guide?instruction.hint:'Make parts. Choose a project. Build a factory that works for you.';
 el('hint-icon').textContent = pressActive||mining?'↓':'↻';
 document.querySelector('.mission small')!.textContent = guide?instruction.stage:'YOUR FIRST PRODUCTION LINE';
 el('pause').textContent = paused?'▶':'Ⅱ'; el('pause').setAttribute('aria-label',paused?'Resume':'Pause');
 el('mute').textContent = sound.muted?'♩':'♪'; el('mute').setAttribute('aria-pressed',String(sound.muted));
 el('debug').style.display = debug?'block':'none';
 el('debug').textContent = `${fps.toFixed(0)} FPS · ${(1000/fps).toFixed(1)} ms · pointers ${controls.activePointers}\nblower ${state.furnace.speed.toFixed(1)} rad/s · ${Math.round(state.temperature)}°\nlever ${state.press.position.toFixed(2)} · strokes ${state.press.strokes}\nsmelt ${state.furnaceProgress.toFixed(2)} / press ${state.pressProgress.toFixed(2)}\n${bottleneck()}`;
}
let last = performance.now(), accumulator = 0, saveTimer = 0, fps = 60;
function frame(now: number) {
 const delta = Math.min((now-last)/1000,.1); last = now; fps = .95*fps+.05/(delta||.016);
 if(!paused) {
  mineImpact = Math.max(0,mineImpact-delta);materialTrail.update(delta);
  accumulator += delta;
  while(accumulator>=1/60) {
   if(turnKey) turn(turnKey*.09);
   const plates = state.plates+state.reserve;
   const parts=state.gears+state.springs+state.frames;
   const hadPress = unlocks(state).press;
   step(state,1/60);
   if(state.plates+state.reserve>plates) {sound.ping(300);materialTrail.emit('plate');}
   if(state.gears+state.springs+state.frames>parts){sound.ping(550);materialTrail.emit(state.pressRecipe);}
   if(!hadPress&&unlocks(state).press) { releaseControls(); state.active = 'press'; }
   accumulator -= 1/60;
  }
  saveTimer += delta; if(saveTimer>2) { save(); saveTimer = 0; }
 } else accumulator = 0;
 sound.update(state.furnace.speed,paused);
 if(state.active!=='mine') {render(canvas,state,reduced);materialTrail.draw(canvas,reduced);} updateHud(fps);
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

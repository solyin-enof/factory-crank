import './styles.css';
import { initialState, step, installMotor, transferReserve, setPressPosition } from './game/simulation';
import { PointerControls } from './input/pointerControls';
import { render } from './render/canvasRenderer';
import { Sound } from './audio/sound';
import { load, save as saveState } from './storage/save';
import { factoryMarkup } from './ui/template';
import { tutorial } from './ui/tutorial';
import { unlocks } from './ui/unlocks';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = factoryMarkup;
const el = (id: string) => document.getElementById(id)!;
const dialog = (id: string) => el(id) as HTMLDialogElement;
const canvas = document.querySelector('canvas')!;
for (const surface of [el('wheel'),el('lever'),el('route')]) {
 surface.addEventListener('contextmenu',e=>e.preventDefault());
 surface.addEventListener('dragstart',e=>e.preventDefault());
}
let state = load();
setPressPosition(state,0);
if(!unlocks(state).routing) { state.route = 'gears'; transferReserve(state); }
const sound = new Sound();
let paused = false, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let debug = false, guide = true, turnKey = 0;
try { sound.muted = localStorage.getItem('crank-muted') === 'true'; } catch { /* Optional preferences. */ }

function canOperate() { return !paused && !state.finished; }
function turn(delta: number) {
 if (canOperate() && !state.automatic && state.active === 'furnace') state.furnace.impulse += delta;
}
function pull(position: number) {
 if (!canOperate() || state.active !== 'press') return;
 const gears = state.gears;
 if (setPressPosition(state, position)) sound.clank();
 if (state.gears > gears) sound.ping(550);
}
function returnLever() { setPressPosition(state, 0); }
const controls = new PointerControls(el('wheel'), el('route'), {
 turn,
 route: value => { if (canOperate()) state.route = value; },
 gesture: () => sound.unlock(),
 lever: pull,
 leverRelease: returnLever,
}, el('lever'));
function releaseControls() { turnKey = 0; controls.reset(); }
function setPaused(value: boolean) { releaseControls(); paused = value; save(); }
function save() {
 saveState(state);
 try { localStorage.setItem('crank-muted', String(sound.muted)); } catch { /* Storage may be disabled. */ }
}
function reset() {
 releaseControls(); state = initialState(); paused = false;
 for (const id of ['results','options']) if(dialog(id).open) dialog(id).close();
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
for (const machine of ['furnace','press'] as const) el(machine).onclick = () => {
 releaseControls(); state.active = machine;
};
el('settings').onclick = () => { setPaused(true); dialog('options').showModal(); };
el('resume').onclick = () => dialog('options').close();
dialog('options').addEventListener('close', () => paused = false);
(el('motion') as HTMLInputElement).checked = reduced;
el('motion').onchange = () => reduced = (el('motion') as HTMLInputElement).checked;
el('debug-toggle').onchange = () => debug = (el('debug-toggle') as HTMLInputElement).checked;
el('restart').onclick = reset; el('replay').onclick = reset;
window.addEventListener('keydown', e => {
 if (!canOperate() || !['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.code)) return;
 if(e.target instanceof HTMLInputElement) return;
 if(e.target instanceof HTMLButtonElement && !['wheel','lever'].includes(e.target.id)) return;
 e.preventDefault(); sound.unlock();
 if(state.active==='furnace') turnKey = e.code==='ArrowRight'?1:e.code==='ArrowLeft'?-1:0;
 else if(!e.repeat) {
  if(e.code==='ArrowDown') pull(1);
  if(e.code==='ArrowUp') returnLever();
 }
});
window.addEventListener('keyup', e => { if(['ArrowLeft','ArrowRight'].includes(e.code)) turnKey = 0; });
window.addEventListener('blur', () => setPaused(true));
document.addEventListener('visibilitychange', () => { if(document.hidden) setPaused(true); });
function bottleneck() {
 if(state.active==='press') return state.plates<2?'NEEDS 2 PLATES · ROUTE OR TRANSFER RESERVE':state.press.position>=.9?'RETURN THE LEVER · THEN PULL AGAIN':'PULL LEVER ↓ · RAM COMPRESSES PLATES';
 return !state.ore?'ORE DELIVERY ON THE WAY':state.temperature<35?'MORE AIR → MORE HEAT · TURN BLOWER':state.temperature>80?'TOO HOT · LET THE BLOWER COAST':'FIRE IN THE BAND · SMELTING IRON';
}
function updateHud(fps: number) {
 el('gears').textContent = el('gear-count').textContent = String(state.gears);
 el('ore').textContent = String(state.ore); el('plates').textContent = String(state.plates+state.reserve);
 const unlocked = unlocks(state);
 app.classList.toggle('starting',!unlocked.press);
 el('stock-plates').hidden = !unlocked.plates; el('stock-gears').hidden = !unlocked.gears;
 el('decision-controls').hidden = !unlocked.press; el('allocation').hidden = !unlocked.routing;
 document.querySelector('.motor')!.toggleAttribute('hidden',!unlocked.motor);
 document.querySelector('.scene-label')!.textContent = unlocked.press?'ORE → HEAT → PLATES → FORCE → GEARS':'ORE HOPPER → FURNACE → IRON PLATE';
 const goalCount = unlocked.gears?state.gears:unlocked.press?0:state.firstPlate===null?0:1;
 const goalTotal = unlocked.gears?8:1;
 el('gears').textContent = String(goalCount);
 el('goal-label').textContent = unlocked.gears?' / 8 GEARS':unlocked.press?' / 1 GEAR':' / 1 PLATE';
 el('goal-fill').style.width = `${goalCount/goalTotal*100}%`;
 el('status').textContent = paused?'PAUSED · TAKE A BREATHER':bottleneck();
 el('live').textContent = state.automatic?'● MOTOR ONLINE':'● MANUAL';
 el('spokes').setAttribute('transform',`rotate(${state.furnace.angle*180/Math.PI} 90 90)`);
 el('control-fan').setAttribute('transform',`rotate(${state.furnace.angle*360/Math.PI} 145 51)`);
 el('lever-arm').setAttribute('transform',`rotate(${state.press.position*85} 104 68)`);
 el('lever-ram').setAttribute('transform',`translate(0 ${state.press.position*22})`);
 el('lever-link').setAttribute('d',`M68 ${80+state.press.position*22}L104 68`);
 el('press-stock').style.opacity = state.plates>=2?'1':'.2';
 const pressActive = state.active==='press';
 el('wheel').hidden = pressActive; el('lever').hidden = !pressActive;
 el('mechanism-label').textContent = pressActive?'GEAR PRESS / RAM & DIE':'FURNACE / BLOWER DRIVE';
 el('wheel-caption').textContent = pressActive?'PULL ↓ → FORCE → SHAPED METAL':state.automatic?'MOTOR → AIR → STEADY FIRE':'TURN ↻ → AIR → HOTTER FIRE';
 el('wheel').setAttribute('aria-disabled',String(state.automatic));
 el('to-gears').classList.toggle('selected',state.route==='gears');
 el('to-reserve').classList.toggle('selected',state.route==='reserve');
 el('furnace').classList.toggle('active',!pressActive); el('press').classList.toggle('active',pressActive);
 el('transfer').textContent = `Reserve: ${state.reserve} · send to press ↗`;
 (el('install') as HTMLButtonElement).disabled = !state.kit||state.automatic;
 el('motor-label').innerHTML = state.automatic?'⚡ <b>THE MOTOR DRIVES YOUR BLOWER</b><br>Air keeps feeding the fire. Hands free.':state.kit?'⚡ <b>YOUR MOTOR KIT IS READY</b><br>Install it on the blower drive.':`⚡ <b>THE FIRST UPGRADE</b><br>${state.gears} / 3 gears to earn a motor kit.`;
 const instruction = tutorial(state);
 el('next-action').textContent = guide?instruction.action:'From ore to more.';
 el('hint').textContent = guide?instruction.hint:'Turn the furnace blower. Pull the press lever. Make 8 gears.';
 el('hint-icon').textContent = pressActive?'↓':'↻';
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
  accumulator += delta;
  while(accumulator>=1/60) {
   if(turnKey) turn(turnKey*.09);
   const plates = state.plates+state.reserve;
   const hadPress = unlocks(state).press;
   step(state,1/60);
   if(state.plates+state.reserve>plates) sound.ping(300);
   if(!hadPress&&unlocks(state).press) { releaseControls(); state.active = 'press'; }
   accumulator -= 1/60;
  }
  saveTimer += delta; if(saveTimer>2) { save(); saveTimer = 0; }
 } else accumulator = 0;
 sound.update(state.furnace.speed,paused||state.finished);
 render(canvas,state,reduced); updateHud(fps);
 if(state.finished&&!dialog('results').open) {
  el('stats').textContent = `8 gears. One little factory. ${Math.floor(state.elapsed/60)}m ${Math.floor(state.elapsed%60)}s elapsed · ${state.manualTime.toFixed(1)}s manual input · ${state.autoOutput} plates made automatically.`;
  dialog('results').showModal(); save();
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

import { describe,it,expect } from 'vitest';
import { initialState,step,swingPickaxe,setPressPosition,installMotor,type State } from '../src/game/simulation';
import { buildProject,projectStatus,selectPressRecipe,setCrawlerJob,PROJECTS,currentRecipe } from '../src/game/workshop';
import { smelt,pressGear,pressPart } from '../src/game/recipes';
import { updateProgression } from '../src/game/progression';
import { BALANCE as B } from '../src/config/balance';
const mass=(s:State)=>s.ore+s.plates+s.reserve+2*s.gears+s.springs+3*s.frames+s.materialSpent;
const conserve=(s:State)=>expect(mass(s)).toBe(s.minedOre+s.deliveredOre);
const tick=(s:State,seconds:number)=>{for(let i=0;i<seconds*60;i++)step(s,1/60);};
function stock(){
 const s=initialState();
 for(let i=0;i<150;i++){swingPickaxe(s,0);swingPickaxe(s,1);}
 for(let i=0;i<250;i++)smelt(s);
 for(let i=0;i<30;i++)pressGear(s);
 updateProgression(s);
 return s;
}
describe('workshop',()=>{
 it('offers two competing first-gear purchases and spends reserve plates first',()=>{
  const s=initialState();
  for(let i=0;i<2;i++){swingPickaxe(s,0);swingPickaxe(s,1);}
  for(let i=0;i<4;i++)smelt(s);
  pressGear(s);s.reserve=s.plates;s.plates=0;
  expect(projectStatus(s,'oreHoist').canBuild).toBe(true);
  expect(projectStatus(s,'toolBench').canBuild).toBe(true);
  expect(buildProject(s,'oreHoist')).toBe(true);
  expect(s.reserve).toBe(0);expect(s.gears).toBe(0);
  expect(s.gearsMade).toBe(1);expect(s.materialSpent).toBe(4);
  const snapshot=structuredClone(s);
  expect(buildProject(s,'toolBench')).toBe(false);
  expect(buildProject(s,'oreHoist')).toBe(false);
  expect(s).toEqual(snapshot);conserve(s);
  // Spending the first gear cannot postpone the motor's lifetime milestone.
  for(let i=0;i<2;i++){swingPickaxe(s,0);swingPickaxe(s,1);}
  for(let i=0;i<4;i++)smelt(s);
  pressGear(s);pressGear(s);updateProgression(s);
  expect(s.gears).toBe(2);expect(s.kit).toBe(1);conserve(s);
 });
 it('checks complete ingredients for every die and resets work when switching',()=>{
  const s=stock();
  expect(selectPressRecipe(s,'spring')).toBe(false);
  expect(buildProject(s,'toolBench')).toBe(true);
  for(const id of ['spring','frame'] as const){
   selectPressRecipe(s,id);
   const recipe=currentRecipe(s);
   const snapshot=structuredClone(s);s.plates=recipe.plates-1;
   const before=structuredClone(s);
   expect(pressPart(s)).toBe(false);expect(s).toEqual(before);
   Object.assign(s,snapshot);
   for(let i=0;i<recipe.strokes;i++){setPressPosition(s,0);setPressPosition(s,1);}
   expect(id==='spring'?s.springsMade:s.framesMade).toBe(1);conserve(s);
  }
  s.pressProgress=0.5;selectPressRecipe(s,'gear');expect(s.pressProgress).toBe(0);
 });
 it('automates unattended, starves atomically and recovers when inputs arrive',()=>{
  const s=stock();installMotor(s);buildProject(s,'beltDrive');
  s.reserve+=s.plates;s.plates=0;s.route='reserve';
  const parts=s.gearsMade;
  tick(s,60);expect(s.gearsMade).toBe(parts);expect(s.pressProgress).toBe(0);
  // Supply is still absent despite the motor: the hoist is a separate purchase.
  expect(s.deliveredOre).toBe(0);
  s.plates=s.reserve;s.reserve=0;
  tick(s,25);expect(s.gearsMade).toBeGreaterThan(parts);expect(s.autoParts).toBeGreaterThan(0);conserve(s);
 });
 it('gives independent hoist and crawler supply and strengthens both crawler jobs',()=>{
  const s=stock();buildProject(s,'toolBench');
  selectPressRecipe(s,'spring');pressPart(s);pressPart(s);
  selectPressRecipe(s,'frame');for(let i=0;i<5;i++)pressPart(s);
  expect(buildProject(s,'crawler')).toBe(true);
  expect(s.automatic).toBe(false);expect(s.workshop.oreHoist).toBe(false);
  tick(s,12.1);expect(s.deliveredOre).toBe(2);conserve(s);
  setCrawlerJob(s,'tend');const supplied=s.deliveredOre;tick(s,12);expect(s.deliveredOre).toBe(supplied);
  selectPressRecipe(s,'spring');for(let i=0;i<3;i++)pressPart(s);
  expect(buildProject(s,'signalMast')).toBe(true);
  setCrawlerJob(s,'haul');tick(s,12);expect(s.deliveredOre-supplied).toBe(3);conserve(s);
  expect(s.finished).toBe(true);const elapsed=s.elapsed;tick(s,1);expect(s.elapsed).toBeGreaterThan(elapsed);
  const ore=s.ore;swingPickaxe(s,0);expect(swingPickaxe(s,1)).toBe(true);expect(s.ore).toBe(ore+2);
 });
 it('applies the thermal jacket and stronger tending to smelting work',()=>{
  const base=stock();installMotor(base);base.temperature=55;
  const work=(s:State)=>s.plates+s.reserve+s.furnaceProgress;
  const starting=work(base);
  const normal=structuredClone(base), tender=structuredClone(base), upgraded=structuredClone(base), jacket=structuredClone(base);
  tender.workshop.crawler=true;tender.crawlerJob='tend';
  upgraded.workshop.crawler=true;upgraded.workshop.signalMast=true;upgraded.crawlerJob='tend';
  jacket.workshop.thermalJacket=true;
  for(const s of [normal,tender,upgraded,jacket]){tick(s,7);conserve(s);}
  expect(work(normal)-starting).toBeCloseTo(7/5,8);
  expect(work(tender)-starting).toBeCloseTo(7/5*1.5,8);
  expect(work(upgraded)-starting).toBeCloseTo(7/5*1.75,8);
  expect(work(jacket)-starting).toBeCloseTo(7/3.5,8);
 });
 it('completes every project through mining, cranking and press input, then continues',()=>{
  const s=initialState();let frame=0;
  function until(predicate:()=>boolean){
   for(let limit=0;!predicate()&&limit<180000;limit++,frame++){
    const target=Math.max(0,Math.min(B.maxSpeed,(B.cooling+(55-s.temperature)*0.7)/B.heating*B.maxSpeed));
    if(s.ore<2&&frame%90===0){swingPickaxe(s,0);swingPickaxe(s,1);}
    else if(!s.automatic&&s.furnace.speed<target-1)s.furnace.impulse+=0.2;
    else if(frame%90===0){setPressPosition(s,0);setPressPosition(s,1);}
    step(s,1/60);if(s.kit>0)installMotor(s);conserve(s);
   }
   expect(predicate()).toBe(true);
  }
  const craft=(id:Parameters<typeof buildProject>[1])=>{until(()=>projectStatus(s,id).canBuild);expect(buildProject(s,id)).toBe(true);conserve(s);};
  craft('toolBench');craft('oreHoist');craft('beltDrive');
  selectPressRecipe(s,'spring');until(()=>s.springs>=2);
  selectPressRecipe(s,'frame');until(()=>s.frames>=1);
  selectPressRecipe(s,'gear');craft('crawler');
  selectPressRecipe(s,'frame');until(()=>s.frames>=2);
  selectPressRecipe(s,'gear');craft('thermalJacket');
  selectPressRecipe(s,'frame');until(()=>s.frames>=2);
  selectPressRecipe(s,'spring');until(()=>s.springs>=3);
  selectPressRecipe(s,'gear');craft('signalMast');
  expect(PROJECTS.every(p=>s.workshop[p.id])).toBe(true);
  expect(s.finished).toBe(true);expect(s.autoParts).toBeGreaterThan(0);
  const produced=s.gearsMade;tick(s,60);expect(s.gearsMade).toBeGreaterThan(produced);conserve(s);
  console.info('Full workshop input-driven completion seconds',s.elapsed-60);
 });
});

import type { State, ProjectId, PressRecipe } from './types';
export type { ProjectId, PressRecipe } from './types';
type Costs = {gears?:number;plates?:number;springs?:number;frames?:number};
export const PRESS_RECIPES: {id:PressRecipe;name:string;plates:number;strokes:number;seconds:number}[] = [
 {id:'gear',name:'Gear',plates:2,strokes:3,seconds:12},
 {id:'spring',name:'Spring',plates:1,strokes:2,seconds:8},
 {id:'frame',name:'Frame',plates:3,strokes:4,seconds:16},
];
export const PROJECTS: {id:ProjectId;name:string;description:string;costs:Costs}[] = [
 {id:'oreHoist',name:'Ore hoist',description:'Delivers 2 ore every 12 seconds.',costs:{gears:1,plates:2}},
 {id:'toolBench',name:'Tool bench',description:'Unlocks spring and frame press dies.',costs:{gears:1,plates:2}},
 {id:'beltDrive',name:'Belt drive',description:'Runs the selected press die automatically.',costs:{gears:2,plates:2}},
 {id:'crawler',name:'Crawler',description:'Assign to haul ore or tend the furnace.',costs:{gears:2,springs:2,frames:1}},
 {id:'thermalJacket',name:'Thermal jacket',description:'Reduces smelting cycles to 3.5 seconds.',costs:{gears:2,frames:2}},
 {id:'signalMast',name:'Signal mast',description:'Completes the workshop and improves crawler assistance.',costs:{gears:4,frames:2,springs:3}},
];
export function currentRecipe(s:State) { return PRESS_RECIPES.find(r=>r.id===s.pressRecipe)!; }
export function projectStatus(s:State,id:ProjectId) {
 const project=PROJECTS.find(p=>p.id===id)!;
 const unlocked= id==='oreHoist'||id==='toolBench' ? s.gearsMade>=1 : id==='beltDrive' ? s.automatic : id==='crawler' ? s.workshop.toolBench&&s.springsMade>=1&&s.framesMade>=1 : id==='thermalJacket' ? s.workshop.oreHoist&&s.workshop.toolBench&&s.framesMade>=1 : s.workshop.crawler;
 const missing=Object.entries(project.costs).flatMap(([key,n])=>{
  const have=key==='plates'?s.plates+s.reserve:s[key as 'gears'|'springs'|'frames'];
  return have<n?[`${n-have} ${key}`]:[];
 });
 return {unlocked,built:s.workshop[id],canBuild:unlocked&&!s.workshop[id]&&missing.length===0,missing};
}
export function buildProject(s:State,id:ProjectId):boolean {
 if(!projectStatus(s,id).canBuild)return false;
 const costs=PROJECTS.find(p=>p.id===id)!.costs;
 for(const [key,n] of Object.entries(costs)){
  if(key==='plates'){const reserve=Math.min(s.reserve,n);s.reserve-=reserve;s.plates-=n-reserve;}
  else s[key as 'gears'|'springs'|'frames']-=n;
  s.materialSpent+=n*(key==='gears'?2:key==='frames'?3:1);
 }
 s.workshop[id]=true;
 if(id==='signalMast')s.finished=true;
 return true;
}
export function selectPressRecipe(s:State,id:PressRecipe):boolean {
 if(!PRESS_RECIPES.some(r=>r.id===id)||(id!=='gear'&&!s.workshop.toolBench))return false;
 if(s.pressRecipe!==id){s.pressRecipe=id;s.pressProgress=0;}
 return true;
}
export function setCrawlerJob(s:State,job:'haul'|'tend'):boolean {
 if(!s.workshop.crawler||!['haul','tend'].includes(job))return false;
 s.crawlerJob=job;return true;
}

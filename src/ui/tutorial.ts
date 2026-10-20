import type { State } from '../game/simulation';
import { currentRecipe } from '../game/workshop';
export type Guide = { stage: string; action: string; hint: string };
export function tutorial(s: State): Guide {
 const recipe=currentRecipe(s);
 const supplied=s.workshop.oreHoist||s.workshop.crawler&&s.crawlerJob==='haul';
 if(s.active==='mine') return {stage:'ROCK → ORE',action:'Mine some iron.',hint:s.workshop.oreHoist?'The hoist brings ore while you work. Swing for an extra batch.':'Swipe the pickaxe down into the seam. Each full swing breaks out two ore.'};
 if(s.kit) return {stage:'YOUR FIRST MOTOR',action:'Let the motor take over.',hint:'Install motor. It drives the blower and unlocks a belt drive for the press.'};
 if(s.temperature>80&&!s.automatic) return {stage:'FURNACE / TOO HOT',action:'Let the fire cool.',hint:'Stop turning. Less air cools the fire; nothing is lost.'};
 if(s.ore===0&&!supplied&&s.plates<recipe.plates) return {stage:'SUPPLY / EMPTY HOPPER',action:'Mine some more iron.',hint:'The blower keeps the fire hot, but cannot make ore. Visit Mine, or build an ore hoist in Workshop.'};
 if(s.ore===0&&!s.automatic&&s.active==='furnace') return {stage:'FURNACE / EMPTY HOPPER',action:'The fire needs ore.',hint:s.workshop.oreHoist?'The hoist is bringing more ore. Or visit the mine for an extra batch.':'Select Mine to refill the hopper. An ore hoist can take over this job.'};
 if(s.gearsMade>=1&&!Object.values(s.workshop).some(Boolean)) return {stage:'YOUR FIRST GEAR / NEW POSSIBILITIES',action:'Choose what to build.',hint:'Open Workshop below. An ore hoist frees your hands; a tool bench opens new products.'};
 if(s.reserve>=recipe.plates&&s.plates<recipe.plates&&s.active==='press') return {stage:'PRESS / WAITING FOR METAL',action:'Your plates are reserved.',hint:'Send reserve plates to the press, or save them for a workshop project.'};
 if(s.active==='press') {
  if(s.plates<recipe.plates)return {stage:'PRESS / WAITING FOR METAL',action:`${recipe.name} needs ${recipe.plates} plate${recipe.plates>1?'s':''}.`,hint:s.automatic?'Keep new plates routed to the press, or change the die to make another part.':'Heat more iron at the furnace. Reserve plates stay safe for building projects.'};
  if(s.workshop.beltDrive&&s.automatic)return {stage:'PRESS / AUTOMATIC',action:`Making ${recipe.name.toLowerCase()}s. Hands free.`,hint:'Choose a die to make different parts. Route plates to Reserve when you want to save them for a project.'};
  return {stage:`PRESS / ${recipe.name.toUpperCase()} DIE`,action:'Pull the lever down.',hint:`The die shapes ${recipe.name.toLowerCase()}s. Release and pull again: ${Math.min(recipe.strokes-1,Math.floor(s.pressProgress*recipe.strokes+1e-6))}/${recipe.strokes} pulls.`};
 }
 if(s.automatic)return {stage:'FURNACE / AUTOMATIC',action:'The blower runs itself.',hint:s.workshop.beltDrive?'Your press is automated too. Open Workshop and choose your next build.':'Make parts at the press, or build a belt drive to automate it.'};
 if(s.plates>=2)return {stage:'TWO PLATES READY',action:'Try the press.',hint:'Select Gear press and pull its handle. Gears open the workshop.'};
 if(s.firstPlate!==null)return {stage:'ORE → IRON',action:'Keep the fire breathing.',hint:'Turn the blower to smelt plates. Plates feed both the press and your workshop.'};
 return {stage:'ORE → IRON',action:'Give the fire some air.',hint:'Drag the gold handle clockwise ↻. The wheel drives air into the fire.'};
}

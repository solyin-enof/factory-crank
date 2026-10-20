import type { State } from '../game/simulation';
export type Guide = { stage: string; action: string; hint: string };
export function tutorial(s: State): Guide {
 if(s.active==='mine') return {stage:'ROCK → ORE',action:'Mine some iron.',hint:'Swipe the pickaxe down into the seam. Each full swing breaks out two ore.'};
 if(s.temperature>80&&!s.automatic) return {stage:'FURNACE / TOO HOT',action:'Let the fire cool.',hint:'Stop turning. Less air cools the fire; nothing is lost.'};
 if(s.ore===0&&!s.automatic&&s.active==='furnace') return {stage:'FURNACE / EMPTY HOPPER',action:'The fire needs ore.',hint:'Select Mine and swing your pickaxe to refill the hopper.'};
 if(s.reserve>=2&&s.plates<2) return {stage:'PRESS / WAITING FOR METAL',action:'Send plates to the press.',hint:'Tap Reserve: send to press. Two plates feed the die.'};
 if(s.kit) return {stage:'YOUR FIRST MOTOR',action:'Let the motor take over.',hint:'Install motor: it turns the furnace blower for you.'};
 if(s.active==='press') return s.plates<2
  ? {stage:'PRESS / WAITING FOR METAL',action:s.automatic?'More plates are on the way.':'The press needs iron.',hint:s.automatic?'The motor keeps the furnace hot. Wait for two plates.':'Select Furnace. Turn its blower to smelt two more plates.'}
  : {stage:'GEAR PRESS / RAM & DIE',action:'Pull the lever down.',hint:`Drag the gold grip down to squeeze the plates. Release, then pull again. ${Math.min(2,Math.floor(s.pressProgress*3+1e-6))}/3 pulls.`};
 if(s.automatic) return {stage:'FURNACE / AUTOMATIC',action:'The blower runs itself.',hint:'Select Gear press. Your hands are free to operate its lever.'};
 if(s.plates>=2) return {stage:'TWO PLATES READY',action:'Try the gear press.',hint:'Select Gear press and pull its handle down. The ram shapes the metal.'};
 if(s.firstPlate!==null) return {stage:'ORE → IRON',action:s.gears?'Feed the fire.':'You made an iron plate.',hint:s.gears?'Turn the blower to smelt more plates for the press.':'Keep the fire warm. Two plates will unlock the gear press.'};
 return {stage:'ORE → IRON',action:'Give the fire some air.',hint:'Drag the gold handle clockwise ↻. The wheel drives air into the fire.'};
}

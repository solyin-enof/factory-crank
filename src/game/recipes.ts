import { currentRecipe } from './workshop';
import type { State } from './types';
/** Complete recipes atomically: nothing is deducted until all ingredients exist. */
export function smelt(state: State): boolean {
  if (state.ore < 1) return false;
  state.ore -= 1;
  if (state.route === 'reserve') state.reserve += 1;
  else state.plates += 1;
  if (state.automatic) state.autoOutput += 1;
  state.firstPlate ??= state.elapsed;
  return true;
}
export function pressGear(state: State): boolean {
  if (state.plates < 2) return false;
  state.plates -= 2;
  state.gears += 1;
  state.gearsMade += 1;
  state.firstGear ??= state.elapsed;
  return true;
}
export function transferReserve(state: State): void {
  state.plates += state.reserve;
  state.reserve = 0;
}

export function pressPart(state:State):boolean {
 const recipe=currentRecipe(state);
 if(state.plates<recipe.plates)return false;
 if(recipe.id==='gear')return pressGear(state);
 state.plates-=recipe.plates;
 if(recipe.id==='spring'){state.springs++;state.springsMade++;}
 else {state.frames++;state.framesMade++;}
 return true;
}

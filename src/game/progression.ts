import { BALANCE } from '../config/balance';
import type { State } from './types';
export function updateProgression(state: State): void {
  if (!state.rewarded && state.gears >= BALANCE.motorGears) {
    state.rewarded = true;
    state.kit += 1;
  }
  state.finished = state.gears >= BALANCE.goalGears;
}
export function installMotor(state: State): boolean {
  if (state.automatic || state.kit < 1) return false;
  state.kit -= 1;
  state.automatic = true;
  state.motorAt = state.elapsed;
  state.active = 'press';
  return true;
}

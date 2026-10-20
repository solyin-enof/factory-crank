import { BALANCE as B } from '../config/balance';
import type { State, Wheel } from './types';
import { smelt, pressGear } from './recipes';
import { updateProgression } from './progression';
export type { State, Wheel, Lever, Machine } from './types';
export { initialState } from './initialState';
export { installMotor } from './progression';
export { transferReserve } from './recipes';

export function advanceWheel(wheel: Wheel, dt: number): void {
  wheel.speed = Math.max(0, Math.min(B.maxSpeed, wheel.speed + wheel.impulse * B.impulseGain));
  wheel.impulse = 0;
  wheel.speed = Math.max(0, wheel.speed * Math.exp(-B.drag * dt) - B.load * dt);
  wheel.angle = (wheel.angle + wheel.speed * dt) % (Math.PI * 2);
}
/** Mutates one deterministic fixed step. Caller owns the accumulator and pause state. */
export function step(state: State, dt: number): void {
  if (state.finished || !Number.isFinite(dt) || dt <= 0) return;
  dt = Math.min(dt, 0.1);
  state.elapsed += dt;
  if (Math.abs(state.furnace.impulse) > 0) state.manualTime += dt;
  advanceWheel(state.furnace, dt);
  if (state.automatic) {
    // Proportional blower regulation holds a stable temperature near 55 degrees.
    state.furnace.speed = Math.max(0, Math.min(B.maxSpeed, (B.cooling + (55 - state.temperature) * 0.7) / B.heating * B.maxSpeed));
  }
  state.temperature = Math.max(20, Math.min(110,
    state.temperature + (state.furnace.speed / B.maxSpeed * B.heating - B.cooling) * dt));
  if (state.automatic) state.supplyTime += dt;
  const deliveries = Math.floor(state.supplyTime / B.deliverySeconds);
  if (deliveries > state.deliveries) {
    state.ore += (deliveries - state.deliveries) * B.deliveryOre;
    state.deliveries = deliveries;
  }
  if (state.ore >= 1 && state.temperature >= B.temperatureMin && state.temperature <= B.temperatureMax) {
    state.furnaceProgress += dt / B.smeltSeconds;
    if (state.furnaceProgress >= 1 && smelt(state)) state.furnaceProgress -= 1;
  }
  updateProgression(state);
}

/** A complete downstroke counts once; the handle must return before another. */
export function setPressPosition(state: State, position: number): boolean {
  if (state.finished || !Number.isFinite(position)) return false;
  const lever = state.press;
  lever.position = lever.target = Math.max(0, Math.min(1, position));
  if (lever.position <= 0.15) lever.armed = true;
  if (lever.position < 0.9 || !lever.armed) return false;
  lever.armed = false;
  if (state.plates < 2) return false;
  lever.strokes += 1;
  state.manualTime += 0.2;
  state.pressProgress += 1 / B.pressStrokes;
  if (state.pressProgress >= 1 - Number.EPSILON) {
    if (pressGear(state)) state.pressProgress = Math.max(0, state.pressProgress - 1);
  }
  updateProgression(state);
  return true;
}

/** One complete pickaxe swing extracts a batch; holding cannot extract more. */
export function swingPickaxe(state: State, position: number): boolean {
  if (state.finished || !Number.isFinite(position)) return false;
  const pick = state.mine;
  pick.position = Math.max(0, Math.min(1, position));
  if (pick.position <= 0.15) pick.armed = true;
  if (pick.position < 0.9 || !pick.armed) return false;
  pick.armed = false;
  pick.strikes += 1;
  state.ore += B.miningOre;
  state.minedOre += B.miningOre;
  state.manualTime += 0.2;
  return true;
}

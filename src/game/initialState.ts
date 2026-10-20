import { BALANCE } from '../config/balance';
import type { State } from './types';
export function initialState(): State {
  return {
    ore: BALANCE.initialOre, plates: 0, reserve: 0, gears: 0, kit: 0,
    automatic: false, rewarded: false, temperature: BALANCE.initialTemperature,
    furnaceProgress: 0, pressProgress: 0,
    furnace: { angle: 0, speed: 0, impulse: 0 }, press: { position: 0, target: 0, strokes: 0, armed: true },
    active: 'furnace', route: 'gears', elapsed: 0, manualTime: 0, autoOutput: 0,
    deliveries: 0, finished: false, firstPlate: null, firstGear: null, motorAt: null,
  };
}

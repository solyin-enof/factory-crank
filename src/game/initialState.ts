import { BALANCE } from '../config/balance';
import type { State } from './types';
export function initialState(): State {
  return {
    workshop:{oreHoist:false,toolBench:false,beltDrive:false,crawler:false,thermalJacket:false,signalMast:false},
    springs:0, frames:0, gearsMade:0, springsMade:0, framesMade:0, pressRecipe:'gear', materialSpent:0, deliveredOre:0, crawlerJob:'haul', autoParts:0,
    mine: { position: 0, armed: true, strikes: 0 }, minedOre: 0, supplyTime: 0,
    ore: BALANCE.initialOre, plates: 0, reserve: 0, gears: 0, kit: 0,
    automatic: false, rewarded: false, temperature: BALANCE.initialTemperature,
    furnaceProgress: 0, pressProgress: 0,
    furnace: { angle: 0, speed: 0, impulse: 0 }, press: { position: 0, target: 0, strokes: 0, armed: true },
    active: 'mine', route: 'gears', elapsed: 0, manualTime: 0, autoOutput: 0,
    deliveries: 0, finished: false, firstPlate: null, firstGear: null, motorAt: null,
  };
}

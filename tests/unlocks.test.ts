import { describe, expect, it } from 'vitest';
import { initialState } from '../src/game/initialState';
import { swingPickaxe } from '../src/game/simulation';
import { unlocks } from '../src/ui/unlocks';

describe('progressive controls', () => {
  it('starts with no additional controls or inventories', () => {
    expect(unlocks(initialState())).toEqual({ furnace: false, press: false, routing: false, motor: false, plates: false, gears: false });
  });

  it('reveals the furnace after three mining swings and keeps it when ore is consumed',()=>{
    const state=initialState();
    for(let i=0;i<2;i++){swingPickaxe(state,1);swingPickaxe(state,0);}
    expect(unlocks(state).furnace).toBe(false);
    swingPickaxe(state,1);state.ore=0;
    expect(unlocks(state).furnace).toBe(true);
  });

  it('reveals plates first and the press after two plates, before a gear exists', () => {
    const state = initialState();
    state.plates = 1;
    expect(unlocks(state)).toEqual({ furnace: true, press: false, routing: false, motor: false, plates: true, gears: false });
    state.reserve = 1;
    expect(unlocks(state)).toEqual({ furnace: true, press: true, routing: false, motor: false, plates: true, gears: false });
  });

  it('reveals routing with the first gear and the motor with the second', () => {
    const state = initialState();
    state.gears = 1;
    expect(unlocks(state)).toEqual({ furnace: true, press: true, routing: true, motor: false, plates: true, gears: true });
    state.gears = 2;state.gearsMade = 2;
    expect(unlocks(state).motor).toBe(true);
  });

  it('keeps the press available after its ingredients are consumed', () => {
    const state = initialState();
    state.firstPlate = 1;
    state.pressProgress = 0.2;
    expect(unlocks(state).press).toBe(true);
    expect(unlocks(state).plates).toBe(true);
    state.pressProgress = 0;
    state.firstGear = 2;
    expect(unlocks(state).press).toBe(true);
    expect(unlocks(state).routing).toBe(true);
    expect(unlocks(state).gears).toBe(true);
  });

  it('keeps gear controls and motor discovery after spending stock',()=>{
    const state=initialState();state.gearsMade=3;state.gears=0;
    expect(unlocks(state).routing).toBe(true);
    expect(unlocks(state).press).toBe(true);
    expect(unlocks(state).motor).toBe(true);
  });

  it('infers earlier milestones from a legacy save containing a motor kit or automation', () => {
    for (const advancement of [{ kit: 1 }, { automatic: true }]) {
      const state = { ...initialState(), ...advancement };
      expect(unlocks(state)).toEqual({ furnace: true, press: true, routing: true, motor: true, plates: true, gears: true });
    }
  });
});

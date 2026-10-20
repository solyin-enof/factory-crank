import { describe, expect, it } from 'vitest';
import { initialState } from '../src/game/initialState';
import { unlocks } from '../src/ui/unlocks';

describe('progressive controls', () => {
  it('starts with no additional controls or inventories', () => {
    expect(unlocks(initialState())).toEqual({ press: false, routing: false, motor: false, plates: false, gears: false });
  });

  it('reveals plates first and the press after two plates, before a gear exists', () => {
    const state = initialState();
    state.plates = 1;
    expect(unlocks(state)).toEqual({ press: false, routing: false, motor: false, plates: true, gears: false });
    state.reserve = 1;
    expect(unlocks(state)).toEqual({ press: true, routing: false, motor: false, plates: true, gears: false });
  });

  it('reveals routing with the first gear and the motor with the second', () => {
    const state = initialState();
    state.gears = 1;
    expect(unlocks(state)).toEqual({ press: true, routing: true, motor: false, plates: true, gears: true });
    state.gears = 2;
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

  it('infers earlier milestones from a legacy save containing a motor kit or automation', () => {
    for (const advancement of [{ kit: 1 }, { automatic: true }]) {
      const state = { ...initialState(), ...advancement };
      expect(unlocks(state)).toEqual({ press: true, routing: true, motor: true, plates: true, gears: true });
    }
  });
});

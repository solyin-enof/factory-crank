import { BALANCE } from '../config/balance';
import type { State } from '../game/types';

/** Reveal controls as production reaches them, including milestones in older saves. */
export function unlocks(s: State): {
  furnace: boolean; press: boolean; routing: boolean; motor: boolean; plates: boolean; gears: boolean;
} {
  const hasMotor = s.kit > 0 || s.automatic;
  const hasGear = s.gears > 0 || s.firstGear !== null || hasMotor;
  const hasPlate = s.firstPlate !== null || s.plates + s.reserve > 0 || hasGear;
  return {
    furnace: s.minedOre >= BALANCE.miningUnlockOre || hasPlate,
    press: s.plates + s.reserve >= 2 || hasGear || s.pressProgress > 0,
    routing: hasGear,
    motor: s.gears >= 2 || hasMotor || s.motorAt !== null,
    plates: hasPlate,
    gears: hasGear,
  };
}

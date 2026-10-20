export type Machine = 'furnace' | 'press';
export type Wheel = { angle: number; speed: number; impulse: number };
export type Lever = { position: number; target: number; strokes: number; armed: boolean };
export type State = {
  ore: number; plates: number; reserve: number; gears: number; kit: number;
  automatic: boolean; rewarded: boolean; temperature: number;
  furnaceProgress: number; pressProgress: number;
  furnace: Wheel; press: Lever; active: Machine; route: 'gears' | 'reserve';
  elapsed: number; manualTime: number; autoOutput: number; deliveries: number;
  finished: boolean; firstPlate: number | null; firstGear: number | null; motorAt: number | null;
};

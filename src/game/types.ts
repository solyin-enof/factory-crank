export type ProjectId = 'oreHoist'|'toolBench'|'beltDrive'|'crawler'|'thermalJacket'|'signalMast';
export type PressRecipe = 'gear'|'spring'|'frame';
export type Machine = 'mine' | 'furnace' | 'press';
export type Wheel = { angle: number; speed: number; impulse: number };
export type Lever = { position: number; target: number; strokes: number; armed: boolean };
export type State = {
  workshop: Record<ProjectId,boolean>; springs:number; frames:number; gearsMade:number; springsMade:number; framesMade:number; pressRecipe:PressRecipe; materialSpent:number; deliveredOre:number; crawlerJob:'haul'|'tend'; autoParts:number;
  mine: { position: number; armed: boolean; strikes: number }; minedOre: number; supplyTime: number;
  ore: number; plates: number; reserve: number; gears: number; kit: number;
  automatic: boolean; rewarded: boolean; temperature: number;
  furnaceProgress: number; pressProgress: number;
  furnace: Wheel; press: Lever; active: Machine; route: 'gears' | 'reserve';
  elapsed: number; manualTime: number; autoOutput: number; deliveries: number;
  finished: boolean; firstPlate: number | null; firstGear: number | null; motorAt: number | null;
};

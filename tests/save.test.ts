import { expect, it } from 'vitest';
import { validState } from '../src/storage/save';
import { initialState } from '../src/game/initialState';
it('accepts complete states and rejects corrupt save values',()=>{
 expect(validState(initialState())).toBe(true);
 expect(validState({...initialState(),ore:-1})).toBe(false);
 expect(validState({...initialState(),furnace:null})).toBe(false);
 expect(validState({...initialState(),firstPlate:'bad'})).toBe(false);
 expect(validState({...initialState(),active:'bad'})).toBe(false);
});

import { load, save } from '../src/storage/save';
import { vi, afterEach } from 'vitest';
afterEach(() => vi.unstubAllGlobals());
it('migrates v1 stocks and milestones while clearing the obsolete wheel', () => {
 const legacy = {...initialState(),ore:7,plates:3,gears:3,kit:1,rewarded:true,elapsed:85,firstPlate:7,firstGear:25,pressProgress:0.8,press:{angle:4,speed:8,impulse:0}};
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:1,state:legacy})});
 const state = load();
 expect(state).toEqual({...legacy,press:initialState().press,minedOre:12,supplyTime:0,gearsMade:3});
});
it('round trips v4 lever and mining state using the original storage key', () => {
 let data = '';
 vi.stubGlobal('localStorage',{
  getItem:(key:string)=>key==='factory-crank-v1'?data:null,
  setItem:(key:string,value:string)=>{expect(key).toBe('factory-crank-v1');data=value;},
 });
 const state=initialState();
 state.press={position:1,target:1,strokes:2,armed:false};
 save(state);
 expect(JSON.parse(data).version).toBe(4);
 expect(load()).toEqual(state);
});
it('rejects invalid lever values', () => {
 for (const press of [null,{...initialState().press,position:2},{...initialState().press,strokes:0.5},{...initialState().press,armed:'yes'}]) {
  expect(validState({...initialState(),press})).toBe(false);
 }
});

it('migrates v2 saves without banking pre-motor elapsed time', () => {
 const legacy = {...initialState(),ore:5,elapsed:200,deliveries:3,pressProgress:0.5};
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:2,state:legacy})});
 const state=load();
 expect(state.ore).toBe(5);
 expect(state.minedOre).toBe(12);
 expect(state.supplyTime).toBe(36);
 expect(state.pressProgress).toBe(0.5);
 expect(state.mine).toEqual(initialState().mine);
});

it('resumes completed v3 saves and preserves legacy supply without erasing stock',()=>{
 const legacy={...initialState(),ore:4,plates:3,reserve:1,gears:8,automatic:true,rewarded:true,finished:true,minedOre:20,deliveries:2,supplyTime:27};
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:3,state:legacy})});
 const s=load();
 expect(s.ore).toBe(4); expect(s.gears).toBe(8); expect(s.gearsMade).toBe(8);
 expect(s.finished).toBe(false); expect(s.workshop.oreHoist).toBe(true);
 expect(s.deliveredOre).toBe(4); expect(s.supplyTime).toBe(27);
});
it('credits three lifetime gears for an older installed motor even if held gears are lower',()=>{
 const legacy={...initialState(),automatic:true,gears:0};
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:3,state:legacy})});
 expect(load().gearsMade).toBe(3);
});
it('rejects malformed workshop and recipe state',()=>{
 for(const partial of [{workshop:null},{workshop:{}},{workshop:{...initialState().workshop,crawler:1}},{pressRecipe:'bad'},{crawlerJob:'bad'},{springs:0.5},{deliveredOre:-1}]){
  expect(validState({...initialState(),...partial})).toBe(false);
 }
});

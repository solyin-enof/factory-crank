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

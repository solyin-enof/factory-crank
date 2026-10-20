import { BALANCE as B } from '../config/balance';
import { initialState, type State } from '../game/simulation';
// Keep the original key so phones with the first release migrate in place.
const KEY = 'factory-crank-v1';
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
export function validState(value: unknown): value is State {
 if (!value || typeof value !== 'object') return false;
 const s = value as Record<string, unknown>;
 for (const [key, defaultValue] of Object.entries(initialState())) {
  const v = s[key];
  if (['firstPlate','firstGear','motorAt'].includes(key)) { if (v !== null && (!finite(v) || v < 0)) return false; }
  else if (typeof defaultValue === 'number') { if (!finite(v) || v < 0) return false; }
  else if (typeof defaultValue === 'boolean') { if (typeof v !== 'boolean') return false; }
 }
 if (!['mine','furnace','press'].includes(String(s.active)) || !['gears','reserve'].includes(String(s.route))) return false;
 const wheel = s.furnace as Record<string,unknown> | null;
 if (!wheel || typeof wheel !== 'object' || !['angle','speed','impulse'].every(k => finite(wheel[k]))) return false;
 const mine = s.mine as Record<string,unknown> | null;
 if (!mine || typeof mine !== 'object' || !finite(mine.position) || mine.position < 0 || mine.position > 1
  || typeof mine.armed !== 'boolean' || !finite(mine.strikes) || !Number.isInteger(mine.strikes) || mine.strikes < 0) return false;
 const lever = s.press as Record<string,unknown> | null;
 return !!lever && typeof lever === 'object' && ['position','target'].every(k => finite(lever[k]) && lever[k] >= 0 && lever[k] <= 1)
  && finite(lever.strokes) && Number.isInteger(lever.strokes) && lever.strokes >= 0 && typeof lever.armed === 'boolean';
}
export function load(): State {
 try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if ([1, 2].includes(saved?.version) && saved.state && typeof saved.state === 'object') {
   const migrated = {...saved.state,
    press: saved.version === 1 ? initialState().press : saved.state.press,
    mine: initialState().mine, minedOre: 12, supplyTime: saved.state.deliveries * B.deliverySeconds};
   if (validState(migrated)) return migrated;
  }
  if (saved?.version === 3 && validState(saved.state)) return saved.state;
 } catch { /* Corrupt or unavailable storage starts a fresh run. */ }
 return initialState();
}
export function save(state: State): void {
 try { localStorage.setItem(KEY, JSON.stringify({version: 3, state})); } catch { /* Storage may be disabled. */ }
}

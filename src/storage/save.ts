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
 if (!['furnace','press'].includes(String(s.active)) || !['gears','reserve'].includes(String(s.route))) return false;
 const wheel = s.furnace as Record<string,unknown> | null;
 if (!wheel || typeof wheel !== 'object' || !['angle','speed','impulse'].every(k => finite(wheel[k]))) return false;
 const lever = s.press as Record<string,unknown> | null;
 return !!lever && typeof lever === 'object' && ['position','target'].every(k => finite(lever[k]) && lever[k] >= 0 && lever[k] <= 1)
  && finite(lever.strokes) && Number.isInteger(lever.strokes) && lever.strokes >= 0 && typeof lever.armed === 'boolean';
}
export function load(): State {
 try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved?.version === 1 && saved.state && typeof saved.state === 'object') {
   const migrated = {...saved.state, press: initialState().press};
   if (validState(migrated)) return migrated;
  }
  if (saved?.version === 2 && validState(saved.state)) return saved.state;
 } catch { /* Corrupt or unavailable storage starts a fresh run. */ }
 return initialState();
}
export function save(state: State): void {
 try { localStorage.setItem(KEY, JSON.stringify({version: 2, state})); } catch { /* Storage may be disabled. */ }
}

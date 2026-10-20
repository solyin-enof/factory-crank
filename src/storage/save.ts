import { initialState, type State } from '../game/simulation';
const KEY = 'factory-crank-v1';
export function validState(value: unknown): value is State {
 if (!value || typeof value !== 'object') return false;
 const s = value as Record<string, unknown>;
 for (const [key, defaultValue] of Object.entries(initialState())) {
  const v=s[key];
  if (['firstPlate','firstGear','motorAt'].includes(key)) { if(v!==null && (typeof v!=='number'||!Number.isFinite(v)||v<0)) return false; }
  else if(typeof defaultValue==='number'){if(typeof v!=='number'||!Number.isFinite(v)||v<0) return false;}
  else if(typeof defaultValue==='boolean'){if(typeof v!=='boolean')return false;}
 }
 if(!['furnace','press'].includes(String(s.active))||!['gears','reserve'].includes(String(s.route)))return false;
 return ['furnace','press'].every(key=>{const w=s[key] as Record<string,unknown>|null;return w&&typeof w==='object'&&['angle','speed','impulse'].every(k=>typeof w[k]==='number'&&Number.isFinite(w[k]));});
}
export function load(): State {
 try {const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&validState(saved.state))return saved.state;}catch{/* Fall back when storage is corrupt or unavailable. */}
 return initialState();
}
export function save(state: State): void {
 try {localStorage.setItem(KEY,JSON.stringify({version:1,state}));}catch{/* Private browsing may disable persistence. */}
}

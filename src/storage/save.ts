import { BALANCE as B } from '../config/balance';
import { initialState, type State } from '../game/simulation';
import { PROJECTS, PRESS_RECIPES } from '../game/workshop';
// Preserve the original key so installed phones migrate in place.
const KEY = 'factory-crank-v1';
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const record = (value: unknown): value is Record<string,unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const unit = (value: unknown) => finite(value) && value >= 0 && value <= 1;
const integer = (value: unknown) => finite(value) && Number.isInteger(value) && value >= 0;
export function validState(value: unknown): value is State {
 if (!record(value)) return false;
 for (const [key, defaultValue] of Object.entries(initialState())) {
  const v=value[key];
  if (['firstPlate','firstGear','motorAt'].includes(key)) { if(v!==null&&(!finite(v)||v<0))return false; }
  else if(typeof defaultValue==='number'){if(!finite(v)||v<0)return false;}
  else if(typeof defaultValue==='boolean'){if(typeof v!=='boolean')return false;}
 }
 if(!['mine','furnace','press'].includes(String(value.active))||!['gears','reserve'].includes(String(value.route))
  ||!['haul','tend'].includes(String(value.crawlerJob))||!PRESS_RECIPES.some(r=>r.id===value.pressRecipe))return false;
 const wheel=value.furnace;
 if(!record(wheel)||!['angle','speed','impulse'].every(k=>finite(wheel[k]))||Number(wheel.speed)<0)return false;
 const mine=value.mine;
 if(!record(mine)||!unit(mine.position)||typeof mine.armed!=='boolean'||!integer(mine.strikes))return false;
 const lever=value.press;
 if(!record(lever)||!unit(lever.position)||!unit(lever.target)||!integer(lever.strokes)||typeof lever.armed!=='boolean')return false;
 const workshop=value.workshop;
 if(!record(workshop)||!PROJECTS.every(p=>typeof workshop[p.id]==='boolean'))return false;
 for(const key of ['ore','plates','reserve','gears','springs','frames','kit','gearsMade','springsMade','framesMade','materialSpent','deliveredOre','minedOre','deliveries','autoParts']){
  if(!integer(value[key]))return false;
 }
 return unit(value.pressProgress)&&unit(value.furnaceProgress);
}
export function load():State {
 try {
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if([1,2,3].includes(saved?.version)&&record(saved.state)) {
   const old=saved.state;
   const fresh=initialState();
   const migrated={...fresh,...old,
    press:saved.version===1?fresh.press:old.press,
    mine:saved.version<3?fresh.mine:old.mine,
    minedOre:saved.version<3?12:old.minedOre,
    supplyTime:saved.version<3?Number(old.deliveries)*B.deliverySeconds:old.supplyTime,
    deliveredOre:Number(old.deliveries)*B.deliveryOre,
    gearsMade:Math.max(Number(old.gears),old.automatic||old.rewarded||Number(old.kit)>0?B.motorGears:0),
    workshop:{...fresh.workshop,oreHoist:old.automatic===true},finished:false,
   };
   if(validState(migrated))return migrated;
  }
  if(saved?.version===4&&validState(saved.state))return saved.state;
 } catch { /* A corrupt or unavailable save starts a fresh run. */ }
 return initialState();
}
export function save(state:State):void {
 try {localStorage.setItem(KEY,JSON.stringify({version:4,state}));} catch { /* Storage may be disabled. */ }
}

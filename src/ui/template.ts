export const factoryMarkup = `
<header>
 <div><div class="brand">factory<span> crank.</span></div><p class="eyebrow">LITTLE WORKS. BIG IDEAS.</p></div>
 <div class="tools"><button class="icon" id="mute" aria-label="Mute sound">♪</button><button class="icon" id="pause" aria-label="Pause">Ⅱ</button></div>
</header>
<div class="mission"><div><small>YOUR FIRST PRODUCTION LINE</small><h1 id="next-action">Mine some iron.</h1></div><div class="goal"><span id="gears">0</span><small id="goal-label"> / 6 ORE</small></div></div>
<div class="goalbar"><i id="goal-fill"></i></div>
<div class="scene"><span class="scene-label">ORE → HEAT → PLATES → FORCE → GEARS</span><span class="live" id="live">● MANUAL</span><canvas aria-label="Ore falls from the hopper into a furnace. A belt-driven blower feeds air to the fire. Plates feed a lever-operated gear press."></canvas><div class="status" id="status"></div></div>
<div class="inventory"><div id="stock-ore"><span class="material">◆</span><section><b id="ore">0</b><small>IRON ORE</small></section></div><div id="stock-plates"><span class="material">▰</span><section><b id="plates">0</b><small>PLATES</small></section></div><div id="stock-gears"><span class="material">⚙</span><section><b id="gear-count">0</b><small>GEARS</small></section></div></div>
<div class="extra-parts" id="extra-parts" hidden><span>♧ <b id="springs">0</b> SPRINGS</span><span>▱ <b id="frames">0</b> FRAMES</span></div>
<p id="material-path" class="material-path" hidden></p>
<p id="factory-summary" class="factory-summary" hidden></p>
<div class="motor"><span id="motor-label"></span><button id="install" disabled>Install motor ↗</button></div>
<nav class="tabs" id="station-tabs" aria-label="Workstations"><button id="mine" class="active">Mine</button><button id="furnace">Furnace</button><button id="press">Press</button></nav>
<div id="press-dies" class="press-dies" hidden><span>PRESS DIE</span><button id="die-gear" aria-pressed="true">Gear</button><button id="die-spring" aria-pressed="false">Spring</button><button id="die-frame" aria-pressed="false">Frame</button></div>
<div class="controls">
 <div id="decision-controls"><div id="allocation"><p class="control-label">SEND NEW PLATES TO</p><div class="route" id="route" aria-label="Plate routing"><button class="selected" id="to-gears" aria-label="Route plates to press">PRESS</button><button id="to-reserve" aria-label="Route plates to reserve">RESERVE</button></div><button class="small-action" id="transfer">Reserve: 0 · send to press ↗</button></div></div>
 <div class="machine-panel">
  <p class="control-label" id="mechanism-label">FURNACE / BLOWER DRIVE</p>
  <button class="machine-control pickaxe" id="pickaxe" aria-label="Mine iron ore. Swipe downward to swing the pickaxe into the rock. Keyboard: Down Arrow swings; Up Arrow raises it.">
   <svg viewBox="0 0 280 280" aria-hidden="true">
    <path d="M17 230L25 140 62 112 112 106 146 127 188 167 198 232Z" fill="#35473d" stroke="#71816a" stroke-width="3"/>
    <path d="M27 142L70 163 63 222M69 116L97 158 151 139M96 158L132 196 183 187M132 196L121 232" fill="none" stroke="#26392e" stroke-width="6"/>
    <path d="M31 191L73 173 96 183 125 164 151 170 178 158" fill="none" stroke="#9b7953" stroke-width="13"/>
    <path d="M34 188L72 171 95 180 125 161 153 168" fill="none" stroke="#c1ae7b" stroke-width="4"/>
    <path id="rock-cracks" d="M80 179L74 148 90 133M80 179L53 207M80 179L111 208 106 228" fill="none" stroke="#e6c68c" stroke-width="2" opacity="0"/>
    <path d="M13 238H259" stroke="#536a4c" stroke-width="4" stroke-linecap="round"/>
    <path d="M25 234l9-9 9 10M159 236l10-11 9 12M201 237l7-6 10 7" fill="#7d8165"/>
    <g id="pickaxe-tool">
     <path d="M228 227L174 81" fill="none" stroke="#263829" stroke-width="18" stroke-linecap="round"/>
     <path d="M228 227L174 81" fill="none" stroke="#c5995f" stroke-width="11" stroke-linecap="round"/>
     <path d="M222 211l7 18" stroke="#ecd092" stroke-width="15" stroke-linecap="round"/>
     <path d="M122 89Q161 43 213 101L184 86 174 90 162 80Z" fill="#bfc6af" stroke="#53674b" stroke-width="3" stroke-linejoin="round"/>
     <path d="M133 80Q161 57 193 83" fill="none" stroke="#eef0d4" stroke-width="3"/>
    </g>
    <g id="mining-impact" opacity="0"><path d="M67 173l-17-8M76 164l-5-16M88 170l12-12" stroke="#f1d59b" stroke-width="3"/><path d="M49 192l-8-5 1 9M103 193l7-7 2 8M87 212l6-2-3 9" fill="#bea475"/><text x="95" y="139" fill="#f3d28c" font-size="22" font-family="sans-serif" font-weight="700">+2 ORE</text></g>
    <path class="gesture-guide" d="M247 80v68m-7-7 7 10 7-10" fill="none" stroke="#eed39a" stroke-width="3"/>
    <text x="82" y="262" text-anchor="middle" font-size="9" letter-spacing="2" fill="#a4b592">IRON SEAM</text>
   </svg>
  </button>
  <button class="machine-control wheel" id="wheel" aria-label="Furnace blower crank. Drag clockwise around the handle to blow air into the fire. Keyboard: Right Arrow turns; Left Arrow brakes.">
   <svg viewBox="0 0 180 180" aria-hidden="true">
    <rect x="20" y="34" width="145" height="125" rx="16" fill="#344d35" stroke="#687d50" stroke-width="2"/>
    <path d="M145 50V21h23" fill="none" stroke="#a3ad7c" stroke-width="13"/>
    <circle cx="145" cy="51" r="21" fill="#162c20" stroke="#b7bb8a" stroke-width="4"/>
    <g id="control-fan"><path d="M145 34q13 2 4 17q-3 13-14 10q-12-8 10-10q-13-12 0-17" fill="#a3b77b"/></g>
    <path d="M42 57L130 33M130 140L164 62" fill="none" stroke="#0e2118" stroke-width="6"/>
    <g id="spokes"><circle cx="90" cy="90" r="60" fill="#243b29" stroke="#d0b779" stroke-width="11"/><path d="M90 35v110M35 90h110M51 51l78 78M51 129l78-78" stroke="#a49a69" stroke-width="8"/><circle cx="90" cy="90" r="17" fill="#d7be7b" stroke="#203623" stroke-width="5"/><circle cx="132" cy="50" r="12" fill="#f0c981" stroke="#243b29" stroke-width="5"/></g>
    <circle cx="90" cy="90" r="5" fill="#304930"/>
    <path class="gesture-guide" d="M35 34a73 73 0 0 1 94-12m-1-8 3 10-11 2" stroke="#f5d799" stroke-width="3" fill="none"/>
   </svg>
  </button>
  <button class="machine-control lever" id="lever" hidden aria-label="Gear press lever. Drag the handle downward to compress plates. Release to return. Keyboard: Down Arrow pulls; Up Arrow returns.">
   <svg viewBox="0 0 180 180" aria-hidden="true">
    <rect x="17" y="150" width="125" height="16" rx="4" fill="#8a9d6b"/>
    <path d="M29 151V47h82v104" stroke="#879d69" stroke-width="13" fill="none"/>
    <rect x="21" y="37" width="99" height="17" rx="4" fill="#a2ae7d"/>
    <path d="M68 57v70" stroke="#3b5034" stroke-width="24"/>
    <g id="lever-ram"><rect x="58" y="70" width="20" height="38" rx="3" fill="#c4c9a0"/><rect x="45" y="102" width="46" height="11" rx="3" fill="#a5b485"/></g>
    <g id="press-stock"><rect x="46" y="132" width="43" height="5" rx="2" fill="#d1d7b9"/><rect x="46" y="139" width="43" height="5" rx="2" fill="#afc298"/></g>
    <path id="lever-link" d="M68 80L104 68" stroke="#dbbd7a" stroke-width="6"/>
    <g id="lever-arm"><path d="M104 68L152 22" stroke="#dbbd7a" stroke-width="9" stroke-linecap="round"/><rect x="139" y="10" width="27" height="21" rx="8" fill="#edc982" stroke="#384e31" stroke-width="4"/></g>
    <circle cx="104" cy="68" r="8" fill="#d1d3a6" stroke="#394e30" stroke-width="4"/>
    <path class="gesture-guide" d="M167 48v63m-6-7 6 9 6-9" fill="none" stroke="#f5d799" stroke-width="3"/>
   </svg>
  </button>
  <p class="wheel-caption" id="wheel-caption">TURN → AIR → HOTTER FIRE</p>
 </div>
</div>
<div class="hint"><span id="hint-icon">↻</span><div id="hint"></div></div>
<div id="milestone" class="milestone" hidden role="status">⌁ SIGNAL ONLINE · YOUR WORKSHOP IS ALIVE. Keep building.</div>
<footer><span id="footer-brand">SMALL FACTORY. MADE BY YOU.</span><button id="workshop-launch" class="workshop-launch" hidden>Workshop ↗</button><button id="settings">OPTIONS ↗</button></footer><pre id="debug"></pre>
<dialog id="options"><h2>Workshop options</h2><button id="show-tutorial">How to play</button><label><input type="checkbox" id="motion"> Reduce motion</label><label><input type="checkbox" id="debug-toggle"> Show diagnostics</label><button id="show-stats">Production stats</button><button id="resume">Back to work</button><button id="restart">Reset & replay</button></dialog>
<dialog id="welcome">
 <p class="eyebrow">YOUR HANDS ARE THE MACHINE</p><h2>Rock. Ore. Iron.</h2>
 <div class="tutorial-machines"><span>↻<small>BLOWER</small></span><span>↓<small>PRESS</small></span></div>
 <p><b>Swing the pickaxe.</b> Swipe down into the iron seam. Each full swing mines two ore; six ore reveal the furnace. Return to the mine whenever you need more.</p>
 <p><b>Turn the furnace crank.</b> It drives a blower that pushes air into the fire. The ore hopper feeds the furnace; heat turns ore into plates.</p>
 <p><b>Pull the press lever.</b> Select Press. Drag its handle down: the linked ram squeezes two plates into a gear. Three full pulls finish each gear.</p>
 <p><b>Earn your motor at 3 gears.</b> Install it to drive the blower for you. Spend gears in the Workshop. Build an ore hoist to stop mining, or a tool bench to unlock spring and frame dies. Later, automate the press and build a crawler.</p>
 <button id="start-tutorial">Back to work ↗</button><button id="skip-tutorial" class="skip">Skip guide</button>
</dialog>
<dialog id="workshop" class="workshop-dialog">
 <div class="workshop-heading"><span class="eyebrow">BUILD YOUR WAY</span><button id="close-workshop" aria-label="Close workshop">×</button></div>
 <h2>What will you make?</h2><p class="workshop-intro">Remove a chore. Or make something new.</p><p id="workshop-stock" class="workshop-stock"></p>
 <p id="workshop-message" class="workshop-message" role="status"></p>
 <div id="project-list"></div><p id="no-projects" hidden>Everything here is built. Keep making parts and watch your factory work.</p><button id="more-projects" hidden>More projects ↗</button>
 <fieldset id="crawler-jobs" hidden><legend>Put your crawler to work</legend><div class="crawler-choices"><button id="crawler-haul" aria-pressed="true">Haul ore</button><button id="crawler-tend" aria-pressed="false">Tend fire</button></div><p id="crawler-effect"></p></fieldset>
 <details><summary>Your factory</summary><p id="installed-projects"></p><p>Reserve plates stay out of the press. Save them for your next project.</p></details>
</dialog>
<dialog id="results"><p>YOUR FACTORY / STILL GROWING</p><h2>You made it work.</h2><p id="stats"></p><button id="close-stats">Back to factory</button><button id="replay">Start over ↗</button></dialog>`;

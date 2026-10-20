# Factory Crank

[Play in your browser](https://solyin-enof.github.io/factory-crank/) — works on phones and desktop.

A mobile factory game about operating machinery, then building a motor that takes over your work. TypeScript, Vite, Canvas 2D and SVG controls. Original visuals and synthesized Web Audio; no backend or accounts.

## Run

```sh
npm install
npm run dev
```

Vite listens on `0.0.0.0:5173`. Use the computer's LAN IP from a phone on the same Wi-Fi.

```sh
npm test
npm run build
```

Deploy `dist/` to a static host. A manifest and SVG icon provide PWA metadata. Service-worker caching and offline installation are not implemented.

## Play

The game starts with **only an iron seam and a pickaxe**, with zero loose ore. There is no opening tutorial or hold-to-produce button. A short instruction beside the mechanism explains its effect.

- **Mine:** swipe downward to swing the pickaxe into the rock. Each full swing breaks out two ore with chips, cracks and a metallic stone impact. Three swings (six ore) reveal the furnace. The Mine tab remains available for additional supply. Tapping, holding or jittering the tool does not mine ore.
- **Furnace:** drag the gold handle clockwise around the wheel. The belt drives a blower that pushes air into the fire. More air means more heat. Coast when hot; counterclockwise motion brakes. The hopper gravity-feeds ore into the chamber. Each ore becomes one plate after five seconds in the 35–80° band; overheating pauses production without destroying material.
- **Gear press:** appears after two plates. The control switches to a lever integrated with the ram and die. Drag the gold grip down; the ram compresses the metal. Release to return it. Three full strokes consume two plates and make a gear. Holding a lowered lever or jittering it cannot produce another stroke.
- **Routing:** appears after your first gear. Tap/drag GEARS or RESERVE. Transfer reserved plates back to the press when needed. The station tabs let you move between the furnace and press.
- **Motor:** becomes visible after two gears. Three gears award one kit. Install it on the blower: the crank and fan continue turning without input and regulate the furnace. Make eight gears to finish, then replay without refreshing.

Down Arrow swings the pickaxe; Up Arrow raises it. Right/Left Arrow turn/brake the furnace. Down Arrow pulls the press lever; Up Arrow returns it. Key repeat does not generate press strokes. The routing selector and machinery own independent pointers; simultaneous touches are optional.

The machine controls disable text selection, native dragging and touch callouts. Pointer capture keeps a drag attached to its mechanism; cancellation, tab changes and pause release the controls. There is no tap or hold shortcut for manufacturing.

Pause/mute are in the header. Options includes reduced motion, diagnostics, reset/replay and an optional mechanism reference. Backgrounding pauses; use the play icon to resume. Machinery hum and impacts have been raised, and the hum includes higher harmonics so it carries better on phone speakers.

## Simulation and saves

Tuning lives in `src/config/balance.ts`. The furnace uses fixed 60 Hz steps, inertia, drag and load; the press uses actual lever displacement with top/bottom thresholds. Input, simulation, drawing, audio, save validation and UI progression are separate modules.

Every run begins at zero ore. A complete pickaxe swing adds **2 ore** to the hopper and the mined-material ledger. After motor installation, automatic supply adds **2 ore every 12 seconds of motor operation**. Before that, return to the mine whenever the hopper needs supply. Recipes are atomic: `ore + press plates + reserve plates + 2 × gears = mined ore + delivered ore`. A motor kit is a one-time game milestone, not a realistic manufacturing recipe.

Version 3 localStorage saves preserve inventories, milestones and partial work from versions 1 and 2. Older runs receive a 12-ore legacy ledger credit matching their original starting stock, keep the furnace unlocked and gain access to the mine. Automatic supply has its own clock, so pre-motor time does not bank deliveries. Before routing unlocks, old reserve stock feeds the press automatically. Invalid saves start a fresh run. There is no offline production or network telemetry. Fonts use system fallbacks without remote requests.

## Verification

28 tests cover mining strokes, supply gating, wrapping, pointer isolation/capture/cancellation, lever displacement and full-stroke gating, material conservation, temperature boundaries, automation, saves/migration, progressive reveals and a complete input-driven run. The deterministic test operator mines its first batch, produces its first plate at 10.1s, first gear at 19.5s, installs the motor at 40.5s and finishes at 102s. These timings are faster than the original provisional targets; physical playtesting should set the next tuning pass.

Browser checks cover pickaxe swings awarding ore, the third swing revealing the furnace with six ore, return to the mine, circular cranking and the furnace-to-press transition without text selection, plus compact layouts at 320×640 and 390×844. `npm test` and `npm run build` pass. Physical iOS/Android long-press behavior, simultaneous touch and perceived speaker volume still need device validation.

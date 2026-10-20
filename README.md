# Factory Crank

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

The game starts with **only ore, a furnace and its blower crank**. There is no opening tutorial or hold-to-produce button. A short instruction beside the mechanism explains its effect.

- **Furnace:** drag the gold handle clockwise around the wheel. The belt drives a blower that pushes air into the fire. More air means more heat. Coast when hot; counterclockwise motion brakes. The hopper gravity-feeds ore into the chamber. Each ore becomes one plate after five seconds in the 35–80° band; overheating pauses production without destroying material.
- **Gear press:** appears after two plates. The control switches to a lever integrated with the ram and die. Drag the gold grip down; the ram compresses the metal. Release to return it. Three full strokes consume two plates and make a gear. Holding a lowered lever or jittering it cannot produce another stroke.
- **Routing:** appears after your first gear. Tap/drag GEARS or RESERVE. Transfer reserved plates back to the press when needed. The station tabs let you move between the furnace and press.
- **Motor:** becomes visible after two gears. Three gears award one kit. Install it on the blower: the crank and fan continue turning without input and regulate the furnace. Make eight gears to finish, then replay without refreshing.

Right/Left Arrow turn/brake the furnace. Down Arrow pulls the press lever; Up Arrow returns it. Key repeat does not generate press strokes. The routing selector and machinery own independent pointers; simultaneous touches are optional.

The machine controls disable text selection, native dragging and touch callouts. Pointer capture keeps a drag attached to its mechanism; cancellation, tab changes and pause release the controls. There is no tap or hold shortcut for manufacturing.

Pause/mute are in the header. Options includes reduced motion, diagnostics, reset/replay and an optional mechanism reference. Backgrounding pauses; use the play icon to resume. Machinery hum and impacts have been raised, and the hum includes higher harmonics so it carries better on phone speakers.

## Simulation and saves

Tuning lives in `src/config/balance.ts`. The furnace uses fixed 60 Hz steps, inertia, drag and load; the press uses actual lever displacement with top/bottom thresholds. Input, simulation, drawing, audio, save validation and UI progression are separate modules.

The initial 12 ore support three gears. Supply adds **2 ore every 12 seconds**, even before automation, to prevent a deadlock. Recipes are atomic: `ore + press plates + reserve plates + 2 × gears = 12 + delivered ore`. A motor kit is a one-time game milestone, not a realistic manufacturing recipe.

Version 2 localStorage saves preserve inventories, milestones and partial work from version 1 while replacing the old press wheel with a lever. Before routing unlocks, old reserve stock feeds the press automatically. Invalid saves start a fresh run. There is no offline production or network telemetry. Fonts use system fallbacks without remote requests.

## Verification

24 tests cover wrapping, pointer isolation/capture/cancellation, lever displacement and full-stroke gating, material conservation, temperature boundaries, automation, saves/migration, progressive reveals and a complete input-driven run. The deterministic test operator produces its first plate at 7.1s, first gear at 16.5s, installs the motor at 36.0s and finishes at 85.5s. These timings are faster than the original provisional targets; physical playtesting should set the next tuning pass.

Browser checks cover circular cranking without text selection, first-screen layout, and the furnace-to-press transition. `npm test` and `npm run build` pass. Physical iOS/Android long-press behavior, simultaneous touch and perceived speaker volume still need device validation.

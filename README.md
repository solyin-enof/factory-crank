# Factory Crank

A portrait-first factory game built with TypeScript, Vite and Canvas 2D. Start as twelve pieces of iron ore, smelt plates, press gears, then install the motor that takes over your furnace. Original drawn machinery and synthesized sound; no backend or accounts.

## Run

```sh
npm install
npm run dev
```

Open the printed localhost URL. The server binds to `0.0.0.0`; on a phone on the same Wi-Fi, use the computer's LAN IP and port 5173.

```sh
npm test
npm run build
```

Deploy `dist/` to a static host. The manifest and SVG icon provide PWA metadata. Offline installation/service-worker caching is not implemented.

## Play

The first-run walkthrough explains the chain before starting. The large heading and bottom instruction advance with actual progress. Reopen the guide through **Options → How to play**, or skip it.

1. **Hold HOLD TO CRANK** underneath the wheel, or drag clockwise around its rim. On desktop, hold Space or Right Arrow with the wheel or hold button focused. A wheel tap nudges it; a tap alone will not sustain production.
2. Heat the furnace into the 35–80° operating band. Release to coast when it gets hot; counterclockwise dragging brakes the wheel. Each ore becomes one plate after five seconds in the band. Overheating pauses production without destroying material.
3. Route plates to **GEARS** or **RESERVE** by tapping or dragging the selector. Reserved plates are safe; use **Reserve: send to press** to move them to the press.
4. Select **Gear press** and crank it. Two allocated plates make one gear. Switch back to the furnace when it needs heat. Both machines retain momentum and progress while you switch.
5. Three gears award one motor kit. **Install motor** consumes it and switches your controls to the press. The furnace now turns and regulates its own heat without input.
6. Make eight gears to finish and see elapsed time, manual-input time and automatic output. Replay resets the run without refreshing.

Routing and wheel gestures have separate pointer ownership, so they work simultaneously; two fingers are never required. Pause and mute are in the header. Options contains reduced motion, diagnostics and reset/replay. Backgrounding pauses the game; use the play icon to resume.

## Simulation and economy

`src/config/balance.ts` centralizes all tuning. The simulation advances at fixed 60 Hz with a capped frame accumulator. Clockwise displacement supplies wheel momentum; drag and load slow it down. Input, simulation, renderer, audio and save validation have separate modules.

The initial 12 ore support the first three gears. A documented supply adds **2 ore every 12 seconds**, including before automation, so routing mistakes cannot deadlock the motor. Furnace and press recipes are atomic. Conservation is `ore + press plates + reserve plates + 2 × gears = 12 + delivered ore`. The motor kit is a one-time milestone reward, not a realistic manufacturing recipe.

Versioned localStorage saves every two seconds and on background/pause-related actions. Invalid saves fall back to a fresh run. There is no offline production or network telemetry. Diagnostics displays FPS, pointers, speed, temperature, progress, stall reason and local milestone timings. All fonts use system fallbacks without remote requests.

## Verification

- 13 unit tests: angular wrapping, event displacement, pointer ownership, inertia/braking, atomic recipes and conservation, exact temperature boundaries, motor installation, corrupt saves, and a complete input-driven run.
- Deterministic feedback-controller run: first plate **7.1s**, first gear **36.6s**, motor **84.9s**, eight gears **205.6s**. Real human timing varies; motor timing is slightly ahead of the brief's provisional 90–150s target.
- Browser check: mouse cranking and hold input visibly turn the wheel; plates are produced and advance the guide. Walkthrough open/close and options work. Controls and instructions fit at **320×640** and **390×844** without scrolling with diagnostics disabled.
- `npm test`, `npm run build` and `npm audit` pass.

## Next improvement

Playtest the first minute on physical iOS and Android devices, especially the transition from smelting to pressing. Tune momentum and the tutorial from those observations. Two simultaneous physical touches and synthesized audio still need device validation. The current canvas has a deliberately compact scene on short screens; richer material exit animations and a more dramatic motor attachment are future polish.

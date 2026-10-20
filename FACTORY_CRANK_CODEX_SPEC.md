# Factory Crank: Codex Implementation Brief

## Mission
Build a polished, portrait-first mobile web game in which the player starts as iron ore, physically operates factory machinery with touch gestures, transforms into manufactured products, and eventually automates the machines they once operated manually.

**Core promise: Turn the crank. Make a plate. Build a motor. Never turn that crank again.**

The game must be playable, not a static mockup. Build a 3-5 minute vertical slice first. Avoid accounts, servers, ads, and a large tech tree.

## Design principles
1. **Touch is machinery.** The player's thumb rotates a flywheel, pulls a lever, or routes materials. The machines respond immediately and visibly.
2. **You are the material.** Represent the player as a batch of ore that becomes plates and gears. Respect resource quantities and recipes. Do not magically turn one plate into an engine.
3. **Automation is the reward.** A motor takes over a manually operated machine, and it continues to run when the player lets go.
4. **Choices matter.** Routing resources and handling bottlenecks matter more than tapping quickly.
5. **One-thumb onboarding, two-thumb depth.** First teach cranking. Later, let the left thumb route materials while the right thumb operates a machine. Provide a one-thumb alternative.
6. **Readable, tactile, fast.** The player should understand machine state from motion, labels, and sound, without reading a manual.

## Stack and platform
- TypeScript, Vite, Canvas 2D for the game; DOM/CSS for menus and accessible controls.
- Static deployment, no backend. PWA-ready manifest and responsive portrait layout.
- Target 390x844 CSS px; support 320x640 and desktop mouse testing.
- Pointer Events with pointer capture and distinct pointer IDs for simultaneous touch. `touch-action: none` on the game surface.
- Fixed-step simulation independent of render frame rate; aim for 60 fps.
- Original industrial-toy visuals and synthesized Web Audio effects. Do not reuse StarCraft, Factorio, or other third-party protected art, names, or sounds.
- Local save via versioned localStorage. Mute and reduced-motion support. Haptics optional and never required.
- If the repository already has a coherent stack, preserve it and document deviations.

## First playable run
1. Begin with **12 iron ore** in a hopper. The player's avatar is a visible stream/batch of material.
2. **Furnace:** turn a large virtual crank to power the blower. Heat the furnace into a forgiving operating band. Every 1 ore yields 1 iron plate. Show plates physically leaving on a conveyor.
3. **Gear press:** consume 2 iron plates per gear. Operate the press with a tactile lever or crank. Show material deductions and completed gears.
4. **Routing:** choose whether plates go to the gear press or a reserve hopper. This decision affects how fast the player can reach the goal.
5. **Motor milestone:** after a clear production goal, award one motor kit. This is a simplified game milestone, not a claim about real manufacturing. Installing it on the furnace consumes the kit.
6. **Automation reveal:** the motor snaps into place. The furnace wheel continues turning with no touch. Replenishing ore arrives automatically. The player can now operate the press while the furnace runs itself.
7. **Finish:** produce 8 gears. Show elapsed time, gears made, manual operation time, and automatic output. Offer replay.

Avoid economy deadlocks. The motor milestone must always be reachable. If initial resources are insufficient for the target, replenish ore at a documented rate. No inventory can go negative.

## The virtual crank: highest priority
Place a wheel about 140 CSS px across in the lower-right control area.

- On pointer down, capture the pointer and record its angle relative to the wheel center using `atan2(y-cy, x-cx)`.
- On pointer move, calculate angular delta and **unwrap the -pi/pi boundary**. No jumping across the seam.
- Use angular displacement to apply torque. Clamp implausible input spikes and filter event noise. Do not make output depend on browser event frequency.
- Model inertia, drag, and machine load. On release, the wheel coasts down instead of stopping abruptly.
- Clockwise rotation powers the machine. Counterclockwise input brakes it (or applies reverse torque, but choose one rule and be consistent).
- Provide immediate feedback: moving spokes, belt movement, furnace glow, temperature change, sound, and production progress.
- A controlled flick and occasional correction should be effective. Do not require continuous frantic circles.

Example physics, with tunable coefficients:

```ts
angularVelocity += (inputTorque - loadTorque - drag * angularVelocity) * dt / inertia;
angularVelocity = Math.max(0, Math.min(maxAngularVelocity, angularVelocity));
angle += angularVelocity * dt;
```

Use a fixed simulation step and clamp long frame delays. Handle `pointercancel`, lost capture, and multi-touch gracefully.

### Furnace model
Wheel speed powers the blower. Heat rises under power and cools when idle. Production progresses only with ore available and temperature inside the operating band. Below the band, show `TOO COLD`. Above the band, show `TOO HOT` and reduce efficiency without destroying inventory. An automated motor should regulate temperature reliably. Expose balance parameters in `src/config/balance.ts`.

Initial playtest targets: first plate in 5-10 seconds, first gear in 30-45 seconds, automation payoff within 90-150 seconds. Tune by feel rather than hardcoding these timings.

## Two-thumb controls
- Right thumb: crank active machine.
- Left thumb: drag a large routing control between `GEARS` and `RESERVE`.
- Both pointers work simultaneously, identified by pointer ID. Touching one control must not interrupt the other.
- Also support tapping the routing selector, so one-handed play remains possible.
- Avoid small, moving touch targets and hidden precision requirements.

## Portrait layout
- Top 12%: goal (`GEARS 3/8`), pause, mute.
- Middle 53%: factory scene, hopper, machine, conveyor, material stream, outputs.
- Next 10%: inventory (`ORE`, `PLATES`, `GEARS`) and motor status.
- Bottom 25%: crank on right, route/action on left, one-line prompt.

Use safe-area insets. Interactive targets at least 44x44 CSS px. Keep labels legible and avoid essential information behind thumbs. Status must not rely on color alone.

### Visual/audio direction
Original chunky industrial-toy style: dark steel, warm furnace glow, animated belts, obvious material silhouettes, and bright status labels. Each completed item exits its machine as an object, not just a number. Add small clanks, motor hum, sparks, and a brief counter animation. Start audio only after a user gesture. Include mute. Support reduced motion.

**Critical moment:** when the player installs the motor, show it attach, show the crank turn by itself, and let the player lift both fingers while output continues. Make this the most satisfying moment in the slice.

## Simulation architecture
Keep input, simulation, rendering, audio, and persistence separate. Suggested types:

```ts
type Resource = 'iron_ore' | 'iron_plate' | 'gear' | 'motor_kit';
type MachineKind = 'furnace' | 'gear_press';
type MachineMode = 'manual' | 'automatic';
type Inventory = Record<Resource, number>;

type MachineState = {
  id: string;
  kind: MachineKind;
  mode: MachineMode;
  progress: number;
  angularPosition: number;
  angularVelocity: number;
  temperature?: number;
};
```

Atomic recipes: furnace consumes 1 ore -> 1 plate; press consumes 2 plates -> 1 gear. Motor kit is an explicit milestone reward and installation consumes one kit. Preserve conservation of materials except for documented inputs, rewards, and sinks. Make simulation deterministic and testable.

Suggested layout:

```text
index.html
package.json
vite.config.ts
tsconfig.json
public/manifest.webmanifest
src/main.ts
src/styles.css
src/config/balance.ts
src/game/types.ts
src/game/initialState.ts
src/game/simulation.ts
src/game/recipes.ts
src/game/progression.ts
src/input/pointerControls.ts
src/render/canvasRenderer.ts
src/render/particles.ts
src/audio/sound.ts
src/storage/save.ts
src/ui/hud.ts
tests/simulation.test.ts
tests/recipes.test.ts
tests/pointerControls.test.ts
README.md
```

Adapt paths if the repo already has a structure. Keep modules lean.

## Build in phases

### Phase 1: mechanical toy
Make a responsive canvas with a large wheel. It follows circular pointer movement, has inertia, drives a visible belt, and works with mouse and touch. Show RPM in a debug overlay. Do not proceed until it feels good.

### Phase 2: smelting
Add ore, temperature, iron plate output, production progress, sound, and inventory. A new player should make a plate without a lengthy tutorial.

### Phase 3: gears and routing
Add the gear press, 2:1 recipe, resource routing, two-thumb input, and a real allocation decision. Explain shortages visibly.

### Phase 4: automation
Add the motor milestone, install interaction, autonomous furnace control, replenishing ore, end goal, and results/replay.

### Phase 5: polish
Add contextual tutorial, responsive layouts, safe areas, audio/motion settings, save/reset, PWA metadata, tests, and debug controls.

## Contextual tutorial
Advance on actions, not timers. Let players skip it.

1. `DRAG AROUND THE WHEEL TO TURN IT.`
2. `KEEP THE FURNACE IN THE GREEN BAND.`
3. `YOU MADE AN IRON PLATE.`
4. `SEND PLATES TO THE GEAR PRESS.`
5. `TWO PLATES MAKE ONE GEAR.`
6. `BUILD YOUR FIRST MOTOR.`
7. `INSTALL MOTOR ON FURNACE.`
8. `LET GO. IT KEEPS RUNNING.`
9. `NOW OPERATE THE NEXT MACHINE.`

## Acceptance criteria
- A new player can make a plate within 15 seconds of first opening the game.
- Wheel rotation remains smooth across the angle wrap boundary and after finger release.
- Two pointers operate routing and crank independently.
- Recipes never consume missing materials or create outputs for free.
- Every stalled machine gives an understandable reason.
- Motor unlock cannot deadlock; automation visibly runs without input.
- A run can be finished and replayed without refreshing.
- Works at 320x640 and 390x844, with touch and mouse.
- No required hover, sound, vibration, or simultaneous two-thumb gesture.
- Unit tests cover recipe atomicity, conservation, temperature boundaries, motor installation, angle unwrapping, and pointer isolation.
- `npm run build` and `npm test` pass.

## Debugging and evaluation
Provide an optional debug overlay showing FPS/frame time, active pointers, wheel speed, temperature, production progress, inventory, and current bottleneck. Log time to first plate, first gear, and motor installation locally only. No telemetry network calls. Add reset-save and restart controls.

Playtest questions:
- Is turning the crank intrinsically satisfying for 20 seconds?
- Does the player understand why production stops?
- Does the first motor feel like a genuine upgrade in capability?
- Does routing create a decision, or just another chore?
- After automating the furnace, does the player want to automate the press?

## Out of scope
No combat, multiplayer, monetization, account system, huge research tree, realistic chemistry, large free-form map, or endless runner in the MVP. Avoid elaborate menus and copyrighted game assets.

## Possible expansions after validation
1. Automate the press, then introduce a new manually operated machine.
2. Add copper and circuits, requiring coordination between two material streams.
3. Show the material stream progressively assembling into a robot or vehicle.
4. Persist automated machines between short sessions.
5. Add short timed optimization challenges with constrained resources.
6. A/B test a scrolling tunnel variant against stationary factory stations.

## Instructions to Codex
1. Inspect the repository and briefly state the implementation plan.
2. Build the complete vertical slice, not just a design document or UI mockup.
3. Implement and test the crank before expanding the production chain.
4. Keep tunable gameplay constants centralized.
5. Run tests and a production build. Fix failures.
6. Update `README.md` with how to run, build, test, and play, plus control descriptions.
7. Report changed files, verification results, known issues, and the next highest-value improvement.

**Success condition:** A player physically cranks a furnace to create iron plates, makes gears, installs a motor, lets go, watches the furnace continue working, and immediately wants to automate the next machine.

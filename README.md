# Factory Crank

[Play in your browser](https://solyin-enof.github.io/factory-crank/) — works on phones and desktop.

A portrait mobile factory game about becoming something more: swing a pickaxe, drive a furnace blower, pull a press lever, then build machinery that takes over those jobs. Gears open a workshop where shared stock can become automation or new products. There is no eight-gear ending.

TypeScript, Vite, Canvas 2D and SVG. Original visuals and synthesized sound; no accounts, backend, ads or third-party game assets.

## Run

```sh
npm install
npm run dev
```

The dev server listens on `0.0.0.0:5173`. Use the computer's LAN IP from a phone on the same Wi-Fi. The configured Tailscale hostname is allowed in `vite.config.ts`.

```sh
npm test
npm run build
```

Deploy `dist/` to a static host. The manifest and icon provide PWA metadata. Service-worker caching and offline installation are not implemented.

## Play

Start with only a pickaxe and iron seam. There is no opening tutorial or hold-to-produce button. Machinery and choices appear as you reach them.

1. Swipe down to mine two ore per full pickaxe swing. Three swings reveal the furnace. Mine remains available whenever you need extra supply.
2. Drag the furnace crank clockwise. Its belt drives a blower: more air means more heat. Coast when hot; reverse input brakes. Every ore becomes one plate after five seconds in the 35–80° band. Overheating destroys no inventory.
3. Two plates reveal the press. Three complete down-and-return lever pulls make one gear from two plates. Holding or jittering cannot produce more.
4. Your first gear opens **Workshop**. Choose an ore hoist to remove mining work, or a tool bench to make different parts. Each costs one gear and two plates. Missing ingredients and construction costs are visible; **Plan this** keeps your intended project on the workshop button.
5. Three **lifetime** gears earn the furnace motor. Spending gears on a project does not postpone that reward. Installing the motor drives the blower and unlocks a press belt drive. The blower itself does not create ore.
6. Choose which press die to run. Route new plates to **PRESS**, or to **RESERVE** to keep them safe for projects. Project construction uses reserve plates first. Changing dies resets unpaid press progress; inputs are consumed only when a complete part exits.
7. Build a crawler, give it a job, and improve whichever stage is limiting your next project. The signal mast completes this workshop chapter and strengthens the crawler. Your factory keeps operating afterward.

| Press die | Plates per part | Manual pulls | Automatic cycle |
| --- | ---: | ---: | ---: |
| Gear | 2 | 3 | 12 seconds |
| Spring | 1 | 2 | 8 seconds |
| Frame | 3 | 4 | 16 seconds |

| Project | Cost | Capability |
| --- | --- | --- |
| Ore hoist | 1 gear + 2 plates | Supplies 2 ore every 12 seconds; takes over mining |
| Tool bench | 1 gear + 2 plates | Unlocks spring and frame press dies |
| Belt drive | 2 gears + 2 plates | Furnace motor drives the selected press die automatically |
| Crawler | 2 gears + 2 springs + 1 frame | Hauls 2 extra ore per delivery, or tends the fire for 50% faster smelting |
| Thermal jacket | 2 gears + 2 frames | Reduces the base smelting cycle from 5s to 3.5s |
| Signal mast | 4 gears + 2 frames + 3 springs | Completes the chapter; crawler hauls 3 ore or tends for 75% faster smelting |

The crawler's hauling job can provide supply even without a hoist. Its tending job creates no ore. Assign jobs in Workshop without rebuilding the crawler. New projects appear after their required capabilities/materials have been encountered; the panel shows at most three projects per page.

Automation keeps consuming the same recipes. A stopped machine names its shortage and resumes when stock arrives. The factory scene shows installed machinery, crawler cargo and the chosen material shape. Short-lived output objects spawn on actual production completions. The automated press no longer needs its manual lever control.

## Controls and settings

Right/Left Arrow turn/brake the furnace. Down Arrow swings the pickaxe or pulls the press; Up Arrow returns it. Key repeat cannot create strokes. Modal dialogs block machine keyboard input while the factory can keep running.

Routing and machinery own independent pointers. Two simultaneous touches are optional. Text selection, touch callouts and native dragging are disabled on gesture surfaces. Pointer cancellation, pause and station changes release controls.

Pause/mute are in the header. Options includes reduced motion, diagnostics, production stats, reset/replay and optional mechanism help. Backgrounding pauses; use the play icon to resume. Sound reinforces visual feedback and is not required to play.

## Simulation and saves

Fixed 60 Hz simulation separates input, recipes, progression, rendering, UI, sound and persistence. Balance coefficients are in `src/config/balance.ts`; project costs and press die definitions are centralized in `src/game/workshop.ts`.

Construction is atomic and one-time. Inventory tracks spendable stock separately from lifetime output and material embedded in equipment:

```text
ore + plates + reserve + 2×gears + springs + 3×frames + materialSpent
  = minedOre + deliveredOre
```

Supply time advances only while a hoist or hauling crawler is providing ore. Actual delivered ore is recorded because different equipment combinations change the batch size. A motor kit is an explicit milestone reward, not a realistic manufacturing recipe.

Version 4 localStorage saves migrate existing runs in place, preserve stock and partial work, and resume old completed eight-gear games. Previously automated runs receive a legacy ore hoist so existing supply is preserved. Earlier pre-mining saves keep their original 12-ore ledger credit. Invalid saves start fresh. There is no offline production, network telemetry or remote font dependency.

## Research and design

- [Primary-source gameplay research](docs/gameplay-research.md): Factorio developer accounts plus original autonomy/competence and enjoyment research, with design inferences clearly distinguished from evidence.
- [Original conversation and direction](docs/original-inspiration.md): following material transformations, persistent production dependencies, and permanently automating understood physical work.
- [Expansion design](docs/workshop-expansion.md): bounded scope, recipes, effects and verification.

The working hypothesis is that understanding a process, choosing what to build, and watching that choice change the next bottleneck make a better loop. A larger catalog alone does not establish enjoyment. The next phone playtest should ask which first build the player wants, whether they understand its effect, and whether they choose to inspect the next capability without prompting.

## Verification

40 tests cover physical input, recipe atomicity, lifetime unlocks after spending, every construction cost, material conservation, temperature boundaries, unattended automation, starvation/recovery, crawler jobs, guidance and save migration. An input-driven run builds every project in about **297 seconds**, then continues producing unattended with conservation checked throughout.

Browser checks exercised the real first-gear workshop reveal and shortages, project construction, die switching, automated spring output, crawler reassignment, signal-mast completion without an end dialog, and continued production. A separate advanced-stock test origin isolated later UI checks from the ongoing game. Physical iOS/Android gesture feel and enjoyment still need playtesting.

`npm test` and `npm run build` pass. The highest-value next content is a distinct physical process with another input stream, such as copper winding feeding an assembler; add it after testing whether the current allocation choices are understandable and enjoyable.

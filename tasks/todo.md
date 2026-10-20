# Factory Crank implementation

- [x] Implement and test fixed-step crank physics and pointer isolation.
- [x] Implement atomic recipes, routing, progression and automation.
- [x] Build responsive playable factory, controls, audio and persistence.
- [x] Verify tests, production build and browser playthrough.
- [x] Document controls, balance and results; commit scoped changes.

## Plan review
Proceed with the supplied TypeScript/Vite/Canvas stack. Motor unlocks at 3 gears; initial 12 ore supports this milestone. Supply delivery prevents reserve routing from blocking progress. Furnace automation then supplies the remaining run.

## Review
13 tests pass; production build passes; npm audit reports zero vulnerabilities. Browser confirmed circular crank torque/coasting, hold input, plate production, tutorial progression and reopen, plus no-scroll layouts at 320×640 and 390×844. Input-driven simulation completes eight gears in 205.6 seconds. Physical multi-touch/audio remain device validation items.

## Playtest correction: onboarding
- [x] Add first-run walkthrough and action-driven, prominent tutorial steps.
- [x] Add explicit hold-to-crank alternative and immediate tap feedback.
- [x] Verify walkthrough, dismiss/reopen and actual first plate in browser.

## Playtest correction: controls are machine parts
- [x] Replace hold shortcut with a furnace crank visibly driving the blower.
- [x] Give the gear press a drag lever connected to its ram; production requires actual strokes.
- [x] Explain ore hopper → furnace heat and plates → press force in the tutorial.
- [x] Raise machinery and completion sound levels.
- [x] Verify gestures, conservation, save migration, layouts and build; commit.

Plan review: Keep the hopper as a gravity feed, show a belt-driven blower on the furnace, and make press lever position drive the ram directly. A full lever pull performs one compression stroke. Returning the lever resets the mechanism, not production. No hold-to-produce path.

## Playtest correction: start with less
- [x] Remove automatic tutorial; reveal machinery and controls through production milestones.
- [x] Start with only ore, furnace and blower; reveal press at two plates, routing after one gear, motor after two gears.
- [x] Verify opening and progressive reveals in browser and tests.


## Machine-control review
- 24 tests pass, including full lever stroke gating, pointer cancellation/isolation, material conservation, v1 save migration and progressive reveals.
- Production build passes. Browser cranking produced two plates, automatically revealed the lever, and three actual drag pulls made a gear and revealed routing. Dragging left the browser selection empty.
- Fresh game opens without a modal, press, routing or motor clutter. Opening and press layouts checked at 390×844 and 320×640; compact opening adjusted by 16px after measurement.
- Blower hum gain increased from .025 to .085 and impact gain from .07 to .23. Hum pitch/harmonics adjusted for phone speakers; physical iOS callout behavior and perceived volume remain device checks.
- The new lever makes the deterministic expert run quicker (85.5s); physical playtesting should guide balance instead of adding artificial waits.

## Mining before smelting
- [x] Start with a rock seam and swipe-operated pickaxe, with zero loose ore.
- [x] Award two ore per full swing; reveal furnace after three swings (six ore).
- [x] Keep the mine available for supply; start automatic deliveries only after the furnace motor is installed.
- [x] Add pickaxe impact, rock chips, mining save migration and progression tests.
- [x] Verify browser gestures, mobile layout, tests and build; document and commit.

Plan review: Mining is a physical downward swing, not a tap or hold shortcut. The mine starts alone. Three swings reveal the furnace; later tabs allow Mine/Furnace/Press. Recipes conserve mined and delivered ore. Existing saves keep their inventories and skip the new opening.


## Mining review
- 28 tests and the production build pass. Conservation now includes mined ore, and automatic deliveries accrue only while the motor runs.
- Browser swipes awarded 2 ore each; the third swing revealed the furnace with 6 ore. Return-to-mine works. Text selection stayed empty.
- Mine and furnace layouts fit 320×640 and 390×844. Existing inventories and partial work migrate to save version 3.
- Complete deterministic mining-to-eight-gears run finishes in 102s. Physical phone sound/touch feel remains a playtest follow-up.

## Mobile hostname access
- [x] Add the exact Tailscale hostname to Vite's allowed hosts.
- [x] Verify the live server serves that Host header and still rejects unrelated hosts; build and commit.

Plan review: Reproduced HTTP 403 using the phone's hostname as the Host header. Add an explicit allowlist entry; retain existing all-interface listening for mobile access.

Mobile hostname review: Reproduced HTTP 403, added vite.config.ts and restarted the existing dev server on port 5173. The exact Tailscale Host header now returns the game with HTTP 200; unrelated.invalid still returns HTTP 403; localhost returns HTTP 200. Production build passes.

## Open-ended workshop expansion
- [x] Research factory-game enjoyment and game enjoyment using primary sources; save cited findings.
- [x] Implement typed project catalog, atomic costs, lifetime unlocks and resource accounting.
- [x] Add springs/frames, press automation, ore hoist, thermal jacket, crawler jobs and signal mast.
- [x] Replace eight-gear stop with continuing milestones and progressive workshop UI.
- [x] Migrate saves, verify full production/choice paths and browser/mobile interactions.
- [x] Update documentation and review results; commit.

Plan review: docs/workshop-expansion.md defines the bounded playable expansion. First gear opens an automation-versus-new-products choice. Every subsequent project changes production or opens a new capability. Preserve the uncluttered opening and physical gestures.

## Public test repository
- [x] Find the solyin-enof GitHub browser session and review publication files.
- [x] Verify current snapshot: 40 tests pass and production build succeeds.
- [x] Publish a fresh public snapshot without QA artifacts or local hostname.
- [x] Verify uploaded files and public visibility.

Plan review: Publish the current Factory Crank source to solyin-enof/factory-crank using a fresh history; preserve local in-progress changes.

Publication review: Public repository https://github.com/solyin-enof/factory-crank verified in the solyin-enof browser session. All 39 source/document files uploaded in a fresh Git history. Tests: 40 passing; production build passes. QA artifacts, dependencies, build output and machine-specific allowed hostname are excluded. Local gameplay work remains unchanged.

## GitHub Pages playtest
- [x] Build public snapshot with /factory-crank/ asset base.
- [x] Commit and upload static files to gh-pages; enable Pages.
- [x] Verify deployed game loads and accepts input.

Plan review: Serve the compiled game from gh-pages at https://solyin-enof.github.io/factory-crank/.


## Workshop expansion review
- Primary-source research saved in docs/gameplay-research.md. User-provided inspiration read and summarized separately in docs/original-inspiration.md; the implementation emphasizes material transformation and obsolete manual controls.
- Six projects, springs/frames, automated pressing, crawler jobs, thermal throughput and a non-blocking signal milestone implemented. The fresh mine remains unchanged.
- 40 tests pass. Full input-driven construction of all six projects finishes around297s, preserves material accounting and continues unattended. Save v4 migrates previously finished games and preserves old supply.
- Real browser flow made the first gear and opened two choice cards with missing stock. Isolated advanced UI checks built projects, selected spring output, reassigned the crawler, completed the mast, and observed automatic stock growth without an end dialog.
- Review found and fixed modal-arrow input leakage, outdated GEARS routing labels, and product-first empty-hopper guidance. The automated press's manual control is removed after installation.
- Production build passes. Physical phone feel, pacing and voluntary replay remain human playtest questions; tests do not establish fun.

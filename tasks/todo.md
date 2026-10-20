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

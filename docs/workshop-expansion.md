# Workshop expansion

## Intent
Keep the mining → blower → press opening. After the first gear, let players spend shared stock on different capabilities. Reveal only relevant projects; installed machines visibly replace work and expose the next bottleneck. Eight gears is no longer an ending.

## Player loop
1. First gear reveals two workshop choices: Ore hoist (less mining) or Tool bench (new products).
2. Furnace motor still arrives at three lifetime gears, even if held gears were spent.
3. Tool bench unlocks spring and frame dies on the existing physical press. Springs use 1 plate/2 strokes; frames use 3 plates/4 strokes; gears remain 2 plates/3 strokes.
4. The furnace motor unlocks a Belt drive that operates the press automatically. Selecting a press recipe controls what the automated line makes.
5. Ore hoist plus access to frames unlocks a Thermal jacket that smelts faster.
6. Making springs and frames reveals a Crawler. Once built, assign it to haul ore or tend the furnace; changing jobs shifts the bottleneck without losing the machine.
7. A Crawler reveals the Signal mast project. Building it completes the first workshop milestone and improves the crawler. Production and experimentation continue afterward.

## Projects and explicit costs
- Ore hoist: 1 gear + 2 plates. Supplies 2 ore every 12 seconds, independently of the furnace motor. First gear unlocks it.
- Tool bench: 1 gear + 2 plates. Unlocks spring/frame dies. First gear unlocks it.
- Belt drive: 2 gears + 2 plates. Automates the selected press die when the furnace motor is installed. Furnace motor unlocks it.
- Crawler: 2 gears + 2 springs + 1 frame. Requires bench and first produced spring/frame. Hauling adds 2 ore to supply batches; tending increases furnace speed by 50%. It can haul even without an ore hoist.
- Thermal jacket: 2 gears + 2 frames. Requires ore hoist, bench and first frame. Reduces smelt cycle from 5s to 3.5s.
- Signal mast: 4 gears + 2 frames + 3 springs. Requires crawler. Marks the first workshop complete and increases crawler assistance by 50%.

Project assembly is a deliberate one-time allocation, not repeated tapping for output. All costs are checked atomically, reserve plates are spent before press plates, and partial crafting never consumes resources.

## State and modules
- Catalog in game/workshop.ts owns typed costs, prerequisites, availability/missing-stock explanations, craft installation and selected die.
- Track lifetime gears/springs/frames for unlocks, spendable inventories for costs, and materialSpent for iron embedded in equipment.
- Keep resource mass invariant: ore + plates + reserve + 2*gears + springs + 3*frames + materialSpent = minedOre + deliveredOre.
- Supply clock belongs to ore hoist/crawler, not a blower. Delivery batches track actual deliveredOre to allow variable batch size.
- Automatic press uses the same atomic recipes as the lever. Holding/jitter never powers manual output. Machines stop with clear shortages, then recover when inputs arrive.
- Save version migrates old progress, resumes completed eight-gear saves, and preserves old automatic supply by granting a legacy ore hoist. Credit historical material production where needed; never erase inventories.

## Interface
The fresh mine remains unchanged. A compact Workshop button appears after the first gear; its panel contains no more than three ready-to-build projects at once, visible costs, shortages and installed effects. Locked future choices are revealed only when relevant. Inventory and press-die selector expand only after the bench. Show a live factory summary and installed machinery in the scene. No blocking tutorial or mandatory result modal.

## Verification
Test recipe atomicity, irreversible spending/lifetime unlocks, mass conservation through every project, unattended automation, starvation/recovery, switching dies, crawler assignment, completed-save migration, and an input-driven full chapter. Browser-check fresh mine, first workshop choice, real craft consumption/effect, press recipe selector, mobile layout, saves and milestone continuation. Run tests and production build, update README/todo, commit scoped files.

## Research
See gameplay-research.md for cited primary-source evidence and the distinction between research findings and design inferences. These choices are hypotheses to playtest; functional completeness cannot establish fun.

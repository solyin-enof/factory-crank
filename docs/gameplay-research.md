# Factory Crank: growing the playable loop

Research date: 2026-10-19. This is design research and a proposal, not a claim that the proposed features have shipped. The existing tactile mine → furnace → gear press opening is the starting point. The user's direction supersedes the original eight-gear finish: making gears should open up choices about what to build next.

## What the sources actually support

These are six primary sources: four accounts by Factorio's developers and two original game-enjoyment papers. Developer reasoning is valuable experience, not controlled evidence that a particular mechanic will work here. The studies support design hypotheses; neither proves this game will be fun.

| Source | Finding or author position | Practical inference for this game |
| --- | --- | --- |
| [Wube, FFF #376: Research and Technology](https://www.factorio.com/blog/post/fff-376), 2023-09-15 | Kovarex describes automation as the way to overcome resource grind, rejects bloating the game with many recipes that work alike, and argues that the strongest strategy must also be enjoyable. The article's trigger technologies connect discoveries to mining and crafting actual materials. | Make upgrades remove a task the player has felt. Reveal useful next capabilities through production. A recipe needs a different consequence, not only a new name. |
| [Wube, FFF #284: 0.17 experimental](https://www.factorio.com/blog/post/fff-284), 2019-03-01 | Abregado's introduction-design goals include creativity, learning through doing, limited initial choice, and purposeful production. He describes competition between consumption needs as a way to teach production; a fixed research cost alone can encourage waiting. | Give gears competing uses. Let the player choose a useful project while another need remains visible. Do not make accumulating an arbitrary stockpile the whole objective. This article describes an experimental introduction with acknowledged rough edges; its difficulty is not a model to reproduce. |
| [Wube, FFF #305: The Oil Changes](https://www.factorio.com/blog/post/fff-305), 2019-07-26 | The developers identify a mismatch between many unlocked technologies and little working automation as a source of confusion. Their proposed learning curve establishes a functioning basic process before adding complications. They favor an intermediate with several useful downstream uses. | Show one new production concept at a time. Let new materials become useful in multiple projects, and reveal advanced variants after the basic machine has produced something. |
| [Wube, FFF #375: Quality](https://www.factorio.com/blog/post/fff-375), 2023-09-08 | Kovarex distinguishes expanding production from improving production, and values the strategic balance between them. Limited improved machinery creates a prioritization problem. The feature's UI is hidden until unlocked. | Offer a choice between expanding the product range and improving a current bottleneck. Keep future systems out of the starting UI. This is a design principle, not a proposal to copy quality tiers, random rolls, recyclers, or Factorio's recipes. |
| [Ryan, Rigby & Przybylski, *The Motivational Pull of Video Games*](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf), 2006, DOI [10.1007/s11031-006-9051-8](https://doi.org/10.1007/s11031-006-9051-8) | Across four studies, perceived in-game autonomy and competence were associated with enjoyment; intuitive controls were related to those experiences. The multiplayer study also found relatedness predictive of enjoyment and future play. | Support ownership of the next goal and make successful control legible. This is evidence for autonomy and competence as useful lenses, not proof that adding a choice menu causes enjoyment. It does not require adding multiplayer to this solo game. |
| [Sweetser & Wyeth, *GameFlow: A Model for Evaluating Player Enjoyment in Games*](https://doi.org/10.1145/1077246.1077253), 2005 | Their flow-based evaluation model includes challenge, player skills, control, clear goals, feedback, concentration, immersion, and social interaction. Initial evaluation used expert reviews of two real-time strategy games. | Use clear current goals, immediate response, and challenges that develop with understanding as review questions. GameFlow is a heuristic model with limited initial validation, not a universal formula or a requirement to maximize difficulty. |

## Working design hypothesis

The satisfying cycle is **do a little physical work → understand the process → build something that changes it → see a new bottleneck → choose what to solve next**. This synthesis is our inference from the sources and the user's feedback. It should be tested with actual players.

The controls are a central difference from a large factory-building game: the pickaxe visibly chips rock, the furnace wheel drives a blower, and the press lever drives its ram. A machine upgrade should keep those mechanical connections visible. A menu click can commit a construction choice; it should not replace operating the machine with repeated clicks.

## Proposed next playable loop

### 1. Gears open a workshop

After the first gear, reveal a compact workshop alongside the existing stations. Show the current inventory, two or three available projects, exact resource costs, and one plain sentence explaining each result. Keep undiscovered branches absent from the opening screen.

The first three directions should answer different player intentions:

| Player intention | Project | Immediate consequence | New pressure |
| --- | --- | --- | --- |
| “I want to stop mining by hand.” | A mechanical extractor built from gears and plates | A visible hammer/linkage brings in ore periodically; the pickaxe still works for an extra batch. | The furnace becomes the slow stage. |
| “I want to work at the press while the furnace runs.” | A regulated blower drive | The existing furnace wheel runs itself and maintains useful heat. | The player needs a steadier supply of ore or more press capacity. |
| “I want to build a different product.” | A forming die or winding bench | Existing stock can become a part with a distinct downstream purpose, such as a frame or coil. | Plates are now shared between more than one useful output. |

Names, costs, and timing are proposed tuning, not findings from the literature. The important property is that the choices change the player's next few minutes. They should remain available later: choosing an extractor first should postpone a blower, not permanently punish the player.

### 2. A second product introduces allocation

The gear press can initially use alternate dies to make gears and frames from plates. Frames contribute to a visible assembly project and machinery construction. Switching dies does not discard paid partial work; the UI explains when a job is waiting for plates. One press shared between recipes creates a concrete scheduling decision without immediately requiring a map, conveyor editor, or many new controls.

If a copper/wire branch is added, it should introduce an actual second input stream and a tactile winding action. A circuit icon bought from the same plate counter would add vocabulary without teaching a new production relationship. Copper, wire, and circuits are candidates for a later stage, after the first allocation choice is demonstrably enjoyable.

### 3. Automation changes what the player does

Automate the press with a visible cam cycling the same ram previously operated by hand. Let the player choose its active recipe while the machine performs the strokes. This frees attention for allocation and the next mechanism. An automation upgrade must keep consuming the documented inputs and obey the same output recipes.

Offer a small throughput improvement only when it competes meaningfully with expansion. More incoming ore has little value while the furnace is already the bottleneck; label this state plainly rather than implying every upgrade is equally helpful.

### 4. Give the factory an output worth making

Use a visible build, such as a small hauling cart or workshop helper, to consume gears, frames, and a later motor part. Show its silhouette gaining components as the player commits materials. Completion should open another useful capability or a new commission rather than immediately end the session. A compact completion panel can celebrate the milestone while leaving the factory playable.

Production counts may reveal projects, but construction should consume real inventory. Keep cumulative “ever made” milestones distinct from current stock so spending gears cannot accidentally relock machinery or invalidate a save. Preserve existing runs and the original motor award as an explicit legacy/milestone rule where needed.

## Guardrails for implementation and playtesting

- **No busywork tech checklist.** Every unlock should either remove manual labor, enable a different product, or change allocation/throughput. Skip cosmetic intermediate recipes with no decision attached.
- **No winning by waiting alone.** If every available action is waiting for the same counter, costs or throughput need tuning. There should be a useful mechanical or planning action, with no requirement for frantic repetition.
- **No dominant tedious strategy.** Test whether optimal progress asks the player to repeat pickaxe swings long after an extractor is available, or constantly switch tabs to prevent losses. Improve the system rather than instructing the player to avoid optimizing.
- **Recoverable choices.** Manual input remains available; projects cannot spend unavailable resources; no essential automation requires its own locked output; shortages name the input and its source. Prefer postponement over permanent failure.
- **Readable automation.** Show a completed item, the mechanism that made it, and why a station stopped. Sound reinforces feedback but cannot carry essential information.
- **Progressive UI.** Begin with the mine. Reveal a workshop when its first choices become actionable, and later choices when their materials have been encountered. Keep the active mechanism large on a 320 × 640 screen.

Observe a fresh player after the first gear. Can they explain their chosen project and what it changes? Do they notice a different bottleneck after building it? Can they choose a different useful first project on replay? Do they voluntarily inspect the next capability after automation? Those observations are stronger evidence of fun than a large recipe count or a passing simulation test.

Record local milestone times and watch for long stretches with no meaningful input. Use tests to prove recipes, saves, unlocks, and automation are correct; use phone playtesting to decide whether gestures, pacing, sound, and choices are enjoyable. No network analytics or account system is needed.

import { expect, it } from 'vitest';
import { initialState } from '../src/game/initialState';
import { tutorial } from '../src/ui/tutorial';
it('explains the real supply bottleneck on the product-first path',()=>{
 const s=initialState();Object.assign(s,{active:'press',automatic:true,gearsMade:3});s.workshop.toolBench=true;
 expect(tutorial(s).stage).toContain('SUPPLY');
 expect(tutorial(s).hint).toContain('Mine');
 s.workshop.crawler=true;s.crawlerJob='tend';
 expect(tutorial(s).stage).toContain('SUPPLY');
 s.crawlerJob='haul';
 expect(tutorial(s).stage).not.toContain('SUPPLY');
});
it('gives die-specific manual stroke goals and automated instructions',()=>{
 const s=initialState();Object.assign(s,{active:'press',plates:4,pressRecipe:'frame'});s.workshop.toolBench=true;
 expect(tutorial(s).hint).toContain('/4 pulls');
 s.automatic=true;s.workshop.beltDrive=true;
 expect(tutorial(s).action).toContain('frames');
 expect(tutorial(s).hint).toContain('Reserve');
});

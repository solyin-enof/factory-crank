import { describe, expect, it } from 'vitest';
import { PointerTracker, unwrapAngle } from '../src/input/pointerControls';

describe('crank angle displacement', () => {
  it('unwraps clockwise movement across the angle boundary', () => {
    expect(unwrapAngle(-Math.PI * 2 + 0.2)).toBeCloseTo(0.2);
  });
  it('unwraps counterclockwise movement across the angle boundary', () => {
    expect(unwrapAngle(Math.PI * 2 - 0.2)).toBeCloseTo(-0.2);
  });
  it('preserves small displacement, regardless of event frequency', () => {
    const steps = Array.from({ length: 100 }, () => unwrapAngle(0.001));
    expect(steps.reduce((sum, step) => sum + step, 0)).toBeCloseTo(unwrapAngle(0.1));
  });
});

describe('independent pointer ownership', () => {
  it('keeps crank and route pointers independent on release', () => {
    const tracker = new PointerTracker();
    expect(tracker.claim(1, 'wheel')).toBe(true);
    expect(tracker.claim(2, 'route')).toBe(true);
    expect(tracker.claim(1, 'route')).toBe(false);
    tracker.release(2);
    expect(tracker.owns(1, 'wheel')).toBe(true);
    expect(tracker.owns(2, 'route')).toBe(false);
    expect(tracker.size).toBe(1);
    tracker.release(1);
    expect(tracker.size).toBe(0);
  });
});

import { leverPosition, PointerControls } from '../src/input/pointerControls';

class FakeControl extends EventTarget {
  captures = new Set<number>();
  getBoundingClientRect() { return { left: 0, top: 0, width: 200, height: 200 }; }
  setPointerCapture(id: number) { this.captures.add(id); }
  hasPointerCapture(id: number) { return this.captures.has(id); }
  releasePointerCapture(id: number) { this.captures.delete(id); }
  pointer(type: string, pointerId: number, clientY = 0, clientX = 0) {
    this.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { pointerId, clientX, clientY }));
  }
  get element(): HTMLElement { return this as unknown as HTMLElement; }
}

describe('lever displacement', () => {
  it('normalizes total downward travel and clamps the physical endpoints', () => {
    expect(leverPosition(25, 200)).toBe(0.25);
    expect(leverPosition(100, 200)).toBe(1);
    expect(leverPosition(500, 200)).toBe(1);
    expect(leverPosition(-25, 200)).toBe(0);
    expect(leverPosition(20, 0)).toBe(0);
  });

  it('keeps controls independent, rejects duplicate physical owners, and cancels cleanly', () => {
    const wheel = new FakeControl();
    const route = new FakeControl();
    const lever = new FakeControl();
    const positions: number[] = [];
    const turns: number[] = [];
    let releases = 0;
    const controls = new PointerControls(wheel.element, route.element, {
      turn: value => turns.push(value), route: () => {}, gesture: () => {},
      lever: value => positions.push(value), leverRelease: () => { releases++; },
    }, lever.element);
    wheel.pointer('pointerdown', 1, 100, 200);
    wheel.pointer('pointerdown', 4, 100, 200);
    lever.pointer('pointerdown', 2, 20);
    lever.pointer('pointerdown', 5, 20);
    route.pointer('pointerdown', 3);
    expect(controls.activePointers).toBe(3);
    expect(positions).toEqual([]); // Holding or tapping cannot produce a stroke.
    lever.pointer('pointermove', 5, 120);
    lever.pointer('pointermove', 2, 45);
    lever.pointer('pointermove', 2, 70);
    expect(positions).toEqual([0.25, 0.5]);
    lever.pointer('pointercancel', 2);
    lever.pointer('lostpointercapture', 2);
    expect(releases).toBe(1);
    expect(controls.activePointers).toBe(2);
    wheel.pointer('pointermove', 1, 200, 100);
    expect(turns).toEqual([0.65]);
    controls.reset();
    expect(controls.activePointers).toBe(0);
    expect(wheel.captures.size + route.captures.size + lever.captures.size).toBe(0);
    wheel.pointer('pointermove', 1, 100, 0);
    expect(turns).toHaveLength(1);
    controls.dispose();
  });
});

describe('pickaxe pointer input', () => {
  it('requires downward movement, clamps the swing, and releases cancellation once', () => {
    const wheel = new FakeControl();
    const route = new FakeControl();
    const lever = new FakeControl();
    const pickaxe = new FakeControl();
    const swings: number[] = [];
    const leverPositions: number[] = [];
    let releases = 0;
    const controls = new PointerControls(wheel.element, route.element, {
      turn: () => {}, route: () => {}, gesture: () => {},
      swing: value => swings.push(value), swingRelease: () => { releases++; },
      lever: value => leverPositions.push(value),
    }, lever.element, pickaxe.element);
    pickaxe.pointer('pointerdown', 1, 20);
    pickaxe.pointer('pointerdown', 2, 20);
    lever.pointer('pointerdown', 3, 20);
    expect(controls.activePointers).toBe(2);
    expect(swings).toEqual([]);
    pickaxe.pointer('pointermove', 2, 120);
    pickaxe.pointer('pointermove', 1, 70);
    pickaxe.pointer('pointermove', 1, 500);
    pickaxe.pointer('pointermove', 1, 0);
    expect(swings).toEqual([0.5, 1, 0]);
    pickaxe.pointer('pointercancel', 1);
    pickaxe.pointer('lostpointercapture', 1);
    expect(releases).toBe(1);
    expect(controls.activePointers).toBe(1);
    lever.pointer('pointermove', 3, 45);
    expect(leverPositions).toEqual([0.25]);
    pickaxe.pointer('pointerdown', 4, 20);
    controls.reset();
    expect(releases).toBe(2);
    expect(controls.activePointers).toBe(0);
    expect(pickaxe.captures.size + lever.captures.size).toBe(0);
    pickaxe.pointer('pointermove', 4, 120);
    expect(swings).toHaveLength(3);
    controls.dispose();
  });
});

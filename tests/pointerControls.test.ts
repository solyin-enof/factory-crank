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

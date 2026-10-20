import { describe, expect, it } from 'vitest';
import { initialState, step, installMotor, transferReserve, advanceWheel } from '../src/game/simulation';
import { smelt, pressGear } from '../src/game/recipes';
import { BALANCE as B } from '../src/config/balance';
import { updateProgression } from '../src/game/progression';

const run = (state: ReturnType<typeof initialState>, seconds: number) => {
  for (let i = 0; i < seconds * 60; i++) step(state, 1 / 60);
};

describe('factory simulation', () => {
  it('makes recipes atomic and conserves material through routing', () => {
    const s = initialState();
    expect(pressGear(s)).toBe(false);
    s.route = 'reserve';
    smelt(s); smelt(s);
    expect(s.ore + s.plates + s.reserve + 2 * s.gears).toBe(12);
    transferReserve(s);
    expect(pressGear(s)).toBe(true);
    expect(s.ore + s.plates + s.reserve + 2 * s.gears).toBe(12);
    s.ore = 0;
    expect(smelt(s)).toBe(false);
    expect(s.ore).toBe(0);
  });
  it('coasts after release and brakes counterclockwise input', () => {
    const wheel = { angle: 0, speed: 0, impulse: 3 };
    advanceWheel(wheel, 1 / 60);
    const speed = wheel.speed;
    advanceWheel(wheel, 1 / 60);
    expect(wheel.speed).toBeGreaterThan(0);
    expect(wheel.speed).toBeLessThan(speed);
    wheel.impulse = -100;
    advanceWheel(wheel, 1 / 60);
    expect(wheel.speed).toBe(0);
  });
  it('halts smelting outside the operating temperature band', () => {
    for (const temperature of [20, 90]) {
      const s = initialState();
      s.temperature = temperature;
      step(s, 1 / 60);
      expect(s.furnaceProgress).toBe(0);
      expect(s.ore).toBe(12);
    }
    const s = initialState();
    s.temperature = 50;
    step(s, 1 / 60);
    expect(s.furnaceProgress).toBeGreaterThan(0);
  });
  it('rewards exactly one kit and consumes it once on installation', () => {
    const s = initialState();
    expect(installMotor(s)).toBe(false);
    s.gears = 3;
    updateProgression(s); updateProgression(s);
    expect(s.kit).toBe(1);
    expect(installMotor(s)).toBe(true);
    expect(installMotor(s)).toBe(false);
    expect(s.kit).toBe(0);
    expect(s.active).toBe('press');
  });
  it('makes a first plate within ten seconds with a maintained crank', () => {
    const s = initialState();
    for (let i = 0; i < 10 * 60 && s.firstPlate === null; i++) {
      s.furnace.impulse += 0.08;
      step(s, 1 / 60);
    }
    expect(s.firstPlate).not.toBeNull();
    expect(s.firstPlate!).toBeLessThanOrEqual(10);
  });
  it('automates without touch, replenishes ore and completes eight gears', () => {
    const s = initialState();
    // Reach the milestone through explicit recipes, then let the motor work.
    for (let i = 0; i < 6; i++) smelt(s);
    for (let i = 0; i < 3; i++) pressGear(s);
    updateProgression(s);
    installMotor(s);
    run(s, 20);
    expect(s.autoOutput).toBeGreaterThan(0);
    for (let i = 0; i < 180 * 60 && !s.finished; i++) {
      s.press.impulse += 0.08;
      step(s, 1 / 60);
      expect(s.ore + s.plates + s.reserve + s.gears * 2).toBe(12 + s.deliveries * 2);
    }
    expect(s.finished).toBe(true);
    expect(s.gears).toBe(8);
    expect(s.temperature).toBeGreaterThan(35);
    expect(s.temperature).toBeLessThan(80);
  });
  it('includes both exact temperature boundaries and excludes adjacent values', () => {
    const dt = 1 / 60;
    for (const [temperature, allowed] of [[35, true], [80, true], [34.999, false], [80.001, false]] as const) {
      const s = initialState();
      // Idle cooling lands exactly on the requested boundary after this step.
      s.temperature = temperature + B.cooling * dt;
      step(s, dt);
      expect(s.temperature).toBeCloseTo(temperature, 10);
      expect(s.furnaceProgress > 0).toBe(allowed);
    }
  });
  it('plays the entire run through manual crank input and the motor upgrade', () => {
    const s = initialState();
    for (let frame = 0; frame < 300 * 60 && !s.finished; frame++) {
      // A one-thumb operator makes occasional furnace corrections, then cranks
      // the press while furnace inertia keeps the blower moving.
      const targetSpeed = Math.max(0, Math.min(B.maxSpeed,
        (B.cooling + (55 - s.temperature) * 0.7) / B.heating * B.maxSpeed));
      if (!s.automatic && s.furnace.speed < targetSpeed - 1) {
        s.furnace.impulse += 0.2;
      } else if (s.plates >= 2) {
        s.press.impulse += 0.15;
      }
      step(s, 1 / 60);
      if (s.kit > 0) expect(installMotor(s)).toBe(true);
      expect(s.ore + s.plates + s.reserve + 2 * s.gears).toBe(12 + B.deliveryOre * s.deliveries);
    }
    expect(s.finished).toBe(true);
    expect(s.elapsed).toBeLessThan(300);
    expect(s.firstPlate).toBeGreaterThan(0);
    expect(s.firstGear).toBeGreaterThan(s.firstPlate!);
    expect(s.motorAt).toBeGreaterThan(s.firstGear!);
    expect(s.autoOutput).toBeGreaterThan(0);
    expect(s.kit).toBe(0);
    console.info('Full playable run timings (seconds)', {
      firstPlate: s.firstPlate, firstGear: s.firstGear, motor: s.motorAt, finish: s.elapsed,
    });
  });

});

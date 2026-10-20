export type Route = 'gears' | 'reserve';
type Control = 'wheel' | 'route';

/** Signed shortest angular displacement. Screen coordinates make clockwise positive. */
export function unwrapAngle(delta: number): number {
  if (!Number.isFinite(delta)) return 0;
  return Math.atan2(Math.sin(delta), Math.cos(delta));
}

export class PointerTracker {
  private readonly owners = new Map<number, Control>();

  claim(id: number, control: Control): boolean {
    if (this.owners.has(id)) return false;
    this.owners.set(id, control);
    return true;
  }

  owns(id: number, control: Control): boolean {
    return this.owners.get(id) === control;
  }

  release(id: number): void {
    this.owners.delete(id);
  }

  get size(): number { return this.owners.size; }
}

export interface PointerCallbacks {
  turn(delta: number): void;
  route(value: Route): void;
  gesture(): void;
}

export class PointerControls {
  private readonly pointers = new PointerTracker();
  private readonly angles = new Map<number, number>();
  private readonly captured = new Map<number, HTMLElement>();
  private readonly listeners = new AbortController();

  constructor(
    private readonly wheel: HTMLElement,
    private readonly route: HTMLElement,
    private readonly callbacks: PointerCallbacks,
  ) {
    this.attach(wheel, 'wheel');
    this.attach(route, 'route');
  }

  get activePointers(): number { return this.pointers.size; }

  dispose(): void {
    this.listeners.abort();
    for (const [id, element] of this.captured) {
      this.pointers.release(id);
      if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    }
    this.captured.clear();
    this.angles.clear();
  }

  private attach(element: HTMLElement, control: Control): void {
    const options = { signal: this.listeners.signal };
    element.addEventListener('pointerdown', (event) => {
      if (!this.pointers.claim(event.pointerId, control)) return;
      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      this.captured.set(event.pointerId, element);
      this.callbacks.gesture();
      if (control === 'wheel') this.angles.set(event.pointerId, this.angle(event));
      else this.selectRoute(event);
    }, options);
    element.addEventListener('pointermove', (event) => {
      if (!this.pointers.owns(event.pointerId, control)) return;
      event.preventDefault();
      if (control === 'route') {
        this.selectRoute(event);
        return;
      }
      const angle = this.angle(event);
      const previous = this.angles.get(event.pointerId);
      this.angles.set(event.pointerId, angle);
      if (previous !== undefined) {
        const delta = unwrapAngle(angle - previous);
        this.callbacks.turn(Math.max(-0.65, Math.min(0.65, delta)));
      }
    }, options);
    const release = (event: PointerEvent) => {
      if (!this.pointers.owns(event.pointerId, control)) return;
      this.pointers.release(event.pointerId);
      this.angles.delete(event.pointerId);
      this.captured.delete(event.pointerId);
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    };
    element.addEventListener('pointerup', release, options);
    element.addEventListener('pointercancel', release, options);
    element.addEventListener('lostpointercapture', release, options);
  }

  private angle(event: PointerEvent): number {
    const bounds = this.wheel.getBoundingClientRect();
    return Math.atan2(event.clientY - bounds.top - bounds.height / 2,
      event.clientX - bounds.left - bounds.width / 2);
  }

  private selectRoute(event: PointerEvent): void {
    const bounds = this.route.getBoundingClientRect();
    this.callbacks.route(event.clientX < bounds.left + bounds.width / 2 ? 'gears' : 'reserve');
  }
}

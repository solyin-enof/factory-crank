export class Sound {
 private context?: AudioContext;
 muted = false;
 private hum?: GainNode;
 private oscillator?: OscillatorNode;
 unlock() { this.context ??= new AudioContext(); if(!this.hum){this.hum=this.context.createGain();this.hum.gain.value=0;this.oscillator=this.context.createOscillator();this.oscillator.type='sine';this.oscillator.frequency.value=65;this.oscillator.connect(this.hum).connect(this.context.destination);this.oscillator.start();} void this.context.resume(); }
 update(speed: number, paused: boolean) {
  if(!this.context||!this.hum||!this.oscillator)return;
  this.hum.gain.setTargetAtTime(this.muted||paused?0:Math.min(speed/14,1)*.025,this.context.currentTime,.1);
  this.oscillator.frequency.setTargetAtTime(45+speed*5,this.context.currentTime,.1);
 }
 ping(frequency = 420) {
  if (!this.context || this.muted) return;
  const oscillator = this.context.createOscillator(), gain = this.context.createGain();
  oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency / 2, this.context.currentTime + .12);
  gain.gain.setValueAtTime(.07, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + .16);
  oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + .17);
 }
}

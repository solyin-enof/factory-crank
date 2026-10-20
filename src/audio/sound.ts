export class Sound {
 private context?: AudioContext;
 muted = false;
 private hum?: GainNode;
 private oscillator?: OscillatorNode;
 unlock() { this.context ??= new AudioContext(); if(!this.hum){this.hum=this.context.createGain();this.hum.gain.value=0;this.oscillator=this.context.createOscillator();this.oscillator.type='triangle';this.oscillator.frequency.value=65;this.oscillator.connect(this.hum).connect(this.context.destination);this.oscillator.start();} void this.context.resume(); }
 update(speed: number, paused: boolean) {
  if(!this.context||!this.hum||!this.oscillator)return;
  this.hum.gain.setTargetAtTime(this.muted||paused?0:Math.min(speed/14,1)*.085,this.context.currentTime,.1);
  this.oscillator.frequency.setTargetAtTime(90+speed*8,this.context.currentTime,.1);
 }
 strike() {
  this.ping(760);
  if(!this.context||this.muted)return;
  const buffer=this.context.createBuffer(1,this.context.sampleRate*.06,this.context.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length);
  const source=this.context.createBufferSource(),gain=this.context.createGain();
  source.buffer=buffer;gain.gain.value=.1;source.connect(gain).connect(this.context.destination);source.start();
 }
 clank() { this.ping(180); }
 ping(frequency = 420) {
  if (!this.context || this.muted) return;
  const oscillator = this.context.createOscillator(), gain = this.context.createGain();
  oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency / 2, this.context.currentTime + .12);
  gain.gain.setValueAtTime(.23, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + .16);
  oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + .17);
 }
}

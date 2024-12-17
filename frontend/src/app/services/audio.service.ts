import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new AudioContext();
  }

  playErrorSound() {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'square'; // Square wave gives a buzzing sound
    oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime); // Low frequency for the hum
    oscillator.connect(this.audioContext.destination);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.08); // Short duration (0.3 seconds)
  }
}


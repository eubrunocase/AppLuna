import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

const LUNA_COLORS = ['#C05C46', '#E3A847', '#3D8B5F', '#F4D6A0', '#F9F6EE'];

@Injectable({ providedIn: 'root' })
export class CelebrationService {
  celebrateSuccess(): void {
    const base = {
      colors: LUNA_COLORS,
      disableForReducedMotion: true,
      zIndex: 10000,
    };

    void confetti({
      ...base,
      particleCount: 90,
      spread: 76,
      startVelocity: 42,
      origin: { y: 0.62 },
    });

    void confetti({
      ...base,
      particleCount: 48,
      angle: 60,
      spread: 58,
      origin: { x: 0, y: 0.72 },
    });

    void confetti({
      ...base,
      particleCount: 48,
      angle: 120,
      spread: 58,
      origin: { x: 1, y: 0.72 },
    });

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        void confetti({
          ...base,
          particleCount: 36,
          spread: 110,
          scalar: 0.95,
          shapes: ['star'],
          colors: ['#E3A847', '#C05C46', '#F9F6EE'],
          origin: { y: 0.55 },
        });
      }, 180);
    }
  }
}

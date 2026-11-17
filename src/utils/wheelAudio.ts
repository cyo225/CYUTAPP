// Web Audio API synthesized sound effects for the Campus Life CYUT prize & lunch wheels.
// Zero external audio assets required; runs offline in PWA with immediate touch-gesture unlock.

class WheelAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setMuted(nextMuted: boolean): void {
    this.muted = nextMuted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playSpinStart(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Mechanical peg tick sound; pitch subtly rises with wheel velocity
  public playTick(velocityFactor = 0.5): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const clamped = Math.max(0.1, Math.min(1, velocityFactor));

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 + clamped * 380, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.032);

      gain.gain.setValueAtTime(0.09 + clamped * 0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.042);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Crisp neon arcade hop sound for 9-grid food marquee
  public playMarqueeHop(stepIndex: number, speedFactor = 0.5): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const scale = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99, 880.0, 987.77];
      const baseFreq = scale[stepIndex % scale.length];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * (0.95 + speedFactor * 0.15), now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + 0.045);

      gain.gain.setValueAtTime(0.085, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio scheduling errors
    }
  }

  // Cheerful bright arpeggio + warm shimmer when wheel stops on prize
  public playCelebration(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Bright C-major pentatonic / octave fanfare: C5, E5, G5, C6, E6
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];

      notes.forEach((freq, idx) => {
        const start = now + idx * 0.085;
        const duration = idx === notes.length - 1 ? 0.55 : 0.26;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(idx === notes.length - 1 ? 0.16 : 0.12, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    } catch {
      // Ignore audio scheduling errors
    }
  }
}

export const wheelAudio = new WheelAudioEngine();

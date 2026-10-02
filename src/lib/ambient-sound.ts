// Generates calm background tones in the browser with the Web Audio API (no audio files needed)

export type Track = "none" | "theta" | "calm";

export const TRACKS: { value: Track; label: string }[] = [
  { value: "none", label: "No sound" },
  { value: "theta", label: "Low frequency (4Hz) – best with headphones" },
  { value: "calm", label: "Calm tone" },
];

export class AmbientSound {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];

  start(track: Track) {
    this.stop();
    if (track === "none") return;

    this.ctx = new AudioContext();
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05; // keep it soft
    gain.connect(this.ctx.destination);

    // theta: 200Hz in left ear + 204Hz in right ear = 4Hz binaural beat
    // calm: two soft tones a musical fifth apart
    const tones: [number, number][] =
      track === "theta" ? [[200, -1], [204, 1]] : [[174, 0], [261, 0]];

    for (const [freq, pan] of tones) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = pan;
      osc.connect(panner).connect(gain);
      osc.start();
      this.oscillators.push(osc);
    }
  }

  pause() {
    this.ctx?.suspend();
  }

  resume() {
    this.ctx?.resume();
  }

  stop() {
    this.oscillators.forEach((o) => o.stop());
    this.oscillators = [];
    this.ctx?.close();
    this.ctx = null;
  }
}

export function formatTime(totalSeconds: number) {
  const s = Math.max(totalSeconds, 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

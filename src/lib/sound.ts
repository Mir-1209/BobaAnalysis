// Tiny procedural sound effects (Web Audio): no files, no network. Off with one toggle in Settings.
let ctx: AudioContext | null = null;
let enabled = true;

export function setSound(on: boolean) {
  enabled = on;
}

function ac(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.05) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  /** XP orb pickup */
  orb() { const f = 1200 + Math.random() * 500; tone(f, 0, 0.08, "triangle", 0.06); tone(f * 1.5, 0.05, 0.08, "triangle", 0.05); },
  correct() { tone(660, 0, 0.09); tone(880, 0.08, 0.09); tone(1320, 0.16, 0.14, "triangle"); },
  wrong() { tone(180, 0, 0.18, "sawtooth", 0.04); tone(140, 0.1, 0.2, "sawtooth", 0.035); },
  click() { tone(520, 0, 0.04, "square", 0.03); },
  levelUp() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.22, "triangle", 0.06)); },
  advancement() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.12, 0.3, "sine", 0.07)); },
  hit() { tone(90, 0, 0.12, "square", 0.06); tone(60, 0.04, 0.2, "sawtooth", 0.04); },
  done() { [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.15, 0.4, "triangle", 0.06)); },
};

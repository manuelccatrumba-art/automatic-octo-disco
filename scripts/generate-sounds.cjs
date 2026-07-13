// Sintetiza os efeitos sonoros da app (sem dependências externas, sem custos de licenciamento).
// Não faz parte do build; corre-se manualmente sempre que os sons precisarem de ajuste.
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function noteFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function bellEnvelope(t, attack, decay) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  return Math.exp(-(t - attack) / decay);
}

function addNote(buffer, startSec, durationSec, midi, { attack = 0.01, decay = 0.35, gain = 0.28, harmonic = 0.15 } = {}) {
  const freq = noteFreq(midi);
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  for (let i = 0; i < totalSamples; i++) {
    const idx = startSample + i;
    if (idx >= buffer.length) break;
    const t = i / SAMPLE_RATE;
    const env = bellEnvelope(t, attack, decay);
    const sample = Math.sin(2 * Math.PI * freq * t) + harmonic * Math.sin(2 * Math.PI * freq * 2 * t);
    buffer[idx] += sample * env * gain;
  }
}

function addThump(buffer, startSec, durationSec, freq, gain = 0.55) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  for (let i = 0; i < totalSamples; i++) {
    const idx = startSample + i;
    if (idx >= buffer.length) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t / (durationSec * 0.28));
    const pitchDrop = freq * (1 - 0.4 * (t / durationSec));
    buffer[idx] += Math.sin(2 * Math.PI * pitchDrop * t) * env * gain;
  }
}

function addSweep(buffer, startSec, durationSec, fromFreq, toFreq, gain = 0.22) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durationSec * SAMPLE_RATE);
  for (let i = 0; i < totalSamples; i++) {
    const idx = startSample + i;
    if (idx >= buffer.length) break;
    const t = i / SAMPLE_RATE;
    const progress = t / durationSec;
    const freq = fromFreq + (toFreq - fromFreq) * progress;
    const env = Math.sin(Math.PI * progress) ** 1.5;
    buffer[idx] += Math.sin(2 * Math.PI * freq * t) * env * gain;
  }
}

function writeWav(filePath, floatBuffer) {
  let peak = 0;
  for (let i = 0; i < floatBuffer.length; i++) peak = Math.max(peak, Math.abs(floatBuffer[i]));
  const normalizeGain = peak > 0.95 ? 0.95 / peak : 1;

  const pcm = Buffer.alloc(floatBuffer.length * 2);
  for (let i = 0; i < floatBuffer.length; i++) {
    const s = Math.max(-1, Math.min(1, floatBuffer[i] * normalizeGain));
    pcm.writeInt16LE(Math.round(s * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  fs.writeFileSync(filePath, Buffer.concat([header, pcm]));
  console.log('wrote', filePath);
}

// --- alarme: "o teu coração notou algo perto" — dois batimentos suaves + tom quente a subir ---
(() => {
  const durationSec = 1.6;
  const buffer = new Float32Array(Math.ceil(durationSec * SAMPLE_RATE));
  addThump(buffer, 0.0, 0.35, 95);
  addThump(buffer, 0.32, 0.35, 88);
  addSweep(buffer, 0.55, 0.85, 440, 660, 0.2);
  addNote(buffer, 0.55, 0.9, 76, { attack: 0.05, decay: 0.5, gain: 0.16 }); // E5 quente por baixo do sweep
  writeWav(path.join(__dirname, '..', 'assets', 'sounds', 'alarm.wav'), buffer);
})();

// --- match revelado: cascata de sinos ascendente, o momento mágico ---
(() => {
  const durationSec = 2.1;
  const buffer = new Float32Array(Math.ceil(durationSec * SAMPLE_RATE));
  const chord = [72, 76, 79, 84, 88]; // C5 E5 G5 C6 E6 — acorde maior, brilhante
  chord.forEach((midi, i) => {
    addNote(buffer, i * 0.09, 1.3, midi, { attack: 0.008, decay: 0.55, gain: 0.24, harmonic: 0.2 });
  });
  // brilho final mais agudo, curto
  addNote(buffer, 0.55, 0.9, 96, { attack: 0.005, decay: 0.4, gain: 0.13, harmonic: 0.3 });
  writeWav(path.join(__dirname, '..', 'assets', 'sounds', 'match.wav'), buffer);
})();

// --- crush adicionado: "pop" curto e doce, feedback discreto ---
(() => {
  const durationSec = 0.35;
  const buffer = new Float32Array(Math.ceil(durationSec * SAMPLE_RATE));
  addNote(buffer, 0, 0.3, 79, { attack: 0.004, decay: 0.15, gain: 0.3, harmonic: 0.1 }); // G5
  addNote(buffer, 0.04, 0.28, 84, { attack: 0.004, decay: 0.14, gain: 0.2, harmonic: 0.1 }); // C6
  writeWav(path.join(__dirname, '..', 'assets', 'sounds', 'crush.wav'), buffer);
})();

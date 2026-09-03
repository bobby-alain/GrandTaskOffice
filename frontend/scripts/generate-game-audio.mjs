import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 22050;
const outputDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/audio");

function noteFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function square(frequency, time) {
  return Math.sin(2 * Math.PI * frequency * time) >= 0 ? 1 : -1;
}

function triangle(frequency, time) {
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * time));
}

function envelope(position, length, attack = 0.02, release = 0.08) {
  return Math.min(1, position / attack, Math.max(0, (length - position) / release));
}

function writeWav(filename, duration, renderSample) {
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + sampleCount * 2, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(sampleCount * 2, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const value = Math.max(-1, Math.min(1, renderSample(index / sampleRate, index)));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, filename), buffer);
}

// Original 92 BPM boom-bap-inspired loop: heavy kick, backbeat snare,
// swung hats, warm bass and a sparse minor-key office-heist motif.
const beatLength = 60 / 92;
const sixteenth = beatLength / 4;
const stepsPerBar = 16;
const bars = 4;
const musicDuration = beatLength * 4 * bars;
const kickSteps = new Set([0, 6, 10, 16, 23, 26, 32, 38, 42, 48, 55, 58]);
const snareSteps = new Set([4, 12, 20, 28, 36, 44, 52, 60]);
const bassNotes = [45, 45, 43, 43, 41, 41, 40, 43];
const motif = [69, 72, 74, 76, 74, 72, 67, 64];

function noise(index) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function timeSinceStep(time, targetStep) {
  return time - targetStep * sixteenth;
}

writeWav("office-heist-loop.wav", musicDuration, (time, index) => {
  const absoluteStep = Math.floor(time / sixteenth);
  const stepInBar = absoluteStep % stepsPerBar;
  const bar = Math.floor(absoluteStep / stepsPerBar);
  const stepTime = time % sixteenth;

  const bassNote = bassNotes[Math.floor(absoluteStep / 8) % bassNotes.length];
  const bass = Math.sin(2 * Math.PI * noteFrequency(bassNote) * time) * 0.22
    + triangle(noteFrequency(bassNote) / 2, time) * 0.07;

  const motifActive = [2, 7, 11, 14].includes(stepInBar);
  const motifIndex = (bar * 4 + [2, 7, 11, 14].indexOf(stepInBar)) % motif.length;
  const keys = motifActive
    ? (triangle(noteFrequency(motif[motifIndex]), time) + Math.sin(2 * Math.PI * noteFrequency(motif[motifIndex] - 12) * time) * 0.55)
      * envelope(stepTime, sixteenth, 0.008, 0.08) * 0.085
    : 0;

  let kick = 0;
  let snare = 0;
  for (const hit of kickSteps) {
    const hitTime = timeSinceStep(time, hit);
    if (hitTime >= 0 && hitTime < 0.24) {
      kick += Math.sin(2 * Math.PI * (66 - hitTime * 110) * hitTime) * Math.exp(-hitTime * 15) * 0.42;
    }
  }
  for (const hit of snareSteps) {
    const hitTime = timeSinceStep(time, hit);
    if (hitTime >= 0 && hitTime < 0.17) {
      snare += (noise(index) * 0.25 + Math.sin(2 * Math.PI * 185 * hitTime) * 0.12) * Math.exp(-hitTime * 24);
    }
  }

  const hatStep = Math.floor(time / (sixteenth * 2));
  const hatOffset = hatStep % 2 ? sixteenth * 0.32 : 0;
  const hatTime = (time - hatOffset + musicDuration) % (sixteenth * 2);
  const hat = hatTime < 0.055 ? noise(index * 3) * Math.exp(-hatTime * 75) * 0.055 : 0;
  const vinyl = noise(index * 7) * 0.006;
  const loopFade = Math.min(1, time / 0.025, (musicDuration - time) / 0.025);
  return (bass + keys + kick + snare + hat + vinyl) * Math.max(0, loopFade);
});

const victoryNotes = [72, 76, 79, 84, 79, 84];
const victoryStep = 0.28;
const victoryDuration = victoryNotes.length * victoryStep + 0.7;

writeWav("clean-getaway.wav", victoryDuration, (time) => {
  const step = Math.min(victoryNotes.length - 1, Math.floor(time / victoryStep));
  const position = time - step * victoryStep;
  const note = victoryNotes[step];
  const lead = square(noteFrequency(note), time) * envelope(position, victoryStep, 0.01, 0.1) * 0.2;
  const harmony = triangle(noteFrequency(note - 12), time) * envelope(position, victoryStep, 0.02, 0.12) * 0.18;
  const finalChord = time > victoryNotes.length * victoryStep
    ? (triangle(noteFrequency(72), time) + triangle(noteFrequency(76), time) + triangle(noteFrequency(79), time)) * Math.exp(-(time - victoryNotes.length * victoryStep) * 2.5) * 0.12
    : 0;
  return lead + harmony + finalChord;
});

console.log(`Generated original game audio in ${outputDir}`);

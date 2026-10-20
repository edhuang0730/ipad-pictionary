import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { bytesToBase64 } from '../server/wsProtocol';

interface NoteStep {
  freq: number;
  durationMs: number;
  volume?: number;
}

/**
 * Synthesizes a 16-bit mono PCM WAV Data URI for a sequence of musical notes.
 */
function buildWavDataUri(notes: NoteStep[], sampleRate = 22050): string {
  const totalSamples = notes.reduce(
    (sum, n) => sum + Math.floor((n.durationMs / 1000) * sampleRate),
    0
  );

  const dataByteLen = totalSamples * 2;
  const buffer = new ArrayBuffer(44 + dataByteLen);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLen, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeAscii(36, 'data');
  view.setUint32(40, dataByteLen, true);

  let sampleOffset = 0;
  for (const note of notes) {
    const count = Math.floor((note.durationMs / 1000) * sampleRate);
    const vol = note.volume ?? 0.35;
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      // Smooth attack & decay envelope
      const attack = Math.min(1, i / (sampleRate * 0.008));
      const release = Math.min(1, (count - i) / (sampleRate * 0.025));
      const env = attack * release;
      const sample =
        note.freq > 0
          ? Math.sin(2 * Math.PI * note.freq * t) * vol * env
          : 0;
      const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + sampleOffset * 2, int16, true);
      sampleOffset += 1;
    }
  }

  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

class SoundManager {
  private muted: boolean = false;
  private webAudioCtx: any = null;
  private initialized: boolean = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    if (Platform.OS !== 'web') {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
      } catch {}
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public async playNotes(notes: NoteStep[]) {
    if (this.muted) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioCtx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.webAudioCtx) {
            this.webAudioCtx = new AudioCtx();
          }
          const ctx = this.webAudioCtx;
          let startTime = ctx.currentTime;
          for (const n of notes) {
            const dur = n.durationMs / 1000;
            if (n.freq > 0) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(n.freq, startTime);
              gain.gain.setValueAtTime(n.volume ?? 0.25, startTime);
              gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(startTime);
              osc.stop(startTime + dur);
            }
            startTime += dur;
          }
          return;
        }
      } catch {}
    }

    try {
      await this.ensureInitialized();
      const uri = buildWavDataUri(notes);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {}
  }

  public playPlayerJoin() {
    this.playNotes([
      { freq: 523.25, durationMs: 70, volume: 0.3 },
      { freq: 659.25, durationMs: 110, volume: 0.35 },
    ]);
  }

  public playCountdownTick(urgent = false) {
    this.playNotes([
      { freq: urgent ? 880 : 660, durationMs: 55, volume: urgent ? 0.35 : 0.22 },
    ]);
  }

  public playTurnStart() {
    this.playNotes([
      { freq: 440, durationMs: 80, volume: 0.3 },
      { freq: 554.37, durationMs: 80, volume: 0.32 },
      { freq: 659.25, durationMs: 160, volume: 0.38 },
    ]);
  }

  public playCorrectGuess() {
    this.playNotes([
      { freq: 523.25, durationMs: 80, volume: 0.38 },
      { freq: 659.25, durationMs: 80, volume: 0.38 },
      { freq: 783.99, durationMs: 90, volume: 0.4 },
      { freq: 1046.5, durationMs: 220, volume: 0.42 },
    ]);
  }

  public playSkipWord() {
    this.playNotes([
      { freq: 440, durationMs: 65, volume: 0.25 },
      { freq: 349.23, durationMs: 95, volume: 0.25 },
    ]);
  }

  public playTurnEnd() {
    this.playNotes([
      { freq: 392, durationMs: 140, volume: 0.38 },
      { freq: 329.63, durationMs: 140, volume: 0.38 },
      { freq: 261.63, durationMs: 280, volume: 0.42 },
    ]);
  }

  public playVictoryFanfare() {
    this.playNotes([
      { freq: 523.25, durationMs: 100, volume: 0.38 },
      { freq: 659.25, durationMs: 100, volume: 0.38 },
      { freq: 783.99, durationMs: 100, volume: 0.38 },
      { freq: 1046.5, durationMs: 140, volume: 0.42 },
      { freq: 783.99, durationMs: 90, volume: 0.35 },
      { freq: 1046.5, durationMs: 320, volume: 0.45 },
    ]);
  }
}

export const soundFX = new SoundManager();

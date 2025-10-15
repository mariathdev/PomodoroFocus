// WebAudio API-based sound management for premium audio experience

class SoundManager {
  private audioContext: AudioContext | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private alarmBuffer: AudioBuffer | null = null;
  private volume: number = 0.7;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.loadSounds();
    }
  }

  private async loadSounds() {
    // Generate simple tones for click and alarm since we don't have audio files yet
    // In production, you'd load actual .wav/.ogg files
    try {
      this.clickBuffer = this.generateClickSound();
      this.alarmBuffer = this.generateAlarmSound();
    } catch (error) {
      console.error('[SoundManager] Failed to generate sounds:', error);
    }
  }

  private generateClickSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.05; // 50ms
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Simple beep with decay
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 800; // Hz
      const decay = Math.exp(-t * 20);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.3;
    }

    return buffer;
  }

  private generateAlarmSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5; // 1.5 seconds
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Pleasant notification chime with harmonics
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 2);
      
      // Multiple frequencies for richer sound
      const f1 = Math.sin(2 * Math.PI * 523.25 * t); // C5
      const f2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.5; // E5
      const f3 = Math.sin(2 * Math.PI * 783.99 * t) * 0.3; // G5
      
      data[i] = (f1 + f2 + f3) * decay * 0.4;
    }

    return buffer;
  }

  playClick(pitchVariation: number = 0) {
    if (!this.enabled || !this.audioContext || !this.clickBuffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.clickBuffer;
      source.playbackRate.value = 1 + pitchVariation; // Slight pitch variation
      gainNode.gain.value = this.volume * 0.5; // Quieter for clicks

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('[SoundManager] Failed to play click:', error);
    }
  }

  playAlarm() {
    if (!this.enabled || !this.audioContext || !this.alarmBuffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.alarmBuffer;
      gainNode.gain.value = this.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);

      console.log('[SoundManager] Alarm played');
    } catch (error) {
      console.error('[SoundManager] Failed to play alarm:', error);
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();

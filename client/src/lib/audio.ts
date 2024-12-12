import { MUSIC_OPTIONS, BREAK_MUSIC_OPTIONS } from './constants';

class AudioPlayer {
  private currentDisplayMode: 'audio' | 'video' | null = null;
  private currentFocusSoundId: string | null = null;
  private currentBreakSoundId: string | null = null;
  private focusAudio: HTMLAudioElement | null = null;
  private breakAudio: HTMLAudioElement | null = null;
  private focusVideo: HTMLVideoElement | null = null;
  private breakVideo: HTMLVideoElement | null = null;
  private isProgrammaticChangeFocus = false;
  private isProgrammaticChangeBreak = false;
  private audioContext: AudioContext | null = null;
  private countdownTimeouts: number[] = [];
  private fadeOutIntervals: number[] = [];
  private focusAudioSourceNode: MediaElementAudioSourceNode | null = null;
  private focusAudioGainNode: GainNode | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API is not supported in this browser:', error);
    }
  }

  private setupMediaSession(isBreak: boolean, displayMode: 'audio' | 'video') {
    if ('mediaSession' in navigator) {
      const title = isBreak ? '休憩時間' : '集中時間';
      const artist = isBreak ? 'リラックス音楽' : '集中音楽';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: 'Pomodoro Timer',
        artwork: [
          { src: '/bone_knight.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        console.log('MediaSession play action received');
        const event = new CustomEvent('audioPlayed', { detail: { isBreak } });
        window.dispatchEvent(event);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log('MediaSession pause action received');
        const event = new CustomEvent('audioPaused', { detail: { isBreak } });
        window.dispatchEvent(event);
      });
    }
  }

  private createAudioElement(audioSrc: string, isBreak: boolean): HTMLAudioElement {
    const audioElement = document.createElement('audio');
    audioElement.src = audioSrc;
    audioElement.loop = true;

    audioElement.addEventListener('pause', () => {
      const isProgrammaticChange = isBreak ? this.isProgrammaticChangeBreak : this.isProgrammaticChangeFocus;
      if (!isProgrammaticChange) {
        console.log('Audio element paused');
        const event = new CustomEvent('audioPaused', { detail: { isBreak } });
        window.dispatchEvent(event);
      }
    });

    audioElement.addEventListener('play', () => {
      const isProgrammaticChange = isBreak ? this.isProgrammaticChangeBreak : this.isProgrammaticChangeFocus;
      if (!isProgrammaticChange) {
        console.log('Audio element played');
        const event = new CustomEvent('audioPlayed', { detail: { isBreak } });
        window.dispatchEvent(event);
      }
    });

    document.body.appendChild(audioElement);
    return audioElement;
  }

  public async play(soundId: string, isBreak: boolean = false, displayMode: 'audio' | 'video') {
    try {
      console.log(`Playing sound: ${soundId}, isBreak: ${isBreak}, mode: ${displayMode}`);

      const isSameSound = isBreak
        ? this.currentBreakSoundId === soundId
        : this.currentFocusSoundId === soundId;
      const isSameDisplayMode = this.currentDisplayMode === displayMode;

      let currentTime = 0;
      if (isBreak) {
        currentTime = this.breakAudio?.currentTime || this.breakVideo?.currentTime || 0;
      } else {
        currentTime = this.focusAudio?.currentTime || this.focusVideo?.currentTime || 0;
      }

      if (!isSameSound || !isSameDisplayMode) {
        if (isBreak) {
          this.stopBreak(false);
          this.currentBreakSoundId = soundId;
        } else {
          this.stopFocus(false);
          this.currentFocusSoundId = soundId;
        }
      }

      this.currentDisplayMode = displayMode;

      const options = isBreak ? BREAK_MUSIC_OPTIONS : MUSIC_OPTIONS;
      const option = options.find((opt) => opt.id === soundId);
      if (!option) return;

      const audioSrc = option.audioSrc || option.videoSrc || option.src;

      if (displayMode === 'video') {
        // ビデオモードの処理は変更なし
        const videoElement = document.querySelector(
          `video[data-type="${isBreak ? 'break' : 'focus'}"]`
        ) as HTMLVideoElement;
        if (videoElement) {
          if (audioSrc) {
            videoElement.src = audioSrc;
          }
          videoElement.currentTime = currentTime;
          videoElement.loop = true;
          videoElement.muted = false;

          const eventListenerKey = isBreak ? 'breakVideoEventAttached' : 'focusVideoEventAttached';
          if (!(this as any)[eventListenerKey]) {
            videoElement.addEventListener('pause', () => {
              const isProgrammaticChange = isBreak ? this.isProgrammaticChangeBreak : this.isProgrammaticChangeFocus;
              if (!isProgrammaticChange) {
                console.log('Video element paused');
                const event = new CustomEvent('audioPaused', { detail: { isBreak } });
                window.dispatchEvent(event);
              }
            });

            videoElement.addEventListener('play', () => {
              const isProgrammaticChange = isBreak ? this.isProgrammaticChangeBreak : this.isProgrammaticChangeFocus;
              if (!isProgrammaticChange) {
                console.log('Video element played');
                const event = new CustomEvent('audioPlayed', { detail: { isBreak } });
                window.dispatchEvent(event);
              }
            });
            (this as any)[eventListenerKey] = true;
          }

          this.isProgrammaticChangeBreak = isBreak;
          this.isProgrammaticChangeFocus = !isBreak;
          await videoElement.play();
          this.isProgrammaticChangeBreak = false;
          this.isProgrammaticChangeFocus = false;

          if (isBreak) {
            this.breakVideo = videoElement;
          } else {
            this.focusVideo = videoElement;
          }

          this.setupMediaSession(isBreak, displayMode);
        }
      } else {
        if (audioSrc) {
          let audioElement: HTMLAudioElement;
          if (isBreak) {
            if (!this.breakAudio) {
              this.breakAudio = this.createAudioElement(audioSrc, true);
            } else {
              this.breakAudio.src = audioSrc;
            }
            audioElement = this.breakAudio;
          } else {
            if (!this.focusAudio || !isSameSound) {
              if (this.focusAudio) {
                this.stopFocus(true);
              }
              this.focusAudio = this.createAudioElement(audioSrc, false);

              // AudioContextの設定
              if (this.audioContext) {
                this.focusAudioSourceNode = this.audioContext.createMediaElementSource(this.focusAudio);
                this.focusAudioGainNode = this.audioContext.createGain();
                this.focusAudioSourceNode.connect(this.focusAudioGainNode);
                this.focusAudioGainNode.connect(this.audioContext.destination);
              }
            } else {
              this.focusAudio.src = audioSrc;
            }
            audioElement = this.focusAudio;

            // ゲインをリセット
            if (this.focusAudioGainNode && this.audioContext) {
              this.focusAudioGainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
              console.log('ゲインをリセット：', this.focusAudioGainNode.gain.value);
            }
          }

          audioElement.currentTime = currentTime;

          this.isProgrammaticChangeFocus = !isBreak;
          this.isProgrammaticChangeBreak = isBreak;
          await audioElement.play();
          this.isProgrammaticChangeFocus = false;
          this.isProgrammaticChangeBreak = false;

          this.setupMediaSession(isBreak, displayMode);
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  public stopFocus(reset: boolean = false) {
    console.log('Stopping focus audio/video, reset:', reset);
    if (this.focusAudio) {
      this.isProgrammaticChangeFocus = true;
      this.focusAudio.pause();
      if (reset) {
        this.focusAudio.currentTime = 0;
        this.focusAudio.parentNode?.removeChild(this.focusAudio);
        this.focusAudio = null;
      }
      this.isProgrammaticChangeFocus = false;
    }
    if (this.focusVideo) {
      this.isProgrammaticChangeFocus = true;
      this.focusVideo.pause();
      if (reset) {
        this.focusVideo.currentTime = 0;
        this.focusVideo = null;
      }
      this.isProgrammaticChangeFocus = false;
    }

    // GainNodeとSourceNodeの破棄
    if (this.focusAudioGainNode) {
      this.focusAudioGainNode.disconnect();
      this.focusAudioGainNode = null;
    }
    if (this.focusAudioSourceNode) {
      this.focusAudioSourceNode.disconnect();
      this.focusAudioSourceNode = null;
    }

    if (reset) {
      this.currentFocusSoundId = null;
    }
  }

  public stopBreak(reset: boolean = false) {
    console.log('Stopping break audio/video, reset:', reset);
    if (this.breakAudio) {
      this.isProgrammaticChangeBreak = true;
      this.breakAudio.pause();
      if (reset) {
        this.breakAudio.currentTime = 0;
        this.breakAudio.parentNode?.removeChild(this.breakAudio);
        this.breakAudio = null;
      }
      this.isProgrammaticChangeBreak = false;
    }
    if (this.breakVideo) {
      this.isProgrammaticChangeBreak = true;
      this.breakVideo.pause();
      if (reset) {
        this.breakVideo.currentTime = 0;
        this.breakVideo = null;
      }
      this.isProgrammaticChangeBreak = false;
    }
    if (reset) {
      this.currentBreakSoundId = null;
    }
  }

  public stop() {
    this.stopFocus(true);
    this.stopBreak(true);
    this.currentDisplayMode = null;
    this.stopCountdownBeep();
    this.clearFadeOutIntervals();
  }

  private createBeep(
    frequency: number,
    duration: number,
    volume: number = 0.5,
    fadeOut: boolean = false,
    fadeOutDuration: number = 0
  ): { oscillator: OscillatorNode; gainNode: GainNode } | null {
    if (!this.audioContext) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    if (fadeOut && fadeOutDuration > 0) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + fadeOutDuration);
    } else {
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + duration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    }

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    return { oscillator, gainNode };
  }

  public fadeOutMainAudio(duration: number = 3) {
    this.clearFadeOutIntervals();

    if (this.focusAudioGainNode && this.audioContext) {
      const initialGain = this.focusAudioGainNode.gain.value || 1;
      const currentTime = this.audioContext.currentTime;
      const endTime = currentTime + duration;

      // 音量をフェードアウト
      this.focusAudioGainNode.gain.setValueAtTime(initialGain, currentTime);
      this.focusAudioGainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      // フェードアウト後に再生を停止
      const timeout = window.setTimeout(() => {
        if (this.focusAudio) {
          this.focusAudio.pause();
        }
      }, duration * 1000);

      this.fadeOutIntervals.push(timeout);
    }
  }

  private clearFadeOutIntervals() {
    this.fadeOutIntervals.forEach(interval => {
      clearTimeout(interval);
    });
    this.fadeOutIntervals = [];
  }

  public async playNHKTimeSignal() {
    try {
      if (!this.audioContext) {
        console.warn('Audio context not available');
        return;
      }

      await this.ensureAudioContext();

      // 既存のタイムアウトをクリア
      this.stopCountdownBeep();

      // 予報音（440Hz、100ms音 + 900ms無音）を3回再生
      for (let i = 0; i < 3; i++) {
        const timeout = window.setTimeout(() => {
          const beep = this.createBeep(440, 0.1, 0.5);
          if (beep) {
            const { oscillator } = beep;
            oscillator.start(this.audioContext!.currentTime);
            oscillator.stop(this.audioContext!.currentTime + 0.1);
          }
        }, i * 1000); // 1000ms間隔
        this.countdownTimeouts.push(timeout);
      }

      // 正報音（880Hz、1000ms音、2000msで直線的に減衰）
      const mainSignalTimeout = window.setTimeout(() => {
        const beep = this.createBeep(880, 3, 0.5, true, 2);
        if (beep) {
          const { oscillator } = beep;
          oscillator.start(this.audioContext!.currentTime);
          oscillator.stop(this.audioContext!.currentTime + 3);
        }
      }, 3000); // 予報音の後

      this.countdownTimeouts.push(mainSignalTimeout);

    } catch (error) {
      console.error('NHK time signal playback error:', error);
    }
  }

  public stopCountdownBeep() {
    this.countdownTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.countdownTimeouts = [];
  }

  private async ensureAudioContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  public playSingleBeep(frequency: number = 880, duration: number = 0.3, volume: number = 0.4) {
    try {
      if (!this.audioContext) {
        console.warn('Audio context not available');
        return;
      }

      this.ensureAudioContext();

      const beep = this.createBeep(frequency, duration, volume);
      if (beep) {
        const { oscillator } = beep;
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + duration);
      }
    } catch (error) {
      console.error('Single beep playback error:', error);
    }
  }

  public async playCountdownSound() {
    try {
      if (!this.audioContext) {
        console.warn('Audio context not available');
        return;
      }

      await this.ensureAudioContext();

      // クリーンアップ：既存のタイムアウトをクリア
      this.stopCountdownBeep();

      // シンプルな「ポン」音を700ms間隔で3回再生
      const frequency = 800; // 時報のような音のための周波数
      const duration = 0.3; // 音の長さ（0.3秒）
      const volume = 0.4; // 音量
      const interval = 700; // 間隔（700ミリ秒）

      for (let i = 0; i < 3; i++) {
        const timeout = window.setTimeout(() => {
          const beep = this.createBeep(frequency, duration, volume);
          if (beep) {
            const { oscillator } = beep;
            oscillator.start(this.audioContext!.currentTime);
            oscillator.stop(this.audioContext!.currentTime + duration);
          }
        }, i * interval);
        this.countdownTimeouts.push(timeout);
      }
    } catch (error) {
      console.error('Countdown sound playback error:', error);
    }
  }

  public async playTransitionSound() {
    try {
      if (!this.audioContext) {
        console.warn('Audio context not available');
        return;
      }

      await this.ensureAudioContext();

      // トランジション音（3秒間のフェードアウト）を生成
      const beep = this.createBeep(800, 3, 0.4, true, 3);
      if (beep) {
        const { oscillator } = beep;
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 3);
      }
    } catch (error) {
      console.error('Transition sound playback error:', error);
    }
  }
}

export const audioPlayer = new AudioPlayer();
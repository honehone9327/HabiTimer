export const DEFAULT_SETTINGS = {
  focusTime: 25,
  breakTime: 5,
  sets: 4,
};

export const MESSAGES = {
  focus: {
    start: "頑張りましょう！集中タイムの始まりです。",
    during: "集中力を保ち、決して諦めない。",
    end: "素晴らしい！休憩を取りましょう。",
  },
  break: {
    start: "休憩時間です。リラックスしてください。",
    during: "英気を養いましょう。",
    end: "次の集中タイムに向けて、目標を再確認しましょう。",
  },
  reset: "タイマーをリセットしました。新たな気持ちで始めましょう！",
};

export const STORAGE_KEY = "pomodoro-settings";

interface MusicOption {
  id: string;
  label: string;
  src?: string;
  audioSrc?: string;
  videoSrc?: string;
}

export const MUSIC_OPTIONS: MusicOption[] = [
  { id: 'none', label: 'なし', src: '' },
  {
    id: 'campfire',
    label: '焚き火の音',
    src: '/audio/campfire.mp4',
    audioSrc: '/audio/campfire.mp4',
    videoSrc: '/audio/campfire.mp4',
  },
  { id: 'waves', label: '波の音', src: '/audio/waves.mp3' },
  { id: 'rain', label: '雨の音', src: '' },
  { id: 'forest', label: '森の音', src: '' }
];

export const BREAK_MUSIC_OPTIONS = [
  { id: 'none', label: 'なし', src: '' },
  { 
    id: 'orgel',
    label: 'オルゴール',
    audioSrc: '/audio/oru.mp4',
    videoSrc: '/audio/oru.mp4'
  }
];

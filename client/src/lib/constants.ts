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
  audioSrc?: string;
  videoSrc?: string;
}

// 将来的にMP4を使用予定のため、audioSrcとvideoSrcを残す
// 現在MP3音源がある場合はaudioSrcにMP3ファイルを指定し、videoSrcには将来のMP4ファイルを指定しておく
// まだMP4ファイルが用意できていないものはvideoSrcを空欄または省略
// 集中時の音源一覧
export const MUSIC_OPTIONS: MusicOption[] = [
  {
    id: 'none',
    label: 'なし',
  },
  {
    id: 'campfire',
    label: '焚き火の音',
    audioSrc: '/audio/campfire.mp3',
    // videoSrc: '/audio/campfire.mp4' // 将来的にMP4へ移行する場合はこちらを使用予定
  },
  {
    id: 'waves',
    label: '波の音',
    audioSrc: '/audio/waves.mp3',
    // videoSrc: '/audio/waves.mp4'
  },
  {
    id: 'rain',
    label: '雨の音',
    audioSrc: '/audio/rain.mp3',
    // videoSrc: '/audio/rain.mp4'
  },
  {
    id: 'forest',
    label: '森の音',
    audioSrc: '/audio/forest.mp3',
    // videoSrc: '/audio/forest.mp4'
  },
  {
    id: 'river_1',
    label: '川の音(急流)',
    audioSrc: '/audio/river_1.mp3',
    // videoSrc: '/audio/river_1.mp4'
  },
  {
    id: 'river_2',
    label: '川の音(静流)',
    audioSrc: '/audio/river_2.mp3',
    // videoSrc: '/audio/river_2.mp4'
  },
];

// 休憩時の音源一覧
export const BREAK_MUSIC_OPTIONS: MusicOption[] = [
  {
    id: 'none',
    label: 'なし',
  },
  {
    id: 'orgel',
    label: 'オルゴール',
    audioSrc: '/audio/orgel.mp3',
    // videoSrc: '/audio/orgel.mp4'
  },
  {
    id: 'piano',
    label: 'ピアノ',
    audioSrc: '/audio/piano.mp3',
    // videoSrc: '/audio/piano.mp4'
  },
  {
    id: 'cafe_1',
    label: 'カフェ',
    audioSrc: '/audio/cafe_1.mp3',
    // videoSrc: '/audio/cafe_1.mp4'
  },
  {
    id: 'cafe_2',
    label: 'カフェ（アコギ）',
    audioSrc: '/audio/cafe_2.mp3',
    // videoSrc: '/audio/cafe_2.mp4'
  },
];
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const TRAINER_MESSAGES = {
  'drill-sergeant': {
    exercise: [
      'あと何回できる！！頑張れ！',
      '甘えは許さないぞ！',
      '限界を超えろ！'
    ],
    rest: [
      '次はもっと追い込むぞ！',
      '休憩は短く！',
      '準備はいいか！'
    ]
  },
  'friendly': {
    exercise: [
      'その調子！頑張ってます！',
      'もう少し！一緒に頑張りましょう！',
      'とてもいい感じです！'
    ],
    rest: [
      'しっかり休んでくださいね',
      '水分補給も忘れずに！',
      '次も一緒に頑張りましょう！'
    ]
  },
  'motivational': {
    exercise: [
      '自分を信じて！',
      '一歩一歩、着実に！',
      'あなたならできる！'
    ],
    rest: [
      '良い休憩を！',
      'リフレッシュしましょう！',
      '次も頑張りましょう！'
    ]
  }
};

export interface Exercise {
  id: string;
  name: string;
  custom?: boolean;
}

interface WorkoutState {
  exerciseTime: number;
  restTime: number;
  sets: number;
  isRunning: boolean;
  isTimerStarted: boolean;
  currentSet: number;
  isRest: boolean;
  remainingTime: number;
  selectedMusic: string;
  exercises: Exercise[];
  selectedExercise: string | null;
  trainerMode: string;
  currentMessage: string;
  timerId: NodeJS.Timeout | null;
  showCompletionDialog: boolean;
  
  setExerciseTime: (time: number) => void;
  setTrainerMode: (mode: string) => void;
  updateTrainerMessage: () => void;
  setRestTime: (time: number) => void;
  setSets: (sets: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchMode: () => void;
  setSelectedMusic: (music: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (id: string) => void;
  setSelectedExercise: (id: string | null) => void;
  setShowCompletionDialog: (show: boolean) => void;
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: '腕立て' },
  { id: '2', name: 'スクワット' },
  { id: '3', name: 'プランク' },
];

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      exerciseTime: 30,
      restTime: 10,
      sets: 30,
      isRunning: false,
      isTimerStarted: false,
      currentSet: 1,
      isRest: false,
      remainingTime: 30,
      selectedMusic: 'なし',
      exercises: DEFAULT_EXERCISES,
      selectedExercise: null,
      trainerMode: 'friendly',
      currentMessage: 'トレーニングを始めましょう！',
      timerId: null,
      showCompletionDialog: false,

      setExerciseTime: (time) => set({ exerciseTime: time, remainingTime: time }),
      setTrainerMode: (mode) => set({ trainerMode: mode }),
      updateTrainerMessage: () => set((state) => {
        const messages = TRAINER_MESSAGES[state.trainerMode as keyof typeof TRAINER_MESSAGES];
        const messageType = state.isRest ? 'rest' : 'exercise';
        const messageList = messages[messageType];
        const randomIndex = Math.floor(Math.random() * messageList.length);
        return { currentMessage: messageList[randomIndex] };
      }),
      setRestTime: (time) => set({ restTime: time }),
      setSets: (sets) => set({ sets }),
      toggleTimer: () => {
        const state = get();
        if (state.isRunning) {
          if (state.timerId) {
            clearInterval(state.timerId);
          }
          set({ 
            isRunning: false, 
            timerId: null 
          });
        } else {
          const id = setInterval(() => {
            const currentState = get();
            if (currentState.remainingTime > 0) {
              currentState.tick();
            } else {
              currentState.switchMode();
            }
          }, 1000);

          set({
            isRunning: true,
            isTimerStarted: true,
            timerId: id
          });
        }
      },

      resetTimer: () => {
        const state = get();
        if (state.timerId) {
          clearInterval(state.timerId);
          // Clear the timer ID immediately to prevent any race conditions
          set({ timerId: null });
        }
        set((state) => ({
          isRunning: false,
          isTimerStarted: false,
          currentSet: 1,
          isRest: false,
          remainingTime: state.exerciseTime,
          showCompletionDialog: false,
        }));
      },

      tick: () => set((state) => ({
        remainingTime: Math.max(0, state.remainingTime - 1)
      })),

      switchMode: () => set((state) => {
        if (state.currentSet >= state.sets && !state.isRest) {
          if (state.timerId) {
            clearInterval(state.timerId);
          }
          return {
            isRunning: false,
            timerId: null,
            currentSet: 1,
            isRest: false,
            remainingTime: state.exerciseTime,
            showCompletionDialog: true,
          };
        }

        const isRest = !state.isRest;
        const currentSet = isRest ? state.currentSet : state.currentSet + 1;
        const newRemainingTime = (isRest ? state.restTime : state.exerciseTime);

        return {
          isRest,
          currentSet,
          remainingTime: newRemainingTime,
          isRunning: true,
        };
      }),
      setSelectedMusic: (music) => set({ selectedMusic: music }),
      addExercise: (exercise) => set((state) => ({
        exercises: [...state.exercises, exercise],
      })),
      removeExercise: (id) => set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
      })),
      setSelectedExercise: (id) => set({ selectedExercise: id }),
      setShowCompletionDialog: (show) => set({ showCompletionDialog: show }),
    }),
    {
      name: 'workout-storage',
    }
  )
);
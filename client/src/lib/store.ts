import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { DEFAULT_SETTINGS } from './constants';

export interface Task {
  id: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
}

interface TimerHistory {
  completedAt: Date;
  focusTime: number;
  breakTime: number;
  completedSets: number;
  focusMusic: string;
  breakMusic: string;
  avatar: string;
}

interface PomodoroState {
  focusTime: number;
  breakTime: number;
  sets: number;
  isRunning: boolean;
  isTimerStarted: boolean;
  currentSet: number;
  isBreak: boolean;
  remainingTime: number;
  goal: string;
  selectedMusic: string;
  selectedBreakMusic: string;
  selectedAvatar: string;
  displayMode: 'audio' | 'video';
  tasks: Task[];
  points: number;
  timerId: number | null; // 修正箇所
  audioElement: HTMLAudioElement | null;
  timerHistory: TimerHistory[];
  isTimerCompleted: boolean;
  setDisplayMode: (mode: 'audio' | 'video') => void;
  setFocusTime: (time: number) => void;
  setBreakTime: (time: number) => void;
  setSets: (sets: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchMode: () => void;
  setGoal: (goal: string) => void;
  setSelectedMusic: (music: string) => void;
  setSelectedBreakMusic: (music: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addPoints: (amount: number) => void;
  setRemainingTime: (time: number) => void;
  setIsBreak: (isBreak: boolean) => void;
  setCurrentSet: (set: number) => void;
  addTimerHistory: () => void;
  clearTimerHistory: () => void;
  applyTimerSettings: (history: TimerHistory) => void;
  removeTimerHistory: (index: number) => void;
  setIsTimerStarted: (isStarted: boolean) => void;
  resetAllTimerStates: () => void;
}

const persistOptions: PersistOptions<PomodoroState> = {
  name: 'pomodoro-storage',
  version: 1,
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      return {
        ...persistedState,
        focusTime: persistedState.focusTime || DEFAULT_SETTINGS.focusTime,
        breakTime: persistedState.breakTime || DEFAULT_SETTINGS.breakTime,
        sets: persistedState.sets || DEFAULT_SETTINGS.sets,
      };
    }
    return persistedState;
  },
};

export const useStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      focusTime: DEFAULT_SETTINGS.focusTime,
      breakTime: DEFAULT_SETTINGS.breakTime,
      sets: DEFAULT_SETTINGS.sets,
      isRunning: false,
      isTimerStarted: false,
      currentSet: 1,
      isBreak: false,
      remainingTime: DEFAULT_SETTINGS.focusTime * 60,
      goal: '',
      selectedMusic: 'なし',
      selectedBreakMusic: 'なし',
      selectedAvatar: 'default',
      displayMode: 'audio' as const,
      tasks: [],
      points: 0,
      timerId: null, // 初期値は null
      audioElement: null,
      timerHistory: [],
      isTimerCompleted: false,

      setDisplayMode: (mode) => {
        // 一時的に音声モードのみに固定
        console.log('Display mode is currently fixed to audio mode');
        return;
      },

      setFocusTime: (time) => {
        const validTime = Number(time);
        if (isNaN(validTime) || validTime <= 0) {
          console.error('Invalid focus time:', time);
          return;
        }
        console.log('Setting focus time to:', validTime);
        set({ focusTime: validTime, remainingTime: validTime * 60 });
      },

      setBreakTime: (time) => {
        const validTime = Number(time);
        if (isNaN(validTime) || validTime <= 0) {
          console.error('Invalid break time:', time);
          return;
        }
        console.log('Setting break time to:', validTime);
        set({ breakTime: validTime });
      },

      setSets: (sets) => set({ sets }),

      toggleTimer: () => {
        const state = get();
        console.log('Toggling timer. Current state:', state.isRunning);
        if (state.isRunning) {
          if (state.timerId !== null) {
            clearInterval(state.timerId);
          }
          set({
            isRunning: false,
            timerId: null,
          });
        } else {
          const id = window.setInterval(() => { // window.setIntervalを使用
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
            timerId: id,
          });
        }
      },

      resetTimer: () => {
        const state = get();
        console.log('Resetting timer');
        if (state.timerId !== null) {
          clearInterval(state.timerId);
        }
        set({
          isRunning: false,
          isTimerStarted: false,
          timerId: null,
          currentSet: 1,
          isBreak: false,
          remainingTime: state.focusTime * 60,
          isTimerCompleted: false,
        });
      },

      tick: () => {
        console.log('Tick: updating remaining time');
        set((state) => ({
          remainingTime: Math.max(0, state.remainingTime - 1),
        }));
      },

      switchMode: () => set((state) => {
        if (!state.isRunning) return {};

        console.log('Switching mode');
        if (state.currentSet >= state.sets && !state.isBreak) {
          state.addPoints(50);
          state.addTimerHistory();
          if (state.timerId !== null) {
            clearInterval(state.timerId);
          }
          return {
            isRunning: false,
            timerId: null,
            currentSet: 1,
            isBreak: false,
            remainingTime: state.focusTime * 60,
            isTimerCompleted: true,
          };
        }

        const isBreak = !state.isBreak;
        const currentSet = isBreak ? state.currentSet : state.currentSet + 1;
        console.log(`New mode - Break: ${isBreak}, Set: ${currentSet}`);

        return {
          isBreak,
          currentSet,
          remainingTime: (isBreak ? state.breakTime : state.focusTime) * 60,
          isRunning: true,
        };
      }),

      setGoal: (goal) => set({ goal }),
      setSelectedMusic: (music) => set({ selectedMusic: music }),
      setSelectedBreakMusic: (music) => set({ selectedBreakMusic: music }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter(task => task.id !== id) })),
      toggleTaskComplete: (id) => set((state) => {
        const newTasks = state.tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        if (newTasks.find(t => t.id === id)?.completed) {
          setTimeout(() => {
            set((state) => ({
              tasks: state.tasks.filter(t => t.id !== id)
            }));
          }, 300);
        }
        return { tasks: newTasks };
      }),

      reorderTasks: (startIndex, endIndex) => set((state) => {
        const newTasks = Array.from(state.tasks);
        const [removed] = newTasks.splice(startIndex, 1);
        newTasks.splice(endIndex, 0, removed);
        return { tasks: newTasks };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        )
      })),

      addPoints: (amount) => set((state) => ({ points: state.points + amount })),
      setRemainingTime: (time) => {
        if (isNaN(time) || time < 0) {
          console.error('Invalid remaining time:', time);
          return;
        }
        console.log('Setting remaining time to:', time);
        set({ remainingTime: time });
      },

      setIsBreak: (isBreak) => set({ isBreak }),
      setCurrentSet: (currentSet: number) => set({ currentSet }),

      addTimerHistory: () => set((state) => ({
        timerHistory: [
          {
            completedAt: new Date(),
            focusTime: state.focusTime,
            breakTime: state.breakTime,
            completedSets: state.currentSet,
            focusMusic: (() => {
              switch(state.selectedMusic) {
                case 'campfire': return '焚き火の音';
                case 'waves': return '波の音';
                case 'rain': return '雨の音';
                case 'forest': return '森の音';
                case 'none': return 'なし';
                default: return state.selectedMusic;
              }
            })(),
            breakMusic: (() => {
              switch(state.selectedBreakMusic) {
                case 'orgel': return 'オルゴール';
                case 'none': return 'なし';
                default: return state.selectedBreakMusic;
              }
            })(),
            avatar: (() => {
              switch(state.selectedAvatar) {
                case 'bone-knight': return 'ボーンナイト';
                case 'none': return 'なし';
                default: return state.selectedAvatar;
              }
            })()
          },
          ...state.timerHistory.slice(0, 2)
        ]
      })),

      clearTimerHistory: () => set({ timerHistory: [] }),

      applyTimerSettings: (history) => {
        const validFocusTime = Number(history.focusTime);
        const validBreakTime = Number(history.breakTime);

        if (isNaN(validFocusTime) || validFocusTime <= 0) {
          console.error('Invalid focus time in history:', history.focusTime);
          return;
        }

        if (isNaN(validBreakTime) || validBreakTime <= 0) {
          console.error('Invalid break time in history:', history.breakTime);
          return;
        }

        console.log('Applying timer settings from history');
        set({
          focusTime: validFocusTime,
          breakTime: validBreakTime,
          sets: history.completedSets,
          selectedMusic: history.focusMusic,
          selectedBreakMusic: history.breakMusic,
          selectedAvatar: history.avatar,
          remainingTime: validFocusTime * 60
        });
      },

      removeTimerHistory: (index: number) => set((state) => ({
        timerHistory: state.timerHistory.filter((_, i) => i !== index)
      })),

      setIsTimerStarted: (isStarted: boolean) => set({ isTimerStarted: isStarted }),

      resetAllTimerStates: () => {
        const state = get();
        if (state.timerId !== null) {
          clearInterval(state.timerId);
        }
        set({
          isRunning: false,
          isTimerStarted: false,
          currentSet: 1,
          isBreak: false,
          remainingTime: get().focusTime * 60,
          timerId: null,
        });
      },
    }),
    persistOptions
  )
);

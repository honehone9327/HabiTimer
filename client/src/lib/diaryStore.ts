import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DiaryEntry = {
  date: Date;
  concentration: 'good' | 'normal' | 'bad';
  achievements: string;
  failures: string;
  challenges: string;
  completed_sets: number;
  focus_time: number;
  break_time: number;
};

type DiaryStore = {
  entries: DiaryEntry[];
  addEntry: (entry: DiaryEntry) => void;
  updateEntry: (date: Date, entry: Partial<DiaryEntry>) => void;
  getEntryByDate: (date: Date) => DiaryEntry | undefined;
};

export const useDiaryStore = create<DiaryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        set((state) => ({
          entries: [...state.entries, entry],
        }));
      },
      updateEntry: (date, updatedFields) => {
        set((state) => ({
          entries: state.entries.map(entry => 
            entry.date.getFullYear() === date.getFullYear() &&
            entry.date.getMonth() === date.getMonth() &&
            entry.date.getDate() === date.getDate()
              ? { ...entry, ...updatedFields }
              : entry
          ),
        }));
      },
      getEntryByDate: (date) => {
        const entries = get().entries;
        return entries.find(
          (entry) => 
            entry.date.getFullYear() === date.getFullYear() &&
            entry.date.getMonth() === date.getMonth() &&
            entry.date.getDate() === date.getDate()
        );
      },
    }),
    {
      name: 'diary-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        entries: state.entries.map(entry => ({
          ...entry,
          date: entry.date.toISOString(),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.entries = state.entries.map(entry => ({
            ...entry,
            date: new Date(entry.date),
          }));
        }
      },
    }
  )
);

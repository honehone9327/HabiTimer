import { createStore } from 'zustand/vanilla';

type PreviousPathStore = {
  previousPath: string;
  setPreviousPath: (path: string) => void;
};

export const usePreviousPath = createStore<PreviousPathStore>((set) => ({
  previousPath: '/',
  setPreviousPath: (path: string) => set({ previousPath: path }),
}));

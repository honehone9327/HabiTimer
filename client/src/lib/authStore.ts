import { create } from 'zustand';
import { persist, type StorageValue } from 'zustand/middleware';
import { useStore } from './store';

interface User {
  id: number;
  email: string;
  name: string;
  points: number;
  plan_type: string;
  is_verified: boolean;
  avatar_url?: string;
  subscription_plan: string;
  billing_cycle?: "monthly" | "yearly";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: { email?: string; name?: string; password?: string }) => Promise<void>;
  updateSubscription: (planId: string, billingCycle: "monthly" | "yearly") => Promise<any>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          set({ 
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false 
          });

          // ログイン成功後にタイマーの状態をリセット
          useStore.getState().resetAllTimerStates();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          set({ 
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${get().token}`,
          },
        }).finally(() => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        });
      },

      clearError: () => set({ error: null }),

      updateSubscription: async (planId: string, billingCycle: "monthly" | "yearly") => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/subscription', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().token}`
            },
            body: JSON.stringify({ planId, billingCycle })
          });

          const responseData = await response.json();
          if (!response.ok) {
            throw new Error(responseData.message || 'Subscription update failed');
          }

          set({ 
            user: responseData.user,
            isLoading: false 
          });
          return responseData;
        } catch (error) {
          console.error('Subscription update error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Subscription update failed',
            isLoading: false 
          });
          throw error;
        }
      },

      updateProfile: async (data: { email?: string; name?: string; password?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().token}`,
            },
            body: JSON.stringify(data),
          });

          const responseData = await response.json();
          if (!response.ok) {
            throw new Error(responseData.message || 'Profile update failed');
          }

          set({ 
            user: responseData.user,
            isLoading: false 
          });
        } catch (error) {
          console.error('Profile update error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
      storage: {
        getItem: (name): StorageValue<AuthState> | null => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const data = JSON.parse(str);
            if (data.state && data.state.token) {
              return data as StorageValue<AuthState>;
            }
          } catch (e) {}
          return null;
        },
        setItem: (name, value: StorageValue<AuthState>) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

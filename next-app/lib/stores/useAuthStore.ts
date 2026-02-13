// Authentication state management with Zustand
import { create } from 'zustand';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false,
  }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false,
    isLoading: false,
  }),
}));

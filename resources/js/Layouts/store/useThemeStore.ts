import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const KEY = 'kubix-theme';

const apply = (mode: ThemeMode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
};

const initial = (): ThemeMode => {
    try {
        return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
};

interface ThemeState {
    mode: ThemeMode;
    toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    mode: initial(),
    toggle: () => {
        const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(KEY, next); } catch {}
        apply(next);
        set({ mode: next });
    },
}));

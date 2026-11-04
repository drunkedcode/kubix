import { create } from 'zustand';

interface UiState {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    sidebarCollapsed: true,
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

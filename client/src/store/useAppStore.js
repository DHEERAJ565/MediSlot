import { create } from 'zustand';

/**
 * ============================================================================
 * UNIT VI: Lightweight Global State Management using Zustand
 * ============================================================================
 * ARCHITECTURAL COMPARISON:
 * 1. Local State (useState):
 *    - Best for component-private state (e.g., input values, modal open/close, toggle switches).
 *    - Does not cause sibling re-renders; strictly bounded to component lifecycle.
 *
 * 2. Context API (e.g., AuthContext):
 *    - Ideal for low-frequency global updates (e.g., User authentication, theme, current role).
 *    - Built into React, no external bundle overhead.
 *
 * 3. Zustand Store (useAppStore):
 *    - Best for high-frequency or multi-component shared state (notifications, audio preferences, reception UI sync).
 *    - Uses selector subscriptions: components only re-render when the specific selected slice changes!
 *    - No Provider nesting hell; hook-based direct access anywhere in the tree.
 */

export const useAppStore = create((set, get) => ({
  // --- UI & Preferences State ---
  soundEnabled: false,
  lobbyFilterDepartment: 'All',
  announcementTickerVisible: true,
  recentNotifications: [],

  // --- Actions ---
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  setLobbyFilterDepartment: (department) => set({ lobbyFilterDepartment: department }),

  toggleAnnouncementTicker: () => set((state) => ({ announcementTickerVisible: !state.announcementTickerVisible })),

  // Add a live clinic notification banner
  addNotification: (message, type = 'info') =>
    set((state) => ({
      recentNotifications: [
        { id: Date.now(), message, type, timestamp: new Date().toLocaleTimeString() },
        ...state.recentNotifications.slice(0, 4), // Maintain top 5 most recent
      ],
    })),

  clearNotifications: () => set({ recentNotifications: [] }),
}));

export default useAppStore;

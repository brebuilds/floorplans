import { create } from 'zustand';
import type { Floorplan } from '@/types';

interface HistoryState {
  history: {
    [floorplanId: string]: {
      past: Floorplan[];
      present: Floorplan;
      future: Floorplan[];
    };
  };
  addToHistory: (floorplanId: string, floorplan: Floorplan) => void;
  undo: (floorplanId: string) => Floorplan | null;
  redo: (floorplanId: string) => Floorplan | null;
  canUndo: (floorplanId: string) => boolean;
  canRedo: (floorplanId: string) => boolean;
  clearHistory: (floorplanId: string) => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: {},

  addToHistory: (floorplanId, floorplan) => {
    const state = get();
    const current = state.history[floorplanId];

    if (!current) {
      set({
        history: {
          ...state.history,
          [floorplanId]: {
            past: [],
            present: floorplan,
            future: [],
          },
        },
      });
      return;
    }

    // Don't add if it's the same as present
    if (JSON.stringify(current.present) === JSON.stringify(floorplan)) {
      return;
    }

    const newPast = [...current.past, current.present].slice(-MAX_HISTORY);

    set({
      history: {
        ...state.history,
        [floorplanId]: {
          past: newPast,
          present: floorplan,
          future: [], // Clear future when new action is performed
        },
      },
    });
  },

  undo: (floorplanId) => {
    const state = get();
    const current = state.history[floorplanId];

    if (!current || current.past.length === 0) {
      return null;
    }

    const previous = current.past[current.past.length - 1];
    const newPast = current.past.slice(0, -1);
    const newFuture = [current.present, ...current.future];

    set({
      history: {
        ...state.history,
        [floorplanId]: {
          past: newPast,
          present: previous,
          future: newFuture.slice(0, MAX_HISTORY),
        },
      },
    });

    return previous;
  },

  redo: (floorplanId) => {
    const state = get();
    const current = state.history[floorplanId];

    if (!current || current.future.length === 0) {
      return null;
    }

    const next = current.future[0];
    const newPast = [...current.past, current.present];
    const newFuture = current.future.slice(1);

    set({
      history: {
        ...state.history,
        [floorplanId]: {
          past: newPast.slice(-MAX_HISTORY),
          present: next,
          future: newFuture,
        },
      },
    });

    return next;
  },

  canUndo: (floorplanId) => {
    const state = get();
    const current = state.history[floorplanId];
    return current ? current.past.length > 0 : false;
  },

  canRedo: (floorplanId) => {
    const state = get();
    const current = state.history[floorplanId];
    return current ? current.future.length > 0 : false;
  },

  clearHistory: (floorplanId) => {
    const state = get();
    const { [floorplanId]: _, ...rest } = state.history;
    set({ history: rest });
  },
}));


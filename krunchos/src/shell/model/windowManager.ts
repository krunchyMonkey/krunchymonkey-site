import type { AppId } from "../../apps/registry";

export interface DesktopWindow {
  readonly id: AppId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly zIndex: number;
  readonly minimized: boolean;
}

export interface WindowState {
  readonly windows: readonly DesktopWindow[];
  readonly nextZIndex: number;
}

export type WindowAction =
  | { readonly type: "open"; readonly id: AppId }
  | { readonly type: "focus"; readonly id: AppId }
  | { readonly type: "close"; readonly id: AppId }
  | { readonly type: "minimize"; readonly id: AppId }
  | { readonly type: "move"; readonly id: AppId; readonly x: number; readonly y: number };

export const initialWindowState: WindowState = {
  windows: [{ id: "workbench", x: 175, y: 108, width: 580, height: 430, zIndex: 1, minimized: false }],
  nextZIndex: 2,
};

export function windowReducer(state: WindowState, action: WindowAction): WindowState {
  const existing = state.windows.find((item) => item.id === action.id);

  if (action.type === "open" && !existing) {
    const offset = state.windows.length * 34;
    return {
      windows: [
        ...state.windows,
        {
          id: action.id,
          x: 230 + offset,
          y: 145 + offset,
          width: 530,
          height: 410,
          zIndex: state.nextZIndex,
          minimized: false,
        },
      ],
      nextZIndex: state.nextZIndex + 1,
    };
  }

  if (action.type === "close") {
    return { ...state, windows: state.windows.filter((item) => item.id !== action.id) };
  }

  if (!existing) {
    return state;
  }

  if (action.type === "move") {
    return {
      ...state,
      windows: state.windows.map((item) =>
        item.id === action.id ? { ...item, x: action.x, y: action.y } : item,
      ),
    };
  }

  if (action.type === "minimize") {
    return {
      ...state,
      windows: state.windows.map((item) =>
        item.id === action.id ? { ...item, minimized: true } : item,
      ),
    };
  }

  return {
    windows: state.windows.map((item) =>
      item.id === action.id
        ? { ...item, minimized: false, zIndex: state.nextZIndex }
        : item,
    ),
    nextZIndex: state.nextZIndex + 1,
  };
}

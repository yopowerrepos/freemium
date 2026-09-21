// Public type representing the current modifier key states
export type ModifierState = {
  ctrl: boolean;
  shift: boolean;
  // Toggled on / off every time the user presses CTRL twice in a row
  hideValues: boolean;
};

// Internal modifier key state
let modifierState: ModifierState = {
  ctrl: false,
  shift: false,
  hideValues: false,
};

// Maximum delay (ms) between two CTRL presses to be treated as a double press
const DOUBLE_PRESS_DELAY = 400;

// Timestamp of the last CTRL press, used to detect the double press
let lastCtrlPress = 0;

// List of subscribers to notify when modifier state changes
const listeners = new Set<(modifiers: ModifierState) => void>();

// Helper: shallow compare to detect changes
const hasStateChanged = (a: ModifierState, b: ModifierState): boolean =>
  a.ctrl !== b.ctrl || a.shift !== b.shift || a.hideValues !== b.hideValues;

// Internal update logic to notify only if state actually changed
const updateState = (newState: Partial<ModifierState>) => {
  const updated: ModifierState = {
    ...modifierState,
    ...newState,
  };

  if (hasStateChanged(updated, modifierState)) {
    modifierState = updated;
    listeners.forEach((callback) =>
      callback(Object.freeze({ ...modifierState }))
    );
  }
};

let initialized = false;

// ✅ Call this once (e.g. in PCF `init()`) to begin tracking keys globally
// `subgrid` and `visibility` are the localStorage keys you want cleared on CTRL+F5
export const initModifierTracker = (subgrid: string, visibility: string = "") => {
  if (initialized) return;
  initialized = true;

  const handleKey = (e: KeyboardEvent) => {
    switch (e.code) {
      case "ControlLeft":
      case "ControlRight": {
        const pressed = e.type === "keydown";

        // Only react to a real press (ignore the auto repeat while the key is held)
        if (pressed && !modifierState.ctrl) {
          const now = Date.now();
          if (now - lastCtrlPress <= DOUBLE_PRESS_DELAY) {
            // Second press within the delay -> turn the masking on / off
            lastCtrlPress = 0;
            updateState({ ctrl: true, hideValues: !modifierState.hideValues });
            break;
          }
          lastCtrlPress = now;
        }

        updateState({ ctrl: pressed });
        break;
      }
      case "ShiftLeft":
      case "ShiftRight":
        updateState({ shift: e.type === "keydown" });
        break;
      case "F5":
        if (modifierState.ctrl && e.type === "keydown") {
          localStorage.removeItem(subgrid);
          if (visibility) localStorage.removeItem(visibility);
        }
        break;
    }
  };

  window.addEventListener("keydown", handleKey);
  window.addEventListener("keyup", handleKey);
};

// ✅ Restore a previously persisted show / hide state (e.g. from localStorage)
// Notifies the subscribers only when it actually differs from the current state
export const setHideValues = (hideValues: boolean) => {
  updateState({ hideValues });
};

// ✅ Get the current state of modifier keys
export const getModifierState = (): ModifierState => ({ ...modifierState });

// ✅ Subscribe to modifier state changes
// Returns a function to unsubscribe when no longer needed
export const subscribeToModifierChange = (
  callback: (modifiers: ModifierState) => void
): (() => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
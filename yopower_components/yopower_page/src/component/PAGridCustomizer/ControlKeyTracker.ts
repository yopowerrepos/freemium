// Public type representing the current modifier key states
export type ModifierState = {
  ctrl: boolean;
  shift: boolean;
};

// Internal modifier key state
let modifierState: ModifierState = {
  ctrl: false,
  shift: false,
};

// List of subscribers to notify when modifier state changes
const listeners = new Set<(modifiers: ModifierState) => void>();

// Helper: shallow compare to detect changes
const hasStateChanged = (a: ModifierState, b: ModifierState): boolean =>
  a.ctrl !== b.ctrl || a.shift !== b.shift;

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
export const initModifierTracker = () => {
  if (initialized) return;
  initialized = true;

  const handleKey = (e: KeyboardEvent) => {
    switch (e.code) {
      case "ControlLeft":
      case "ControlRight":
        updateState({ ctrl: e.type === "keydown" });
        break;
      case "ShiftLeft":
      case "ShiftRight":
        updateState({ shift: e.type === "keydown" });
        break;
    }
  };

  window.addEventListener("keydown", handleKey);
  window.addEventListener("keyup", handleKey);
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
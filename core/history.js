const undoStack = [];
const redoStack = [];

function isActionLike(action) {
  return !!action && (typeof action.undo === 'function' || typeof action.redo === 'function');
}

/**
 * Registra uma ação no histórico e limpa a pilha de redo.
 * action: { undo?: Function, redo?: Function, label?: string, timestamp?: number, meta?: any }
 */
export function pushHistory(action) {
  if (!isActionLike(action)) return false;
  undoStack.push({
    timestamp: Date.now(),
    ...action
  });
  redoStack.length = 0;
  return true;
}

/**
 * Desfaz a última ação registrada.
 */
export function undo(context) {
  const action = undoStack.pop();
  if (!action) return false;

  if (typeof action.undo === 'function') {
    action.undo(context);
  }

  redoStack.push(action);
  return true;
}

/**
 * Refaz a última ação desfeita.
 */
export function redo(context) {
  const action = redoStack.pop();
  if (!action) return false;

  if (typeof action.redo === 'function') {
    action.redo(context);
  }

  undoStack.push(action);
  return true;
}

export function clearHistory() {
  undoStack.length = 0;
  redoStack.length = 0;
}

export function canUndo() {
  return undoStack.length > 0;
}

export function canRedo() {
  return redoStack.length > 0;
}

export function getHistoryState() {
  return {
    undoDepth: undoStack.length,
    redoDepth: redoStack.length,
    nextUndo: undoStack[undoStack.length - 1] ?? null,
    nextRedo: redoStack[redoStack.length - 1] ?? null
  };
}

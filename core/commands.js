import { undo as historyUndo, redo as historyRedo } from './history.js';

function getSelection(context = {}) {
  if (Array.isArray(context.selection)) return context.selection;
  if (typeof context.getSelection === 'function') return context.getSelection() || [];
  return [];
}

function runContextMethod(context, methodName, ...args) {
  const fn = context?.[methodName];
  if (typeof fn === 'function') return fn(...args);
  return undefined;
}

function notImplemented(label) {
  return {
    id: label,
    name: label,
    execute: (context = {}) => runContextMethod(context, 'notify', `${label} ainda não implementado`) ?? null
  };
}

export const commands = {
  edit: {
    copy: {
      id: 'copy',
      name: 'Copiar',
      shortcut: 'Ctrl+C',
      execute: (context = {}) => {
        const selection = getSelection(context);
        context.clipboard = selection.map(item => (typeof structuredClone === 'function' ? structuredClone(item) : JSON.parse(JSON.stringify(item))));
        return context.clipboard;
      }
    },
    paste: {
      id: 'paste',
      name: 'Colar',
      shortcut: 'Ctrl+V',
      execute: (context = {}) => {
        const clipboard = Array.isArray(context.clipboard) ? context.clipboard : [];
        const clones = clipboard.map(item => (typeof structuredClone === 'function' ? structuredClone(item) : JSON.parse(JSON.stringify(item))));
        runContextMethod(context, 'insertElements', clones);
        runContextMethod(context, 'setSelection', clones);
        return clones;
      }
    },
    duplicate: {
      id: 'duplicate',
      name: 'Duplicar',
      shortcut: 'Ctrl+D',
      execute: (context = {}) => runContextMethod(context, 'duplicateSelection')
    },
    delete: {
      id: 'delete',
      name: 'Excluir',
      shortcut: 'Delete',
      execute: (context = {}) => runContextMethod(context, 'deleteSelection')
    },
    undo: {
      id: 'undo',
      name: 'Desfazer',
      shortcut: 'Ctrl+Z',
      execute: (context = {}) => historyUndo(context)
    },
    redo: {
      id: 'redo',
      name: 'Refazer',
      shortcut: 'Ctrl+Shift+Z',
      execute: (context = {}) => historyRedo(context)
    }
  },

  selection: {
    selectAll: {
      id: 'selectAll',
      name: 'Selecionar tudo',
      shortcut: 'Ctrl+A',
      execute: (context = {}) => runContextMethod(context, 'selectAll')
    },
    deselectAll: {
      id: 'deselectAll',
      name: 'Desselecionar',
      shortcut: 'Esc',
      execute: (context = {}) => runContextMethod(context, 'clearSelection')
    }
  },

  transform: {
    move: {
      id: 'move',
      name: 'Mover',
      execute: (context = {}, payload = { dx: 0, dy: 0 }) => runContextMethod(context, 'moveSelection', payload)
    },
    rotate: {
      id: 'rotate',
      name: 'Rotacionar',
      execute: (context = {}, payload = { angle: 0 }) => runContextMethod(context, 'rotateSelection', payload)
    },
    scale: {
      id: 'scale',
      name: 'Escalar',
      execute: (context = {}, payload = { x: 1, y: 1 }) => runContextMethod(context, 'scaleSelection', payload)
    },
    flipHorizontal: {
      id: 'flipHorizontal',
      name: 'Espelhar horizontal',
      execute: (context = {}) => runContextMethod(context, 'flipSelection', { axis: 'x' })
    },
    flipVertical: {
      id: 'flipVertical',
      name: 'Espelhar vertical',
      execute: (context = {}) => runContextMethod(context, 'flipSelection', { axis: 'y' })
    }
  },

  shapes: {},
  appearance: {},
  organize: {},
  view: {},

  boolean: {
    union: {
      id: 'union',
      name: 'Unir',
      execute: (context = {}) => runContextMethod(context, 'booleanOperation', { type: 'union' })
    },
    subtract: {
      id: 'subtract',
      name: 'Subtrair',
      execute: (context = {}) => runContextMethod(context, 'booleanOperation', { type: 'subtract' })
    },
    intersect: {
      id: 'intersect',
      name: 'Interseção',
      execute: (context = {}) => runContextMethod(context, 'booleanOperation', { type: 'intersect' })
    }
  },

  text: {}
};

// Seeds opcionais para expansão futura (lista solicitada pelo usuário)
commands.edit.cut = notImplemented('cut');
commands.edit.pasteInPlace = notImplemented('pasteInPlace');
commands.edit.group = notImplemented('group');
commands.edit.ungroup = notImplemented('ungroup');
commands.edit.lock = notImplemented('lock');
commands.edit.unlock = notImplemented('unlock');
commands.edit.hide = notImplemented('hide');
commands.edit.show = notImplemented('show');

export function getAllCommands() {
  return Object.values(commands)
    .flatMap(category => Object.values(category))
    .filter(cmd => cmd && cmd.id);
}

import { getAllCommands } from './commands.js';
import { executeCommand } from './dispatcher.js';

function normalizeShortcut(shortcut = '') {
  return shortcut
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('control', 'ctrl')
    .replace('command', 'meta');
}

function eventToShortcut(event) {
  const parts = [];
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');

  const key = event.key?.toLowerCase();
  if (!key) return '';

  // Normaliza teclas especiais comuns
  const keyAlias = key === 'escape' ? 'esc' : key;
  parts.push(keyAlias);

  return parts.join('+');
}

export function createShortcutMap(commandList = getAllCommands()) {
  const map = new Map();
  for (const command of commandList) {
    if (!command.shortcut) continue;
    map.set(normalizeShortcut(command.shortcut), command.id);
  }
  return map;
}

export function bindShortcuts(target = window, context = {}) {
  const shortcutMap = createShortcutMap();

  const handler = event => {
    const isTypingTarget = event.target?.matches?.('input, textarea, select, [contenteditable="true"]');
    if (isTypingTarget) return;

    const shortcut = normalizeShortcut(eventToShortcut(event));
    const commandId = shortcutMap.get(shortcut);

    if (!commandId) return;

    event.preventDefault();
    executeCommand(commandId, context);
  };

  target.addEventListener('keydown', handler, { passive: false });

  return () => target.removeEventListener('keydown', handler);
}

export { normalizeShortcut, eventToShortcut };

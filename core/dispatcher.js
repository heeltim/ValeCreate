import { commands, getAllCommands } from './commands.js';
import { pushHistory } from './history.js';

const commandIndex = new Map();

function indexCommands() {
  commandIndex.clear();
  for (const cmd of getAllCommands()) {
    commandIndex.set(cmd.id, cmd);
  }
}

indexCommands();

export function getCommand(commandId) {
  return commandIndex.get(commandId) || null;
}

/**
 * Executa um comando por id.
 * payload pode carregar parâmetros da execução.
 */
export function executeCommand(commandId, context = {}, payload) {
  const command = getCommand(commandId);
  if (!command) {
    throw new Error(`Comando não encontrado: ${commandId}`);
  }

  const result = command.execute(context, payload);

  // Hook para integração com histórico: se o comando retornar undo/redo, registramos.
  if (result && (typeof result.undo === 'function' || typeof result.redo === 'function')) {
    pushHistory({
      label: command.name,
      ...result
    });
  }

  return result;
}

export function listCommands() {
  return getAllCommands().map(cmd => ({
    id: cmd.id,
    name: cmd.name,
    shortcut: cmd.shortcut || null
  }));
}

export function refreshCommandIndex() {
  indexCommands();
  return commandIndex.size;
}

export { commands };

(function(global){
  const KEY = 'goblins_v3';
  const BACKUP_PREFIX = 'goblins_v3_backup_';
  const MAX_BACKUPS = 5;

  function parseJSON(value, fallback){
    try { return JSON.parse(value); } catch { return fallback; }
  }

  const Storage = {
    save(data){
      try {
        const serialized = JSON.stringify(data);
        global.localStorage.setItem(KEY, serialized);
        this.createBackup(serialized);
        return true;
      } catch (error) {
        global.ErrorHandler?.capture?.(error, { scope: 'Storage.save' });
        return false;
      }
    },
    load(){
      const raw = global.localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = parseJSON(raw, null);
      if (parsed !== null) return parsed;
      return this.restoreFromBackup();
    },
    createBackup(serialized){
      const stamp = Date.now();
      global.localStorage.setItem(`${BACKUP_PREFIX}${stamp}`, serialized);
      const keys = Object.keys(global.localStorage)
        .filter((k) => k.startsWith(BACKUP_PREFIX))
        .sort();
      while (keys.length > MAX_BACKUPS) {
        const old = keys.shift();
        global.localStorage.removeItem(old);
      }
    },
    restoreFromBackup(){
      const keys = Object.keys(global.localStorage)
        .filter((k) => k.startsWith(BACKUP_PREFIX))
        .sort()
        .reverse();
      for (const key of keys) {
        const parsed = parseJSON(global.localStorage.getItem(key), null);
        if (parsed !== null) return parsed;
      }
      return [];
    },
    exportAll(){
      const payload = {
        current: this.load(),
        backups: Object.keys(global.localStorage)
          .filter((k) => k.startsWith(BACKUP_PREFIX))
          .map((k) => ({ key: k, value: parseJSON(global.localStorage.getItem(k), null) }))
      };
      return payload;
    }
  };

  global.Storage = Storage;
})(window);

(function(global){
  const Security = {
    sanitizeSVG(input){
      const raw = String(input || '');
      return raw
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
        .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
        .replace(/javascript:/gi, '');
    },
    getParentOrigin(){
      if (global.location.ancestorOrigins && global.location.ancestorOrigins.length) {
        return global.location.ancestorOrigins[0];
      }
      return global.location.origin;
    },
    isTrustedMessageEvent(ev, opts = {}){
      if (!ev) return false;
      const { allowedOrigin, allowedSource } = opts;
      const originOk = !allowedOrigin || ev.origin === allowedOrigin || ev.origin === 'null';
      const sourceOk = !allowedSource || ev.source === allowedSource;
      return originOk && sourceOk;
    }
  };

  global.Security = Security;
})(window);

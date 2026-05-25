(function(global){
  const ErrorHandler = {
    init(options = {}){
      this.onError = options.onError;
      global.addEventListener('error', (event) => {
        this.capture(event.error || new Error(event.message), { type: 'error' });
      });
      global.addEventListener('unhandledrejection', (event) => {
        this.capture(event.reason || new Error('Unhandled promise rejection'), { type: 'unhandledrejection' });
      });
    },
    capture(error, meta = {}){
      const message = error?.message || String(error);
      console.error('[GoBrand Error]', message, meta);
      if (typeof this.onError === 'function') this.onError(error, meta);
    }
  };

  global.ErrorHandler = ErrorHandler;
})(window);

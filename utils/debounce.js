(function(global){
  function debounce(fn, wait = 300){
    let timer;
    return function debounced(...args){
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  global.debounce = debounce;
})(window);

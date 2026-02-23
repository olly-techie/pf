(function(global){
  'use strict';

  const scrollState = {
    y: window.scrollY || 0,
    lastY: window.scrollY || 0,
    velocity: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    // section progress map populated by main.js
    sections: {}
  };

  let lastTs = performance.now();
  let ticking = false;

  function onScroll(e){
    // passive - only read and stash; heavy work done in RAF subscribers
    scrollState.y = window.scrollY || window.pageYOffset || 0;
    if (!ticking){
      ticking = true;
      requestAnimationFrame(()=> {
        const now = performance.now();
        const dt = Math.max(16, now - lastTs);
        scrollState.velocity = (scrollState.y - scrollState.lastY) / dt;
        scrollState.lastY = scrollState.y;
        lastTs = now;
        ticking = false;
      });
    }
  }

  function onResize(){
    scrollState.width = window.innerWidth;
    scrollState.height = window.innerHeight;
  }

  // passive listener
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onResize, {passive:true});

  // visibility - reduce work when hidden
  document.addEventListener('visibilitychange', ()=> {
    if (document.hidden) {
      // no-op here. sections and engine will stop when not needed.
    }
  });

  // Expose read-only state
  global.__SCROLL_STATE__ = scrollState;

})(window);
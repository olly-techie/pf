(function(window){
  'use strict';

  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'hero';

  const module = (function(){

    let el, headlineWrap;
    let unsub = null;
    let progress = 0;

    function init(sectionEl, ctx){
      el = sectionEl;
      headlineWrap = el.querySelector('.hero-headline-wrap');
      // initial state for CSS-only fallback if JS loads late
      headlineWrap.style.willChange = 'transform,opacity';
      headlineWrap.style.transform = 'translateY(12px)';
      headlineWrap.style.opacity = '0';
    }

    function activate(){
      // subscribe to engine for smooth, low-cost animation
      if (unsub) return;
      unsub = window.__ANIMATION_ENGINE__.subscribe(now=>{
        // compute progress based on viewport
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // clamp between 0..1 where 0 is top of hero visible, 1 is scrolled past 50% of hero
        progress = Math.min(1, Math.max(0, 1 - (rect.top / (vh * 0.6))));
        // transform: translateY from 12px -> 0 ; opacity 0->1
        const ty = (1 - progress) * 12;
        const op = Math.min(1, progress * 1.2);
        // write once
        headlineWrap.style.transform = `translateY(${ty}px)`;
        headlineWrap.style.opacity = `${op}`;
        // store for dev mode
        module.progress = progress;
      });
    }

    function deactivate(){
      if (unsub){ unsub(); unsub = null; }
    }

    return {init, activate, deactivate, get progress(){ return progress }};
  })();

  window.__SECTION_MODULES__[key] = module;

})(window);
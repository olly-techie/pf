(function(window){
  'use strict';
  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'evolution';

  const mod = (function(){
    let el, items;
    let unsub = null;
    let progress = 0;

    function init(sectionEl, ctx){
      el = sectionEl;
      items = Array.from(el.querySelectorAll('.milestone'));
      // initial state
      items.forEach((it,i)=>{
        const dot = it.querySelector('.dot');
        it.style.opacity = '0';
        it.style.transform = 'translateY(12px)';
        if (dot) { dot.style.opacity = '0'; dot.style.transform = 'translateY(6px)'; }
      });
    }

    function activate(){
      if (unsub) return;
      unsub = window.__ANIMATION_ENGINE__.subscribe(now=>{
        // compute a progress for the section
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        progress = Math.min(1, Math.max(0, 1 - (rect.top / (vh * 0.8))));
        // sequential reveal (staggered by index)
        items.forEach((it,i)=>{
          const delay = i * 0.12;
          const local = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          const ty = (1 - local) * 10;
          const op = local;
          it.style.transform = `translateY(${ty}px)`;
          it.style.opacity = `${op}`;
          const dot = it.querySelector('.dot');
          if (dot){ dot.style.opacity = `${op}`; dot.style.transform = `translateY(${ty*0.6}px)`; }
        });
        mod.progress = progress;
      });
    }

    function deactivate(){
      if (unsub){ unsub(); unsub = null; }
    }

    return {init, activate, deactivate, get progress(){ return progress }};
  })();

  window.__SECTION_MODULES__[key] = mod;

})(window);
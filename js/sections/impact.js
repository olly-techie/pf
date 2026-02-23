(function(window){
  'use strict';
  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'impact';

  const mod = (function(){
    let el, items;
    let unsub = null;
    let progress = 0;

    function init(sectionEl, ctx){
      el = sectionEl;
      items = Array.from(el.querySelectorAll('.case'));
      items.forEach(it=>{
        it.style.opacity = '0';
        it.style.transform = 'translateY(12px)';
      });
    }

    function activate(){
      if (unsub) return;
      unsub = window.__ANIMATION_ENGINE__.subscribe(now=>{
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        progress = Math.min(1, Math.max(0, 1 - (rect.top / (vh * 0.9))));
        items.forEach((it,i)=>{
          const delay = i * 0.08;
          const local = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          it.style.opacity = `${local}`;
          it.style.transform = `translateY(${(1-local)*10}px)`;
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
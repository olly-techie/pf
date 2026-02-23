(function(window){
  'use strict';
  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'cta';

  const mod = (function(){
    let el;
    function init(sectionEl, ctx){
      el = sectionEl;
      const buttons = Array.from(el.querySelectorAll('.btn'));
      buttons.forEach(btn=>{
        // press feedback for touch: temporary scale using transform
        btn.addEventListener('pointerdown', onPress, {passive:true});
        btn.addEventListener('pointerup', onRelease, {passive:true});
        btn.addEventListener('pointercancel', onRelease, {passive:true});
      });
    }

    function onPress(e){
      e.currentTarget.style.transform = 'translateY(-2px) scale(0.996)';
    }
    function onRelease(e){
      e.currentTarget.style.transform = ''; }

    function activate(){}
    function deactivate(){}

    return {init, activate, deactivate};
  })();

  window.__SECTION_MODULES__[key] = mod;

})(window);
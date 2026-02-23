(function(window){
  'use strict';
  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'vision';

  const mod = (function(){
    let el, canvas, ctx;
    let particles = [];
    let unsub = null;
    let progress = 0;
    let active = false;

    function init(sectionEl, ctxObj){
      el = sectionEl;
      canvas = el.querySelector('canvas[data-canvas="vision-particles"]');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize, {passive:true});
      createParticles(28);
    }

    function createParticles(n){
      particles = [];
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (let i=0;i<n;i++){
        particles.push({
          x: Math.random()*w,
          y: Math.random()*h,
          vx: (Math.random()-0.5)*0.12,
          vy: (Math.random()-0.5)*0.12,
          r: 0.6 + Math.random()*1.6,
          alpha: 0.06 + Math.random()*0.04,
        });
      }
    }

    function resize(){
      if (!canvas) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || canvas.width;
      const h = canvas.clientHeight || canvas.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx && ctx.scale(dpr, dpr);
    }

    function activate(){
      if (active) return;
      active = true;
      unsub = window.__ANIMATION_ENGINE__.subscribe(now=>{
        // small low-cost motion
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
          ctx.fillStyle = `rgba(31,182,255,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
          ctx.fill();
        });
        mod.progress = 1; // not used heavily
      });
    }

    function deactivate(){
      if (unsub){ unsub(); unsub = null; }
      active = false;
      if (ctx) {
        // keep canvas in current state but stop updates
      }
    }

    return {init, activate, deactivate, get progress(){ return progress }};
  })();

  window.__SECTION_MODULES__[key] = mod;

})(window);
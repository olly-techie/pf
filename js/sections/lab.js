(function(window){
  'use strict';
  window.__SECTION_MODULES__ = window.__SECTION_MODULES__ || {};
  const key = 'lab';

  const mod = (function(){
    let el;
    let canvas, ctx;
    let unsubRead=null, unsubWrite=null;
    let t = 0;
    let active = false;
    let progress = 0;

    function init(sectionEl, ctxObj){
      el = sectionEl;
      const canvasEl = el.querySelector('canvas[data-canvas="event-loop"]');
      if (canvasEl){
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        // scale for devicePixelRatio
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const w = canvas.width; const h = canvas.height;
        canvas.style.width = canvas.style.width || canvas.width + 'px';
        canvas.style.height = canvas.style.height || canvas.height + 'px';
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }
      // hydration module is conceptual - leave as DOM with minor transforms
    }

    function activate(){
      if (active) return;
      active = true;
      // read phase: measure
      unsubRead = window.__ANIMATION_ENGINE__.subscribeRead((now,dt)=>{
        // measure section rect to compute progress
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        progress = Math.min(1, Math.max(0, 1 - (rect.top / (vh * 0.9))));
      });
      // write phase: render visualizer
      unsubWrite = window.__ANIMATION_ENGINE__.subscribeWrite((now,dt)=>{
        t += dt * 0.001;
        if (canvas && ctx){
          drawEventLoop(ctx, canvas, t);
        }
        // small demo: hydrate placeholder pulse
        const hyd = el.querySelector('.hydration-frame');
        if (hyd){
          const scale = 0.98 + Math.abs(Math.sin(t*0.8))*0.02;
          hyd.style.transform = `scale(${scale})`;
          hyd.style.opacity = `${0.9 + Math.sin(t*0.6)*0.07}`;
        }
        mod.progress = progress;
      });
    }

    function deactivate(){
      if (unsubRead){ unsubRead(); unsubRead = null; }
      if (unsubWrite){ unsubWrite(); unsubWrite = null; }
      active = false;
    }

    function drawEventLoop(ctx, canvas, time){
      // Lightweight drawing: represent task queues as boxes and moving dots
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // note: we use CSS size for drawing (ctx is scaled)
      // draw two queues
      const laneW = w * 0.42;
      const gap = w * 0.06;
      const x1 = 0.02 * w;
      const x2 = x1 + laneW + gap;
      const y = 10;
      const laneH = h - 20;

      // lane backgrounds (subtle)
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      roundRect(ctx,x1,y,laneW,laneH,6); ctx.fill();
      roundRect(ctx,x2,y,laneW,laneH,6); ctx.fill();

      // labels
      ctx.fillStyle = 'rgba(245,245,245,0.7)';
      ctx.font = '12px monospace';
      ctx.fillText('Macro Queue', x1 + 8, y + 18);
      ctx.fillText('Micro Queue', x2 + 8, y + 18);

      // moving dots (simulate tasks)
      const speed = 40 + Math.sin(time)*20;
      const tasks = 6;
      for (let i=0;i<tasks;i++){ 
        const sx = (time * (0.3 + i*0.02)*speed + i*40) % (laneW - 20);
        const sy = y + 40 + (i%3)*18;
        ctx.fillStyle = 'rgba(31,182,255,0.9)';
        roundRect(ctx, x1 + sx, sy, 8, 8, 3); ctx.fill();
      }

      // micro tasks - faster
      for (let i=0;i<tasks;i++){
        const sx = (time * (0.6 + i*0.03)*speed + i*30) % (laneW - 20);
        const sy = y + 40 + (i%3)*18;
        ctx.fillStyle = 'rgba(120,255,200,0.85)';
        roundRect(ctx, x2 + sx, sy, 6, 6, 3); ctx.fill();
      }
    }

    function roundRect(ctx,x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    return {init, activate, deactivate, get progress(){ return progress }};
  })();

  window.__SECTION_MODULES__[key] = mod;

})(window);
importScripts = function(){ /* no-op for environments without importScripts */ };

(function(global){
  'use strict';

  const Engine = global.__ANIMATION_ENGINE__;
  const Scroll = global.__SCROLL_STATE__;

  // Registry of sections
  const SECTIONS = {
    hero: {el:document.getElementById('hero'), module:null, src:'js/sections/hero.js'},
    evolution: {el:document.getElementById('evolution'), module:null, src:'js/sections/evolution.js'},
    lab: {el:document.getElementById('lab'), module:null, src:'js/sections/lab.js'},
    impact: {el:document.getElementById('impact'), module:null, src:'js/sections/impact.js'},
    vision: {el:document.getElementById('vision'), module:null, src:'js/sections/vision.js'},
    cta: {el:document.getElementById('cta'), module:null, src:'js/sections/cta.js'}
  };

  // IntersectionObserver to activate/deactivate sections
  const ioOptions = {root:null, rootMargin:'0px 0px -10% 0px', threshold: buildThresholdList()};
  const io = new IntersectionObserver(handleIntersect, ioOptions);

  Object.values(SECTIONS).forEach(s=>{ if (s.el) io.observe(s.el); });

  // Dynamically load module script by creating a <script type="module"> tag
  // This avoids bundling and allows progressive enhancement.
  function loadSectionModule(sectionKey){
    const entry = SECTIONS[sectionKey];
    if (!entry || entry.module) return Promise.resolve(entry.module);
    return new Promise((resolve, reject)=>{
      const script = document.createElement('script');
      script.type = 'module';
      script.src = entry.src;
      script.onload = ()=> {
        // Each module registers itself on window.__SECTION_MODULES__[key]
        const registry = window.__SECTION_MODULES__ || {};
        entry.module = registry[sectionKey] || null;
        if (entry.module && typeof entry.module.init === 'function'){
          entry.module.init(entry.el, {Engine, Scroll});
        }
        resolve(entry.module);
      };
      script.onerror = (e)=> reject(e);
      document.head.appendChild(script);
    });
  }

  // Intersection handler
  function handleIntersect(entries){
    entries.forEach(entry=>{
      const el = entry.target;
      const key = el.getAttribute('data-section') || el.id;
      const isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (!SECTIONS[key]) return;
      if (isVisible){
        // lazy load then activate
        loadSectionModule(key).then(mod=>{
          if (mod && typeof mod.activate === 'function') mod.activate();
        }).catch(()=>{/* non-fatal */});
      } else {
        const mod = SECTIONS[key].module;
        if (mod && typeof mod.deactivate === 'function') mod.deactivate();
      }
    });
  }

  // Utility to create thresholds for finer progress control
  function buildThresholdList(){
    const numSteps = 50;
    const list = [];
    for (let i=0;i<=numSteps;i++) list.push(i/numSteps);
    return list;
  }

  // Dev Mode: double-tap 'D' to toggle; unobtrusive by default
  let devMode = false;
  const devHint = document.getElementById('dev-hint');
  const DEV_REG = {fps:null, velocity:null, progress:null};
  const devOverlay = createDevOverlay();

  let lastKey = 0;
  window.addEventListener('keydown', (e)=>{
    const now = performance.now();
    if (e.key.toLowerCase()==='d' && now - lastKey < 400){
      toggleDev();
    }
    lastKey = now;
  });

  function createDevOverlay(){
    const wrap = document.createElement('div');
    wrap.style.position='fixed';
    wrap.style.left='12px';
    wrap.style.top='12px';
    wrap.style.zIndex='9999';
    wrap.style.color='var(--fg)';
    wrap.style.fontFamily='monospace';
    wrap.style.fontSize='12px';
    wrap.style.background='rgba(0,0,0,0.45)';
    wrap.style.padding='8px 10px';
    wrap.style.borderRadius='8px';
    wrap.style.display='none';
    wrap.style.pointerEvents='none';
    document.body.appendChild(wrap);
    return wrap;
  }

  let fpsCounter = {frames:0,last:performance.now(),fps:0};
  function updateDevOverlay(now){
    fpsCounter.frames++;
    if (now - fpsCounter.last >= 500){
      fpsCounter.fps = Math.round((fpsCounter.frames*1000) / (now - fpsCounter.last));
      fpsCounter.last = now;
      fpsCounter.frames = 0;
    }
    devOverlay.innerText = `FPS: ${fpsCounter.fps}\nScrollV: ${Scroll.velocity.toFixed(3)}\nSections:\n` +
      Object.keys(SECTIONS).map(k=> {
        const mod = SECTIONS[k].module;
        const prog = mod && typeof mod.progress === 'number' ? mod.progress.toFixed(2) : '-';
        return `  ${k}: ${prog}`;
      }).join('\n');
  }

  function toggleDev(){
    devMode = !devMode;
    devOverlay.style.display = devMode ? 'block' : 'none';
    devHint.style.opacity = devMode ? '0.06' : '0.06';
    // if enabled, subscribe to engine to update overlay
    if (devMode){
      DEV_REG.fps = Engine.subscribe(now=>{
        updateDevOverlay(now);
      });
    } else {
      if (DEV_REG.fps) { DEV_REG.fps(); DEV_REG.fps = null; }
    }
  }

  // Expose for debug/testing
  global.__SITE_BOOT__ = {SECTIONS, toggleDev};

  // Make sure initial heavy modules are lazy loaded only when they become visible.

})(window);
(function(global){
  'use strict';

  // Shared engine
  const Engine = (function(){
    let rafId = null;
    let last = performance.now();
    const subs = new Set();
    const reads = new Set();
    const writes = new Set();
    let running = false;

    function loop(now){
      const dt = Math.min(64, now - last);
      last = now;

      // 1) batch reads
      if (reads.size){
        for (const fn of reads) {
          try { fn(now, dt); } catch (e) { console.error(e); }
        }
      }

      // 2) batch main subscribers (logic-only)
      if (subs.size){
        for (const fn of subs) {
          try { fn(now, dt); } catch (e) { console.error(e); }
        }
      }

      // 3) batch writes
      if (writes.size){
        for (const fn of writes){
          try { fn(now, dt); } catch (e){ console.error(e); }
        }
      }

      // continue if any subscriber exists
      if (reads.size || subs.size || writes.size){
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
        running = false;
      }
    }

    function ensureRunning(){
      if (!running){
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }

    return {
      // main logic subscriber
      subscribe(fn){
        subs.add(fn);
        ensureRunning();
        return ()=>subs.delete(fn);
      },
      // read-only batch (DOM reads)
      subscribeRead(fn){
        reads.add(fn);
        ensureRunning();
        return ()=>reads.delete(fn);
      },
      // write-only batch (DOM writes)
      subscribeWrite(fn){
        writes.add(fn);
        ensureRunning();
        return ()=>writes.delete(fn);
      },
      getActiveCounts(){
        return {reads:reads.size, subs:subs.size, writes:writes.size};
      },
      stop(){
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        subs.clear(); reads.clear(); writes.clear();
      }
    };
  })();

  // Expose
  global.__ANIMATION_ENGINE__ = Engine;

})(window);
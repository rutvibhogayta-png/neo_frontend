/* The technology orbit: a tilted ring (like Saturn's) with the NeoFolks mark at the centre.
   Text-only nodes, no icons. Hover slows it; click or focus brings a technology to the front. */
(function () {
  const NF = (window.NF = window.NF || { pages: {} });

  NF.orbit = function () {
    const stage = document.getElementById('orbitStage');
    if (!stage || !window.NEOFOLKS_DATA) return;
    const TECHS = window.NEOFOLKS_DATA.technologies;
    const nameEl = document.getElementById('orbitName');
    const catEl = document.getElementById('orbitCat');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NS = 'http://www.w3.org/2000/svg';
    const TILT = -16 * Math.PI / 180;
    const SECONDS_PER_ITEM = 1.7;
    const N = TECHS.length, STEP = Math.PI * 2 / N, TWO_PI = Math.PI * 2;

    const mk = (cls) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); return s; };
    const ringBack = mk('o-ring o-back'), ringFront = mk('o-ring o-front');
    stage.prepend(ringFront); stage.prepend(ringBack);

    const nodes = TECHS.map((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'o-node'; b.textContent = t.name;
      b.setAttribute('aria-label', t.name + ', ' + t.category + '. Bring to the front');
      b.addEventListener('click', () => goTo(i));
      b.addEventListener('focus', () => goTo(i));
      stage.appendChild(b); return b;
    });

    let W = 0, H = 0, R = 0, B = 0, visible = true;
    function drawRing() {
      const g = (front) => {
        const d = `M ${-R} 0 A ${R} ${B} 0 0 ${front ? 1 : 0} ${R} 0`;
        return `<g transform="translate(${W / 2} ${H / 2}) rotate(${TILT * 180 / Math.PI})">
          <path d="${d}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1"/></g>`;
      };
      [ringBack, ringFront].forEach((s, i) => { s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.innerHTML = g(i === 1); });
    }
    function measure() {
      const r = stage.getBoundingClientRect(); W = r.width; H = r.height;
      if (!W) return;
      const narrow = W < 600;
      R = Math.min(W * (narrow ? 0.38 : 0.4), 470);
      B = R * (narrow ? 0.46 : 0.36);
      drawRing(); place();
    }

    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const smooth = (x) => x * x * (3 - 2 * x);
    let offset = Math.PI / 2, active = -1;

    function place() {
      if (!W) return;
      nodes.forEach((el, i) => {
        const th = i * STEP + offset;
        const lx = R * Math.cos(th), ly = B * Math.sin(th);
        const x = lx * Math.cos(TILT) - ly * Math.sin(TILT);
        const y = lx * Math.sin(TILT) + ly * Math.cos(TILT);
        const depth = (ly / B + 1) / 2;
        const d = Math.abs(wrap(th - Math.PI / 2));
        const e = smooth(1 - Math.min(1, d / (STEP * 0.8)));
        const scale = (0.66 + 0.34 * depth) * (1 + 0.32 * e);
        el.style.transform = `translate(${W / 2 + x}px, ${H / 2 + y}px) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = ((0.3 + 0.5 * depth) + (1 - (0.3 + 0.5 * depth)) * e).toFixed(3);
        el.style.zIndex = ly >= 0 ? 5 + Math.round(depth * 10) : 1;
        el.style.setProperty('--e', e.toFixed(3));
      });
      const near = ((Math.round((Math.PI / 2 - offset) / STEP) % N) + N) % N;
      if (near !== active) {
        active = near;
        if (nameEl) nameEl.textContent = TECHS[near].name;
        if (catEl) catEl.textContent = TECHS[near].category;
      }
    }

    const FULL = -STEP / SECONDS_PER_ITEM;
    let speed = reduce ? 0 : FULL, hovering = false, goal = null, last = performance.now();
    function frame(now) {
      if (!stage.isConnected) return; // page changed (preview router)
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible) {
        if (goal !== null) {
          const diff = goal - offset;
          offset += diff * (1 - Math.exp(-dt * 7));
          if (Math.abs(diff) < 0.002) { offset = goal; goal = null; }
        } else {
          const wanted = hovering || reduce ? 0 : FULL;
          speed += (wanted - speed) * (1 - Math.exp(-dt * 5));
          offset += speed * dt;
        }
        place();
      }
      requestAnimationFrame(frame);
    }
    function goTo(i) {
      let target = Math.PI / 2 - i * STEP;
      target += Math.round((offset - target) / TWO_PI) * TWO_PI;
      goal = target;
    }
    // scrolling the page nudges the orbit around
    let lastY = scrollY;
    addEventListener('scroll', () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (visible && !reduce && goal === null) offset -= dy * 0.0035;
    }, { passive: true });
    stage.addEventListener('mouseenter', () => (hovering = true));
    stage.addEventListener('mouseleave', () => (hovering = false));
    if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(stage);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(stage); else addEventListener('resize', measure);
    measure(); requestAnimationFrame(frame);
  };
})();

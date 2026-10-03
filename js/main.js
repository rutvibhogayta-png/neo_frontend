/* NeoFolks site script. Each page registers an initialiser in NF.pages; NF.mount() runs the right one. */
(function () {
  const NF = (window.NF = window.NF || { pages: {} });
  const D = () => window.NEOFOLKS_DATA;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  NF.params = () => new URLSearchParams(NF.preview ? (location.hash.split('?')[1] || '') : location.search);
  NF.page = () => document.body.dataset.page;

  const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const toDate = (iso) => new Date(iso + 'T00:00:00');
  const daysTo = (d) => Math.round((d - startOfToday()) / 864e5);
  const countText = (d) => {
    const n = daysTo(d);
    return n === 0 ? 'Happening today' : n === 1 ? 'Tomorrow' : n > 1 ? n + ' days to go' : '';
  };
  const pad = (n) => String(n).padStart(2, '0');

  /* ---- fit text: scales a single line so it spans its container exactly ---- */
  NF.fit = function () {
    document.querySelectorAll('[data-fit]').forEach((el) => {
      const box = el.parentElement;
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      const cw = box.clientWidth;
      const narrow = innerWidth < 700;
      const cap = el.closest('.foot-word') ? (narrow ? 0.5 : 0.36) : (narrow ? 0.68 : 0.4);
      if (w && cw) el.style.fontSize = Math.floor((100 * cw * cap / w) * 10) / 10 + 'px';
      el.classList.add('is-fit');
    });
  };

  /* ---- shell: header, mobile menu (runs once) ---- */
  let shellDone = false;
  NF.shell = function () {
    if (shellDone) return; shellDone = true;
    const btn = document.querySelector('.menu-btn');
    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Close' : 'Menu'; }
    };
    btn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    document.querySelector('.main-nav')?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('resize', NF.fit, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(NF.fit);
  };

  NF.mount = function () {
    const page = NF.page();
    document.querySelectorAll('.main-nav a[data-nav]').forEach((a) => {
      if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    NF.fit();
    (NF.pages[page] || function () {})();
    if (NF.scroll) NF.scroll();
  };

  /* ---------- HOME ---------- */
  NF.pages.home = function () {
    NF.orbit && NF.orbit();

    // next event
    const ev = D().events.map((e) => ({ ...e, d: toDate(e.iso) }));
    const up = ev.filter((e) => e.d >= startOfToday()).sort((a, b) => a.d - b.d)[0];
    const next = up || ev.sort((a, b) => b.d - a.d)[0];
    const t = document.getElementById('nextTicket');
    if (t && next) {
      t.querySelector('[data-day]').textContent = pad(next.d.getDate());
      t.querySelector('[data-month]').textContent = MONTHS_LONG[next.d.getMonth()] + ' ' + next.d.getFullYear();
      t.querySelector('[data-count]').textContent = up ? countText(next.d) : 'Past event';
      t.querySelector('[data-kicker]').textContent = up ? 'Next up' : 'Latest event';
      t.querySelector('[data-title]').textContent = next.title;
      t.querySelector('[data-cat]').textContent = D().catLabels[next.cat];
      t.querySelector('[data-detail]').textContent = next.detail;
    }

    // hero strip: the next event, so the top of the page carries live information
    const hn = document.getElementById('heroNext');
    if (hn && next) {
      const f = (k) => hn.querySelector('[data-hn="' + k + '"]');
      f('kicker').textContent = up ? 'Next up' : 'Latest event';
      f('title').textContent = next.title;
      f('date').textContent = next.d.getDate() + ' ' + MONTHS_LONG[next.d.getMonth()] + ' ' + next.d.getFullYear();
      const c = up ? countText(next.d) : '';
      f('count').textContent = c; f('count').hidden = !c;
      hn.hidden = false;
    }

    NF.reviews && NF.reviews();

    // community word list shows how many events each holds
    document.querySelectorAll('[data-count-cat]').forEach((el) => {
      const n = D().events.filter((e) => e.cat === el.dataset.countCat).length;
      el.textContent = n === 0 ? 'Soon' : n + (n === 1 ? ' event' : ' events');
    });

    // stats count up once, when they scroll into view
    const stats = document.querySelectorAll('[data-stat]');
    const run = (el) => {
      const end = +el.dataset.stat, suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = end + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e) + (p === 1 ? suf : '');
        if (p < 1 && el.isConnected) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }), { threshold: 0.6 });
      stats.forEach((s) => { s.textContent = '0'; io.observe(s); });
    } else stats.forEach(run);
  };


  /* ---------- REVIEWS (home): a slow wall of cards, plus a form to add yours ----------
     No backend yet: a new review is saved on the visitor's device (localStorage) and shown on the wall.
     To collect reviews for everyone, send `r` to your API inside the submit handler (marked below) and load them into D().reviews. */
  const RW_KEY = 'neofolks-reviews';
  const rwLoad = () => { try { const a = JSON.parse(localStorage.getItem(RW_KEY) || '[]'); return Array.isArray(a) ? a.filter((r) => r && r.name && r.text) : []; } catch (e) { return []; } };
  const rwSave = (list) => { try { localStorage.setItem(RW_KEY, JSON.stringify(list.slice(0, 20))); } catch (e) {} };
  const initialsOf = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  NF.reviews = function () {
    const wall = document.getElementById('rwWall');
    if (!wall) return;
    const $ = (id) => document.getElementById(id);
    const toggle = $('rwToggle'), wrap = $('rwFormWrap'), form = $('rwForm'), done = $('rwDone'), count = $('rwCount');
    let mine = rwLoad(), fresh = null, cols = 0;

    const card = (r) => {
      const a = document.createElement('article'); a.className = 'rw-card' + (r === fresh ? ' is-new' : '');
      const q = document.createElement('p'); q.className = 'rw-quote'; q.textContent = '"' + r.text + '"';
      const by = document.createElement('div'); by.className = 'rw-by';
      const av = document.createElement('span'); av.className = 'rw-av'; av.setAttribute('aria-hidden', 'true'); av.textContent = initialsOf(r.name);
      const who = document.createElement('div');
      const nm = document.createElement('p'); nm.className = 'rw-name'; nm.textContent = r.name;
      const rl = document.createElement('p'); rl.className = 'rw-role'; rl.textContent = r.year + ', ' + r.course;
      who.append(nm, rl); by.append(av, who); a.append(q, by); return a;
    };

    function build() {
      const n = innerWidth >= 960 ? 3 : innerWidth >= 640 ? 2 : 1;
      cols = n; wall.style.setProperty('--cols', n); wall.textContent = '';
      const list = mine.concat(D().reviews || []);
      const buckets = Array.from({ length: n }, () => []);
      list.forEach((r, i) => buckets[i % n].push(r));
      buckets.forEach((items, c) => {
        const col = document.createElement('div'); col.className = 'rw-col' + (c % 2 ? ' rev' : '');
        col.style.setProperty('--off', [0, 0.38, 0.7][c] || 0);
        const track = document.createElement('div'); track.className = 'rw-track';
        const set = document.createElement('div'); set.className = 'rw-set';
        items.forEach((r) => set.appendChild(card(r)));
        track.appendChild(set); col.appendChild(track); wall.appendChild(col);
      });
      if (reduce) return;
      // each column loops: repeat its cards until they overflow the wall, then clone the set for a seamless -50% scroll
      wall.querySelectorAll('.rw-col').forEach((col) => {
        const track = col.firstChild, set = track.firstChild, base = [...set.children];
        if (!base.length) return;
        for (let g = 0; set.offsetHeight < wall.clientHeight + 40 && g < 8; g++) {
          base.forEach((el) => { const c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); set.appendChild(c); });
        }
        const clone = set.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
        col.style.setProperty('--dur', Math.max(26, Math.round(set.offsetHeight / 24)) + 's');
      });
    }
    build();

    const onResize = () => { if (!wall.isConnected) { removeEventListener('resize', onResize); return; } const n = innerWidth >= 960 ? 3 : innerWidth >= 640 ? 2 : 1; if (n !== cols) build(); };
    addEventListener('resize', onResize, { passive: true });

    const setOpen = (open) => {
      wrap.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Add your review';
      if (open) { form.hidden = false; done.hidden = true; form.elements.name.focus({ preventScroll: true }); }
    };
    toggle.addEventListener('click', () => setOpen(wrap.hidden));
    $('rwCancel').addEventListener('click', () => { setOpen(false); toggle.focus(); });
    $('rwAgain').addEventListener('click', () => { form.reset(); count.textContent = '0 / 220'; form.hidden = false; done.hidden = true; form.elements.name.focus(); });
    form.elements.text.addEventListener('input', (e) => { count.textContent = e.target.value.length + ' / 220'; });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = Object.fromEntries(new FormData(form));
      const r = { name: d.name.trim(), course: d.course.trim(), year: d.year, text: d.text.trim().replace(/\s+/g, ' ') };
      /* Backend hook: fetch('/api/reviews', { method: 'POST', body: JSON.stringify(r) }) */
      fresh = r; mine.unshift(r); rwSave(mine); build();
      form.reset(); count.textContent = '0 / 220';
      done.querySelector('[data-name]').textContent = r.name.split(' ')[0];
      form.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
      wall.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
  };

  /* ---------- ABOUT ---------- */
  NF.pages.about = function () {
    const panels = [...document.querySelectorAll('.v-panel')];
    panels.forEach((p) => p.addEventListener('click', () => {
      panels.forEach((q) => q.setAttribute('aria-expanded', String(q === p)));
    }));
  };

  /* ---------- TEAM ---------- */
  NF.pages.team = function () {
    const root = document.getElementById('roster');
    if (!root) return;
    root.innerHTML = D().team.map((m) => {
      const fig = m.photo
        ? `<img class="m-photo" src="${m.photo}" alt="${m.name}">`
        : `<span class="m-mono" aria-hidden="true">${m.initials}</span>`;
      const apply = m.open ? `<a class="link m-apply" href="join.html?role=event-operations">Apply</a>` : '';
      return `<article class="m-card tone-${m.tone}${m.open ? ' is-open' : ''}">
        <div class="m-fig">${fig}</div>
        <h3 class="m-name">${m.name}</h3>
        <p class="m-role">${m.role}</p>${apply}</article>`;
    }).join('');
  };


  /* ---------- EVENTS timeline: a winding path, one event in focus at a time ---------- */
  const TL = { root: null, items: [], cum: [], ys: [], total: 0, H: 0 };
  const SVGNS = 'http://www.w3.org/2000/svg';
  function tlMid() {
    const hh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 60;
    const fb = document.getElementById('filterBar'), fh = fb ? fb.offsetHeight : 0;
    return hh + fh + (innerHeight - hh - fh) / 2;
  }
  function tlLayout() {
    const root = TL.root; if (!root || !root.isConnected) return;
    const svg = root.querySelector('.tl-svg'), base = svg.querySelector('.tl-base'), prog = svg.querySelector('.tl-prog');
    const rb = root.getBoundingClientRect(), W = root.offsetWidth, H = root.offsetHeight;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const pts = [...root.querySelectorAll('.tl-node')].map((n) => { const r = n.getBoundingClientRect(); return { x: r.left - rb.left + r.width / 2, y: r.top - rb.top + r.height / 2 }; });
    if (!pts.length) return;
    let d = 'M ' + pts[0].x + ' 0 L ' + pts[0].x + ' ' + pts[0].y;
    const ds = [d];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], k = (b.y - a.y) * 0.55;
      d += ' C ' + a.x + ' ' + (a.y + k) + ' ' + b.x + ' ' + (b.y - k) + ' ' + b.x + ' ' + b.y; ds.push(d);
    }
    const end = d + ' L ' + pts[pts.length - 1].x + ' ' + H;
    base.setAttribute('d', end); prog.setAttribute('d', end);
    const tmp = document.createElementNS(SVGNS, 'path'); svg.appendChild(tmp);
    TL.cum = ds.map((x) => { tmp.setAttribute('d', x); return tmp.getTotalLength(); });
    tmp.setAttribute('d', end); TL.total = tmp.getTotalLength(); tmp.remove();
    TL.ys = pts.map((p) => p.y); TL.H = H;
    prog.style.strokeDasharray = TL.total;
    tlTick(); root.classList.add('is-live');
  }
  function tlTick() {
    const root = TL.root; if (!root || !root.isConnected || !TL.ys.length) return;
    const rb = root.getBoundingClientRect(), mid = tlMid();
    let best = 0, bd = Infinity;
    TL.items.forEach((it, i) => { const r = it.getBoundingClientRect(), dist = Math.abs(r.top + r.height / 2 - mid); if (dist < bd) { bd = dist; best = i; } });
    TL.items.forEach((it, i) => it.classList.toggle('is-active', i === best));
    const cy = mid - rb.top, ys = [0].concat(TL.ys, TL.H), ls = [0].concat(TL.cum, TL.total);
    let L = cy <= 0 ? 0 : cy >= TL.H ? TL.total : 0;
    if (cy > 0 && cy < TL.H) for (let k = 1; k < ys.length; k++) if (cy <= ys[k]) { L = ls[k - 1] + ((cy - ys[k - 1]) / ((ys[k] - ys[k - 1]) || 1)) * (ls[k] - ls[k - 1]); break; }
    root.querySelector('.tl-prog').style.strokeDashoffset = TL.total - L;
  }
  let tlBound = false, tlA = false, tlB = false;
  NF.timeline = function (root) {
    TL.root = root; TL.items = [...root.querySelectorAll('.tl-item')];
    if (!tlBound) {
      tlBound = true;
      addEventListener('scroll', () => { if (tlA) return; tlA = true; requestAnimationFrame(() => { tlA = false; tlTick(); }); }, { passive: true });
      addEventListener('resize', () => { if (tlB) return; tlB = true; requestAnimationFrame(() => { tlB = false; tlLayout(); }); }, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(tlLayout);
    }
    // choose an event: bring it to the middle of the screen
    root.addEventListener('click', (e) => {
      const it = e.target.closest('.tl-item'); if (!it || e.target.closest('a') || it.classList.contains('is-active')) return;
      const r = it.getBoundingClientRect();
      scrollBy({ top: r.top + r.height / 2 - tlMid(), behavior: reduce ? 'auto' : 'smooth' });
    });
    tlLayout(); requestAnimationFrame(tlLayout);
  };

  /* ---------- EVENTS ---------- */
  NF.pages.events = function () {
    const app = document.getElementById('eventsApp');
    if (!app) return;
    const labels = D().catLabels;
    const today = startOfToday();
    const all = D().events.map((e) => ({ ...e, d: toDate(e.iso) }));
    const upcoming = all.filter((e) => e.d >= today).sort((a, b) => a.d - b.d);
    const past = all.filter((e) => e.d < today).sort((a, b) => b.d - a.d);
    const cats = ['all', 'workshops', 'seminars', 'competitions', 'community'];
    let filter = NF.params().get('filter');
    if (!cats.includes(filter)) filter = 'all';
    const count = (c) => all.filter((e) => c === 'all' || e.cat === c).length;
    const bar = document.getElementById('filterBar');
    const out = document.getElementById('eventsOut');

    const longDate = (d) => d.getDate() + ' ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getFullYear();
    const tlItem = (e, i, isUp) => `<li class="tl-item ${i % 2 ? 'is-r' : 'is-l'}">
      <span class="tl-node" aria-hidden="true"></span>
      <article class="tl-card">
        <div class="tl-top"><span class="tl-pill${isUp ? ' is-up' : ''}">${isUp ? 'Upcoming' : 'Past'}</span><span class="tl-cat">${labels[e.cat]}</span></div>
        <h3>${e.title}</h3><p class="tl-date">${longDate(e.d)}</p><p class="tl-detail">${e.detail}</p>
        ${isUp ? `<div class="tl-foot"><span class="tl-count">${countText(e.d)}</span><a class="link" href="join.html">Join NeoFolks</a></div>` : ''}
      </article></li>`;

    function render() {
      bar.innerHTML = cats.map((c) => `<button type="button" class="f-btn" aria-pressed="${c === filter}" data-f="${c}">${c === 'all' ? 'All' : labels[c]}<sup>${count(c)}</sup></button>`).join('');
      const u = upcoming.filter((e) => filter === 'all' || e.cat === filter);
      const p = past.filter((e) => filter === 'all' || e.cat === filter);
      const list = u.map((e) => [e, true]).concat(p.map((e) => [e, false]));
      if (!list.length) {
        out.innerHTML = `<div class="ev-empty"><h2>Nothing listed under ${labels[filter]} yet.</h2><p>Have an idea for one? Tell us and we will help you run it.</p><a class="btn" href="contact.html">Suggest an event</a></div>`;
        TL.root = null; return;
      }
      out.innerHTML = `<section class="ev-block tl-wrap" id="upcoming" aria-label="Event lineup"><svg class="tl-svg" aria-hidden="true" focusable="false"><path class="tl-base"/><path class="tl-prog"/></svg><ol class="tl">${list.map(([e, isUp], i) => tlItem(e, i, isUp)).join('')}</ol></section>`;
      NF.timeline(out.querySelector('.tl-wrap'));
    }
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      filter = b.dataset.f; render();
    });
    render();
  };

  /* ---------- CONTACT ---------- */
  NF.pages.contact = function () {
    const btn = document.getElementById('copyEmail');
    if (!btn) return;
    const email = btn.dataset.email;
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(email); }
      catch (e) { const t = document.createElement('textarea'); t.value = email; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); }
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = 'Copy email'; }, 2000);
    });
  };

  /* ---------- JOIN ---------- */
  NF.pages.join = function () {
    const form = document.getElementById('joinForm');
    if (!form) return;
    const done = document.getElementById('joinDone');
    const role = NF.params().get('role');
    if (role === 'event-operations') {
      const note = document.getElementById('roleNote');
      if (note) { note.hidden = false; }
      const sel = form.elements.interest; if (sel) sel.value = 'Other';
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = Object.fromEntries(new FormData(form));
      const lines = [
        'Name: ' + d.name, 'Email: ' + d.email, 'Course / Branch: ' + d.course,
        'Year: ' + d.year, 'Interested in: ' + d.interest,
        role === 'event-operations' ? 'Applying for: Event Operations Lead' : ''
      ].filter(Boolean).join('\n');
      const href = 'mailto:neofolks@nuvstudents.edu?subject=' + encodeURIComponent('Join NeoFolks: ' + d.name) + '&body=' + encodeURIComponent(lines);
      /* No backend yet: the form opens a ready-to-send email. Replace with a fetch() to your API later. */
      done.querySelector('[data-name]').textContent = d.name.split(' ')[0];
      done.querySelector('[data-mail]').setAttribute('href', href);
      form.hidden = true; done.hidden = false; done.focus();
      location.href = href;
    });
    done.querySelector('[data-back]')?.addEventListener('click', () => { done.hidden = true; form.hidden = false; form.elements.name.focus(); });
  };


  /* ---- scroll features: progress bar, back-to-top, reveal, word scrub, hero parallax ---- */
  let scrollBound = false, bar, topBtn, scrubs = [], revealIO;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  NF.scroll = function () {
    if (!scrollBound) {
      scrollBound = true;
      bar = document.createElement('div'); bar.className = 'scroll-bar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
      topBtn = document.createElement('button'); topBtn.type = 'button'; topBtn.className = 'to-top'; topBtn.textContent = 'Top'; topBtn.setAttribute('aria-label', 'Back to top');
      topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
      document.body.appendChild(topBtn);
      let ticking = false;
      const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; NF.scrollTick(); }); };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll, { passive: true });
    }
    // reveal on scroll
    if (revealIO) revealIO.disconnect();
    if (!reduce && 'IntersectionObserver' in window) {
      revealIO = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      const groups = [
        ['.intro > *, .community > *, .orbit-head, .next .ticket, .stat, .cta h2, .cta-row', 'rv'],
        ['.a-hero .a-lede, .do-item, .a-do-title, .vals h2, .vals-row, .lanes-head, .a-cta > *', 'rv'],
        ['.t-hero > *, .t-bottom > *', 'rv'],
        ['.m-card', 'rv-fade'],
        ['.e-hero p, .up, .ev-row, .e-cta > *', 'rv'],
        ['.c-row, .c-cta > *', 'rv'],
        ['.j-side > p, .j-words', 'rv']
      ];
      groups.forEach(([sel, cls]) => document.querySelectorAll(sel).forEach((el, i) => {
        if (el.classList.contains('rv') || el.classList.contains('rv-fade')) return;
        el.classList.add(cls); el.style.setProperty('--d', Math.min(i % 4, 3) * 0.07 + 's'); revealIO.observe(el);
      }));
    }
    // word scrub: words light up as the paragraph scrolls into view
    scrubs = [];
    if (!reduce) document.querySelectorAll('.a-lede, .intro-side > p:first-child').forEach((el) => {
      if (el.dataset.scrub) return; el.dataset.scrub = '1';
      const words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', words.join(' '));
      el.innerHTML = words.map((w) => '<span class="sw" aria-hidden="true">' + w + '</span>').join(' ');
      scrubs.push(el);
    });
    document.querySelectorAll('.a-lede, .intro-side > p:first-child').forEach((el) => { if (!scrubs.includes(el) && el.dataset.scrub) scrubs.push(el); });
    NF.scrollTick();
  };
  NF.scrollTick = function () {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? clamp01(y / h) : 0).toFixed(4) + ')';
    if (topBtn) topBtn.classList.toggle('show', y > innerHeight * 0.9);
    const logo = document.querySelector('.hero-logo');
    if (logo && !reduce) logo.style.setProperty('--py', Math.min(y, 900) * 0.18 + 'px');
    scrubs.forEach((el) => {
      const r = el.getBoundingClientRect(), words = el.querySelectorAll('.sw');
      const p = clamp01((innerHeight * 0.92 - r.top) / (innerHeight * 0.45 + r.height * 0.6));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  };

  /* ---- boot (multi-page build). The preview file boots itself. ---- */
  if (!window.NF_PREVIEW) {
    const boot = () => { NF.preview = false; NF.shell(); NF.mount(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  }
})();

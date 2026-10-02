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

    const upCard = (e) => `<article class="up">
      <div class="up-date"><b>${pad(e.d.getDate())}</b><span>${MONTHS[e.d.getMonth()]} ${e.d.getFullYear()}</span></div>
      <div class="up-body"><p class="tag">${labels[e.cat]}</p><h3>${e.title}</h3><p>${e.detail}</p>
      <p class="up-count">${countText(e.d)}</p><a class="btn" href="join.html">Join NeoFolks</a></div></article>`;
    const row = (e) => `<li class="ev-row">
      <div class="ev-date"><b>${pad(e.d.getDate())}</b><span>${MONTHS[e.d.getMonth()]} ${e.d.getFullYear()}</span></div>
      <h3 class="ev-title">${e.title}</h3><p class="ev-cat">${labels[e.cat]}</p><p class="ev-detail">${e.detail}</p></li>`;

    function render() {
      bar.innerHTML = cats.map((c) => `<button type="button" class="f-btn" aria-pressed="${c === filter}" data-f="${c}">${c === 'all' ? 'All' : labels[c]}<sup>${count(c)}</sup></button>`).join('');
      const u = upcoming.filter((e) => filter === 'all' || e.cat === filter);
      const p = past.filter((e) => filter === 'all' || e.cat === filter);
      let html = '';
      if (u.length) html += `<section class="ev-block" id="upcoming"><h2 class="ev-h">Upcoming</h2>${u.map(upCard).join('')}</section>`;
      if (p.length) html += `<section class="ev-block"><h2 class="ev-h">Past</h2><ul class="ev-list">${p.map(row).join('')}</ul></section>`;
      if (!u.length && !p.length) html = `<div class="ev-empty"><h2>Nothing listed under ${labels[filter]} yet.</h2><p>Have an idea for one? Tell us and we will help you run it.</p><a class="btn" href="contact.html">Suggest an event</a></div>`;
      out.innerHTML = html;
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

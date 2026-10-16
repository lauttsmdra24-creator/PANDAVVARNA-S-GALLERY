/* PANDAVVARNA GALLERY — flipbook fullscreen (versi smooth) */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const book = document.getElementById('book');
  const pages = [...book.querySelectorAll('.page')];
  const N = pages.length;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KMUL = REDUCED ? 4 : 1;

  /* ---------- layout fullscreen ---------- */
  const RATIO = { wide: 1.62, tall: 0.5 };
  const GRID = { wide: [10, 5], tall: [5, 10] };
  const GAP = 0.3;

  function insets() {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(d);
    const cs = getComputedStyle(d);
    const r = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
    d.remove();
    return r;
  }

  function layout() {
    const W0 = stage.clientWidth;
    const H0 = stage.clientHeight;
    const ins = insets();
    const m = Math.max(16, Math.min(W0, H0) * 0.075);
    const pt = Math.max(m, ins.t + 10), pr = Math.max(m, ins.r + 10);
    const pb = Math.max(m, ins.b + 10), pl = Math.max(m, ins.l + 10);
    const areaW = W0 - pl - pr;
    const areaH = H0 - pt - pb;
    const W = Math.floor(Math.min(areaW, areaH * 2.1));
    const H = Math.floor(areaH);
    const bx = pl + (areaW - W) / 2;
    const by = pt;

    let best = null;
    for (const mode of ['wide', 'tall']) {
      const ph = Math.min(H, W / RATIO[mode]);
      const u = ph / 100;
      const [cols, rows] = GRID[mode];
      const aw = W - 4 * u;
      const ah = H - 11 * u;
      const cell = Math.floor(Math.min(aw / (cols + (cols - 1) * GAP), ah / (rows + (rows - 1) * GAP)));
      if (!best || cell > best.cell) best = { m: mode, ph, cols, cell };
    }
    const set = (k, v) => book.style.setProperty(k, v);
    set('--pw', W + 'px');
    set('--ph', best.ph.toFixed(1) + 'px');
    set('--cols', best.cols);
    set('--cell', best.cell + 'px');
    set('--gapPx', (best.cell * GAP).toFixed(1) + 'px');
    set('--safe-t', '0px'); set('--safe-r', '0px'); set('--safe-b', '0px'); set('--safe-l', '0px');
    book.classList.toggle('wide', best.m === 'wide');
    book.classList.toggle('tall', best.m === 'tall');

    const sset = (k, v) => stage.style.setProperty(k, v);
    sset('--bx', bx.toFixed(1) + 'px');
    sset('--by', by.toFixed(1) + 'px');
    sset('--bw', W + 'px');
    sset('--bh', H + 'px');
    sset('--bpx', Math.max(3, best.ph * 0.0055).toFixed(1) + 'px');
  }
  let layoutT = 0;
  const relayout = () => { cancelAnimationFrame(layoutT); layoutT = requestAnimationFrame(layout); };
  addEventListener('resize', relayout);
  if (window.visualViewport) visualViewport.addEventListener('resize', relayout);
  addEventListener('orientationchange', () => setTimeout(layout, 120));

  /* ---------- latar langit + awan pixel yang bergerak ---------- */
  function buildSky() {
    const sky = document.createElement('div');
    sky.className = 'sky';
    sky.setAttribute('aria-hidden', 'true');

    const src = pages[0].querySelector('.cloud-l') || document.querySelector('.cloud-l');
    if (src) {
      const c = src.cloneNode(true);
      c.setAttribute('class', 'cloud-svg');
      const svgHTML = c.outerHTML;
      const rnd = (a, b) => a + Math.random() * (b - a);
      const LAYERS = [
        { n: 5, w: [13, 19], top: [3, 48],  dur: [170, 230], o: 0.55 },
        { n: 5, w: [20, 29], top: [14, 72], dur: [110, 150], o: 0.82 },
        { n: 4, w: [30, 42], top: [48, 92], dur: [65, 95],   o: 1 },
      ];
      LAYERS.forEach((L, li) => {
        for (let i = 0; i < L.n; i++) {
          const dur = rnd(L.dur[0], L.dur[1]);
          const el = document.createElement('div');
          el.className = 'sc sc-' + li;
          el.style.setProperty('--w', rnd(L.w[0], L.w[1]).toFixed(1) + 'vw');
          el.style.setProperty('--top', rnd(L.top[0], L.top[1]).toFixed(1) + '%');
          el.style.setProperty('--dur', dur.toFixed(0) + 's');
          el.style.setProperty('--dl', (-rnd(0, dur)).toFixed(1) + 's');
          el.style.setProperty('--x0', rnd(-10, 95).toFixed(0) + 'vw');
          el.style.setProperty('--o', L.o);
          el.style.setProperty('--flip', Math.random() < 0.5 ? -1 : 1);
          el.style.setProperty('--bob', rnd(5, 9).toFixed(1) + 's');
          el.innerHTML = svgHTML;
          sky.appendChild(el);
        }
      });
    }
    document.body.insertBefore(sky, document.body.firstChild);

    const deco = document.createElement('div');
    deco.className = 'book-deco';
    deco.setAttribute('aria-hidden', 'true');
    stage.insertBefore(deco, book);
  }
  buildSky();

  /* ---------- dekorasi: hati melayang, dots, indeks entrance ---------- */
  function addFloaters(pg, n) {
    const face = pg.querySelector('.front');
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      el.className = 'fl';
      el.setAttribute('aria-hidden', 'true');
      el.style.setProperty('--x', (4 + Math.random() * 92).toFixed(1) + '%');
      el.style.setProperty('--s', (2 + Math.random() * 2.4).toFixed(2));
      el.style.setProperty('--dur', (7 + Math.random() * 6).toFixed(1) + 's');
      el.style.setProperty('--dl', (-Math.random() * 12).toFixed(1) + 's');
      face.appendChild(el);
    }
  }
  pages.forEach((pg) => {
    if (pg.classList.contains('page-cover') || pg.classList.contains('page-credit')) addFloaters(pg, 9);
  });

  book.querySelectorAll('.page-gallery').forEach((pg) => {
    pg.querySelectorAll('.frame').forEach((f, i) => f.style.setProperty('--i', i));
  });

  const dotsHTML = pages.map((_, i) => `<button class="dot" data-go="${i}" aria-label="Halaman ${i + 1}"></button>`).join('');
  book.querySelectorAll('.g-head').forEach((h) => {
    const d = document.createElement('div');
    d.className = 'dots' + (N > 8 ? ' many' : '');
    d.innerHTML = dotsHTML;
    h.insertBefore(d, h.lastElementChild);
  });
  const dots = [...book.querySelectorAll('.dot')];
  function markCur() {
    dots.forEach((d, k) => d.classList.toggle('on', k % N === cur));
    pages.forEach((pg, i) => pg.classList.toggle('live', Math.abs(i - cur) <= 1));
  }

  function reveal(i) {
    const pg = pages[i];
    if (!pg || REDUCED) return;
    pg.classList.remove('enter');
    void pg.offsetWidth;
    pg.classList.add('enter');
  }

  /* ---------- lapisan bayangan ---------- */
  const fx = pages.map((pg) => {
    pg.querySelector('.front').insertAdjacentHTML('beforeend', '<div class="shade shade-f"></div><div class="under"></div>');
    pg.querySelector('.back').insertAdjacentHTML('beforeend', '<div class="shade shade-b"></div>');
    return {
      f: pg.querySelector('.shade-f'),
      b: pg.querySelector('.shade-b'),
      u: pg.querySelector('.under'),
    };
  });

  /* ---------- mesin animasi pegas ---------- */
  const S = pages.map(() => ({ p: 0, v: 0, t: 0, k: 60 * KMUL, hold: false, tilt: 0, tiltT: 0, awake: false, vis: '' }));
  let cur = 0;
  let pending = 0;
  let drag = null;
  let raf = 0;
  let lastT = 0;
  const SUB = 1 / 120;

  const normalZ = (i) => (i < cur ? i + 1 : 100 + (N - i));

  function render(i) {
    const s = S[i];
    const pg = pages[i];
    const p = s.p;
    const moving = p > 0.0005 && p < 0.9995;
    const sinp = Math.sin(Math.PI * p);
    pg.style.transform = p <= 0.0005 ? 'none'
      : `translateZ(${(sinp * 26).toFixed(2)}px) rotateY(${(-180 * p).toFixed(3)}deg) rotateX(${(s.tilt * sinp).toFixed(3)}deg)`;
    pg.style.zIndex = moving ? 200 : normalZ(i);
    fx[i].f.style.opacity = p < 0.5 ? (sinp * 0.7).toFixed(3) : 0;
    fx[i].b.style.opacity = p >= 0.5 ? (sinp * 0.6).toFixed(3) : 0;
    if (fx[i + 1]) fx[i + 1].u.style.opacity = moving ? Math.max(sinp * 0.85, (1 - p) * 0.3).toFixed(3) : 0;
  }

  function updateVis() {
    let fu = N;
    for (let i = 0; i < N; i++) if (S[i].p < 0.9995) { fu = i; break; }
    for (let i = 0; i < N; i++) {
      const p = S[i].p;
      const moving = p > 0.0005 && p < 0.9995;
      const v = (p < 0.9995 && (moving || i <= fu + 1)) ? 'visible' : 'hidden';
      if (S[i].vis !== v) { S[i].vis = v; pages[i].style.visibility = v; }
    }
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
    lastT = now;
    const steps = Math.max(1, Math.ceil(dt / SUB));
    const h = dt / steps;
    let active = false;

    for (let i = 0; i < N; i++) {
      const s = S[i];
      if (!s.awake) continue;
      const c = 2 * Math.sqrt(s.k);
      for (let n = 0; n < steps; n++) {
        s.v += (s.k * (s.t - s.p) - c * s.v) * h;
        s.p += s.v * h;
        if (s.p < 0) { s.p = 0; if (s.v < 0) s.v = 0; }
        else if (s.p > 1) { s.p = 1; if (s.v > 0) s.v = 0; }
      }
      s.tilt += (s.tiltT - s.tilt) * (1 - Math.exp(-dt * 9));
      const settled = Math.abs(s.t - s.p) < 0.0005 && Math.abs(s.v) < 0.01 && Math.abs(s.tiltT - s.tilt) < 0.01;
      if (settled && !s.hold) { s.p = s.t; s.v = 0; s.tilt = s.tiltT; s.awake = false; }
      else active = true;
      render(i);
    }
    updateVis();
    if (active || pending > 0) { raf = requestAnimationFrame(tick); return; }
    raf = 0;
  }
  function kick() {
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
  }

  /* ---------- pindah halaman (tombol, keyboard, wheel) ---------- */
  /* ---------- pindah antar album (file HTML lain) saat swipe melewati tepi buku ---------- */
  let leaving = false;
  function crossAlbum(dir) {
    const url = dir > 0 ? book.dataset.next : book.dataset.prev;
    if (!url || leaving) return;
    leaving = true;
    stage.style.transition = 'opacity .22s ease, transform .22s ease';
    stage.style.opacity = '0';
    stage.style.transform = `translateX(${dir > 0 ? -4 : 4}%)`;
    setTimeout(() => { location.href = url; }, REDUCED ? 0 : 230);
  }
  // kembali lewat tombol "back" browser: pulihkan tampilan
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    stage.style.opacity = '';
    stage.style.transform = '';
  });

  function goTo(target) {
    if (pending > 0 || drag) return;
    if (target < 0 || target >= N) { crossAlbum(target < 0 ? -1 : 1); return; }
    if (target === cur) return;
    const dir = target > cur ? 1 : -1;
    const list = [];
    if (dir > 0) for (let i = cur; i < target; i++) list.push(i);
    else for (let i = cur - 1; i >= target; i--) list.push(i);
    const multi = list.length > 1;
    cur = target;
    markCur();
    list.forEach((idx, n) => {
      pending++;
      setTimeout(() => {
        const s = S[idx];
        s.k = (multi ? 120 : 75) * KMUL;
        s.t = dir > 0 ? 1 : 0;
        s.tiltT = multi ? 0 : 5;
        s.awake = true;
        pending--;
        if (n === list.length - 1) reveal(target);
        kick();
      }, n * 90);
    });
    kick();
  }

  book.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) goTo(Number(b.dataset.go));
  });
  addEventListener('keydown', (e) => {
    if (!lb.hidden) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(cur + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(cur - 1);
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(N - 1);
  });
  let wheelLock = 0;
  addEventListener('wheel', (e) => {
    if (!lb.hidden || pending > 0 || drag) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = performance.now();
    if (Math.abs(d) < 30 || now < wheelLock) return;
    wheelLock = now + 650;
    goTo(cur + (d > 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- swipe / drag ---------- */
  let suppressClick = false;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  stage.addEventListener('pointerdown', (e) => {
    if (pending > 0 || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target.closest('button')) return;
    suppressClick = false;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, mode: null, dir: 0, idx: -1, fp: 0, lfp: 0, lt: performance.now(), vf: 0 };
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
  });

  function endListeners() {
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onUp);
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;

    if (!drag.mode) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.2) { drag = null; endListeners(); return; }
      const dir = dx < 0 ? 1 : -1;
      if ((dir > 0 && cur >= N - 1) || (dir < 0 && cur <= 0)) {
        suppressClick = true; drag = null; endListeners();
        crossAlbum(dir);
        return;
      }
      drag.mode = 'turn';
      drag.dir = dir;
      drag.idx = dir > 0 ? cur : cur - 1;
      const s = S[drag.idx];
      s.hold = true;
      s.k = 1200;
      s.awake = true;
      drag.x = e.clientX;
      drag.lt = performance.now();
      suppressClick = true;
      reveal(dir > 0 ? drag.idx + 1 : drag.idx);
      kick();
      return;
    }

    const W = book.clientWidth;
    const fp = clamp01(((drag.dir > 0 ? -1 : 1) * (e.clientX - drag.x)) / (W * 0.8));
    const now = performance.now();
    const dtm = now - drag.lt;
    if (dtm > 0) drag.vf = drag.vf * 0.6 + ((fp - drag.lfp) / (dtm / 1000)) * 0.4;
    drag.lfp = fp;
    drag.lt = now;
    drag.fp = fp;

    const s = S[drag.idx];
    s.t = drag.dir > 0 ? fp : 1 - fp;
    s.tiltT = (0.5 - e.clientY / stage.clientHeight) * 16;
    s.awake = true;
    kick();
  }

  function onUp(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    endListeners();
    const d = drag;
    drag = null;
    if (d.mode !== 'turn') return;

    if (performance.now() - d.lt > 90) d.vf = 0;
    const projected = d.fp + d.vf * 0.12;
    let commit;
    if (d.vf > 1.1 && d.fp > 0.03) commit = true;
    else if (d.vf < -1.1) commit = false;
    else commit = projected > 0.45;

    const s = S[d.idx];
    s.hold = false;
    s.k = (commit ? 85 : 70) * KMUL;
    s.t = commit ? (d.dir > 0 ? 1 : 0) : (d.dir > 0 ? 0 : 1);
    s.tiltT = 0;
    s.awake = true;
    if (commit) { cur += d.dir; markCur(); }
    kick();
  }

  stage.addEventListener('click', (e) => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; return; }
    const frame = e.target.closest('.frame.has-img');
    if (frame) {
      const r = frame.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 10);
      openLightbox(frame);
    }
  }, true);

  /* ---------- parallax halus di cover (mouse) ---------- */
  const cover = pages[0];
  let parRaf = 0;
  stage.addEventListener('pointermove', (e) => {
    if (drag || cur !== 0 || e.pointerType === 'touch' || REDUCED || parRaf) return;
    const nx = (e.clientX / stage.clientWidth - 0.5) * 2;
    const ny = (e.clientY / stage.clientHeight - 0.5) * 2;
    parRaf = requestAnimationFrame(() => {
      parRaf = 0;
      cover.style.setProperty('--mx', nx.toFixed(3));
      cover.style.setProperty('--my', ny.toFixed(3));
    });
  });

  /* ---------- penyimpanan kecil ---------- */
  const store = {
    get(k) {
      try { const v = JSON.parse(localStorage.getItem('pvg.' + k)); return Array.isArray(v) ? v : []; } catch (_) { return []; }
    },
    set(k, v) { try { localStorage.setItem('pvg.' + k, JSON.stringify(v)); } catch (_) {} },
  };
  const seen = new Set(store.get('seen').map(String));

  /* ---------- gambar 1-200: coba beberapa ekstensi ---------- */
  const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif'];
  const imgs = [...book.querySelectorAll('.frame img')];
  const TOTAL_N = Math.max(...imgs.map((im) => Number(im.dataset.n)));
  const frameOf = (img) => img.closest('.frame');
  let statRaf = 0;
  const scheduleStats = () => { if (!statRaf) statRaf = requestAnimationFrame(() => refreshStats()); };

  function syncBadges(img) {
    const f = frameOf(img);
    const n = img.dataset.n;
    f.classList.toggle('seen', seen.has(n));
  }
  function markLoaded(img) {
    img.classList.add('loaded');
    frameOf(img).classList.add('has-img');
    syncBadges(img);
    scheduleStats();
  }
  function tryNext(img) {
    const i = Number(img.dataset.try || 0);
    if (img._adv === i) return;
    img._adv = i;
    if (i + 1 < EXTS.length) {
      img.dataset.try = i + 1;
      img.src = `img/${img.dataset.n}.${EXTS[i + 1]}`;
    }
  }
  document.addEventListener('load', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.dataset.n) markLoaded(img);
  }, true);
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.dataset.n) tryNext(img);
  }, true);
  imgs.forEach((img) => {
    img.decoding = 'async';
    frameOf(img).style.setProperty('--rot', ((Math.random() * 2 - 1) * 1.8).toFixed(2) + 'deg');
    if (img.complete) img.naturalWidth > 0 ? markLoaded(img) : tryNext(img);
  });

  /* ---------- latar bergerak di belakang foto (halaman galeri) ---------- */
  function buildAlbumBg() {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const KINDS = ['heart', 'star', 'gold', 'bubble', 'heart'];
    book.querySelectorAll('.page-gallery .face.front').forEach((face) => {
      const bg = document.createElement('div');
      bg.className = 'bg-fx';
      bg.setAttribute('aria-hidden', 'true');
      let h = '<i class="bgf-check"></i><i class="bgf-blob b1"></i><i class="bgf-blob b2"></i><i class="bgf-blob b3"></i>';
      for (let i = 0; i < 18; i++) {
        const k = KINDS[(Math.random() * KINDS.length) | 0];
        h += `<i class="bgf bgf-${k}" style="--x:${rnd(2, 96).toFixed(1)}%;--s:${rnd(2.8, 5.6).toFixed(2)};` +
             `--dur:${rnd(9, 17).toFixed(1)}s;--dl:${(-rnd(0, 17)).toFixed(1)}s;--sw:${rnd(1.5, 4.5).toFixed(1)};` +
             `--rt:${rnd(-30, 30).toFixed(0)}deg"></i>`;
      }
      for (let i = 0; i < 14; i++) {
        h += `<i class="bgf-tw" style="--x:${rnd(2, 96).toFixed(1)}%;--y:${rnd(3, 97).toFixed(1)}%;` +
             `--s:${rnd(1.2, 2.6).toFixed(2)};--dl:${(-rnd(0, 3)).toFixed(1)}s"></i>`;
      }
      bg.innerHTML = h;
      face.insertBefore(bg, face.firstChild);
    });
  }
  buildAlbumBg();

  /* ---------- progress "foto yang sudah dilihat" ---------- */
  const meters = [...book.querySelectorAll('.page-gallery .face.front')].map((face) => {
    const m = document.createElement('div');
    m.className = 'meter';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<i></i>';
    face.appendChild(m);
    return m;
  });
  function stats() {
    let total = 0, s = 0;
    imgs.forEach((im) => {
      if (!im.classList.contains('loaded')) return;
      total++;
      if (seen.has(im.dataset.n)) s++;
    });
    return { total, seen: s };
  }
  function refreshStats() {
    statRaf = 0;
    const st = stats();
    const pct = st.total ? st.seen / st.total : 0;
    meters.forEach((m) => {
      m.style.setProperty('--p', pct.toFixed(4));
      m.classList.toggle('full', st.total > 0 && st.seen >= st.total);
    });
    lbSeen.textContent = `DILIHAT ${st.seen}/${st.total}`;
  }

  /* ---------- efek: percikan & toast ---------- */
  const fxLayer = document.createElement('div');
  fxLayer.className = 'fx-layer';
  fxLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fxLayer);
  const COLORS = ['#ff4f86', '#ffd23f', '#7be0ff', '#b28bff', '#ffffff', '#8be28b'];

  function burst(x, y, n, kind) {
    if (REDUCED || fxLayer.childElementCount > 260) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const a = Math.random() * Math.PI * 2;
      const d = 40 + Math.random() * 100;
      const heart = kind === 'heart';
      p.className = 'pt' + (heart ? ' heart' : '');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
      p.style.setProperty('--dy', (Math.sin(a) * d - 34).toFixed(0) + 'px');
      p.style.setProperty('--r', ((Math.random() * 2 - 1) * 360).toFixed(0) + 'deg');
      p.style.setProperty('--s', (heart ? 14 + Math.random() * 14 : 5 + Math.random() * 6).toFixed(0) + 'px');
      p.style.setProperty('--c', COLORS[(Math.random() * COLORS.length) | 0]);
      p.style.animationDelay = (Math.random() * 0.08).toFixed(2) + 's';
      p.addEventListener('animationend', () => p.remove());
      fxLayer.appendChild(p);
    }
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = '<i class="t-ico"></i><span></span>';
  document.body.appendChild(toast);
  let toastT = 0;
  function showToast(msg) {
    toast.querySelector('span').textContent = msg;
    toast.classList.remove('on');
    void toast.offsetWidth;
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('on'), 3000);
  }
  const MILESTONES = { 5: 'MULAI SERU! 5 FOTO', 25: '25 FOTO DILIHAT!', 50: '50 FOTO! KEREN', 100: '100 FOTO! HEBAT', 150: '150 FOTO! TINGGAL DIKIT' };

  function markSeen(img) {
    const n = img.dataset.n;
    if (seen.has(n)) return;
    seen.add(n);
    store.set('seen', [...seen]);
    syncBadges(img);
    refreshStats();
    const st = stats();
    if (st.total > 5 && st.seen === st.total) {
      showToast('SEMUA FOTO SUDAH DILIHAT!');
      burst(innerWidth / 2, innerHeight * 0.3, 48);
    } else if (MILESTONES[st.seen]) {
      showToast(MILESTONES[st.seen]);
      burst(innerWidth / 2, innerHeight * 0.2, 24);
    }
  }

  setInterval(() => {
    if (REDUCED || document.hidden || !lb.hidden || drag || pending > 0) return;
    const pg = pages[cur];
    if (!pg || !pg.classList.contains('page-gallery')) return;
    const list = pg.querySelectorAll('.frame.has-img:not(.shine)');
    if (!list.length) return;
    const f = list[(Math.random() * list.length) | 0];
    f.classList.add('shine');
    setTimeout(() => f.classList.remove('shine'), 950);
  }, 1300);

  /* ---------- lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbNo = document.getElementById('lb-no');
  const lbCard = lb.querySelector('.lb-card');
  const lbBar = lb.querySelector('.lb-bar');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  let lbList = [];
  let lbIdx = 0;
  let lbTimer = 0;

  const nav = document.createElement('div');
  nav.className = 'lb-nav';
  nav.append(lbPrev, lbNo, lbNext);
  const tools = document.createElement('div');
  tools.className = 'lb-tools';
  tools.innerHTML = '<button class="hud-btn" id="lb-rand" aria-label="Foto acak"><i class="ico ico-dice"></i></button>';
  lbBar.append(tools, nav);
  const lbRand = document.getElementById('lb-rand');

  const lbSeen = document.createElement('div');
  lbSeen.className = 'lb-stat';
  lb.appendChild(lbSeen);

  function openLightbox(frame) {
    lbList = imgs.filter((im) => im.classList.contains('loaded'));
    lbIdx = lbList.indexOf(frame.querySelector('img'));
    if (lbIdx < 0) return;
    clearTimeout(lbTimer);
    showLb(0);
    lb.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('show')));
  }
  function closeLb() {
    lb.classList.remove('show');
    clearTimeout(lbTimer);
    lbTimer = setTimeout(() => { lb.hidden = true; }, REDUCED ? 0 : 230);
  }
  function showLb(dir) {
    const im = lbList[lbIdx];
    lbImg.src = im.currentSrc || im.src;
    lbNo.textContent = `${im.dataset.n} / ${TOTAL_N}`;
    if (dir && !REDUCED) {
      lbCard.classList.remove('s-next', 's-prev');
      void lbCard.offsetWidth;
      lbCard.classList.add(dir > 0 ? 's-next' : 's-prev');
    }
    markSeen(im);
    [1, -1].forEach((d) => {
      const n = lbList[(lbIdx + d + lbList.length) % lbList.length];
      if (n) new Image().src = n.currentSrc || n.src;
    });
  }
  function stepLb(d) {
    if (!lbList.length) return;
    lbIdx = (lbIdx + d + lbList.length) % lbList.length;
    showLb(d);
  }

  function randomPhoto() {
    if (lbList.length < 2) return;
    const all = lbList.map((_, i) => i).filter((i) => i !== lbIdx);
    const fresh = all.filter((i) => !seen.has(lbList[i].dataset.n));
    const pool = fresh.length ? fresh : all;
    const k = pool[(Math.random() * pool.length) | 0];
    const dir = k > lbIdx ? 1 : -1;
    lbIdx = k;
    showLb(dir);
  }
  lbRand.addEventListener('click', randomPhoto);

  lbPrev.addEventListener('click', () => stepLb(-1));
  lbNext.addEventListener('click', () => stepLb(1));
  document.getElementById('lb-close').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') stepLb(1);
    else if (e.key === 'ArrowLeft') stepLb(-1);
    else if (e.key === 'r' || e.key === 'R') randomPhoto();
  });

  let ls = null;
  lbCard.addEventListener('pointerdown', (e) => {
    ls = { id: e.pointerId, x: e.clientX, dx: 0 };
    try { lbCard.setPointerCapture(e.pointerId); } catch (_) {}
    lbCard.classList.add('drag');
  });
  lbCard.addEventListener('pointermove', (e) => {
    if (!ls || e.pointerId !== ls.id) return;
    ls.dx = e.clientX - ls.x;
    lbCard.style.setProperty('--dx', ls.dx + 'px');
  });
  const endLs = (e) => {
    if (!ls || e.pointerId !== ls.id) return;
    const dx = ls.dx;
    ls = null;
    lbCard.classList.remove('drag');
    lbCard.style.setProperty('--dx', '0px');
    if (dx < -60) stepLb(1);
    else if (dx > 60) stepLb(-1);
  };
  lbCard.addEventListener('pointerup', endLs);
  lbCard.addEventListener('pointercancel', endLs);

  if (location.hash === '#end') {
    cur = N - 1;
    for (let i = 0; i < N - 1; i++) { S[i].p = 1; S[i].t = 1; }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
  }
  layout();
  pages.forEach((_, i) => render(i));
  updateVis();
  markCur();
  scheduleStats();
  // album tanpa cover: halaman pertama langsung tampil dengan animasi masuk
  if (pages[cur].classList.contains('page-gallery')) reveal(cur);
})();
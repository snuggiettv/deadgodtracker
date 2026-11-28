/* Overlay page for OBS / Meld browser sources.
   URL options: ?view=summary|bar|marks|remaining|next|timer|run|splits|items|colpage (comma-separate several to rotate) &cycle=15 &count=4 &timer=0 &scale=1.5 &bg=1 &tainted=0
   colpage: one collection page at a time in the in-game 20x6 layout, next page every &pageevery=12 seconds; &missing=1 shows only what's left.
   &watch=<key> follows an editor's signed read-only feed; &page=1 shows the views stacked as a viewer page.
   Progress comes from this browser's saved state, a read-only feed, or a #code=... snapshot. */
(function () {
  'use strict';
  const DG = window.DG;
  const p = new URLSearchParams(location.search);
  // view can list several views (view=summary,splits,run); the overlay then rotates through them every `cycle` seconds.
  const VIEWS = ['summary', 'bar', 'marks', 'remaining', 'next', 'timer', 'run', 'splits', 'items', 'colpage'];
  const page = p.get('page') === '1';
  const views = (p.get('view') || (page ? 'summary,run,splits,next,marks' : 'summary')).split(',').filter((v) => VIEWS.includes(v));
  if (!views.length) views.push('summary');
  const cycle = Math.min(600, Math.max(3, +p.get('cycle') || 15)) * 1000;
  let vi = 0, view = views[0];
  const showTainted = p.get('tainted') !== '0';
  document.documentElement.style.setProperty('--scale', +p.get('scale') || 1);
  if (p.get('bg') === '1' || page) document.body.classList.add('bg');
  if (page) { document.documentElement.classList.add('page'); document.body.classList.add('page'); document.title = 'Dead God progress'; }

  const codeMatch = /[#&]code=([\w-]+)/.exec(location.hash);
  const watchKey = !codeMatch && DG.sync && DG.sync.validWatch(p.get('watch')) ? p.get('watch') : null;
  let state, waiting = false;
  if (watchKey) { state = DG.emptyState(); waiting = true; } // never show (or overwrite) this browser's own progress
  else try { state = codeMatch ? DG.decode(codeMatch[1]) : DG.load(); } catch (_) { state = DG.load(); }

  const root = document.getElementById('root');
  const pct = (n, d) => DG.pct(n, d);
  const bar = (n, d) => `<div class="bar"><i style="width:${pct(n, d)}%"></i></div>`;

  function summary(st) {
    return `<div class="panel ${st.deadGod ? 'done' : ''}">
      <div class="title">${st.deadGod ? 'Dead God achieved' : 'Road to Dead God'}</div>
      <div class="big">${pct(st.overall, 1)}<small>%</small></div>
      ${bar(st.overall, 1)}
      <div class="rows">
        ${timerRow()}<span>Secrets</span><span class="n">${st.achDone}<small>/${st.achTotal}</small></span>${bar(st.achDone, st.achTotal)}
        <span>Hard marks</span><span class="n">${st.hardMarks}<small>/${st.totalMarks}</small></span>${bar(st.hardMarks, st.totalMarks)}
        <span>Challenges</span><span class="n">${st.chalDone}<small>/${st.chalTotal}</small></span>${bar(st.chalDone, st.chalTotal)}
        <span>Items</span><span class="n">${st.items}<small>/${st.itemsTotal}</small></span>${bar(st.items, st.itemsTotal)}
      </div></div>`;
  }

  function slim(st) {
    return `<div class="slim"><span>Dead God</span><span class="pct">${pct(st.overall, 1)}%</span>${bar(st.overall, 1)}
      <span class="meta">${st.achDone}/${st.achTotal} ach · ${st.items}/${st.itemsTotal} items</span></div>`;
  }

  function marks() {
    const head = '<tr><th></th>' + DG.BOSSES.map((b) => `<th title="${b.name}">${b.short}</th>`).join('') + '</tr>';
    const rows = DG.CHARACTERS.map((c, ci) => {
      if (c.tainted && !showTainted) return '';
      const cells = DG.BOSSES.map((_, bi) => `<td class="l${DG.getMark(state, ci, bi)}"></td>`).join('');
      return `<tr class="${c.tainted ? 't' : ''}"><th class="c">${c.tainted ? 'T·' : ''}${c.short}</th>${cells}</tr>`;
    }).join('');
    return `<div class="grid"><table>${head}${rows}</table></div>`;
  }

  function remaining(st) {
    const list = DG.activeAchievements(state);
    const rows = Object.entries(DG.CATEGORIES).map(([k, label]) => {
      const left = list.filter((a) => a.category === k && !state.ach[a.id]).length;
      return left ? `<span>${label}</span><span class="n">${left}</span>` : '';
    }).join('');
    const itemsLeft = st.itemsTotal - st.items;
    return `<div class="panel left"><div class="title">Still to do</div>
      <div class="rows">${rows}${itemsLeft ? `<span>Items</span><span class="n">${itemsLeft}</span>` : ''}
      <span>Hard marks</span><span class="n">${st.totalMarks - st.hardMarks}</span></div></div>`;
  }

  function next() {
    const items = DG.todo ? DG.todo.nextUp(state, +p.get('count') || 4) : [];
    const rows = items.map((t) => `<li><span>${esc(t.title)}</span>${t.progress ? `<small>${t.progress[0]}/${t.progress[1]}</small>` : ''}</li>`).join('');
    return `<div class="panel next"><div class="title">Next up</div><ul>${rows || '<li>Dead God time!</li>'}</ul></div>`;
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Pinned timer: always on screen, outside the rotating views (corners sit at the edges of the browser source).
  const PIN = { top: 1, bottom: 1, tl: 1, tr: 1, bl: 1, br: 1 };
  const pin = PIN[p.get('pin')] ? p.get('pin') : null;
  const pinEl = document.createElement('div');
  if (pin) {
    pinEl.className = 'pin' + (pin.length === 2 ? ' corner ' + pin : '');
    if (pin === 'top') document.getElementById('wrap').prepend(pinEl);
    else if (pin === 'bottom') document.getElementById('wrap').append(pinEl);
    else document.body.append(pinEl);
  }
  let lastPin = '';
  function renderPin() {
    if (!pin) return;
    pinEl.hidden = view === 'timer'; // the Timer view already shows it
    const html = `<span class="lbl">DeadGod%</span><b class="tm ${state.timer.running ? 'on' : ''}">${tms()}</b>`;
    if (html !== lastPin) { lastPin = html; pinEl.innerHTML = html; }
  }
  const showTimer = p.get('timer') !== '0' && !pin; // with a pinned timer, views don't repeat it
  const tms = () => DG.fmtTime(DG.timerMs(state));
  function timerRow() {
    if (!showTimer || (!state.timer.elapsed && !state.timer.running)) return '';
    return `<span>Timer</span><span class="n tm ${state.timer.running ? 'on' : ''}">${tms()}</span><span></span>`;
  }
  function timerView() {
    return `<div class="panel tview"><div class="title">${state.ach[637] ? 'Dead God · final time' : 'DeadGod%' + (state.timer.sessions ? ' · session ' + state.timer.sessions : '')}</div>
      <div class="big tm ${state.timer.running ? 'on' : ''}">${tms()}</div></div>`;
  }
  function runView(st) {
    const ci = state.current;
    const c = ci == null ? null : DG.CHARACTERS[ci];
    const cells = c ? DG.BOSSES.map((b, bi) => `<div class="rc l${DG.getMark(state, ci, bi)}"><span>${b.short}</span></div>`).join('') : '';
    return `<div class="panel runv"><div class="title">${c ? 'Now playing' : 'Road to Dead God'}</div>
      <div class="rname">${c ? esc(c.name) : DG.pct(st.overall, 1) + '%'}</div>
      ${c ? `<div class="rcells">${cells}</div>` : ''}
      <div class="rfoot"><span>${st.achDone}/${st.achTotal} secrets</span>${showTimer ? `<span class="tm ${state.timer.running ? 'on' : ''}">${tms()}</span>` : ''}</div></div>`;
  }

  // Splits: how long the last few finished route steps took, plus the live step.
  const ft = (ms) => (ms == null ? '—' : DG.fmtTime(ms, false));
  let splitCache = null;
  function splitsView() {
    if (!splitCache || splitCache.s !== state) splitCache = { s: state, t: DG.splits.table(state) };
    const t = splitCache.t;
    const live = Math.max(0, DG.timerMs(state) - (t.done.length ? t.done[t.done.length - 1].at : 0));
    const rows = t.done.slice(-(+p.get('count') || 4)).map((d) => `<li><span>${esc(d.label)}</span><b>${ft(d.seg)}</b><i>${ft(d.at)}</i></li>`).join('');
    const now = t.next ? `<li class="now"><span>${esc(t.next.label)}</span><b class="tm ${state.timer.running ? 'on' : ''}">${ft(live)}</b><i></i></li>` : '';
    return `<div class="panel splitv"><div class="title">Splits</div>
      <ul>${rows}${now}</ul>
      ${showTimer ? `<div class="stot"><span>Timer</span><b class="tm ${state.timer.running ? 'on' : ''}">${tms()}</b><i></i></div>` : ''}</div>`;
  }

  // Collection pages: found / total for each of the 6 in-game pages.
  function itemsView(st) {
    const rows = Array.from({ length: DG.COL_PAGES }, (_, k) => {
      const list = DG.COLLECTION.filter((it) => it.page === k + 1), got = list.filter((it) => state.col[it.i]).length;
      return `<span>Page ${k + 1}</span><span class="n">${got}<small>/${list.length}</small></span>${bar(got, list.length)}`;
    }).join('');
    return `<div class="panel colv"><div class="title">Collection page</div>
      <div class="big">${st.items}<small>/${st.itemsTotal}</small></div>${bar(st.items, st.itemsTotal)}
      <div class="rows">${rows}</div></div>`;
  }

  // Collection page view: one in-game page at a time (20 x 6, missing items greyed), turning every `pageevery` seconds.
  // With missing=1 it shows only the items still to find, in collection order, 40 per screen.
  const SHEET_ROWS = Math.ceil(DG.COLLECTION.length / 20);
  const pageEvery = Math.min(600, Math.max(3, +p.get('pageevery') || 12)) * 1000;
  const missingOnly = p.get('missing') === '1';
  const MISS_PER = 40;
  let colTurn = 0; // advances every pageEvery; each render picks its page from it
  const sprite = (it) => `<i class="ci" style="background-position:${(it.i % 20) / 19 * 100}% ${Math.floor(it.i / 20) / (SHEET_ROWS - 1) * 100}%"></i>`;
  function colPageView() {
    if (missingOnly) {
      const left = DG.COLLECTION.filter((it) => !state.col[it.i]);
      if (!left.length) return `<div class="panel colp"><div class="title">Collection page</div><div class="big">All ${DG.COLLECTION.length} found!</div></div>`;
      const screens = Math.ceil(left.length / MISS_PER), k = colTurn % screens;
      const cells = left.slice(k * MISS_PER, (k + 1) * MISS_PER).map((it) => `<span class="cc miss" title="${esc(it.name)}">${sprite(it)}</span>`).join('');
      return `<div class="panel colp"><div class="chead"><span class="title">Still missing${screens > 1 ? ` · ${k + 1}/${screens}` : ''}</span><b>${left.length}<small> left</small></b></div>
        <div class="cgrid m">${cells}</div></div>`;
    }
    const pg = (colTurn % DG.COL_PAGES) + 1;
    const list = DG.COLLECTION.filter((it) => it.page === pg), got = list.filter((it) => state.col[it.i]).length;
    const cells = list.map((it) => `<span class="cc${state.col[it.i] ? ' got' : ''}">${sprite(it)}</span>`).join('');
    return `<div class="panel colp"><div class="chead"><span class="title">Collection · Page ${pg}/${DG.COL_PAGES}</span><b>${got}<small>/${list.length}</small></b></div>
      <div class="cgrid">${cells}</div>${bar(got, list.length)}</div>`;
  }
  if (views.includes('colpage')) setInterval(() => { colTurn++; if (view === 'colpage' || page) render(false); }, pageEvery);

  let lastHtml = '';
  function render(flash) {
    renderPin();
    const st = DG.stats(state);
    const one = (v) => (v === 'bar' ? slim(st) : v === 'marks' ? marks() : v === 'remaining' ? remaining(st) : v === 'next' ? next() : v === 'timer' ? timerView() : v === 'run' ? runView(st) : v === 'splits' ? splitsView() : v === 'items' ? itemsView(st) : v === 'colpage' ? colPageView() : summary(st));
    const html = waiting ? `<div class="panel"><div class="title">Dead God progress</div><p class="wait">Waiting for the next update from the runner…</p></div>`
      : page ? `<div class="pagehead"><span>Dead God progress</span><small>Live</small></div>` + views.map(one).join('') : one(view);
    if (html !== lastHtml) {
      lastHtml = html;
      root.innerHTML = html;
      if (flash && root.firstElementChild) root.firstElementChild.classList.add('flash');
    }
    relayout();
  }

  // Keep a corner timer from covering the panel: a top corner pushes the panel down,
  // a bottom corner drops the timer just below the panel when the source is too short.
  const wrap = document.getElementById('wrap');
  const baseScale = +p.get('scale') || 1;
  let scale = baseScale;
  // Shrink the panel to fit the browser source when it's too narrow or short for it (never grows past &scale).
  function fit() {
    if (page) return;
    document.documentElement.style.setProperty('--scale', baseScale);
    wrap.style.paddingTop = '';
    const r = wrap.getBoundingClientRect();
    let h = r.height;
    if (pin && pin.length === 2 && !pinEl.hidden) { // a corner timer that can't sit beside the panel needs its own row
      const q = pinEl.getBoundingClientRect();
      if (pin[1] === 'l' || r.width + q.width + 20 > innerWidth) h += q.height + 8; // the panel sits on the left
    }
    const f = Math.min(1, (innerWidth - 2) / r.width, (innerHeight - 2) / h);
    scale = baseScale * (f > 0 ? f : 1);
    document.documentElement.style.setProperty('--scale', scale);
  }
  function placePin() {
    if (!pin || pin.length !== 2) return;
    wrap.style.paddingTop = ''; pinEl.classList.remove('below'); pinEl.style.top = '';
    if (pinEl.hidden) return;
    const r = root.getBoundingClientRect(), q = pinEl.getBoundingClientRect();
    const hit = q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top;
    if (!hit) return;
    if (pin[0] === 't') wrap.style.paddingTop = (10 + (q.height + 8) / scale) + 'px';
    else { pinEl.classList.add('below'); pinEl.style.top = r.bottom + 'px'; }
  }
  function relayout() {
    fit(); placePin();
    if (page) return;
    const r = wrap.getBoundingClientRect(); // a top-corner timer can push the panel down: shrink once more if needed
    const f = Math.min(1, (innerHeight - 2) / r.bottom, (innerWidth - 2) / r.right);
    if (f < 1) { scale *= f; document.documentElement.style.setProperty('--scale', scale); placePin(); }
  }
  window.addEventListener('resize', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);

  if (watchKey) DG.sync.watch(watchKey, { onRemote: (s) => { state = s; waiting = false; render(!page); } });
  if (!codeMatch && !watchKey) DG.onExternalChange((s) => { state = s; render(true); });
  const room = p.get('room'); // older overlay links; new ones use &watch=
  if (!codeMatch && !watchKey && room && DG.sync && DG.sync.validRoom(room)) {
    DG.sync.connect(room, {
      getLocal: () => state,
      onRemote: (s) => { state = s; DG.save(state, true); render(true); },
    });
  }
  render(false);
  setInterval(() => { if (state.timer.running) render(false); }, 100);
  if (views.length > 1 && !page) {
    setInterval(() => {
      root.classList.add('fade');
      setTimeout(() => { vi = (vi + 1) % views.length; view = views[vi]; render(false); root.classList.remove('fade'); }, 450);
    }, cycle);
  }
})();

/* Overlay page for OBS / Meld browser sources.
   URL options: ?view=summary|bar|marks|remaining|next|timer|run &count=4 &timer=0 &scale=1.5 &bg=1 &tainted=0
   Progress comes from this browser's saved state, or from a #code=... snapshot. */
(function () {
  'use strict';
  const DG = window.DG;
  const p = new URLSearchParams(location.search);
  const view = p.get('view') || 'summary';
  const showTainted = p.get('tainted') !== '0';
  document.documentElement.style.setProperty('--scale', +p.get('scale') || 1);
  if (p.get('bg') === '1') document.body.classList.add('bg');

  const codeMatch = /[#&]code=([\w-]+)/.exec(location.hash);
  let state;
  try { state = codeMatch ? DG.decode(codeMatch[1]) : DG.load(); } catch (_) { state = DG.load(); }

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

  const showTimer = p.get('timer') !== '0';
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

  let lastHtml = '';
  function render(flash) {
    const st = DG.stats(state);
    const html = view === 'bar' ? slim(st) : view === 'marks' ? marks() : view === 'remaining' ? remaining(st) : view === 'next' ? next() : view === 'timer' ? timerView() : view === 'run' ? runView(st) : summary(st);
    if (html === lastHtml) return;
    lastHtml = html;
    root.innerHTML = html;
    if (flash && root.firstElementChild) root.firstElementChild.classList.add('flash');
  }

  if (!codeMatch) DG.onExternalChange((s) => { state = s; render(true); });
  const room = p.get('room');
  if (!codeMatch && room && DG.sync && DG.sync.validRoom(room)) {
    DG.sync.connect(room, {
      getLocal: () => state,
      onRemote: (s) => { state = s; DG.save(state, true); render(true); },
    });
  }
  render(false);
  setInterval(() => { if (state.timer.running) render(false); }, 100);
})();

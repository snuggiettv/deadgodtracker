/* Checklist page. */
(function () {
  'use strict';
  const DG = window.DG;
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v; else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k.includes('-')) n.setAttribute(k, v); else if (v !== undefined) n[k] = v;
    }
    kids.flat().forEach((c) => c != null && n.append(c));
    return n;
  };

  let state = DG.load();
  let sync = null;

  function commit(msg) {
    DG.splits.record(state);
    DG.save(state);
    if (sync) sync.publish(state);
    renderAll();
    if (msg) toast(msg);
  }

  let toastTimer;
  function toast(msg, action, ms = 2600) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show'); t.classList.toggle('action', !!action);
    if (action) t.append(el('button', { textContent: action.label, onclick: () => { t.classList.remove('show', 'action'); action.run(); } }));
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show', 'action'), ms);
  }

  // ---------- summary ----------
  function renderSummary() {
    const st = DG.stats(state);
    const card = (label, n, d, extra = '') => el('div', { class: 'card stat' },
      el('div', { class: 'label', textContent: label }),
      el('div', { class: 'value', innerHTML: `${n} <small>/ ${d}${extra}</small>` }),
      el('div', { class: 'bar' }, el('i', { style: `width:${DG.pct(n, d)}%` })));
    const overall = el('div', { class: 'card stat' },
      el('div', { class: 'label', textContent: st.deadGod ? 'Dead God unlocked!' : 'Dead God progress' }),
      el('div', { class: 'value', innerHTML: `${DG.pct(st.overall, 1)}<small>%</small>` }),
      el('div', { class: 'bar' }, el('i', { style: `width:${DG.pct(st.overall, 1)}%` })));
    $('#summary').replaceChildren(
      overall,
      card('Secrets (achievements)', st.achDone, st.achTotal),
      card('Hard marks', st.hardMarks, st.totalMarks),
      card('Challenges', st.chalDone, st.chalTotal),
      card('Items', st.items, st.itemsTotal),
    );
  }

  // ---------- marks ----------
  function renderMarks() {
    const head = el('tr', {}, el('th', { class: 'char', textContent: 'Character' }),
      DG.BOSSES.map((b) => el('th', { textContent: b.short, class: 'has-tip', tabIndex: 0, dataset: { tip: b.id === 'greed' ? 'Ultra Greed (G = Greed, GG = Greedier)' : b.id === 'bluebaby' ? '??? (Blue Baby, in The Chest)' : b.name } })),
      el('th', { textContent: 'Hard' }));
    const rows = DG.CHARACTERS.map((c, ci) => {
      let hard = 0;
      const cells = DG.BOSSES.map((b, bi) => {
        const l = DG.getMark(state, ci, bi);
        if (l === 2) hard++;
        const label = ['–', b.id === 'greed' ? 'G' : 'N', b.id === 'greed' ? 'GG' : 'H'][l];
        const btn = el('button', {
          class: 'mark', textContent: label,
          dataset: { l, ci, bi, tip: `${c.name} – ${b.name}: ${['not done', b.normal || 'Normal', b.hard || 'Hard'][l]}` },
          'aria-label': `${c.name} ${b.name}`,
        });
        return el('td', {}, btn);
      });
      return el('tr', { class: c.tainted ? 'tainted' : '' },
        el('th', { class: 'char', textContent: c.name }), cells,
        el('td', { class: 'count', textContent: `${hard}/12` }));
    });
    $('#marks').replaceChildren(el('thead', {}, head), el('tbody', {}, rows));
    $('#autolink-hint').textContent = state.autoLink
      ? 'Auto-tick is on: marks tick the achievements they unlock (for example Satan as Isaac ticks Mom\'s Knife). Turn it off under Items & settings.'
      : 'Auto-tick is off. Marks and achievements are tracked separately.';
  }

  function cycleMark(ci, bi, clear) {
    const cur = DG.getMark(state, ci, bi);
    const next = clear ? 0 : (cur + 1) % 3;
    const added = DG.setMark(state, ci, bi, next);
    commit(added.length ? `Also ticked: ${added.map((id) => DG.ACH_BY_ID.get(id).name).join(', ')}` : null);
  }

  // Legend for the boss abbreviations.
  $('#marks-legend').replaceChildren(...DG.BOSSES.map((b) => el('span', {}, el('b', { textContent: b.short }), ' ' + (b.id === 'greed' ? 'Ultra Greed / Greedier' : b.id === 'bluebaby' ? '??? (Blue Baby)' : b.name))));

  // Instant tooltips for anything with data-tip (mouse hover, keyboard focus, or a tap on headers on phones).
  const tip = el('div', { class: 'tip', role: 'tooltip' });
  document.body.append(tip);
  let tipFor = null, lastTouch = 0;
  function showTip(t) {
    tipFor = t; tip.textContent = t.dataset.tip; tip.classList.add('show');
    const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = r.left + r.width / 2 - w / 2; x = Math.max(8, Math.min(window.innerWidth - w - 8, x));
    let y = r.top - h - 8; if (y < 8) y = r.bottom + 8;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tipFor = null; tip.classList.remove('show'); }
  document.addEventListener('mouseover', (e) => { if (Date.now() - lastTouch < 800) return; const t = e.target.closest('[data-tip]'); if (t) showTip(t); else if (tipFor) hideTip(); });
  document.addEventListener('focusin', (e) => { const t = e.target.closest('[data-tip]'); if (t) showTip(t); });
  document.addEventListener('focusout', () => { if (Date.now() - lastTouch > 800) hideTip(); });
  document.addEventListener('scroll', hideTip, true);
  document.addEventListener('touchstart', (e) => {
    lastTouch = Date.now();
    const t = e.target.closest('th[data-tip]');
    if (t) { showTip(t); clearTimeout(tip._t); tip._t = setTimeout(hideTip, 2500); } else hideTip();
  }, { passive: true });

  $('#marks').addEventListener('click', (e) => {
    const b = e.target.closest('.mark'); if (!b) return;
    cycleMark(+b.dataset.ci, +b.dataset.bi, false);
  });
  $('#marks').addEventListener('contextmenu', (e) => {
    const b = e.target.closest('.mark'); if (!b) return;
    e.preventDefault(); cycleMark(+b.dataset.ci, +b.dataset.bi, true);
  });

  // ---------- achievements ----------
  const catSel = $('#ach-cat');
  Object.entries(DG.CATEGORIES).forEach(([k, v]) => catSel.append(el('option', { value: k, textContent: v })));

  function achRow(a) {
    const done = !!state.ach[a.id];
    return el('label', { class: 'ach' + (done ? ' done' : '') },
      el('input', { type: 'checkbox', checked: done, dataset: { id: a.id } }),
      el('div', {},
        el('div', {}, el('span', { class: 'id', textContent: '#' + a.id }), el('span', { class: 'n', textContent: a.name }),
          a.repPlus ? el('span', { class: 'tag', textContent: 'Rep+' }) : null),
        el('div', { class: 'u', textContent: a.unlock })));
  }

  function renderAchievements() {
    const q = $('#ach-search').value.trim().toLowerCase();
    const f = $('#ach-filter').value, cat = catSel.value, group = $('#ach-group').value;
    let list = DG.activeAchievements(state).filter((a) => {
      if (f === 'locked' && state.ach[a.id]) return false;
      if (f === 'done' && !state.ach[a.id]) return false;
      if (cat && a.category !== cat) return false;
      if (q) {
        if (q.startsWith('#')) return String(a.id) === q.slice(1);
        return (a.name + ' ' + a.unlock).toLowerCase().includes(q);
      }
      return true;
    });
    const out = $('#ach-out');
    if (!list.length) { out.replaceChildren(el('p', { class: 'hint', textContent: f === 'locked' && !q ? 'Nothing left here. Nice.' : 'No matches.' })); return; }
    if (group === 'id') { out.replaceChildren(el('div', { class: 'ach-list' }, list.map(achRow))); return; }
    const all = DG.activeAchievements(state);
    out.replaceChildren(...Object.entries(DG.CATEGORIES).flatMap(([k, label]) => {
      const sub = list.filter((a) => a.category === k);
      if (!sub.length) return [];
      const inCat = all.filter((a) => a.category === k);
      const doneN = inCat.filter((a) => state.ach[a.id]).length;
      return [el('h3', { class: 'group-title' }, label, el('span', { textContent: `${doneN} / ${inCat.length}` })),
        el('div', { class: 'ach-list' }, sub.map(achRow))];
    }));
  }

  function onAchToggle(e) {
    const cb = e.target.closest('input[type=checkbox][data-id]'); if (!cb) return;
    if (cb.checked) state.ach[cb.dataset.id] = 1; else delete state.ach[cb.dataset.id];
    commit();
  }
  $('#ach-out').addEventListener('change', onAchToggle);
  $('#chal-out').addEventListener('change', onAchToggle);
  ['#ach-search', '#ach-filter', '#ach-group'].forEach((s) => $(s).addEventListener('input', renderAchievements));
  catSel.addEventListener('input', renderAchievements);

  function renderChallenges() {
    const list = DG.ACHIEVEMENTS.filter((a) => a.challenge).sort((a, b) => a.challenge - b.challenge);
    $('#chal-out').replaceChildren(...list.map((a) => {
      const done = !!state.ach[a.id];
      return el('label', { class: 'ach' + (done ? ' done' : '') },
        el('input', { type: 'checkbox', checked: done, dataset: { id: a.id } }),
        el('div', {}, el('div', {}, el('span', { class: 'id', textContent: '#' + a.challenge }), el('span', { class: 'n', textContent: a.challengeName })),
          el('div', { class: 'u', textContent: 'Reward: ' + a.name })));
    }));
  }

  // ---------- collection page ----------
  // Sprites come from img/collection.png (20 per row, 32 px each, in collection order). Without it, names show instead.
  const SHEET = 'img/collection.png?v=b36288e', SHEET_ROWS = Math.ceil(DG.COLLECTION.length / 20);
  let colIcons = false, colPage = 0, colBuiltKey = '';
  try { colPage = Math.max(0, Math.min(DG.COL_PAGES, +localStorage.getItem('deadgod-tracker:colpage') || 0)); } catch (_) { /* ignore */ }
  (function probeSheet() {
    const im = new Image();
    im.onload = () => { colIcons = true; $('#col-names-wrap').hidden = false; colBuiltKey = ''; renderCollection(); };
    im.src = SHEET;
  })();
  const where = (it) => `Page ${it.page}, row ${it.row}, column ${it.col}`;
  function sprite(it) {
    const x = (it.i % 20) / 19 * 100, y = Math.floor(it.i / 20) / (SHEET_ROWS - 1) * 100;
    return el('span', { class: 'ci', style: `background-image:url(${SHEET});background-size:2000% ${SHEET_ROWS * 100}%;background-position:${x}% ${y}%` });
  }
  function colCell(it, withName) {
    const names = withName || !colIcons || $('#col-names').checked;
    return el('button', {
      class: 'colc' + (names ? ' named' : '') + (withName ? ' wide' : ''), dataset: { i: it.i, tip: it.name + ' · ' + where(it) },
      'aria-label': it.name, 'aria-pressed': 'false',
    }, colIcons ? sprite(it) : null, names ? el('span', { class: 'nm', textContent: it.name }) : null,
    withName ? el('small', { textContent: `P${it.page} · R${it.row} · C${it.col}` }) : null);
  }
  function renderCollection() {
    const q = $('#col-search').value.trim().toLowerCase(), missing = $('#col-missing').checked;
    const pageCount = (p) => DG.COLLECTION.filter((it) => it.page === p && state.col[it.i]).length;
    const pageSize = (p) => DG.COLLECTION.filter((it) => it.page === p).length;
    $('#col-pages').replaceChildren(
      el('button', { textContent: 'All', 'aria-pressed': String(colPage === 0), dataset: { p: 0 } },
        el('small', { textContent: ` ${DG.colCount(state)}/${DG.COLLECTION.length}` })),
      ...Array.from({ length: DG.COL_PAGES }, (_, k) => el('button', { textContent: 'Page ' + (k + 1), 'aria-pressed': String(colPage === k + 1), dataset: { p: k + 1 } },
        el('small', { textContent: ` ${pageCount(k + 1)}/${pageSize(k + 1)}` }))));
    // Rebuild the cells only when the filter changes; ticks just restyle them.
    const key = [q, missing && JSON.stringify(state.col), colPage, colIcons, $('#col-names').checked].join('|');
    if (key !== colBuiltKey) {
      colBuiltKey = key;
      const inPage = (it) => !colPage || it.page === colPage;
      const out = [];
      if (q || missing) {
        const list = DG.COLLECTION.filter((it) => inPage(it) && (!q || it.name.toLowerCase().includes(q)) && (!missing || !state.col[it.i]));
        out.push(list.length ? el('div', { class: 'col-list' }, list.map((it) => colCell(it, true)))
          : el('p', { class: 'hint', textContent: missing && !q ? 'Nothing missing here.' : 'No item matches.' }));
      } else {
        for (let p = 1; p <= DG.COL_PAGES; p++) {
          if (colPage && p !== colPage) continue;
          const items = DG.COLLECTION.filter((it) => it.page === p);
          out.push(el('h3', { class: 'group-title' }, 'Page ' + p, el('span', { class: 'col-count', dataset: { p } })),
            el('div', { class: 'col-scroll' }, el('div', { class: 'col-grid' + (colIcons && !$('#col-names').checked ? '' : ' names') }, items.map((it) => colCell(it, false)))));
        }
      }
      $('#col-out').replaceChildren(...out);
    }
    document.querySelectorAll('#col-out .colc').forEach((b) => { const on = !!state.col[b.dataset.i]; b.classList.toggle('got', on); b.setAttribute('aria-pressed', String(on)); });
    document.querySelectorAll('#col-out .col-count').forEach((c) => (c.textContent = `${pageCount(+c.dataset.p)} / ${pageSize(+c.dataset.p)}`));
  }
  $('#col-out').addEventListener('click', (e) => {
    const b = e.target.closest('.colc'); if (!b) return;
    const i = +b.dataset.i, on = !state.col[i];
    DG.setCollected(state, i, on);
    commit();
  });
  $('#col-pages').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-p]'); if (!b) return;
    colPage = +b.dataset.p; try { localStorage.setItem('deadgod-tracker:colpage', colPage); } catch (_) { /* ignore */ }
    renderCollection();
  });
  $('#col-search').addEventListener('input', () => renderCollection());
  $('#col-missing').addEventListener('change', () => renderCollection());
  $('#col-names').addEventListener('change', () => renderCollection());

  // ---------- items & settings ----------
  function renderSettings() {
    if (document.activeElement !== $('#items')) $('#items').value = state.items;
    if (document.activeElement !== $('#items-total')) $('#items-total').value = state.itemsTotal;
    $('#rep-plus').checked = state.repPlus;
    $('#auto-link').checked = state.autoLink;
  }
  const clampItems = (n) => Math.max(0, Math.min(state.itemsTotal, Math.round(n) || 0));
  $('#items').addEventListener('change', (e) => { state.items = clampItems(+e.target.value); commit(); });
  $('#items-dec').addEventListener('click', () => { state.items = clampItems(state.items - 1); commit(); });
  $('#items-inc').addEventListener('click', () => { state.items = clampItems(state.items + 1); commit(); });
  $('#items-total').addEventListener('change', (e) => { state.itemsTotal = Math.max(1, Math.round(+e.target.value) || DG.COLLECTION.length); state.items = clampItems(state.items); commit(); });
  $('#rep-plus').addEventListener('change', (e) => { state.repPlus = e.target.checked; commit(); });
  $('#auto-link').addEventListener('change', (e) => {
    state.autoLink = e.target.checked;
    const added = state.autoLink ? DG.applyRules(state) : [];
    commit(added.length ? `Ticked ${added.length} achievements from your marks` : null);
  });

  function downloadBackup(suffix = '') {
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}`;
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `deadgod-backup-${stamp}${suffix}.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  $('#export-file').addEventListener('click', () => downloadBackup());
  $('#import-file-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { replaceState(DG.normalize(JSON.parse(await f.text())), 'Backup loaded'); } catch (err) { toast('That file is not a tracker backup'); }
    e.target.value = '';
  });
  $('#copy-code').addEventListener('click', async () => {
    const code = DG.encode(state);
    $('#code').value = code;
    try { await navigator.clipboard.writeText(code); toast('Save code copied'); } catch (_) { $('#code').select(); toast('Save code is in the box below. Copy it from there.'); }
  });
  $('#paste-code').addEventListener('click', () => {
    try { replaceState(DG.decode($('#code').value), 'Save code loaded'); } catch (_) { toast('That save code could not be read'); }
  });
  function resetAll() {
    const synced = !!DG.sync.getRoom();
    const msg = 'Reset ALL progress (marks, achievements and items)?' +
      (synced ? '\n\nSync is on, so your overlay and other devices will reset too.' : '') +
      '\n\nYou can undo for 15 seconds afterwards.';
    if (!confirm(msg)) return;
    const backup = JSON.parse(JSON.stringify(state));
    const fresh = DG.emptyState();
    fresh.repPlus = state.repPlus; fresh.autoLink = state.autoLink; fresh.itemsTotal = state.itemsTotal;
    state = fresh; commit();
    toast('Progress reset', { label: 'Undo', run: () => replaceState(backup, 'Progress restored') }, 15000);
  }
  $('#reset').addEventListener('click', resetAll);
  $('#reset-top').addEventListener('click', resetAll);
  // Swap in a whole state (backup, undo, save code) without recording its finished steps as new splits.
  function replaceState(s, msg) { state = s; DG.splits.baseline(state); commit(msg); }

  // ---------- overlay builder ----------
  const base = location.href.replace(/[#?].*$/, '').replace(/index\.html$/, '');
  function overlayUrl(withCode) {
    const p = new URLSearchParams();
    const views = [...document.querySelectorAll('input[name="ov-v"]:checked')].map((i) => i.value);
    p.set('view', (views.length ? views : ['summary']).join(','));
    $('#ov-cycle-wrap').style.display = views.length < 2 ? 'none' : '';
    if (views.length > 1) p.set('cycle', Math.min(600, Math.max(3, Math.round(+$('#ov-cycle').value) || 15)));
    const sc = +$('#ov-scale').value; if (sc && sc !== 1) p.set('scale', sc);
    if ($('#ov-bg').checked) p.set('bg', '1');
    if (!$('#ov-tainted').checked) p.set('tainted', '0');
    if (!$('#ov-timer').checked) p.set('timer', '0');
    if ($('#ov-pin-on').checked) p.set('pin', $('#ov-pin').value);
    $('#ov-pin-wrap').style.display = $('#ov-pin-on').checked ? '' : 'none';
    const room = DG.sync.getRoom(); if (room && !withCode) p.set('watch', DG.sync.watchKey(room)); // read-only feed, never the room
    return base + 'overlay.html?' + p.toString() + (withCode ? '#code=' + DG.encode(state) : '');
  }
  function renderOverlayBuilder() {
    const url = overlayUrl(false);
    $('#ov-url').value = url;
    $('#dock-url').innerHTML = `<code>${base}</code>`;
    $('#ov-sync-note').textContent = DG.sync.getRoom() ? 'Sync is on, so this link follows your ticks from any device.' : 'Sync is off: this link only follows ticks made in the same browser (or an OBS dock).';
    const fr = $('#ov-preview');
    if (fr.dataset.src !== url) { fr.dataset.src = url; fr.src = url; }
  }
  $('#ov-views').addEventListener('change', renderOverlayBuilder);
  ['#ov-pin-on', '#ov-pin', '#ov-cycle', '#ov-scale', '#ov-bg', '#ov-tainted', '#ov-timer'].forEach((s) => $(s).addEventListener('input', renderOverlayBuilder));
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg); } catch (_) { prompt('Copy this link:', text); }
  }
  $('#ov-copy').addEventListener('click', () => copy(overlayUrl(false), 'Overlay link copied'));
  $('#ov-snapshot').addEventListener('click', () => copy(overlayUrl(true), 'Snapshot link copied. Re-copy it after you tick more.'));

  // ---------- tabs ----------
  function showTab(name) {
    document.querySelectorAll('nav.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === name));
    document.querySelectorAll('section[id^=tab-]').forEach((s) => (s.hidden = s.id !== 'tab-' + name));
    try { localStorage.setItem('deadgod-tracker:tab', name); } catch (_) { /* ignore */ }
    if (name === 'overlay') renderOverlayBuilder();
  }
  document.querySelector('nav.tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-tab]'); if (b) showTab(b.dataset.tab); });

  // ---------- timer ----------
  function renderTimer() {
    const ms = DG.timerMs(state), run = state.timer.running, txt = DG.fmtTime(ms);
    $('#htime').textContent = txt; $('#run-time').textContent = txt;
    const live = $('#split-live'); if (live) live.textContent = DG.fmtTime(Math.max(0, ms - Math.max(0, ...Object.values(state.splits))), false);
    $('#htimer').classList.toggle('running', run); $('#run-time').classList.toggle('running', run);
    const label = run ? 'Pause' : ms ? 'Resume' : 'Start';
    $('#htoggle').textContent = label; $('#t-toggle').textContent = label;
    const st = DG.stats(state);
    $('#run-session').textContent = (state.timer.sessions ? `Session ${state.timer.sessions}${state.timer.ended ? ' ended' : ''}` : 'Not started') +
      (state.ach[637] ? ' · Dead God! Timer stopped.' : '');
  }
  function toggleTimer() {
    if (state.timer.running) DG.timerPause(state); else DG.timerStart(state);
    commit();
  }
  $('#htoggle').addEventListener('click', toggleTimer);
  $('#t-toggle').addEventListener('click', toggleTimer);
  $('#t-end').addEventListener('click', () => {
    DG.timerPause(state);
    const st = DG.stats(state);
    state.timer.ended = true; // the next Start begins a new session
    commit();
    downloadBackup(`_session-${state.timer.sessions}`);
    toast(`Session ended at ${DG.fmtTime(DG.timerMs(state))} and a backup file was downloaded. Now show the Secrets menu on stream: it should read ${st.achDone} / ${st.achTotal}.`, null, 15000);
  });
  $('#t-reset').addEventListener('click', () => {
    if (!confirm('Reset the timer to 0:00? Your split times are cleared too. (Progress is not touched.)')) return;
    state.timer = DG.emptyTimer(); state.splits = {}; commit('Timer reset');
  });
  setInterval(() => { if (state.timer.running) renderTimer(); }, 100);

  // ---------- this run ----------
  let diff = 2;
  try { diff = +localStorage.getItem('deadgod-tracker:diff') === 1 ? 1 : 2; } catch (_) { /* ignore */ }
  function renderCharPick() {
    $('#char-pick').replaceChildren(...DG.CHARACTERS.map((c, ci) => {
      const hard = DG.BOSSES.filter((_, bi) => DG.getMark(state, ci, bi) === 2).length;
      const unlocked = DG.todo.charUnlocked(state, ci);
      return el('button', {
        class: (c.tainted ? 't ' : '') + (state.current === ci ? 'sel ' : '') + (unlocked ? '' : 'locked'),
        title: unlocked ? c.name : c.name + ' (not unlocked yet)',
        onclick: () => { state.current = state.current === ci ? null : ci; commit(); },
      }, c.tainted ? 'T. ' + c.name.replace(/^Tainted /, '') : c.name, el('small', { textContent: `${hard}/12 hard` }));
    }));
  }
  function focusRewards(f) {
    if (!f.rewards.length) return el('p', { class: 'hint', textContent: 'No mark rewards left for this character.' });
    return el('ul', { class: 'reward-list' }, f.rewards.map((r) => el('li', {}, el('b', { textContent: r.name }), ' – ' + r.how)));
  }
  function renderRunPanel() {
    const ci = state.current, box = $('#run-panel');
    if (ci == null) { box.replaceChildren(el('p', { class: 'hint', textContent: 'Pick the character you are playing to get big buttons for each boss.' })); return; }
    const f = DG.todo.focus(state, ci);
    const sw = el('div', { class: 'diff-switch' },
      el('button', { class: diff === 1 ? 'on' : '', textContent: 'Normal', onclick: () => setDiff(1) }),
      el('button', { class: diff === 2 ? 'on' : '', textContent: 'Hard', onclick: () => setDiff(2) }));
    const btns = DG.BOSSES.map((b, bi) => {
      const l = DG.getMark(state, ci, bi);
      const lvlName = (x) => (b.id === 'greed' ? ['–', 'Greed', 'Greedier'] : ['–', 'Normal', 'Hard'])[x];
      return el('button', { class: 'boss-btn', dataset: { l }, onclick: () => tapBoss(ci, bi) },
        b.name, el('small', { textContent: l ? 'Done: ' + lvlName(l) : 'Not done' }));
    });
    box.replaceChildren(...[
      el('div', { class: 'row' }, el('h3', { style: 'margin:0;flex:1', textContent: f.c.name }), sw),
      f.lock ? el('p', { class: 'hint', textContent: `🔒 Not unlocked yet: ${f.lock.unlock}` }) : null,
      el('p', { class: 'hint', textContent: 'Tap a boss when you beat it. It counts at the difficulty chosen above and never lowers a mark you already have.' }),
      el('div', { class: 'boss-grid' }, btns),
      el('h3', { textContent: `Still to unlock as ${f.c.name}` }), focusRewards(f)].filter(Boolean));
  }
  function setDiff(d) { diff = d; try { localStorage.setItem('deadgod-tracker:diff', d); } catch (_) { /* ignore */ } renderRunPanel(); }
  function tapBoss(ci, bi) {
    const cur = DG.getMark(state, ci, bi);
    if (cur >= diff) { toast('Already done at this difficulty'); return; }
    const backup = JSON.parse(JSON.stringify(state));
    const added = DG.setMark(state, ci, bi, diff);
    commit();
    const b = DG.BOSSES[bi];
    toast(`${b.name} ✓` + (added.length ? ` · unlocked ${added.map((id) => DG.ACH_BY_ID.get(id).name).join(', ')}` : ''),
      { label: 'Undo', run: () => replaceState(backup, 'Undone') }, 8000);
  }
  function renderFocusCard() {
    const box = $('#todo-focus'), ci = state.current;
    box.hidden = ci == null;
    if (ci == null) return;
    const f = DG.todo.focus(state, ci);
    box.replaceChildren(
      el('div', { class: 'row', style: 'margin:0' }, el('h3', { style: 'flex:1;margin:0', textContent: `Playing ${f.c.name}` }),
        el('button', { class: 'go', textContent: 'This run →', onclick: () => showTab('run') })),
      el('p', { class: 'hint', textContent: f.lock ? `🔒 Unlock first: ${f.lock.unlock}` : f.missing.length
        ? 'Hard marks still needed: ' + f.missing.map((m) => m.b.name).join(', ') : 'All 12 hard marks done. Pick your next character.' }),
      focusRewards(f));
  }

  // ---------- splits ----------
  const fmt = (ms) => (ms == null ? '—' : DG.fmtTime(ms, false));
  function splitRow(d) {
    return el('tr', {}, el('td', { textContent: d.label }), el('td', { class: 'n', textContent: fmt(d.seg) }), el('td', { class: 'n dim', textContent: fmt(d.at) }));
  }
  function renderSplits() {
    const t = DG.splits.table(state);
    const recent = t.done.slice(-5);
    const head = el('tr', {}, el('th', { textContent: 'Step' }), el('th', { class: 'n', textContent: 'Took' }), el('th', { class: 'n', textContent: 'Timer' }));
    const nextRow = t.next ? el('tr', { class: 'cur' }, el('td', {}, el('b', { textContent: 'Now: ' }), t.next.label),
      el('td', { class: 'n' }, el('span', { id: 'split-live', textContent: fmt(t.next.seg) })), el('td')) : null;
    const all = t.done.length > 5 ? el('details', { class: 'split-all' }, el('summary', { textContent: `All ${t.done.length} splits` }),
      el('table', { class: 'splits' }, el('thead', {}, head.cloneNode(true)), el('tbody', {}, t.done.map(splitRow)))) : null;
    $('#run-splits').replaceChildren(...[
      el('h3', { style: 'margin:0', textContent: 'Route splits' }),
      el('p', { class: 'hint', textContent: t.done.length ? 'Each step of the To-do route is a split. It is timed when the step ticks off while the timer is going.'
        : 'Each step of the To-do route is a split. Start the timer and your split times appear here as steps tick off.' }),
      el('table', { class: 'splits' }, el('thead', {}, head), el('tbody', {}, recent.map(splitRow), nextRow)),
      all].filter(Boolean));
  }

  // ---------- to-do ----------
  const TAB_NAMES = { marks: 'Marks', achievements: 'List', items: 'Items', collection: 'Collection', challenges: 'Challenges' };
  function taskRow(t, showPhase) {
    const prog = t.progress ? el('div', { class: 'tprog' }, `${t.progress[0]} / ${t.progress[1]}`,
      el('div', { class: 'bar' }, el('i', { style: `width:${DG.pct(t.progress[0], t.progress[1])}%` }))) : null;
    const cb = t.achId && !t.progress ? el('input', { type: 'checkbox', checked: t.done, dataset: { id: t.achId }, title: 'Mark as unlocked' }) : null;
    const go = t.ci != null && !t.done
      ? el('button', { class: 'go', textContent: 'Play →', title: 'Set as the character you are playing', onclick: () => { state.current = t.ci; commit(); showTab('run'); } })
      : t.tab ? el('button', { class: 'go', textContent: TAB_NAMES[t.tab] + ' →', onclick: () => showTab(t.tab) }) : null;
    const sp = t.done ? DG.splits.splitFor(state, t.title) : null;
    const split = sp ? el('div', { class: 'tsplit', title: 'How long this step took you' }, fmt(sp.seg)) : null;
    return el('div', { class: 'task' + (t.done ? ' done' : '') + (t.locked ? ' locked' : '') + (t.optional ? ' optional' : '') }, cb,
      el('div', { class: 'tbody' },
        showPhase ? el('div', { class: 'tphase', textContent: t.phase }) : null,
        el('div', { class: 'tt', textContent: t.title }), el('div', { class: 'td', textContent: t.detail })),
      split, prog, go);
  }
  const openPhases = new Set();
  function renderTodo() {
    const next = DG.todo.nextUp(state, 6);
    $('#todo-next').replaceChildren(...(next.length ? next.map((t) => taskRow(t, true))
      : [el('p', { class: 'hint', textContent: 'Nothing left. Go claim that Dead God!' })]));
    const showDone = $('#todo-show-done').checked;
    const phases = DG.todo.build(state);
    const firstOpen = phases.find((p) => p.doneCount < p.total);
    $('#todo-phases').replaceChildren(...phases.map((p) => {
      const complete = p.doneCount === p.total;
      const items = p.items.filter((t) => showDone || !t.done);
      const d = el('details', { class: 'phase' + (complete ? ' complete' : ''), dataset: { id: p.id } },
        el('summary', {}, el('span', { class: 'ptitle', textContent: (complete ? '✓ ' : '') + p.title }),
          el('span', { class: 'pcount', textContent: `${p.doneCount} / ${p.total}` }),
          el('div', { class: 'bar pbar' }, el('i', { style: `width:${DG.pct(p.doneCount, p.total)}%` }))),
        el('p', { class: 'pnote', textContent: p.note }),
        el('div', { class: 'tasks' }, items.length ? items.map((t) => taskRow(t, false)) : el('p', { class: 'hint', textContent: 'All done here.' })));
      d.open = openPhases.has(p.id) || (!openPhases.size && p === firstOpen);
      d.addEventListener('toggle', () => { if (d.open) openPhases.add(p.id); else openPhases.delete(p.id); });
      return d;
    }));
    if (!openPhases.size && firstOpen) openPhases.add(firstOpen.id);
  }
  $('#tab-todo').addEventListener('change', (e) => {
    if (e.target.id === 'todo-show-done') return renderTodo();
    onAchToggle(e);
  });

  function renderAll() {
    renderTimer(); renderCharPick(); renderRunPanel(); renderFocusCard(); renderSplits();
    renderTodo();
    renderSummary(); renderMarks(); renderAchievements(); renderChallenges(); renderCollection(); renderSettings();
    DG.splits.baseline(state);
  }

  // ---------- sync ----------
  const syncLink = (room) => base + '#room=' + room;
  const viewerLink = (room) => base + 'overlay.html?page=1&watch=' + DG.sync.watchKey(room);
  function startSync(room) {
    if (sync) sync.close();
    DG.sync.setRoom(room);
    sync = DG.sync.connect(room, {
      feed: true,
      getLocal: () => state,
      onRemote: (s) => { state = s; DG.save(state, true); renderAll(); },
      onStatus: (st) => { $('#sync-status').textContent = { live: 'on', connecting: 'connecting…', offline: 'offline', error: 'error' }[st] || st; },
    });
    // If the room has nothing newer after a moment, share this device's progress.
    setTimeout(() => sync && sync.seedIfNewer(state), 4000);
    renderSync();
  }
  function renderSync() {
    const room = DG.sync.getRoom();
    $('#sync-off').hidden = !!room; $('#sync-on').hidden = !room;
    if (!room) $('#sync-status').textContent = 'off';
    if (room) { $('#sync-link').value = syncLink(room); $('#sync-room').textContent = room; $('#viewer-link').value = viewerLink(room); }
    renderOverlayBuilder();
  }
  $('#sync-start').addEventListener('click', () => { startSync(DG.sync.newRoom()); toast('Sync is on. Open the link on your other devices.'); });
  $('#viewer-copy').addEventListener('click', () => copy(viewerLink(DG.sync.getRoom()), 'Viewer link copied'));
  $('#sync-copy').addEventListener('click', () => copy(syncLink(DG.sync.getRoom()), 'Editor link copied'));
  $('#sync-copy-code').addEventListener('click', () => copy(DG.sync.getRoom(), 'Room code copied'));
  $('#sync-join').addEventListener('click', () => {
    let code = $('#sync-join-code').value.trim().toLowerCase();
    const m = /room=([a-z0-9]+)/.exec(code); if (m) code = m[1]; // accept a pasted editor link too
    if (!DG.sync.validRoom(code)) { toast('That room code doesn\'t look right'); return; }
    if (!confirm('Join this room? Progress on this device will be replaced by the room\'s progress.')) return;
    state.updated = 0; DG.save(state, true);
    startSync(code); toast('Joined the room');
  });
  $('#sync-leave').addEventListener('click', () => {
    if (sync) sync.close(); sync = null; DG.sync.setRoom(null); renderSync(); toast('Sync is off on this device');
  });

  const roomMatch = /[#&]room=([a-z0-9]+)/.exec(location.hash);
  if (roomMatch && DG.sync.validRoom(roomMatch[1]) && roomMatch[1] !== DG.sync.getRoom()) {
    if (confirm('Join this sync room? Progress on this device will be replaced by the room\'s progress.')) {
      state.updated = 0; // let the room's copy win
      DG.save(state, true);
      DG.sync.setRoom(roomMatch[1]);
    }
  }
  if (roomMatch) history.replaceState(null, '', location.pathname + location.search);
  if (DG.sync.getRoom()) startSync(DG.sync.getRoom()); else renderSync();

  // Load a save code passed in the URL (#code=...) once, then clean the URL.
  const m = /[#&]code=([\w-]+)/.exec(location.hash);
  if (m && confirm('Load the progress from this link? It replaces what is saved in this browser.')) {
    try { state = DG.decode(m[1]); DG.save(state); } catch (_) { /* ignore */ }
    history.replaceState(null, '', location.pathname + location.search);
  }

  DG.onExternalChange((s) => { state = s; renderAll(); });
  renderAll();
  let startTab = 'todo';
  try { startTab = localStorage.getItem('deadgod-tracker:tab') || 'todo'; } catch (_) { /* ignore */ }
  showTab(startTab);
})();

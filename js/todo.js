/* To-do roadmap: the DeadGod% route from data/route.js (adapted from D0ggy's and neonomi's
   split sheet). Every step is worked out from the checklist state, so the list updates as you tick. */
(function () {
  'use strict';
  const DG = window.DG;

  // Achievement that unlocks each base character (Isaac starts unlocked).
  const CHAR_UNLOCK = {
    magdalene: 1, cain: 2, judas: 3, bluebaby: 32, eve: 42, samson: 67, azazel: 79, lazarus: 80,
    eden: 81, lost: 82, lilith: 199, keeper: 251, apollyon: 340, forgotten: 390, bethany: 404, jacob: 405,
  };
  const BASE_COUNT = 17;
  // "The Broken" (474) … "The Deserter" (490): opening the Home closet as each character unlocks its tainted version.
  const TAINTED_UNLOCK_START = 474;
  // Mom's Heart kill-count achievements, in order (2 … 11 kills).
  const HEART_KILLS = [150, 8, 139, 33, 140, 141, 10, 11, 32, 234, 34];

  const has = (s, id) => !!s.ach[id];
  const ach = (id) => DG.ACH_BY_ID.get(id);

  function achTask(s, id, extra = {}) {
    const a = ach(id);
    return { key: 'a' + id, achId: id, title: a.name, detail: a.unlock, done: has(s, id), ...extra };
  }

  function charUnlocked(s, ci) {
    const c = DG.CHARACTERS[ci];
    if (!c.tainted) return c.id === 'isaac' || has(s, CHAR_UNLOCK[c.id]);
    return has(s, TAINTED_UNLOCK_START + (ci - BASE_COUNT));
  }

  function markTask(s, ci) {
    const c = DG.CHARACTERS[ci];
    const missing = DG.BOSSES.filter((_, bi) => DG.getMark(s, ci, bi) < 2);
    const hard = DG.BOSSES.length - missing.length;
    if (!charUnlocked(s, ci)) {
      const id = c.tainted ? TAINTED_UNLOCK_START + (ci - BASE_COUNT) : CHAR_UNLOCK[c.id];
      return { key: 'm' + ci, title: `Unlock ${c.name}`, detail: ach(id).unlock, achId: id, done: false, locked: true };
    }
    return {
      key: 'm' + ci, title: `${c.name}: hard marks`, tab: 'marks', progress: [hard, 12], done: !missing.length,
      detail: missing.length ? 'Still need on Hard: ' + missing.map((b) => b.name).join(', ') : 'All done',
    };
  }

  function groupTask(s, key, title, ids, detail, tab) {
    const done = ids.filter((id) => has(s, id)).length;
    return { key, title, detail, tab, progress: [done, ids.length], done: done === ids.length };
  }

  const BOSS_CODE = { MH: 'momsheart', IS: 'isaac', SA: 'satan', BB: 'bluebaby', LA: 'lamb', MS: 'megasatan', BR: 'bossrush', HU: 'hush', GR: 'greed', GG: 'greed', DE: 'delirium', MO: 'mother', BE: 'beast' };
  const BOSS_IDX = Object.fromEntries(DG.BOSSES.map((b, i) => [b.id, i]));
  // Mom's Heart kill count -> achievement for that many kills (1 kill has none; any Mom's Heart mark counts).
  const HEART_AT = { 2: 150, 3: 8, 4: 139, 5: 33, 6: 140, 7: 141, 8: 10, 9: 11, 10: 32, 11: 34 };

  // "1:02:14.945" -> ms (null for "-" or blank).
  function parseTime(t) {
    if (!t || t === '-') return null;
    const p = t.split(':').map(Number);
    return Math.round(p.reduce((a, x) => a * 60 + x, 0) * 1000) || null;
  }

  // Parse the route once into steps with structured requirements.
  const ROUTE = (window.DG_ROUTE || []).map(([chapter, text], ch) => ({
    chapter, id: 'r' + ch,
    steps: text.trim().split('\n').map((line, i) => {
      const [label, req = '', tip = '', times = ''] = line.split('|').map((x) => x.trim());
      const [pb, neo] = times.split(/\s+/).map(parseTime);
      const st = { key: `r${ch}-${i}`, label, tip, ci: null, marks: [], achs: [], items: false, heart: 0, optional: false, ref: { pb, neo } };
      const toks = req.split(/\s+/).filter(Boolean);
      const excl = new Set(toks.filter((t) => t.startsWith('-')).map((t) => t.slice(1)));
      for (const t of toks) {
        if (t.startsWith('@')) st.ci = DG.CHARACTERS.findIndex((c) => c.id === t.slice(1));
        else if (t === 'ALL') {
          for (const b of DG.BOSSES) {
            if (b.id === 'greed') { if (!excl.has('GR')) st.marks.push(['greed', excl.has('GG') ? 1 : 2]); }
            else if (![...excl].some((x) => BOSS_CODE[x] === b.id)) st.marks.push([b.id, 2]);
          }
        } else if (BOSS_CODE[t]) {
          const add = (id, l) => { if (!st.marks.some((m) => m[0] === id)) st.marks.push([id, l]); };
          if (t === 'LA') { add('momsheart', 2); add('satan', 2); }
          if (t === 'BB') { add('momsheart', 2); add('isaac', 2); }
          add(BOSS_CODE[t], t === 'GR' ? 1 : 2);
        } else if (/^a\d+$/.test(t)) st.achs.push(+t.slice(1));
        else if (/^c\d+$/.test(t)) { const a = DG.ACHIEVEMENTS.find((x) => x.challenge === +t.slice(1)); if (a) st.achs.push(a.id); }
        else if (/^h\d+$/.test(t)) st.heart = +t.slice(1);
        else if (t === 'items') st.items = true;
        else if (t === 'opt') st.optional = true;
      }
      return st;
    }),
  }));

  function heartDone(s, k) {
    if (HEART_AT[k]) return has(s, HEART_AT[k]);
    if (k === 1) return has(s, 150) || DG.CHARACTERS.some((_, ci) => DG.getMark(s, ci, 0) > 0);
    return false;
  }

  function stepTask(s, st) {
    const parts = [];
    const missing = [];
    for (const [bid, l] of st.marks) {
      const ok = DG.getMark(s, st.ci, BOSS_IDX[bid]) >= l;
      parts.push(ok);
      if (!ok) missing.push(bid === 'greed' ? (l === 2 ? 'Greedier' : 'Greed') : DG.BOSSES[BOSS_IDX[bid]].name);
    }
    for (const id of st.achs) {
      if (!s.repPlus && id >= 638 && id <= 641) continue;
      const ok = has(s, id); parts.push(ok);
      if (!ok && (st.marks.length || st.achs.length > 1)) missing.push(ach(id).name);
    }
    if (st.heart) parts.push(heartDone(s, st.heart));
    const stt = DG.stats(s);
    if (st.items) parts.push(stt.items >= stt.itemsTotal);
    const met = parts.filter(Boolean).length;
    const t = { key: st.key, title: st.label, done: parts.length > 0 && met === parts.length, optional: st.optional, ref: st.ref };
    const bits = [];
    if (st.tip) bits.push(st.tip);
    if (st.heart && HEART_AT[st.heart]) bits.push('Unlocks ' + ach(HEART_AT[st.heart]).name);
    if (missing.length && met > 0) bits.push('Still need: ' + missing.join(', '));
    if (st.ci != null && st.ci >= 0) {
      t.ci = st.ci;
      if (!charUnlocked(s, st.ci) && !t.done) {
        const c = DG.CHARACTERS[st.ci];
        const lockId = c.tainted ? TAINTED_UNLOCK_START + (st.ci - BASE_COUNT) : CHAR_UNLOCK[c.id];
        t.locked = true; bits.unshift(`Unlock ${c.name} first: ${ach(lockId).unlock}`);
      }
    }
    if (parts.length > 1) t.progress = [met, parts.length];
    if (st.items) { t.progress = [stt.items, stt.itemsTotal]; t.tab = 'items'; }
    if (!st.marks.length && !st.items && !st.heart && st.achs.length === 1) t.achId = st.achs[0];
    if (st.heart) t.achId = HEART_AT[st.heart];
    t.detail = bits.join(' · ');
    return t;
  }

  function build(s) {
    const phases = ROUTE.map((r) => {
      const items = r.steps.map((st) => stepTask(s, st));
      const counted = items.filter((t) => !t.optional);
      return { id: r.id, title: r.chapter, note: '', items, total: counted.length, doneCount: counted.filter((t) => t.done).length };
    });
    const side = (window.DG_SIDE_GOALS || []).filter((id) => DG.ACH_BY_ID.has(id)).map((id) => achTask(s, id));
    phases.push({ id: 'side', title: 'Side goals for every run', note: 'D0ggy keeps these in mind on every run instead of doing them at a fixed point.', items: side,
      total: side.length, doneCount: side.filter((t) => t.done).length, side: true });
    phases[0].note = 'Route adapted from D0ggy\'s and neonomi\'s DeadGod% Repentance+ splits. Each step ticks itself off from your marks and achievements.';
    return phases;
  }

  function byProgress(a, b) {
    if (a.locked !== b.locked) return a.locked ? 1 : -1;
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pa = a.progress ? a.progress[0] / a.progress[1] : 0, pb = b.progress ? b.progress[0] / b.progress[1] : 0;
    return pb - pa;
  }

  // The next open steps of the route, in order (optional steps and side goals left out).
  function nextUp(s, count = 6) {
    const out = [];
    for (const p of build(s)) {
      if (p.side) continue;
      for (const t of p.items) {
        if (t.done || t.optional) continue;
        out.push({ ...t, phase: p.title });
        if (out.length >= count) return out;
      }
    }
    return out;
  }

  // Everything still to get as one character: missing hard marks and the achievements they unlock.
  function focus(s, ci) {
    const c = DG.CHARACTERS[ci];
    const unlocked = charUnlocked(s, ci);
    const missing = DG.BOSSES.map((b, bi) => ({ b, bi, l: DG.getMark(s, ci, bi) })).filter((m) => m.l < 2);
    const rewards = DG.MARK_RULES.filter((r) => r.chars.length === 1 && r.chars[0] === ci && !has(s, r.id))
      .map((r) => ({ id: r.id, name: ach(r.id).name, how: ach(r.id).unlock }));
    const lockId = c.tainted ? TAINTED_UNLOCK_START + (ci - BASE_COUNT) : CHAR_UNLOCK[c.id];
    return { c, unlocked, lock: unlocked || !lockId ? null : ach(lockId), missing, rewards };
  }

  // ---------- splits ----------
  // state.splits maps a step label to the run timer (ms) when that step was finished.
  // A split is recorded only when a step turns done on this device while the timer has started.
  const STEPS = ROUTE.flatMap((r) => r.steps.map((st) => ({ ...st, chapter: r.chapter })));
  const doneSet = (s) => new Set(STEPS.filter((st) => stepTask(s, st).done).map((st) => st.label));
  let lastDone = null;
  function baseline(s) { lastDone = doneSet(s); }
  function record(s) {
    const now = doneSet(s), prev = lastDone || now;
    lastDone = now;
    for (const l of Object.keys(s.splits)) if (!now.has(l)) delete s.splits[l];
    const ms = DG.timerMs(s);
    if (!s.timer.sessions || ms <= 0) return;
    for (const st of STEPS) if (now.has(st.label) && !prev.has(st.label) && s.splits[st.label] == null) s.splits[st.label] = Math.round(ms);
  }
  const refOf = (st, cmp) => { const r = st.ref || {}; return (cmp === 'neo' ? r.neo ?? r.pb : r.pb ?? r.neo) ?? null; };
  // Splits in the order they happened, with segment times and the comparison for each.
  function splitTable(s, cmp = 'pb') {
    const done = STEPS.filter((st) => s.splits[st.label] != null)
      .map((st) => ({ label: st.label, chapter: st.chapter, at: s.splits[st.label], ref: refOf(st, cmp) }))
      .sort((a, b) => a.at - b.at);
    let prev = 0, mine = 0, theirs = 0;
    for (const d of done) {
      d.seg = d.at - prev; prev = d.at;
      d.delta = d.ref != null ? d.seg - d.ref : null;
      if (d.ref != null) { mine += d.seg; theirs += d.ref; }
    }
    const ds = doneSet(s);
    const nextSt = STEPS.find((st) => !st.optional && !ds.has(st.label));
    const next = nextSt ? { label: nextSt.label, chapter: nextSt.chapter, ref: refOf(nextSt, cmp), seg: Math.max(0, DG.timerMs(s) - prev) } : null;
    return { done, next, mine, theirs, delta: mine - theirs, compared: done.filter((d) => d.ref != null).length };
  }
  function splitFor(s, label, cmp) {
    if (s.splits[label] == null) return null;
    return splitTable(s, cmp).done.find((d) => d.label === label) || null;
  }
  // Signed short time for deltas: "+1:02" / "−0:45".
  function fmtDelta(ms) { return (ms < 0 ? '−' : '+') + DG.fmtTime(Math.abs(ms), false); }
  const STEP_LABELS = STEPS.map((st) => st.label);

  DG.todo = { build, nextUp, focus, charUnlocked };
  DG.splits = { baseline, record, table: splitTable, splitFor, refOf, fmtDelta, labels: STEP_LABELS,
    cmpName: (cmp) => (cmp === 'neo' ? 'neonomi' : 'D0ggy PB') };
})();

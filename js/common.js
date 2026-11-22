/* Shared data model, storage and stats for the checklist and the overlay. */
(function () {
  'use strict';

  const STORAGE_KEY = 'deadgod-tracker:v1';

  // 34 characters. `short` is used by the compact overlay grid.
  const BASE = [
    ['isaac', 'Isaac', 'ISA'], ['magdalene', 'Magdalene', 'MAG'], ['cain', 'Cain', 'CAI'],
    ['judas', 'Judas', 'JUD'], ['bluebaby', '??? (Blue Baby)', '???'], ['eve', 'Eve', 'EVE'],
    ['samson', 'Samson', 'SAM'], ['azazel', 'Azazel', 'AZA'], ['lazarus', 'Lazarus', 'LAZ'],
    ['eden', 'Eden', 'EDN'], ['lost', 'The Lost', 'LST'], ['lilith', 'Lilith', 'LIL'],
    ['keeper', 'Keeper', 'KEE'], ['apollyon', 'Apollyon', 'APO'], ['forgotten', 'The Forgotten', 'FOR'],
    ['bethany', 'Bethany', 'BET'], ['jacob', 'Jacob & Esau', 'J&E'],
  ];
  const ALIASES = {
    isaac: ['Isaac'], magdalene: ['Magdalene'], cain: ['Cain'], judas: ['Judas'],
    bluebaby: ['???', 'Blue Baby'], eve: ['Eve'], samson: ['Samson'], azazel: ['Azazel'],
    lazarus: ['Lazarus'], eden: ['Eden'], lost: ['The Lost', 'Lost'], lilith: ['Lilith'],
    keeper: ['Keeper'], apollyon: ['Apollyon'], forgotten: ['The Forgotten', 'Forgotten'],
    bethany: ['Bethany'], jacob: ['Jacob and Esau', 'Jacob & Esau', 'Jacob'],
  };
  const CHARACTERS = [];
  BASE.forEach(([id, name, short]) => CHARACTERS.push({ id, name, short, tainted: false }));
  BASE.forEach(([id, name, short]) =>
    CHARACTERS.push({ id: 't_' + id, name: 'Tainted ' + name.replace(/^The /, ''), short, tainted: true }));

  // 12 completion marks. For Greed, level 1 = Ultra Greed (Greed mode), level 2 = Ultra Greedier.
  const BOSSES = [
    { id: 'momsheart', name: "Mom's Heart", short: 'MH', normal: 'Normal', hard: 'Hard' },
    { id: 'isaac', name: 'Isaac', short: 'IS' },
    { id: 'satan', name: 'Satan', short: 'SA' },
    { id: 'bluebaby', name: '???', short: 'BB' },
    { id: 'lamb', name: 'The Lamb', short: 'LA' },
    { id: 'megasatan', name: 'Mega Satan', short: 'MS' },
    { id: 'bossrush', name: 'Boss Rush', short: 'BR' },
    { id: 'hush', name: 'Hush', short: 'HU' },
    { id: 'greed', name: 'Ultra Greed', short: 'GR', normal: 'Greed', hard: 'Greedier' },
    { id: 'delirium', name: 'Delirium', short: 'DE' },
    { id: 'mother', name: 'Mother', short: 'MO' },
    { id: 'beast', name: 'The Beast', short: 'BE' },
  ];
  const BOSS_ALIASES = {
    "Mom's Heart": ['momsheart', 1], 'Isaac': ['isaac', 1], 'Satan': ['satan', 1], '???': ['bluebaby', 1],
    'The Lamb': ['lamb', 1], 'Mega Satan': ['megasatan', 1], 'Boss Rush': ['bossrush', 1],
    'the Boss Rush': ['bossrush', 1], 'Hush': ['hush', 1], 'Ultra Greed': ['greed', 1],
    'Ultra Greedier': ['greed', 2], 'Delirium': ['delirium', 1], 'Mother': ['mother', 1], 'The Beast': ['beast', 1],
  };

  const REP_PLUS_IDS = new Set([638, 639, 640, 641]);

  // ---- achievements ----
  const ACHIEVEMENTS = window.DG_ACHIEVEMENTS_RAW.trim().split('\n').map((line) => {
    const [id, name, unlock] = line.split('|');
    const a = { id: +id, name, unlock, repPlus: REP_PLUS_IDS.has(+id) };
    const ch = /^Complete .+ \(challenge #(\d+)\)$/.exec(unlock);
    if (ch) { a.challenge = +ch[1]; a.challengeName = unlock.replace(/^Complete /, '').replace(/ \(challenge #\d+\)$/, ''); }
    a.category = categorize(a);
    return a;
  });
  const ACH_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

  function categorize(a) {
    const u = a.unlock;
    if (a.challenge) return 'challenge';
    if (/Donat/i.test(u)) return 'donation';
    if (/ as (Tainted )?[A-Z?]/.test(u) && !/any character/.test(u)) return a.unlock.includes('Tainted') ? 'tainted' : 'character';
    if (/^Unlock(ed)? a new character|^(Magdalene|Cain|Judas|Eve|Samson|Azazel|Lazarus|Eden|The Lost|Lilith|Keeper|Apollyon|The Forgotten|Bethany|Jacob and Esau)$/.test(a.name)) return 'unlock-char';
    if (/\d+ times|\d+ (coins|rocks|beds|poops|arcades|shopkeepers|portals)/i.test(u) || /Destroy|Beat Chapter \d+ \d+/.test(u)) return 'grind';
    return 'other';
  }

  const CATEGORIES = {
    character: 'Character unlocks (marks)', tainted: 'Tainted unlocks (marks)', challenge: 'Challenges',
    donation: 'Donation machines', grind: 'Counters & grinds', 'unlock-char': 'Characters', other: 'Other secrets',
  };

  function charByName(n) {
    n = n.trim();
    let tainted = false;
    if (n.startsWith('Tainted ')) { tainted = true; n = n.slice(8); }
    for (const [id, names] of Object.entries(ALIASES)) {
      if (names.includes(n)) return CHARACTERS.findIndex((c) => c.id === (tainted ? 't_' + id : id));
    }
    return -1;
  }

  // Rules that link completion marks to the achievements they unlock (game rules, so safe to auto-tick).
  const MARK_RULES = [];
  (function buildRules() {
    const allHard = BOSSES.map((b) => [b.id, 2]);
    for (const a of ACHIEVEMENTS) {
      let m, ci = -1, reqs = null;
      const u = a.unlock;
      if ((m = /^Defeat Mom's Heart or It Lives! on Hard mode as (.+)$/.exec(u))) {
        ci = charByName(m[1]); reqs = [['momsheart', 2]];
      } else if ((m = /^Earn all Hard mode Completion Marks as (.+)$/.exec(u))) {
        ci = charByName(m[1]); reqs = allHard;
      } else if ((m = /^(?:Complete |Defeat )(.+?) as (.+)$/.exec(u))) {
        ci = charByName(m[2]);
        const parts = m[1].replace(/, and |, | and /g, '|').split('|');
        const mapped = parts.map((p) => BOSS_ALIASES[p.trim()]);
        if (mapped.every(Boolean)) reqs = mapped;
      }
      if (ci >= 0 && reqs) MARK_RULES.push({ id: a.id, chars: [ci], reqs });
    }
    const nonTainted = CHARACTERS.map((c, i) => (c.tainted ? -1 : i)).filter((i) => i >= 0);
    MARK_RULES.push({ id: 276, chars: nonTainted, reqs: [['megasatan', 1]] }); // Mega
    MARK_RULES.push({ id: 547, chars: nonTainted, reqs: allHard }); // Mega Mush
    MARK_RULES.push({ id: 636, chars: CHARACTERS.map((_, i) => i), reqs: allHard }); // Death Certificate
  })();

  // ---- state ----
  function emptyState() {
    return {
      v: 1, ach: {}, marks: {}, items: 0, itemsTotal: 719, repPlus: true, autoLink: true, updated: 0,
      current: null, // index of the character being played right now
      timer: emptyTimer(),
    };
  }
  function emptyTimer() { return { running: false, elapsed: 0, startedAt: 0, sessions: 0, ended: false }; }
  function normTimer(t) {
    if (!t || typeof t !== 'object') return emptyTimer();
    return { running: !!t.running, elapsed: Math.max(0, +t.elapsed || 0), startedAt: +t.startedAt || 0, sessions: Math.max(0, +t.sessions || 0), ended: !!t.ended };
  }
  function normalize(s) {
    const e = emptyState();
    if (!s || typeof s !== 'object') return e;
    return {
      v: 1,
      ach: s.ach && typeof s.ach === 'object' ? s.ach : {},
      marks: s.marks && typeof s.marks === 'object' ? s.marks : {},
      items: Number.isFinite(+s.items) ? +s.items : 0,
      itemsTotal: Number.isFinite(+s.itemsTotal) && +s.itemsTotal > 0 ? +s.itemsTotal : e.itemsTotal,
      repPlus: s.repPlus !== false,
      autoLink: s.autoLink !== false,
      updated: +s.updated || 0,
      current: Number.isInteger(s.current) && s.current >= 0 && s.current < CHARACTERS.length ? s.current : null,
      timer: normTimer(s.timer),
    };
  }
  // Speedrun timer (milliseconds). Runs between Start and Pause; pausing is allowed only between runs.
  function timerMs(s, now = Date.now()) {
    const t = s.timer;
    return t.elapsed + (t.running && t.startedAt ? Math.max(0, now - t.startedAt) : 0);
  }
  function timerStart(s) {
    const t = s.timer;
    if (t.running) return;
    t.running = true; t.startedAt = Date.now();
    if (!t.sessions || t.ended) { t.sessions = (t.sessions || 0) + 1; t.ended = false; } // a new stream = a new session
  }
  function timerPause(s) { if (s.timer.running) { s.timer.elapsed = timerMs(s); s.timer.running = false; s.timer.startedAt = 0; } }
  function fmtTime(ms, tenths = true) {
    const t = Math.floor(ms / 100), d = t % 10, sec = Math.floor(t / 10) % 60, min = Math.floor(t / 600) % 60, h = Math.floor(t / 36000);
    const p2 = (n) => String(n).padStart(2, '0');
    return (h ? h + ':' + p2(min) : String(min)) + ':' + p2(sec) + (tenths ? '.' + d : '');
  }
  function load() {
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { return emptyState(); }
  }
  let channel = null;
  try { channel = new BroadcastChannel('deadgod-tracker'); } catch (_) { /* old browser */ }
  // keepTime: store a state that came from another device without restamping it.
  function save(state, keepTime) {
    if (!keepTime) state.updated = Date.now();
    if (state.ach[637] && state.timer && state.timer.running) timerPause(state); // the run ends when Dead God pops
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* storage blocked */ }
    if (channel) channel.postMessage(state.updated);
  }
  // Calls fn whenever another tab, dock or browser source saves.
  function onExternalChange(fn) {
    let last = load().updated;
    const check = () => { const s = load(); if (s.updated !== last) { last = s.updated; fn(s); } };
    window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) check(); });
    if (channel) channel.onmessage = check;
    setInterval(check, 1500); // fallback for embedded browsers that don't fire events
  }

  const markKey = (ci, bi) => ci + ':' + BOSSES[bi].id;
  const getMark = (s, ci, bi) => s.marks[markKey(ci, bi)] || 0;
  function setMark(s, ci, bi, level) {
    if (level) s.marks[markKey(ci, bi)] = level; else delete s.marks[markKey(ci, bi)];
    return s.autoLink ? applyRules(s) : [];
  }
  function ruleMet(s, r) {
    return r.chars.every((ci) => r.reqs.every(([bid, lvl]) => (s.marks[ci + ':' + bid] || 0) >= lvl));
  }
  // Ticks achievements whose mark requirements are all met. Never unticks. Returns newly ticked ids.
  function applyRules(s) {
    const added = [];
    for (const r of MARK_RULES) if (!s.ach[r.id] && ruleMet(s, r)) { s.ach[r.id] = 1; added.push(r.id); }
    return added;
  }

  function activeAchievements(s) {
    return ACHIEVEMENTS.filter((a) => s.repPlus || !a.repPlus);
  }

  function stats(s) {
    const list = activeAchievements(s);
    const achDone = list.filter((a) => s.ach[a.id]).length;
    const chal = list.filter((a) => a.challenge);
    let anyMarks = 0, hardMarks = 0;
    for (let ci = 0; ci < CHARACTERS.length; ci++) for (let bi = 0; bi < BOSSES.length; bi++) {
      const m = getMark(s, ci, bi); if (m) anyMarks++; if (m === 2) hardMarks++;
    }
    const totalMarks = CHARACTERS.length * BOSSES.length;
    const items = Math.min(s.items, s.itemsTotal);
    return {
      achDone, achTotal: list.length,
      chalDone: chal.filter((a) => s.ach[a.id]).length, chalTotal: chal.length,
      anyMarks, hardMarks, totalMarks,
      items, itemsTotal: s.itemsTotal,
      deadGod: !!s.ach[637],
      // Overall % = achievements and items weighted by count, so 100% means Dead God is really done.
      overall: (achDone + items) / (list.length + s.itemsTotal),
    };
  }

  function pct(n, d, digits = 1) { return d ? ((100 * n) / d).toFixed(digits) : '0'; }

  window.DG = {
    STORAGE_KEY, CHARACTERS, BOSSES, ACHIEVEMENTS, ACH_BY_ID, CATEGORIES, MARK_RULES,
    load, save, normalize, emptyState, emptyTimer, timerMs, timerStart, timerPause, fmtTime, onExternalChange, getMark, setMark, applyRules,
    activeAchievements, stats, pct,
  };
})();

/* Compact save code: a short base64url string holding the whole state, for moving
   progress between devices or baking it into an overlay link. */
(function () {
  const DG = window.DG;
  const MAX_ID = 641;
  function encode(s) {
    const markCount = DG.CHARACTERS.length * DG.BOSSES.length;
    const core = 6 + Math.ceil(MAX_ID / 8) + Math.ceil(markCount / 4);
    const bytes = new Uint8Array(core + 20);
    bytes[0] = 2;
    bytes[1] = (s.repPlus ? 1 : 0) | (s.autoLink ? 2 : 0);
    bytes[2] = s.items >> 8; bytes[3] = s.items & 255;
    bytes[4] = s.itemsTotal >> 8; bytes[5] = s.itemsTotal & 255;
    let o = 6;
    for (let id = 1; id <= MAX_ID; id++) if (s.ach[id]) bytes[o + ((id - 1) >> 3)] |= 1 << ((id - 1) & 7);
    o += Math.ceil(MAX_ID / 8);
    let k = 0;
    for (let ci = 0; ci < DG.CHARACTERS.length; ci++) for (let bi = 0; bi < DG.BOSSES.length; bi++, k++) {
      bytes[o + (k >> 2)] |= DG.getMark(s, ci, bi) << ((k & 3) * 2);
    }
    // v2 extras: current character, timer
    const dv = new DataView(bytes.buffer, core);
    dv.setUint8(0, s.current == null ? 255 : s.current);
    dv.setUint8(1, (s.timer.running ? 1 : 0) | (s.timer.ended ? 2 : 0));
    dv.setFloat64(2, s.timer.elapsed);
    dv.setFloat64(10, s.timer.startedAt);
    dv.setUint16(18, Math.min(65535, s.timer.sessions));
    let bin = ''; bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(code) {
    code = String(code).trim();
    if (code.startsWith('{')) return DG.normalize(JSON.parse(code)); // accept JSON backups too
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const b = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    if (b[0] !== 1 && b[0] !== 2) throw new Error('Unknown save code version');
    const s = DG.emptyState();
    s.repPlus = !!(b[1] & 1); s.autoLink = !!(b[1] & 2);
    s.items = (b[2] << 8) | b[3]; s.itemsTotal = (b[4] << 8) | b[5] || s.itemsTotal;
    let o = 6;
    for (let id = 1; id <= MAX_ID; id++) if (b[o + ((id - 1) >> 3)] & (1 << ((id - 1) & 7))) s.ach[id] = 1;
    o += Math.ceil(MAX_ID / 8);
    let k = 0;
    for (let ci = 0; ci < DG.CHARACTERS.length; ci++) for (let bi = 0; bi < DG.BOSSES.length; bi++, k++) {
      const l = (b[o + (k >> 2)] >> ((k & 3) * 2)) & 3;
      if (l) s.marks[ci + ':' + DG.BOSSES[bi].id] = Math.min(l, 2);
    }
    o += Math.ceil((DG.CHARACTERS.length * DG.BOSSES.length) / 4);
    if (b[0] === 2 && b.length >= o + 20) {
      const dv = new DataView(b.buffer, o);
      const cur = dv.getUint8(0); s.current = cur < DG.CHARACTERS.length ? cur : null;
      s.timer = { ended: !!(dv.getUint8(1) & 2), running: (dv.getUint8(1) & 1) === 1, elapsed: dv.getFloat64(2) || 0, startedAt: dv.getFloat64(10) || 0, sessions: dv.getUint16(18) };
    }
    return s;
  }
  DG.encode = encode; DG.decode = decode;
})();

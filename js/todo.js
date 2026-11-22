/* To-do roadmap: turns what is still unticked into an ordered list of things to work on.
   The phase order is a common Dead God route, not the only one. Every task is worked out
   from the checklist state, so the list updates as you tick. */
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

  function build(s) {
    const active = new Set(DG.activeAchievements(s).map((a) => a.id));
    const phases = [];
    const phase = (id, title, note, items) => phases.push({ id, title, note, items: items.filter(Boolean) });

    const heartDone = HEART_KILLS.filter((id) => has(s, id)).length;
    phase('start', 'Open up the game', 'Beat Mom and keep beating Mom\'s Heart. This opens new floors and items.', [
      achTask(s, 4),
      { key: 'hearts', title: "Beat Mom's Heart 11 times", detail: 'Unlocks It Lives!, Blue Womb and more along the way',
        progress: [heartDone, HEART_KILLS.length], done: heartDone === HEART_KILLS.length, tab: 'achievements' },
      achTask(s, 57), achTask(s, 78), achTask(s, 58),
      achTask(s, 320, { detail: 'Defeat Hush (Blue Womb needs Mom\'s Heart 10 times)' }),
      achTask(s, 338), achTask(s, 341),
      achTask(s, 411), achTask(s, 635), achTask(s, 407), achTask(s, 415),
    ]);

    phase('chars', 'Unlock every character', 'Each new character opens a row of completion marks.',
      Object.entries(CHAR_UNLOCK).map(([cid, id]) => achTask(s, id, { title: 'Unlock ' + DG.CHARACTERS.find((c) => c.id === cid).name })));

    phase('marks', 'Completion marks (base characters)', 'Play on Hard: a hard mark also counts as the normal one, so you never repeat a run. Characters closest to finished are listed first.',
      DG.CHARACTERS.map((c, ci) => (c.tainted ? null : markTask(s, ci))).filter(Boolean).sort(byProgress));

    phase('tainted', 'Tainted characters', 'Use the Red Key on the closet in Home as each character to unlock their tainted version, then earn their marks.',
      DG.CHARACTERS.map((c, ci) => (c.tainted ? markTask(s, ci) : null)).filter(Boolean).sort(byProgress));

    const chal = DG.ACHIEVEMENTS.filter((a) => a.challenge).sort((a, b) => a.challenge - b.challenge);
    phase('challenges', 'Challenges', 'Some challenges stay locked until you unlock things first. The game shows which ones you can play.',
      chal.map((a) => achTask(s, a.id, { title: `#${a.challenge} ${a.challengeName}`, detail: 'Reward: ' + a.name })));

    const ofCat = (cat) => DG.ACHIEVEMENTS.filter((a) => a.category === cat && active.has(a.id)).map((a) => a.id);
    phase('grind', 'Donations, counters and grinds', 'These build up over many runs, so keep them in mind every run.', [
      groupTask(s, 'donate', 'Donation machines', ofCat('donation'), 'Shop Donation Machine up to 999 coins, Greed Donation Machine up to 1000', 'achievements'),
      ...ofCat('grind').map((id) => achTask(s, id)),
    ]);

    phase('secrets', 'Other secrets', 'One-off unlocks, often easy to do on the way.',
      ofCat('other').filter((id) => ![636, 637].includes(id) && !phases.some((p) => p.items.some((t) => t.achId === id))).map((id) => achTask(s, id)));

    const st = DG.stats(s);
    phase('final', 'Final stretch', 'Collect every item, then the last achievements fall into place.', [
      { key: 'items', title: 'Fill the collection page', detail: `${st.itemsTotal - st.items} items to go`, progress: [st.items, st.itemsTotal], done: st.items >= st.itemsTotal, tab: 'items' },
      s.repPlus ? groupTask(s, 'online', 'Repentance+ achievements', [638, 639, 640, 641], 'Play online, win online, win an online daily, defeat Mom', 'achievements') : null,
      achTask(s, 636), achTask(s, 637),
    ]);

    for (const p of phases) {
      p.total = p.items.length;
      p.doneCount = p.items.filter((t) => t.done).length;
    }
    return phases;
  }

  function byProgress(a, b) {
    if (a.locked !== b.locked) return a.locked ? 1 : -1;
    if (a.done !== b.done) return a.done ? 1 : -1;
    const pa = a.progress ? a.progress[0] / a.progress[1] : 0, pb = b.progress ? b.progress[0] / b.progress[1] : 0;
    return pb - pa;
  }

  // A short mix of open tasks: up to two from each unfinished phase, earliest phases first.
  function nextUp(s, count = 6) {
    const out = [];
    for (const p of build(s)) {
      const open = p.items.filter((t) => !t.done && !t.locked).slice(0, 2);
      for (const t of open) { out.push({ ...t, phase: p.title }); if (out.length >= count) return out; }
    }
    return out;
  }

  DG.todo = { build, nextUp };
})();

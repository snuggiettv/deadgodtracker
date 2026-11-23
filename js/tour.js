/* First-visit walkthrough: steps through each tab with Back / Next and highlights what it does.
   "Don't show this again" is remembered per browser. The ? button in the header replays it. */
(function () {
  'use strict';
  const KEY = 'deadgod-tracker:tour-done';
  const STEPS = [
    { title: 'Welcome to the Dead God Tracker', body: 'A checklist for a DeadGod% run on console, plus an overlay for your stream. Everything you tick is saved in this browser, and can sync to your phone, a mod and the overlay. This quick tour shows what each tab does.' },
    { tab: 'todo', target: '[data-tab="todo"]', title: 'To-do', body: 'Your route, step by step (adapted from D0ggy\'s and neonomi\'s splits). Next up shows what to play now. Steps tick themselves off as you earn marks, and Play → jumps straight into that character.' },
    { tab: 'run', target: '[data-tab="run"]', title: 'This run', body: 'The page to keep open while you play. Start the speedrun timer, pick who you\'re playing, choose Normal or Hard, then tap each boss as you beat it. Big buttons, so it works well for a mod on a phone.' },
    { tab: 'marks', target: '[data-tab="marks"]', title: 'Completion marks', body: 'All 34 characters × 12 marks in one grid. Click a mark to cycle none → Normal → Hard (Greed → Greedier). Marks also tick the achievements they unlock.' },
    { tab: 'achievements', target: '[data-tab="achievements"]', title: 'Achievements', body: 'All 641 secrets with how to unlock each one. Search by name or #id, and filter to what\'s still locked.' },
    { tab: 'challenges', target: '[data-tab="challenges"]', title: 'Challenges', body: 'The 45 challenges and their rewards. Ticking one here ticks its reward achievement too.' },
    { tab: 'items', target: '#sync-card', title: 'Sync, mods and backups', body: 'Turn on sync to link your phone, other browsers and the overlay. You\'ll get a room code and an editor link for a mod. Keep both private and off stream. This tab also has the item counter, settings and backups.' },
    { tab: 'overlay', target: '[data-tab="overlay"]', title: 'Overlay setup', body: 'Pick one or more views (summary, progress bar, mark grid, next up, timer, this run, splits). Tick several and the overlay rotates between them. Copy the link, and add it as a browser source in OBS or Meld. The preview shows what viewers will see.' },
    { target: '#htimer', title: 'Timer and Reset', body: 'The speedrun timer is always up here. Reset clears your progress, asks first, and gives you 15 seconds to undo.' },
    { target: '#contact', title: 'Suggestions or bugs?', body: 'Ideas and bug reports are welcome! Reach Snuggie on Discord: @Snuggie, or on X/Twitter: @akaSnuggie. Good luck on the road to Dead God!' },
  ];

  let i = 0, root = null, lastHl = [];
  const $ = (s) => document.querySelector(s);

  function seen() { try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; } }
  function setSeen(v) { try { if (v) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (_) { /* ignore */ } }

  function build() {
    root = document.createElement('div');
    root.className = 'tour';
    root.innerHTML = `
      <div class="tour-backdrop"></div>
      <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <div class="tour-top"><span class="tour-step"></span><button class="tour-x" aria-label="Close tour">✕</button></div>
        <h3 id="tour-title"></h3>
        <p class="tour-body"></p>
        <div class="tour-dots"></div>
        <div class="tour-nav">
          <button class="tour-prev">← Back</button>
          <label class="tour-dont"><input type="checkbox"> Don't show this again</label>
          <button class="tour-next primary">Next →</button>
        </div>
      </div>`;
    document.body.append(root);
    root.querySelector('.tour-x').onclick = close;
    root.querySelector('.tour-backdrop').onclick = close;
    root.querySelector('.tour-prev').onclick = () => go(i - 1);
    root.querySelector('.tour-next').onclick = () => (i === STEPS.length - 1 ? close() : go(i + 1));
    root.querySelector('.tour-dont input').onchange = (e) => setSeen(e.target.checked);
    root.querySelector('.tour-dots').append(...STEPS.map((_, n) => {
      const d = document.createElement('button'); d.className = 'tour-dot'; d.setAttribute('aria-label', 'Step ' + (n + 1)); d.onclick = () => go(n); return d;
    }));
    document.addEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); root.querySelector('.tour-next').click(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (i > 0) go(i - 1); }
    else if (e.key === 'Escape') close();
  }

  function go(n) {
    i = Math.max(0, Math.min(STEPS.length - 1, n));
    const st = STEPS[i];
    if (st.tab) { const b = $(`nav.tabs [data-tab="${st.tab}"]`); if (b) b.click(); }
    lastHl.forEach((el) => el.classList.remove('tour-hl'));
    lastHl = [];
    if (st.target) {
      const el = $(st.target);
      if (el) { el.classList.add('tour-hl'); lastHl.push(el); window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 90), behavior: 'smooth' }); }
    } else window.scrollTo({ top: 0, behavior: 'smooth' });
    root.querySelector('.tour-step').textContent = `${i + 1} / ${STEPS.length}`;
    root.querySelector('#tour-title').textContent = st.title;
    root.querySelector('.tour-body').textContent = st.body;
    root.querySelector('.tour-prev').disabled = i === 0;
    root.querySelector('.tour-next').textContent = i === STEPS.length - 1 ? 'Finish' : 'Next →';
    root.querySelectorAll('.tour-dot').forEach((d, n) => d.classList.toggle('on', n === i));
    root.querySelector('.tour-next').focus({ preventScroll: true });
  }

  function open() {
    if (!root) build();
    root.hidden = false;
    document.body.classList.add('touring');
    root.querySelector('.tour-dont input').checked = seen();
    go(0);
  }
  function close() {
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove('touring');
    lastHl.forEach((el) => el.classList.remove('tour-hl'));
    lastHl = [];
    const todo = $('nav.tabs [data-tab="todo"]'); if (todo) todo.click();
    window.scrollTo({ top: 0 });
  }

  document.getElementById('help-btn').addEventListener('click', open);
  if (!seen()) setTimeout(open, 400);
  window.DGTour = { open };
})();

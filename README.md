# Dead God Tracker (manual, console-friendly)

A static web checklist for a Dead God run in *The Binding of Isaac: Repentance / Repentance+*,
made for console players who can't read a save file. Tick things off in the browser and show
progress on stream with an OBS / Meld browser-source overlay. No build step, no server.

## Pages
- `index.html` – the checklist: a To-do roadmap of what to work on next, completion-mark grid (34 characters × 12 marks, normal/hard),
  all 641 achievements with search and filters, the 45 challenges, collection-page item count,
  backup/restore and the overlay link builder.
- `overlay.html` – the stream overlay. Options in the URL:
  - `view=summary` (default) · `bar` · `marks` · `remaining` · `next` (to-do, `&count=4`) · `timer` · `run` (current character + marks + timer)
  - `timer=0` to hide the timer in the summary
  - `scale=1.5` to resize, `bg=1` for a dark backdrop (default is transparent), `tainted=0` to hide tainted rows in the grid
  - `room=…` to follow a sync room
  - `#code=…` to show a frozen snapshot from a save code instead of this browser's progress

## How progress is stored
Everything lives in the browser's `localStorage` on the site's origin. The overlay reads the same
storage, so it updates live when both are open in the same browser profile. In OBS, add the
checklist as a **Custom Browser Dock** and the overlay as a **Browser source**: they share storage.
Use *Download backup* or *Copy save code* to move progress between devices.

### Cross-device sync (phone, Meld, any browser)
Turn on **Sync between devices** under *Items & settings*. It creates a random room and sends each
change as a short save code through [ntfy.sh](https://ntfy.sh), a free public relay with no account.
Open the room link on your other devices; the overlay link includes the room too (`&room=…`).
The newest change wins. Anyone with the room link can read and change your progress, so keep it private.
ntfy.sh keeps the last message for about 12 hours and every device keeps its own copy, so nothing is lost
when the relay forgets. The free relay has daily message limits; changes are batched to stay well under them.

Ticking a completion mark auto-ticks the achievements it unlocks (can be turned off in settings).

## Hosting on GitHub Pages
Push this folder to a repo, then Settings → Pages → Deploy from branch → `main` / root.

## Credits
The To-do route is adapted from D0ggy's and neonomi's DeadGod% Repentance+ split sheet (tips paraphrased).

Achievement names and unlock conditions are summarised from the
[Binding of Isaac: Rebirth Wiki](https://bindingofisaacrebirth.wiki.gg/wiki/Achievements), CC BY-SA 3.0.
The Binding of Isaac is © Edmund McMillen and Nicalis. Fan-made and not affiliated.
No code, data or art from other trackers is used.

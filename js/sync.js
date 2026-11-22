/* Cross-device sync through ntfy.sh, a free public pub/sub relay that needs no account.
   Each "room" is a random, unguessable topic. Every save publishes the compact save code;
   every device and overlay in the room subscribes and keeps whichever version is newest.
   ntfy.sh keeps the last message for about 12 hours, and each device also keeps its own copy. */
(function () {
  'use strict';
  const DG = window.DG;
  const RELAY = 'https://ntfy.sh/';
  const ROOM_KEY = 'deadgod-tracker:room';

  const validRoom = (r) => typeof r === 'string' && /^[a-z0-9]{12,40}$/.test(r);
  function getRoom() { try { const r = localStorage.getItem(ROOM_KEY); return validRoom(r) ? r : null; } catch (_) { return null; } }
  function setRoom(r) { try { if (r) localStorage.setItem(ROOM_KEY, r); else localStorage.removeItem(ROOM_KEY); } catch (_) { /* ignore */ } }
  function newRoom() {
    const b = new Uint8Array(12); crypto.getRandomValues(b);
    return Array.from(b, (x) => x.toString(36).padStart(2, '0')).join('').slice(0, 20);
  }
  const topic = (room) => 'deadgod-' + room;

  function parse(msg) {
    const i = msg.indexOf('.');
    if (i < 1) return null;
    const updated = +msg.slice(0, i);
    try { const s = DG.decode(msg.slice(i + 1)); s.updated = updated; return s; } catch (_) { return null; }
  }

  // Connects to a room. onRemote(state) runs for every newer state from another device.
  // onStatus('connecting' | 'live' | 'offline') reports the connection.
  function connect(room, { onRemote, onStatus = () => {}, getLocal }) {
    let es = null, closed = false, remoteUpdated = 0, pending = null;
    const status = (s) => onStatus(s);

    function open() {
      if (closed) return;
      status('connecting');
      es = new EventSource(RELAY + topic(room) + '/sse?since=latest');
      es.onopen = () => status('live');
      es.onmessage = (e) => {
        let data; try { data = JSON.parse(e.data); } catch (_) { return; }
        if (data.event !== 'message' || !data.message) return;
        const s = parse(data.message);
        if (!s) return;
        remoteUpdated = Math.max(remoteUpdated, s.updated);
        const local = getLocal ? getLocal() : null;
        if (!local || s.updated > local.updated) onRemote(s);
      };
      es.onerror = () => { status(navigator.onLine === false ? 'offline' : 'connecting'); };
    }
    open();

    return {
      // Publishes soon (batched), so a burst of ticks becomes one message.
      publish(state, delay = 1200) {
        clearTimeout(pending);
        pending = setTimeout(() => {
          if (state.updated <= remoteUpdated) return;
          remoteUpdated = state.updated;
          fetch(RELAY + topic(room), { method: 'POST', body: state.updated + '.' + DG.encode(state) })
            .then((r) => status(r.ok ? 'live' : 'error'))
            .catch(() => status('offline'));
        }, delay);
      },
      // Shares local progress if the room has nothing newer (e.g. after the relay forgot it).
      seedIfNewer(state) { if (state.updated > remoteUpdated && state.updated > 0) this.publish(state, 0); },
      close() { closed = true; clearTimeout(pending); if (es) es.close(); },
    };
  }

  DG.sync = { getRoom, setRoom, newRoom, validRoom, connect };
})();

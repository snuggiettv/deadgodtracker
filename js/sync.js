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

  // ---- read-only viewer feed ----
  // Editors also post every update to a second topic, signed with an Ed25519 key derived from the room.
  // A viewer link carries only the public key: it finds the feed topic from it and accepts only messages
  // signed by an editor. It can't recover the room, so it can't edit, and anything else posted there is ignored.
  const nacl = window.nacl;
  const te = new TextEncoder();
  const b64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const hex = (bytes) => Array.from(bytes, (x) => x.toString(16).padStart(2, '0')).join('');
  const keyCache = new Map();
  function roomKeys(room) {
    if (!keyCache.has(room)) keyCache.set(room, nacl.sign.keyPair.fromSeed(nacl.hash(te.encode('deadgod-tracker viewer key v1:' + room)).slice(0, 32)));
    return keyCache.get(room);
  }
  const validWatch = (w) => typeof w === 'string' && /^[A-Za-z0-9_-]{43}$/.test(w);
  function watchKey(room) { return b64u(roomKeys(room).publicKey); }
  const feedTopic = (watch) => 'deadgod-v-' + hex(nacl.hash(unb64u(watch))).slice(0, 32);
  function publishFeed(room, state) {
    const body = state.updated + '.' + DG.encode(state);
    const sig = b64u(nacl.sign.detached(te.encode(body), roomKeys(room).secretKey));
    return fetch(RELAY + feedTopic(watchKey(room)), { method: 'POST', body: body + '.' + sig }).catch(() => {});
  }
  // Follows a viewer feed. onRemote(state) gets each newer, correctly signed state.
  function watch(key, { onRemote, onStatus = () => {} }) {
    const pub = unb64u(key);
    let es = null, newest = 0;
    function open() {
      onStatus('connecting');
      es = new EventSource(RELAY + feedTopic(key) + '/sse?since=latest');
      es.onopen = () => onStatus('live');
      es.onmessage = (e) => {
        let data; try { data = JSON.parse(e.data); } catch (_) { return; }
        if (data.event !== 'message' || !data.message) return;
        const j = data.message.lastIndexOf('.');
        if (j < 1) return;
        const body = data.message.slice(0, j);
        let ok = false;
        try { ok = nacl.sign.detached.verify(te.encode(body), unb64u(data.message.slice(j + 1)), pub); } catch (_) { ok = false; }
        if (!ok) return;
        const s = parse(body);
        if (s && s.updated > newest) { newest = s.updated; onRemote(s); }
      };
      es.onerror = () => onStatus(navigator.onLine === false ? 'offline' : 'connecting');
    }
    open();
    return { close() { if (es) es.close(); } };
  }

  function parse(msg) {
    const i = msg.indexOf('.');
    if (i < 1) return null;
    const updated = +msg.slice(0, i);
    try { const s = DG.decode(msg.slice(i + 1)); s.updated = updated; return s; } catch (_) { return null; }
  }

  // Connects to a room. onRemote(state) runs for every newer state from another device.
  // onStatus('connecting' | 'live' | 'offline') reports the connection.
  // feed: also mirror each update to the signed read-only viewer feed (editors only).
  function connect(room, { onRemote, onStatus = () => {}, getLocal, feed = false }) {
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
          if (feed) publishFeed(room, state);
        }, delay);
      },
      // Shares local progress if the room has nothing newer (e.g. after the relay forgot it).
      seedIfNewer(state) {
        if (state.updated > remoteUpdated && state.updated > 0) this.publish(state, 0);
        else if (feed && state.updated > 0) publishFeed(room, state); // make sure viewers have the latest after the relay forgets
      },
      close() { closed = true; clearTimeout(pending); if (es) es.close(); },
    };
  }

  DG.sync = { getRoom, setRoom, newRoom, validRoom, connect, watch, watchKey, validWatch };
})();

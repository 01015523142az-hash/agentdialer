/* dialer/staff-shell.js
 *
 * v670. The staff portal's header furniture for the two dialer consoles:
 * the notification bell and the profile menu. ONE FILE, LOADED BY BOTH
 * CONSOLES, so they cannot drift; tools/publish-dialer.py copies it into both
 * Pages sites next to index.html.
 *
 * v674: the internal chat that v670/v671 added here was REMOVED at the floor's
 * request -- staff chat lives in the staff portal. What stayed: the bell
 * (staff_notifications, live), the profile menu, and the presence heartbeat,
 * so an agent working in the dialer still shows active in the portal's chat.
 *
 * Usage, once signed in:
 *   const shell = StaffShell.init({ sb, userId, headerRight, signOutBtn });
 *   shell.notify({ title, body, priority, icon, onClick, key });
 */
(function () {
  'use strict';

  const CSS = `
  .ss-wrap{position:relative;display:inline-flex}
  .ss-icon-btn{position:relative;width:34px;height:34px;border-radius:50%;padding:0;
    background:transparent;border:1px solid var(--border-light);color:var(--text-2);
    display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;
    transition:border-color .15s,color .15s,background-color .15s}
  .ss-icon-btn:hover{border-color:var(--focus);color:var(--focus);background:var(--focus-dim)}
  .ss-bell-icon{display:inline-block;transform-origin:50% 0%}
  .ss-icon-btn.ringing .ss-bell-icon{animation:ssRing .9s ease-in-out infinite}
  @keyframes ssRing{0%,100%{transform:rotate(0)}10%{transform:rotate(14deg)}20%{transform:rotate(-12deg)}
    30%{transform:rotate(10deg)}40%{transform:rotate(-8deg)}50%{transform:rotate(6deg)}60%{transform:rotate(-4deg)}
    70%{transform:rotate(2deg)}80%,90%{transform:rotate(0)}}
  @media (prefers-reduced-motion:reduce){.ss-icon-btn.ringing .ss-bell-icon{animation:none}}
  .ss-badge{position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;
    background:var(--danger);color:#fff;font-family:var(--mono);font-size:9.5px;font-weight:700;
    display:flex;align-items:center;justify-content:center}
  .ss-hide{display:none!important}

  .ss-nc{position:absolute;top:calc(100% + 10px);right:0;width:380px;max-width:calc(100vw - 32px);
    max-height:min(560px,calc(100vh - 120px));background:var(--card);border:1px solid var(--border);
    border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.35);z-index:300;display:flex;flex-direction:column;overflow:hidden}
  .ss-nc-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0}
  .ss-nc-title{font-size:14px;font-weight:800;color:var(--text)}
  .ss-x{background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:18px;line-height:1;
    padding:2px 6px;border-radius:6px}
  .ss-x:hover{color:var(--text);background:var(--card-hover)}
  .ss-nc-note{padding:8px 16px 0;font-size:11.5px;color:var(--text-2);line-height:1.45}
  .ss-nc-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 16px 10px}
  .ss-toggle{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:12px;color:var(--text)}
  .ss-switch{width:38px;height:21px;border-radius:999px;padding:0;background:var(--idle,#39414E);position:relative;
    cursor:pointer;border:1px solid rgba(128,138,153,.45);transition:background .16s}
  .ss-switch[aria-checked="true"]{background:var(--good,#22C55E);border-color:transparent}
  .ss-knob{position:absolute;top:2.5px;left:2.5px;width:16px;height:16px;border-radius:50%;background:#fff;
    transition:transform .16s;box-shadow:0 1px 3px rgba(0,0,0,.35)}
  .ss-switch[aria-checked="true"] .ss-knob{transform:translateX(17px)}
  .ss-more-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:20;background:var(--card);
    border:1px solid var(--border-light);border-radius:12px;box-shadow:0 14px 34px -10px rgba(0,0,0,.6);
    padding:6px;min-width:186px}
  .ss-menu-item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 10px;border:none;border-radius:8px;
    cursor:pointer;background:none;color:var(--text);font-size:12.5px;font-weight:600;text-align:left}
  .ss-menu-item:hover{background:var(--card-hover)}
  .ss-tabs{display:flex;gap:18px;padding:0 16px;border-bottom:1px solid var(--border)}
  .ss-tab{background:none;border:none;padding:9px 0 8px;cursor:pointer;font-size:12.5px;font-weight:600;
    color:var(--text-dim);border-bottom:2px solid transparent;border-radius:0}
  .ss-tab.active{color:var(--text);border-bottom-color:var(--focus)}
  .ss-tab .ss-count{font-family:var(--mono);font-size:10px;margin-left:4px;color:var(--danger)}
  .ss-nc-list{padding:10px 12px 12px;flex:1;overflow-y:auto}
  .ss-empty{padding:26px 14px;text-align:center;font-size:12px;color:var(--text-dim)}
  .ss-item{display:block;position:relative;border-radius:12px;background:var(--inset);
    padding:13px 40px 11px 14px;margin-bottom:10px;cursor:pointer;transition:background .14s}
  .ss-item:hover{background:var(--card-hover)}
  .ss-item-title{font-size:13px;font-weight:600;color:var(--text);line-height:1.35}
  .ss-item-body{font-size:11.5px;color:var(--text-2);margin-top:3px;line-height:1.4}
  .ss-item-time{font-family:var(--mono);font-size:10px;color:var(--text-dim);margin-top:6px;text-align:right}
  .ss-dot{position:absolute;top:16px;right:14px;width:8px;height:8px;border-radius:50%;background:var(--focus)}

  .ss-pm-btn{width:34px;height:34px;padding:0;border-radius:50%;cursor:pointer;
    background:linear-gradient(to top right,#A8823F,var(--gold-soft,#E4C88F));color:#1A1206;
    border:1px solid rgba(201,166,107,.45);font-weight:800;font-size:12px;
    display:inline-flex;align-items:center;justify-content:center}
  .ss-pm-btn:hover{filter:brightness(1.08)}
  .ss-pm-btn, .ss-pm-avatar{overflow:hidden}
  .ss-pm-photo{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
  .ss-pm .ss-pm-section{margin:10px 0 0;padding:10px 0 0;border:0;border-top:1px solid var(--border);
    border-radius:0;background:none;box-shadow:none}
  .ss-pm .ss-pm-section h2{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--text-2);margin:0 0 6px}
  .ss-pm .ss-pm-section .muted, .ss-pm .ss-pm-section #gmailState{font-size:12px;line-height:1.45;word-break:break-word}
  .ss-pm{position:absolute;top:calc(100% + 8px);right:0;z-index:300;min-width:238px;max-width:300px;padding:12px;
    background:var(--card);border:1px solid var(--border-light);border-radius:14px;
    box-shadow:0 20px 44px -12px rgba(0,0,0,.6)}
  .ss-pm-head{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid var(--border)}
  .ss-pm-avatar{width:38px;height:38px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(to top right,#A8823F,var(--gold-soft,#E4C88F));color:#1A1206;font-weight:800;font-size:13px;
    display:flex;align-items:center;justify-content:center}
  .ss-pm-name{font-weight:700;font-size:13px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ss-pm-role{font-size:11px;font-weight:600;color:var(--gold-soft,#E4C88F);margin-top:1px}
  .ss-pm-email{font-family:var(--mono);font-size:10px;color:var(--text-dim);margin-top:2px;overflow:hidden;
    text-overflow:ellipsis;white-space:nowrap}
  .ss-pm .ss-signout{width:100%;margin:10px 0 0;padding:8px 12px;border-radius:9px;background:var(--inset);
    color:var(--text);border:1px solid var(--border-light);font-size:12px;font-weight:600;cursor:pointer}
  .ss-pm .ss-signout:hover:not(:disabled){background:var(--danger);border-color:var(--danger);color:#fff}

  /* A narrow window: pin the popups to the viewport instead of the button,
     which may sit near the left edge once the header wraps. */
  @media (max-width:640px){.ss-nc,.ss-pm{position:fixed;top:64px;left:8px;right:8px;width:auto;max-width:none}}

  /* v700: a teammate or client calling -- the staff portal's call card. */
  .ss-call{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:1000;
    width:min(430px,calc(100vw - 32px));display:flex;align-items:center;gap:12px;padding:14px 16px;
    border:2px solid var(--focus);border-radius:16px;background:var(--card);
    box-shadow:0 24px 50px -12px rgba(0,0,0,.7)}
  /* Narrow: who is calling on its own row, the two buttons under it. */
  @media (max-width:520px){
    .ss-call{top:12px;flex-wrap:wrap;gap:10px}
    .ss-call-info{flex:1 1 calc(100% - 60px)}
    .ss-call-no{margin-left:auto}
  }
  .ss-call-ico{width:44px;height:44px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;
    justify-content:center;background:rgba(201,166,107,.18);color:var(--focus);font-size:20px;
    animation:ssCallPulse 1.4s ease-in-out infinite}
  @keyframes ssCallPulse{0%,100%{opacity:1}50%{opacity:.45}}
  .ss-call-info{flex:1;min-width:0;display:flex;flex-direction:column}
  .ss-call-sub{font-size:11px;font-weight:600;color:var(--focus);margin-bottom:2px}
  .ss-call-name{font-size:14px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ss-call-btn{border:none;cursor:pointer;font-weight:700;flex-shrink:0;height:38px;
    box-shadow:0 6px 14px -4px rgba(0,0,0,.5)}
  .ss-call-no{width:38px;border-radius:50%;padding:0;background:var(--danger);color:#fff;font-size:15px}
  .ss-call-open{border-radius:999px;padding:0 14px;background:var(--good,#22C55E);color:#06301A;font-size:12px}
  @media (prefers-reduced-motion:reduce){.ss-call-ico{animation:none}}
  `;

  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = (s) => {
    const p = String(s || '').trim().split(/\s+/).filter(Boolean);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : String(s || '?').slice(0, 2).toUpperCase();
  };
  function ago(t) {
    const s = Math.max(0, (Date.now() - new Date(t).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 7 * 86400) return Math.floor(s / 86400) + 'd ago';
    return new Date(t).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  function clock(t) {
    const d = new Date(t);
    return new Date().toDateString() === d.toDateString()
      ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  const linkify = (text) => esc(text).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

  // Same icon per kind, and the same idea of "needs you" as the portal's
  // Priority tab: something a person has to act on, not just information.
  const KIND = {
    dialer_follow_up: { icon: '📞', priority: true },
    dialer_handoff: { icon: '🤝', priority: true },
    dialer_appointment: { icon: '📅', priority: true },
    dialer_task: { icon: '✅', priority: true },
    missed_call: { icon: '📞', priority: true },   // v700: voice_calls_missed_notify
  };

  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function audioCtx() {
    return chime.ctx || (chime.ctx = new (window.AudioContext || window.webkitAudioContext)());
  }
  // v685: browsers start audio switched off until the person has clicked or
  // typed on the page, and a context first made by a realtime notification
  // stays silent -- so the first chime of a session often never played. The
  // context is created and resumed on the first interaction instead, and every
  // later chime has sound.
  function primeAudio() {
    try { const ctx = audioCtx(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { /* no audio */ }
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
    document.addEventListener(ev, primeAudio, { capture: true, passive: true }));
  // v685: a priority notification (reminders, hand-offs) chimes twice.
  function chime(priority) {
    try {
      const ctx = audioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const notesAt = [[587.33, 0], [739.99, 0.09], [987.77, 0.18]];
      const seq = priority ? notesAt.concat(notesAt.map(([f, at]) => [f, at + 0.42])) : notesAt;
      seq.forEach(([f, at]) => {
        const o = ctx.createOscillator(); const g = ctx.createGain(); const s = ctx.currentTime + at;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.22, s + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.2);
        o.connect(g).connect(ctx.destination); o.start(s); o.stop(s + 0.22);
      });
    } catch (e) { /* no audio is not an error */ }
  }

  function init(opts) {
    const { sb, userId, headerRight, signOutBtn } = opts;
    if (!sb || !userId || !headerRight) throw new Error('StaffShell.init needs sb, userId and headerRight');
    if (init.done) return init.done;

    if (!document.getElementById('ss-css')) {
      const st = document.createElement('style'); st.id = 'ss-css'; st.textContent = CSS; document.head.appendChild(st);
    }

    // =============================================================== bell ===
    const notes = [];            // { key, icon, title, body, at, priority, readAt, durableId, onClick }
    let tab = 'priority';
    let unreadOnly = false;

    const bellWrap = el(`
      <div class="ss-wrap">
        <button class="ss-icon-btn" type="button" title="Notifications" aria-haspopup="dialog">
          <span class="ss-bell-icon">🔔</span><span class="ss-badge ss-hide">0</span></button>
        <div class="ss-nc ss-hide" role="dialog" aria-label="Notifications">
          <div class="ss-nc-head"><span class="ss-nc-title">Notifications</span><button type="button" class="ss-x" data-close>✕</button></div>
          <div class="ss-nc-note">Notifications sent to this inbox can be viewed for up to 30 days.</div>
          <div class="ss-nc-controls">
            <label class="ss-toggle"><span>Only show unread</span>
              <button type="button" class="ss-switch" role="switch" aria-checked="false" data-unread><span class="ss-knob"></span></button></label>
            <div class="ss-wrap"><button type="button" class="ss-x" data-more title="More">⋮</button>
              <div class="ss-more-menu ss-hide" data-menu>
                <button type="button" class="ss-menu-item" data-markall>✔ Mark all as read</button>
                <button type="button" class="ss-menu-item" data-clear>🗑 Clear all</button></div></div>
          </div>
          <div class="ss-tabs"><button type="button" class="ss-tab active" data-tab="priority">Priority<span class="ss-count"></span></button>
            <button type="button" class="ss-tab" data-tab="others">Others<span class="ss-count"></span></button></div>
          <div class="ss-nc-list"></div>
        </div>
      </div>`);
    const bellBtn = bellWrap.querySelector('.ss-icon-btn');
    const bellBadge = bellWrap.querySelector('.ss-badge');
    const nc = bellWrap.querySelector('.ss-nc');
    const ncList = nc.querySelector('.ss-nc-list');

    function renderBell() {
      const unread = notes.filter((n) => !n.readAt);
      bellBadge.textContent = unread.length > 99 ? '99+' : String(unread.length);
      bellBadge.classList.toggle('ss-hide', !unread.length);
      bellBtn.classList.toggle('ringing', unread.length > 0);
      nc.querySelectorAll('[data-tab]').forEach((b) => {
        const n = unread.filter((x) => (b.dataset.tab === 'priority') === x.priority).length;
        b.querySelector('.ss-count').textContent = n ? String(n) : '';
        b.classList.toggle('active', b.dataset.tab === tab);
      });
      if (nc.classList.contains('ss-hide')) return;
      const rows = notes.filter((n) => (tab === 'priority') === n.priority && (!unreadOnly || !n.readAt));
      ncList.innerHTML = rows.length ? rows.map((n) => `
        <div class="ss-item" data-key="${esc(n.key)}">
          <div class="ss-item-title">${esc(n.icon || '🔔')} ${esc(n.title)}</div>
          ${n.body ? `<div class="ss-item-body">${esc(n.body)}</div>` : ''}
          <div class="ss-item-time">${esc(ago(n.at))}</div>
          ${n.readAt ? '' : '<span class="ss-dot"></span>'}
        </div>`).join('') : `<div class="ss-empty">${unreadOnly ? 'Nothing unread' : 'No notifications'}</div>`;
      ncList.querySelectorAll('.ss-item').forEach((row) => {
        row.onclick = () => {
          const n = notes.find((x) => x.key === row.dataset.key);
          if (!n) return;
          markRead([n]);
          nc.classList.add('ss-hide');
          try { n.onClick && n.onClick(); } catch (e) { console.warn('notification click:', e); }
        };
      });
    }
    function markRead(list) {
      const now = new Date().toISOString();
      const ids = [];
      list.forEach((n) => { if (!n.readAt) { n.readAt = now; if (n.durableId) ids.push(n.durableId); } });
      if (ids.length) {
        sb.from('staff_notifications').update({ read_at: now }).in('id', ids).is('read_at', null)
          .then(({ error }) => { if (error) console.warn('mark read:', error.message); });
      }
      renderBell();
    }
    function notify(n) {
      const key = n.key || ('n' + Date.now() + Math.random().toString(36).slice(2, 6));
      const existing = notes.find((x) => x.key === key);
      if (existing) { Object.assign(existing, n, { key }); renderBell(); return; }
      notes.unshift({ icon: '🔔', body: '', at: Date.now(), priority: false, readAt: null, ...n, key });
      notes.sort((a, b) => new Date(b.at) - new Date(a.at));
      if (notes.length > 60) notes.length = 60;
      if (!n.silent) chime(Boolean(n.priority));
      renderBell();
    }
    function durable(row, silent) {
      const k = KIND[row.kind] || {};
      notify({
        key: 'd:' + row.id, durableId: row.id, icon: k.icon || '🔔', title: row.title, body: row.body || '',
        at: row.created_at, priority: Boolean(k.priority), readAt: row.read_at || null, silent,
        onClick: () => {
          if (!row.url) return;
          try {
            const u = new URL(row.url, location.href);
            if (u.host === location.host) { if (u.hash) location.hash = u.hash; else location.href = u.href; }
            else window.open(u.href, '_blank', 'noopener');
          } catch (e) { /* malformed url: nothing to open */ }
        },
      });
    }

    bellBtn.onclick = (e) => {
      e.stopPropagation();
      nc.classList.toggle('ss-hide');
      renderBell();
    };
    nc.querySelector('[data-close]').onclick = () => nc.classList.add('ss-hide');
    nc.querySelector('[data-unread]').onclick = (e) => {
      unreadOnly = !unreadOnly;
      e.currentTarget.setAttribute('aria-checked', String(unreadOnly));
      renderBell();
    };
    const moreMenu = nc.querySelector('[data-menu]');
    nc.querySelector('[data-more]').onclick = (e) => { e.stopPropagation(); moreMenu.classList.toggle('ss-hide'); };
    nc.querySelector('[data-markall]').onclick = () => { markRead(notes); moreMenu.classList.add('ss-hide'); };
    nc.querySelector('[data-clear]').onclick = () => { markRead(notes); notes.length = 0; moreMenu.classList.add('ss-hide'); renderBell(); };
    nc.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { tab = b.dataset.tab; renderBell(); }; });
    nc.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => { nc.classList.add('ss-hide'); moreMenu.classList.add('ss-hide'); });

    // The durable half: the last 30 days, unread and read (read ones stay
    // visible, as in the portal; "Only show unread" hides them).
    sb.from('staff_notifications').select('id, kind, title, body, url, created_at, read_at')
      .eq('user_id', userId).gt('created_at', new Date(Date.now() - 30 * 86400e3).toISOString())
      .order('created_at', { ascending: false }).limit(60)
      .then(({ data, error }) => {
        if (error) { console.warn('staff_notifications:', error.message); return; }
        (data || []).forEach((r) => durable(r, true));
      });

    // ============================================================ profile ===
    const pmWrap = el(`
      <div class="ss-wrap">
        <button class="ss-pm-btn" type="button" title="Your profile" aria-haspopup="menu" aria-expanded="false">—</button>
        <div class="ss-pm ss-hide" role="menu">
          <div class="ss-pm-head"><div class="ss-pm-avatar">—</div>
            <div style="min-width:0"><div class="ss-pm-name"></div><div class="ss-pm-role"></div><div class="ss-pm-email"></div></div></div>
        </div>
      </div>`);
    const pmBtn = pmWrap.querySelector('.ss-pm-btn');
    const pm = pmWrap.querySelector('.ss-pm');
    // The page's own Sign out button MOVES inside the menu rather than being
    // replaced, so its handler (close the session, release the contact, drop
    // the softphone -- in that order) is untouched. Same move the portal made.
    if (signOutBtn) {
      signOutBtn.classList.add('ss-signout');
      signOutBtn.classList.remove('signout-btn');
      signOutBtn.textContent = 'Sign out';
      pm.appendChild(signOutBtn);
    }
    pmBtn.onclick = (e) => {
      e.stopPropagation();
      const open = pm.classList.toggle('ss-hide') === false;
      pmBtn.setAttribute('aria-expanded', String(open));
    };
    pm.addEventListener('click', (e) => { if (e.target !== signOutBtn) e.stopPropagation(); });
    document.addEventListener('click', () => { pm.classList.add('ss-hide'); pmBtn.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      pm.classList.add('ss-hide'); nc.classList.add('ss-hide');
    });
    sb.from('profiles').select('full_name, email, role, title, department, avatar_url').eq('id', userId).maybeSingle()
      .then(({ data: p }) => {
        if (!p) return;
        const ini = initials(p.full_name || p.email);
        pmBtn.textContent = ini;
        pm.querySelector('.ss-pm-avatar').textContent = ini;
        // v715 (the owner: "make the profile picture in the staff portal show
        // in the dialer"). The photo set from the portal's profile menu is a
        // public avatars-bucket URL on profiles.avatar_url -- the same one the
        // portal shows. A link that fails to load falls back to the initials.
        if (p.avatar_url && /^https:\/\//.test(p.avatar_url)) {
          [pmBtn, pm.querySelector('.ss-pm-avatar')].forEach((target) => {
            const img = document.createElement('img');
            img.className = 'ss-pm-photo';
            img.alt = '';
            img.onerror = () => { target.textContent = ini; };
            img.src = p.avatar_url;
            target.textContent = '';
            target.appendChild(img);
          });
        }
        pm.querySelector('.ss-pm-name').textContent = p.full_name || p.email || '';
        pm.querySelector('.ss-pm-role').textContent = [p.title, p.department].filter(Boolean).join(' · ') || (p.role || '');
        pm.querySelector('.ss-pm-email').textContent = p.email || '';
        pmBtn.title = [p.full_name, p.title, p.department].filter(Boolean).join(' — ') || 'Your profile';
      });

    // Bell, then whatever the page already had (theme toggle), then the
    // profile menu last -- the portal's order.
    headerRight.appendChild(bellWrap);
    const theme = headerRight.querySelector('.theme-toggle-btn');
    if (theme) headerRight.appendChild(theme);
    headerRight.appendChild(pmWrap);

    // ========================================================== presence ===
    // v674: the chat was removed from both consoles (staff chat in the portal).
    // The presence heartbeat stays: without it an agent working in the dialer
    // shows OFFLINE in the portal's chat all shift. Same rules as the portal:
    // active / away by focus and 10 minutes idle, a busy/dnd override wins,
    // and offline on sign-out.
    const PRESENCE_HEARTBEAT_MS = 30000;
    const IDLE_AWAY_MS = 10 * 60 * 1000;
    let myManual = null;
    let myUntil = null;   // v702: a chat status can be set to clear itself
    let lastActivity = Date.now();
    ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((evt) =>
      window.addEventListener(evt, () => { lastActivity = Date.now(); }, { passive: true, capture: true }));
    function autoStatus() {
      if (document.visibilityState !== 'visible' || !document.hasFocus()) return 'away';
      return Date.now() - lastActivity >= IDLE_AWAY_MS ? 'away' : 'active';
    }
    function heartbeat() {
      const patch = {};
      // v702: an expired "clear after" status is cleared by whichever page is
      // open -- this one included.
      if (myUntil && Date.now() > new Date(myUntil).getTime()) {
        myManual = null; myUntil = null;
        Object.assign(patch, { chat_status_manual: null, status_text: null, status_emoji: null, status_until: null });
      }
      // 'Appear offline' is written as offline, without a fresh last_seen_at.
      patch.chat_status = myManual === 'invisible' ? 'offline' : (myManual || autoStatus());
      if (myManual !== 'invisible') patch.last_seen_at = new Date().toISOString();
      sb.from('profiles').update(patch).eq('id', userId).then(() => {}, () => {});
    }
    // The status is chosen in the staff portal's chat, so it is re-read every
    // couple of minutes rather than only at sign-in.
    function readManual() {
      return sb.from('profiles').select('chat_status_manual, status_until').eq('id', userId).maybeSingle()
        .then(({ data }) => { myManual = data?.chat_status_manual || null; myUntil = data?.status_until || null; });
    }
    readManual().then(() => heartbeat(), () => heartbeat());
    setInterval(readManual, 120000);
    setInterval(heartbeat, PRESENCE_HEARTBEAT_MS);
    document.addEventListener('visibilitychange', heartbeat);
    window.addEventListener('focus', heartbeat);
    window.addEventListener('blur', heartbeat);
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        sb.from('profiles').update({ chat_status: 'offline', last_seen_at: new Date().toISOString() })
          .eq('id', userId).then(() => {}, () => {});
      }, { capture: true });
    }

    // New notifications, live.
    sb.channel('staff-shell-' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_notifications', filter: `user_id=eq.${userId}` },
        (p) => { if (p.new) durable(p.new, false); })
      .subscribe();

    // ====================================================== calls (v700) ===
    // A teammate or client calling this person rings the STAFF PORTAL: calls
    // are WebRTC between two portal tabs. Someone working only in the dialer
    // never heard them -- the dialer did not listen, and because its presence
    // heartbeat shows them "active", the portal skipped the push as well. The
    // dialer now listens on the same channel and shows who is calling, with a
    // ring and a button that opens the staff portal; the caller repeats the
    // offer every 4 s (v700), so the portal tab that opens picks the call up
    // and rings there within seconds. Deliberately passive: it never answers
    // and never says "busy". It goes away when the caller hangs up, the call
    // is answered in a portal tab, or the offers stop.
    const callSeen = new Map();   // callRowId -> time of the last offer; -1 = declined here
    let callBanner = null, callFrom = null, callRow = null, callRingTimer = null, callWatch = null;
    function callRing() {
      try {
        const ctx = audioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {   // the portal's incoming ring
          const at = ctx.currentTime + i * 0.15;
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.frequency.value = f;
          g.gain.setValueAtTime(0.14, at); g.gain.exponentialRampToValueAtTime(0.001, at + 0.35);
          o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + 0.4);
        });
      } catch (e) { /* no audio is not an error */ }
    }
    function callDismiss() {
      clearInterval(callRingTimer); clearInterval(callWatch);
      callRingTimer = callWatch = null;
      if (callBanner) { callBanner.remove(); callBanner = null; }
      callFrom = callRow = null;
    }
    function callShow(m) {
      callFrom = m.from; callRow = m.callRowId;
      if (!callBanner) {
        callBanner = el(`<div class="ss-call" role="alertdialog" aria-label="Incoming call">
          <div class="ss-call-ico">☎</div>
          <div class="ss-call-info"><div class="ss-call-sub">Incoming call · answer it in the staff portal</div>
            <div class="ss-call-name"></div></div>
          <button type="button" class="ss-call-btn ss-call-no" title="Decline" aria-label="Decline call">✕</button>
          <button type="button" class="ss-call-btn ss-call-open" title="Open the staff portal to answer">Answer in portal</button>
        </div>`);
        document.body.appendChild(callBanner);
        callBanner.querySelector('.ss-call-open').onclick = () => {
          window.open('https://staffportal.proptechnologyai.com/', 'proptech-staff-portal');
        };
        callBanner.querySelector('.ss-call-no').onclick = () => {
          const to = callFrom;
          if (callRow) callSeen.set(callRow, -1);
          callDismiss();
          if (!to) return;
          const ch = sb.channel('call-signal-' + to);
          ch.subscribe((st) => {
            if (st !== 'SUBSCRIBED') return;
            ch.send({ type: 'broadcast', event: 'signal', payload: { type: 'decline', from: userId } })
              .then(() => sb.removeChannel(ch), () => sb.removeChannel(ch));
          });
        };
        callRing();
        callRingTimer = setInterval(callRing, 2500);
        // No offer for 12 s means it stopped ringing at the caller's end
        // (answered elsewhere, declined, or gave up).
        callWatch = setInterval(() => {
          if (Date.now() - (callSeen.get(callRow) || 0) > 12000) callDismiss();
        }, 2000);
      }
      callBanner.querySelector('.ss-call-name').textContent = m.fromName || 'Someone';
    }
    sb.channel('call-signal-' + userId)
      .on('broadcast', { event: 'signal' }, ({ payload: m }) => {
        if (!m) return;
        if (m.type === 'offer' || m.type === 'offer-retry') {
          if (!m.callRowId || callSeen.get(m.callRowId) === -1) return;
          callSeen.set(m.callRowId, Date.now());
          if (callRow && callRow !== m.callRowId) return;   // already showing another call
          callShow(m);
        } else if (m.type === 'claimed' && callBanner && m.callRowId === callRow) {
          callDismiss();                                    // answered in a portal tab
        } else if (m.type === 'hangup' && callBanner && m.from === callFrom) {
          callDismiss();                                    // the caller gave up
        }
      })
      .subscribe();

    // v696: a page can put its own section in the profile menu (the dialer's
    // Google card), above Sign out. The node is MOVED, ids and handlers
    // intact, the same way Sign out itself is.
    const addToMenu = (node) => {
      if (!node) return;
      node.classList.add('ss-pm-section');
      pm.insertBefore(node, signOutBtn && signOutBtn.parentNode === pm ? signOutBtn : null);
    };
    init.done = { notify, markRead, addToMenu };
    return init.done;
  }

  window.StaffShell = { init };
})();

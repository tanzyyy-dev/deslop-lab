/* DeSlop Lab viewer — vanilla JS, no build step. Data comes from data/steps.js (window.DESLOP_STEPS). */
(() => {
  'use strict';
  const steps = window.DESLOP_STEPS || [];
  const $ = (sel) => document.querySelector(sel);
  const slider = $('#slider');
  const ticks = $('#ticks');
  const frame = $('#frame');
  const frameBox = $('#frameBox');
  const stage = $('#stage');
  const scaleNote = $('#scaleNote');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const toast = $('#toast');
  const DEVICES = { mobile: 390, tablet: 820, desktop: 1366 };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };

  if (!steps.length) { $('#nowTitle').textContent = 'ステップのデータが見つかりません'; return; }

  let current = 0;
  let device = store.get('deslop-device') || (window.innerWidth < 700 ? 'mobile' : window.innerWidth < 1200 ? 'tablet' : 'desktop');

  /* ---------- helpers ---------- */
  const el = (tag, attrs = {}, ...children) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null) n.append(c);
    return n;
  };
  const list = (items, cls) => el('ul', { class: cls }, (items || []).map((t) => el('li', { text: t })));
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  /* ---------- timeline ---------- */
  slider.max = String(steps.length - 1);
  ticks.parentElement.style.setProperty('--count', steps.length);
  steps.forEach((s, i) => {
    const b = el('button', { type: 'button', class: 'tick', 'data-index': i, 'aria-label': `${s.label}：${s.title}` },
      el('span', { class: 'tick-num', text: s.label.replace('STEP ', '') }),
      el('span', { class: 'tick-name', text: s.short || s.title }));
    b.addEventListener('click', () => go(i, true));
    ticks.append(el('li', {}, b));
  });
  slider.addEventListener('input', () => go(Number(slider.value), false));
  prevBtn.addEventListener('click', () => go(current - 1, true));
  nextBtn.addEventListener('click', () => go(current + 1, true));
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    if (t === slider || t.closest('input, textarea, select, [role="tablist"], [contenteditable]')) return;
    if (e.key === 'ArrowLeft') { go(current - 1, true); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(current + 1, true); e.preventDefault(); }
  });

  /* ---------- device / scaling ---------- */
  const deviceBtns = [...document.querySelectorAll('.device-switch [role="radio"]')];
  const setDevice = (d, focus) => {
    device = DEVICES[d] ? d : 'desktop';
    store.set('deslop-device', device);
    deviceBtns.forEach((b) => {
      const on = b.dataset.device === device;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    fit();
  };
  deviceBtns.forEach((b, i) => {
    b.addEventListener('click', () => setDevice(b.dataset.device));
    b.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      setDevice(deviceBtns[(i + dir + deviceBtns.length) % deviceBtns.length].dataset.device, true);
    });
  });
  function fit() {
    const w = DEVICES[device];
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const scale = Math.min(1, sw / w);
    frameBox.style.width = `${w}px`;
    frameBox.style.height = `${sh / scale}px`;
    frameBox.style.transform = scale < 1 ? `scale(${scale})` : '';
    frameBox.style.marginInline = scale < 1 ? `${(sw - w) / 2}px` : '';
    scaleNote.textContent = scale < 1 ? `幅 ${w}px を ${Math.round(scale * 100)}% で表示` : '';
  }
  new ResizeObserver(fit).observe(stage);

  /* ---------- tabs ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    store.set('deslop-tab', tab.id);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j == null) return;
      e.preventDefault();
      selectTab(tabs[j], true);
    });
  });
  const savedTab = document.getElementById(store.get('deslop-tab') || '');
  if (savedTab && tabs.includes(savedTab)) selectTab(savedTab);

  /* ---------- panes ---------- */
  function renderOverview(s, i) {
    const prev = steps[i - 1];
    const pane = $('#pane-overview');
    pane.replaceChildren(
      el('p', { class: 'lead', text: s.summary }),
      el('h2', { text: s.phase === 'STEP1' ? 'このステップの位置づけ' : 'なぜ直すのか' }),
      list(s.reason),
      s.result ? el('h2', { text: '結果' }) : null,
      s.result ? el('p', { text: s.result }) : null,
      el('h2', { text: '記録' }),
      el('dl', { class: 'meta-list' },
        el('dt', { text: '日付' }), el('dd', { text: s.date }),
        el('dt', { text: '使用モデル' }), el('dd', {}, list(s.models)),
        prev ? el('dt', { text: '比較対象' }) : null,
        prev ? el('dd', { text: `${prev.label}（${prev.title}）` }) : null,
        el('dt', { text: '保存場所' }), el('dd', {}, el('a', { href: s.site, target: '_blank', rel: 'noopener', text: s.site })),
      ),
    );
  }
  function renderPrompts(s) {
    const pane = $('#pane-prompt');
    pane.replaceChildren(
      el('p', { text: 'AIに実際に渡したプロンプトです。誤字も含めて手を加えずに載せています。' }),
      ...s.prompts.map((p) => {
        const btn = el('button', { type: 'button', class: 'copy-btn', 'aria-label': `「${p.label}」をコピー` }, 'コピー');
        btn.addEventListener('click', () => copy(p.text, btn));
        return el('section', { class: 'prompt-block' },
          el('div', { class: 'prompt-head' }, el('h3', { text: p.label }), btn),
          el('pre', { tabindex: '0' }, el('code', { text: p.text })),
          el('div', { class: 'prompt-src' }, '原本: ', el('code', { text: p.file })));
      }),
    );
  }
  function renderChanges(s) {
    const pane = $('#pane-changes');
    const kids = [el('h2', { text: s.phase === 'STEP1' ? '作られたもの' : '変更内容' }), list(s.changes)];
    if (s.evaluation && s.evaluation.length) {
      kids.push(el('h2', { text: s.phase === 'STEP1' ? 'チェックリストによる評価' : 'このステップ後の評価' }),
        el('ul', { class: 'checks' }, s.evaluation.map((e) => el('li', {}, el('b', { text: e.check }), e.finding))));
    }
    const shotNames = { mobile: 'スマホ', tablet: 'タブレット', desktop: 'PC' };
    const shots = Object.entries(s.screenshots || {});
    if (shots.length) {
      kids.push(el('h2', { text: 'スクリーンショット（ページ全体）' }),
        el('div', { class: 'shots' }, shots.map(([k, f]) => el('a', { href: f, target: '_blank', rel: 'noopener', text: shotNames[k] || k }))));
    }
    pane.replaceChildren(...kids);
  }
  function renderLog(s) {
    const pane = $('#pane-log');
    const issues = s.issues || [];
    pane.replaceChildren(
      el('h2', { text: '意図どおりにならなかった点・再指示' }),
      issues.length
        ? el('div', {}, issues.map((x) => el('div', { class: 'issue' }, el('b', { text: x.title }), el('p', { text: x.detail }))))
        : el('p', { class: 'empty', text: 'このステップでは、再指示が必要な問題はありませんでした。' }),
      s.notes && s.notes.length ? el('h2', { text: '補足' }) : null,
      s.notes && s.notes.length ? list(s.notes) : null,
    );
  }
  async function copy(text, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      const ta = el('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text; document.body.append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
    }
    if (ok) {
      btn.textContent = 'コピーしました'; btn.dataset.copied = '';
      setTimeout(() => { btn.textContent = 'コピー'; delete btn.dataset.copied; }, 1800);
    }
    showToast(ok ? 'プロンプトをクリップボードにコピーしました' : 'コピーできませんでした。テキストを選択してコピーしてください');
  }

  /* ---------- navigation ---------- */
  function go(i, fromControl) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    const changed = i !== current || !frame.src;
    current = i;
    const s = steps[i];
    slider.value = String(i);
    slider.style.setProperty('--fill', `${(i / Math.max(1, steps.length - 1)) * 100}%`);
    slider.setAttribute('aria-valuetext', `${s.label}：${s.title}`);
    ticks.querySelectorAll('.tick').forEach((t, j) => t.toggleAttribute('aria-current', j === i) || (j === i && t.setAttribute('aria-current', 'step')));
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === steps.length - 1;
    $('#nowStep').textContent = s.label;
    $('#nowTitle').textContent = s.title;
    document.title = `${s.label} ${s.title} — DeSlop Lab`;
    $('#openLink').href = s.site;
    if (changed) {
      frame.src = s.site;
      frame.title = `${s.label}の制作物：${s.title}`;
      renderOverview(s, i); renderPrompts(s); renderChanges(s); renderLog(s);
      if (location.hash !== `#${s.id}`) history.replaceState(null, '', `#${s.id}`);
    }
    if (fromControl && document.activeElement && document.activeElement.classList.contains('tick')) {
      ticks.querySelectorAll('.tick')[i].focus();
    }
  }

  /* ---------- theme ---------- */
  $('#themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('deslop-theme', root.dataset.theme);
  });

  window.addEventListener('hashchange', () => {
    const j = steps.findIndex((s) => `#${s.id}` === location.hash);
    if (j >= 0 && j !== current) go(j);
  });

  setDevice(device);
  const start = steps.findIndex((s) => `#${s.id}` === location.hash);
  current = -1;
  go(start >= 0 ? start : 0);
})();

(function (global) {
  'use strict';

  const CLOSE_ICON =
    '<svg viewBox="0 0 16 16" aria-hidden="true">' +
    '<path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>' +
    '</svg>';

  const stroke =
    'fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1"';

  const BUILTIN_ICONS = {
    success:
      '<svg class="mt-svg" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle class="mt-stroke mt-stroke--ring" cx="32" cy="32" r="26" ' + stroke + '></circle>' +
      '<path class="mt-stroke mt-stroke--mark" d="M20.5 33.2l8.2 8.3 15.6-18" ' + stroke + '></path>' +
      '</svg>',
    error:
      '<svg class="mt-svg" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle class="mt-stroke mt-stroke--ring" cx="32" cy="32" r="26" ' + stroke + '></circle>' +
      '<path class="mt-stroke mt-stroke--mark" d="M24 24l16 16M40 24L24 40" ' + stroke + '></path>' +
      '</svg>',
    warning:
      '<svg class="mt-svg" viewBox="0 0 64 64" aria-hidden="true">' +
      '<path class="mt-stroke mt-stroke--ring" d="M32 12.5L54 51.5H10z" ' + stroke + '></path>' +
      '<path class="mt-stroke mt-stroke--mark" d="M32 26v12" ' + stroke + '></path>' +
      '<circle class="mt-stroke mt-stroke--dot" cx="32" cy="46" r="1.4" fill="currentColor" stroke="none"></circle>' +
      '</svg>',
    info:
      '<svg class="mt-svg" viewBox="0 0 64 64" aria-hidden="true">' +
      '<circle class="mt-stroke mt-stroke--ring" cx="32" cy="32" r="26" ' + stroke + '></circle>' +
      '<path class="mt-stroke mt-stroke--mark" d="M32 29.5V42" ' + stroke + '></path>' +
      '<circle class="mt-stroke mt-stroke--dot" cx="32" cy="23" r="1.6" fill="currentColor" stroke="none"></circle>' +
      '</svg>'
  };

  const ICONS = Object.assign({}, BUILTIN_ICONS, global.ModernToastIcons || {});

  const TYPES = { success: 1, error: 1, warning: 1, info: 1, loading: 1 };
  const THEMES = { auto: 1, light: 1, dark: 1 };
  const STYLES = { default: 1, bootstrap: 1 };
  const POSITIONS = {
    'top-left': 1,
    'top-center': 1,
    'top-right': 1,
    'bottom-left': 1,
    'bottom-center': 1,
    'bottom-right': 1
  };

  const defaults = {
    id: '',
    type: 'info',
    title: '',
    text: '',
    html: '',
    theme: 'auto',
    style: 'default',
    position: 'top-right',
    duration: 4000,
    closable: true,
    recede: true,
    pauseOnHover: true,
    icon: false,
    progress: false,
    action: null,
    href: '',
    hrefTarget: '_self',
    width: 0,
    gap: 12,
    offsetX: 20,
    offsetY: 20,
    customClass: null,
    onShow: null,
    onDismiss: null
  };

  const userDefaults = {};
  const docks = {};
  const entries = {};
  let seq = 0;

  function hasValue(obj, key) {
    return obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null;
  }

  function pick(raw, key) {
    if (hasValue(raw, key)) return raw[key];
    if (hasValue(userDefaults, key)) return userDefaults[key];
    return defaults[key];
  }

  function parseArgs(args) {
    if (!args.length) return {};
    if (typeof args[0] === 'object' && args[0]) return args[0];
    const options = { title: String(args[0] || '') };
    if (typeof args[1] === 'string') options.text = args[1];
    if (typeof args[2] === 'string') options.type = args[2];
    return options;
  }

  function normalize(raw) {
    raw = raw || {};
    const options = {};
    for (const key in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        options[key] = pick(raw, key);
      }
    }

    if (!TYPES[options.type]) options.type = 'info';
    if (!THEMES[options.theme]) options.theme = 'auto';
    if (!STYLES[options.style]) options.style = 'default';
    if (!POSITIONS[options.position]) options.position = 'top-right';

    options.duration = Math.max(0, Number(options.duration) || 0);
    options.width = Math.max(0, Number(options.width) || 0);
    options.gap = Math.max(0, Number(options.gap) || 0);
    options.offsetX = Math.max(0, Number(options.offsetX) || 0);
    options.offsetY = Math.max(0, Number(options.offsetY) || 0);
    options.closable = Boolean(options.closable);
    options.recede = Boolean(options.recede);
    options.pauseOnHover = Boolean(options.pauseOnHover);
    options.icon = Boolean(options.icon);
    options.progress = Boolean(options.progress);
    options.action = normalizeAction(options.action);
    options.href = safeHref(options.href);
    options.id = options.id ? String(options.id) : '';

    return options;
  }

  function safeHref(href) {
    const value = String(href || '').trim();
    if (!value) return '';
    if (/^(javascript|data|vbscript):/i.test(value)) return '';
    return value;
  }

  function normalizeAction(value) {
    if (!value || typeof value !== 'object') return null;
    const label = String(value.label == null ? '' : value.label).trim();
    if (!label) return null;
    const action = {
      label: label,
      dismiss: value.dismiss !== false
    };
    if (typeof value.onClick === 'function') action.onClick = value.onClick;
    return action;
  }

  function nextId() {
    seq += 1;
    return 'mt-' + seq;
  }

  function resolveTheme(theme) {
    if (theme === 'light' || theme === 'dark') return theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function applyCustomClass(el, customClass, key) {
    if (!el || customClass == null || customClass === '') return;
    let names = '';
    if (typeof customClass === 'string') {
      if (key === 'item') names = customClass;
    } else if (typeof customClass === 'object') {
      names = customClass[key] || '';
    }
    String(names).split(/\s+/).forEach(function (name) {
      if (/^[_a-zA-Z][_a-zA-Z0-9-]*$/.test(name)) el.classList.add(name);
    });
  }

  function sanitizeHtml(dirty) {
    const doc = document.implementation.createHTMLDocument('');
    doc.body.innerHTML = String(dirty || '');
    const forbidden = doc.body.querySelectorAll(
      'script,iframe,object,embed,link,meta,style,form,input,button,textarea,svg,math,video,audio,source'
    );
    Array.prototype.forEach.call(forbidden, function (el) {
      el.remove();
    });
    Array.prototype.forEach.call(doc.body.querySelectorAll('*'), function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        const name = attr.name.toLowerCase();
        const value = attr.value || '';
        if (name.indexOf('on') === 0 || name === 'srcdoc' || name === 'formaction' || name === 'xlink:href') {
          el.removeAttribute(attr.name);
          return;
        }
        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
      if (el.tagName === 'A') {
        el.setAttribute('rel', 'noopener noreferrer');
        el.setAttribute('target', '_blank');
      }
    });
    return doc.body.innerHTML;
  }

  function edgeOf(position) {
    return position.indexOf('top') === 0 ? 'top' : 'bottom';
  }

  function sideOf(position) {
    if (position.indexOf('left') !== -1) return 'left';
    if (position.indexOf('right') !== -1) return 'right';
    return 'center';
  }

  function ensureDock(options) {
    const position = options.position;
    let dock = docks[position];
    if (!dock) {
      dock = document.createElement('div');
      dock.className = 'mt-dock';
      dock.dataset.mtPosition = position;
      dock.dataset.mtEdge = edgeOf(position);
      dock.dataset.mtSide = sideOf(position);
      dock.setAttribute('aria-live', 'polite');
      dock.setAttribute('aria-relevant', 'additions');
      document.body.appendChild(dock);
      docks[position] = dock;
    }

    dock.style.setProperty('--mt-gap', options.gap + 'px');
    dock.style.setProperty('--mt-inset-x', options.offsetX + 'px');
    dock.style.setProperty('--mt-inset-y', options.offsetY + 'px');
    dock.dataset.mtRecede = options.recede ? 'on' : 'off';
    applyCustomClass(dock, options.customClass, 'dock');
    return dock;
  }

  function buildItem(id, options) {
    const item = document.createElement('article');
    item.className = 'mt-item';
    item.id = id;
    item.dataset.mtType = options.type;
    item.dataset.mtTheme = resolveTheme(options.theme);
    item.dataset.mtStyle = options.style === 'bootstrap' ? 'bootstrap' : 'default';
    item.dataset.mtEdge = edgeOf(options.position);
    item.setAttribute('role', options.type === 'error' || options.type === 'warning' ? 'alert' : 'status');
    if (options.pauseOnHover) item.dataset.mtPause = 'on';
    if (options.width) item.style.width = options.width + 'px';
    applyCustomClass(item, options.customClass, 'item');

    if (options.icon) {
      item.classList.add('mt-item--icon');
      item.appendChild(buildIcon(options));
    }

    const body = document.createElement('div');
    body.className = 'mt-body';

    if (options.title) {
      const title = document.createElement('h3');
      title.className = 'mt-title';
      title.textContent = options.title;
      applyCustomClass(title, options.customClass, 'title');
      body.appendChild(title);
    }

    if (options.html || options.text) {
      const text = document.createElement('div');
      text.className = 'mt-text';
      if (options.html) text.innerHTML = sanitizeHtml(options.html);
      else text.textContent = options.text;
      applyCustomClass(text, options.customClass, 'text');
      body.appendChild(text);
    }

    item.appendChild(body);

    if (options.action) {
      item.classList.add('mt-item--action');
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'mt-action';
      actionBtn.textContent = options.action.label;
      applyCustomClass(actionBtn, options.customClass, 'action');
      item.appendChild(actionBtn);
    }

    if (options.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'mt-close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.innerHTML = CLOSE_ICON;
      applyCustomClass(closeBtn, options.customClass, 'close');
      item.appendChild(closeBtn);
    }

    if (options.href) item.classList.add('mt-item--link');

    if (options.progress && options.duration) {
      const bar = document.createElement('div');
      bar.className = 'mt-progress';
      bar.setAttribute('aria-hidden', 'true');
      bar.style.setProperty('--mt-timer', options.duration + 'ms');
      applyCustomClass(bar, options.customClass, 'progress');
      item.appendChild(bar);
    }

    return item;
  }

  function buildIcon(options) {
    const wrap = document.createElement('div');
    wrap.className = 'mt-icon';
    wrap.setAttribute('aria-hidden', 'true');
    applyCustomClass(wrap, options.customClass, 'icon');
    const kind = TYPES[options.type] ? options.type : 'info';
    if (kind === 'loading') {
      const spin = document.createElement('div');
      spin.className = 'mt-spinner';
      wrap.appendChild(spin);
      return wrap;
    }
    wrap.innerHTML = ICONS[kind] || ICONS.info || '';
    return wrap;
  }

  function bindItem(entry) {
    const item = entry.node;
    const options = entry.options;

    if (options.closable) {
      const closeBtn = item.querySelector('.mt-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          dismiss(entry.id, 'close');
        });
      }
    }

    if (options.action) {
      const actionBtn = item.querySelector('.mt-action');
      if (actionBtn) {
        actionBtn.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (entry.leaving) return;
          let keep = false;
          if (typeof options.action.onClick === 'function') {
            try {
              keep = options.action.onClick({
                id: entry.id,
                dismiss: function () {
                  return dismiss(entry.id, 'action');
                }
              }) === false;
            } catch (err) { /* ignore */ }
          }
          if (!keep && options.action.dismiss) dismiss(entry.id, 'action');
        });
      }
    }

    if (options.href) {
      item.addEventListener('click', function (event) {
        if (event.target.closest('.mt-close, .mt-action')) return;
        const target = options.hrefTarget || '_self';
        if (target === '_blank') window.open(options.href, '_blank', 'noopener,noreferrer');
        else window.location.assign(options.href);
        dismiss(entry.id, 'click');
      });
    }

    if (options.duration && options.pauseOnHover) {
      item.addEventListener('pointerenter', function () {
        pauseTimer(entry);
      });
      item.addEventListener('pointerleave', function () {
        resumeTimer(entry);
      });
    }
  }

  function armTimer(entry) {
    if (!entry.options.duration || entry.leaving) return;
    entry.startedAt = Date.now();
    entry.timerId = setTimeout(function () {
      dismiss(entry.id, 'timer');
    }, entry.remaining);
  }

  function pauseTimer(entry) {
    if (!entry.timerId || entry.leaving) return;
    clearTimeout(entry.timerId);
    entry.timerId = null;
    entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
  }

  function resumeTimer(entry) {
    if (entry.timerId || entry.leaving || !entry.options.duration) return;
    armTimer(entry);
  }

  function clearTimer(entry) {
    if (entry.timerId) {
      clearTimeout(entry.timerId);
      entry.timerId = null;
    }
  }

  function show() {
    const options = normalize(parseArgs(arguments));
    const id = options.id || nextId();

    if (entries[id]) {
      forceRemove(id, 'replace');
    }

    const dock = ensureDock(options);
    const item = buildItem(id, options);
    dock.insertBefore(item, dock.firstChild);

    let resolve;
    const promise = new Promise(function (ok) {
      resolve = ok;
    });

    const entry = {
      id: id,
      node: item,
      dock: dock,
      options: options,
      position: options.position,
      remaining: options.duration,
      startedAt: 0,
      timerId: null,
      leaving: false,
      resolve: resolve,
      promise: promise
    };

    entries[id] = entry;
    bindItem(entry);
    armTimer(entry);

    if (typeof options.onShow === 'function') {
      try { options.onShow({ id: id }); } catch (err) { /* ignore */ }
    }

    const handle = promise;
    handle.id = id;
    handle.dismiss = function () {
      return dismiss(id, 'close');
    };
    return handle;
  }

  function forceRemove(id, reason) {
    const entry = entries[id];
    if (!entry) return;
    entry.leaving = true;
    clearTimer(entry);
    if (entry.node && entry.node.parentNode) entry.node.parentNode.removeChild(entry.node);
    forget(entry, reason);
  }

  function forget(entry, reason) {
    if (entry.settled) return entry.result;
    const result = { id: entry.id, dismiss: reason };
    entry.settled = true;
    entry.result = result;
    delete entries[entry.id];
    const dock = entry.dock;
    if (dock && !dock.childElementCount && dock.parentNode) {
      dock.parentNode.removeChild(dock);
      if (docks[entry.position] === dock) delete docks[entry.position];
    }
    if (typeof entry.options.onDismiss === 'function') {
      try { entry.options.onDismiss(result); } catch (err) { /* ignore */ }
    }
    if (entry.resolve) entry.resolve(result);
    return result;
  }

  function dismiss(id, reason) {
    const entry = entries[id];
    if (!entry) return Promise.resolve();
    if (entry.leaving) return entry.promise;
    entry.leaving = true;
    clearTimer(entry);

    const node = entry.node;
    node.classList.add('mt-item--out');

    return new Promise(function (resolveAnim) {
      let done = false;
      function finish() {
        if (done) return;
        done = true;
        node.removeEventListener('animationend', onEnd);
        if (node.parentNode) node.parentNode.removeChild(node);
        resolveAnim(entry.settled ? entry.result : forget(entry, reason));
      }
      function onEnd(event) {
        if (event.target === node) finish();
      }
      node.addEventListener('animationend', onEnd);
      setTimeout(finish, 240);
    });
  }

  function dismissAll() {
    return Promise.all(
      Object.keys(entries).map(function (id) {
        return dismiss(id, 'api');
      })
    );
  }

  function dismissMaybe(id) {
    if (id) return dismiss(String(id), 'api');
    return dismissAll();
  }

  function refresh(id, raw) {
    const entry = entries[id];
    if (!entry || entry.leaving) return;
    raw = Object.assign({}, raw, { position: entry.position, id: id });
    const options = normalize(raw);
    clearTimer(entry);
    const next = buildItem(id, options);
    next.classList.add('mt-item--swap');
    if (entry.node.parentNode) entry.node.parentNode.replaceChild(next, entry.node);
    entry.node = next;
    entry.options = options;
    entry.remaining = options.duration;
    entry.startedAt = 0;
    entry.timerId = null;
    bindItem(entry);
    armTimer(entry);
  }

  function stateOptions(message, fallback) {
    if (typeof message === 'string') return { title: message };
    if (message && typeof message === 'object') return message;
    return { title: fallback };
  }

  function resolveMessage(message, value) {
    if (typeof message !== 'function') return message;
    try { return message(value); } catch (err) { return null; }
  }

  function sharedOptions(messages) {
    const shared = {};
    messages = messages && typeof messages === 'object' ? messages : {};
    for (const key in messages) {
      if (!Object.prototype.hasOwnProperty.call(messages, key)) continue;
      if (key === 'loading' || key === 'success' || key === 'error') continue;
      if (Object.prototype.hasOwnProperty.call(defaults, key)) shared[key] = messages[key];
    }
    return shared;
  }

  function promise(input, messages) {
    messages = messages && typeof messages === 'object' ? messages : {};
    const shared = sharedOptions(messages);
    const loading = Object.assign({}, shared, stateOptions(messages.loading, 'Loading…'));
    loading.type = 'loading';
    loading.duration = 0;
    loading.icon = true;

    const handle = show(loading);
    const id = handle.id;

    let task;
    try {
      task = typeof input === 'function' ? input() : input;
    } catch (err) {
      task = Promise.reject(err);
    }

    const result = Promise.resolve(task).then(function (value) {
      const options = Object.assign(
        {},
        shared,
        stateOptions(resolveMessage(messages.success, value), 'Done')
      );
      if (!options.type || options.type === 'loading') options.type = 'success';
      refresh(id, options);
      return value;
    }, function (err) {
      const options = Object.assign(
        {},
        shared,
        stateOptions(resolveMessage(messages.error, err), 'Something went wrong')
      );
      if (!options.type || options.type === 'loading') options.type = 'error';
      refresh(id, options);
      return Promise.reject(err);
    });

    result.id = id;
    return result;
  }

  function helper(type) {
    return function (title, text, extra) {
      const options = extra && typeof extra === 'object' ? Object.assign({}, extra) : {};
      options.type = type;
      options.title = title;
      if (typeof text === 'string') options.text = text;
      return show(options);
    };
  }

  function setDefaults(next) {
    if (!next || typeof next !== 'object') return getDefaults();
    const skip = { id: 1, type: 1, title: 1, text: 1, html: 1 };
    for (const key in next) {
      if (!Object.prototype.hasOwnProperty.call(defaults, key) || skip[key]) continue;
      if (next[key] == null) delete userDefaults[key];
      else userDefaults[key] = next[key];
    }
    return getDefaults();
  }

  function getDefaults() {
    const merged = {};
    for (const key in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        merged[key] = pick({}, key);
      }
    }
    return merged;
  }

  function setStyle(name) {
    if (name == null) {
      const current = pick({}, 'style');
      return STYLES[current] ? current : 'default';
    }
    userDefaults.style = STYLES[name] ? name : 'default';
    return userDefaults.style;
  }

  const api = {
    show: show,
    promise: promise,
    dismiss: dismissMaybe,
    dismissAll: dismissAll,
    style: setStyle,
    setDefaults: setDefaults,
    getDefaults: getDefaults,
    isVisible: function () {
      return Object.keys(entries).some(function (id) {
        return entries[id] && !entries[id].leaving;
      });
    },
    success: helper('success'),
    error: helper('error'),
    warning: helper('warning'),
    info: helper('info')
  };

  global.ModernToast = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

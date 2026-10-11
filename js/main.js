(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- London time ---------- */

  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday),
      minutes: (+o.hour) * 60 + (+o.minute),
      iso: o.year + '-' + o.month + '-' + o.day
    };
  }

  /* ---------- Day / evening ---------- */

  var toggle = document.querySelector('[data-mode-toggle]');

  function syncToggle() {
    if (!toggle) return;
    var evening = root.getAttribute('data-mode') === 'evening';
    toggle.setAttribute('aria-pressed', String(evening));
    toggle.querySelector('.mode-toggle-label').textContent = evening ? 'Daylight' : 'Evening';
    toggle.setAttribute('aria-label', evening ? 'Switch to daylight' : 'Switch to evening');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim() || '#F1EEE5');
  }

  if (toggle) {
    syncToggle();
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-mode') === 'evening' ? 'day' : 'evening';
      root.classList.add('mode-shift');
      root.setAttribute('data-mode', next);
      try { localStorage.setItem('kerfield-mode', next); } catch (e) {}
      syncToggle();
      window.setTimeout(function () { root.classList.remove('mode-shift'); }, 900);
    });
  }

  /* ---------- Open now ---------- */

  // Minutes from midnight, London time. Monday is closed.
  var HOURS = {
    0: { open: [[720, 1080]], kitchen: [[720, 960]] },
    2: { open: [[720, 1380]], kitchen: [[720, 870], [1080, 1290]] },
    3: { open: [[720, 1380]], kitchen: [[720, 870], [1080, 1290]] },
    4: { open: [[720, 1380]], kitchen: [[720, 870], [1080, 1290]] },
    5: { open: [[720, 1380]], kitchen: [[720, 870], [1080, 1290]] },
    6: { open: [[720, 1380]], kitchen: [[720, 930], [1080, 1290]] }
  };

  function fmt(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? '.' + (m < 10 ? '0' : '') + m : '') + suffix;
  }

  function within(ranges, t) {
    for (var i = 0; i < ranges.length; i++) {
      if (t >= ranges[i][0] && t < ranges[i][1]) return ranges[i];
    }
    return null;
  }

  function openStatus() {
    var now = londonNow();
    var today = HOURS[now.day];
    var t = now.minutes;

    if (today) {
      var open = within(today.open, t);
      if (open) {
        var kitchen = within(today.kitchen, t);
        var line = 'Open now until ' + fmt(open[1]);
        if (kitchen) return { open: true, text: line + ' · Kitchen until ' + fmt(kitchen[1]) };
        var later = today.kitchen.filter(function (r) { return r[0] > t; })[0];
        if (later) return { open: true, text: line + ' · Kitchen from ' + fmt(later[0]) };
        return { open: true, text: line + ' · Kitchen closed for the day' };
      }
      if (t < today.open[0][0]) return { open: false, text: 'Opens today at ' + fmt(today.open[0][0]) };
    }

    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        var when = i === 1 ? 'tomorrow' : DAYS[d];
        return { open: false, text: 'Closed now · Opens ' + when + ' at ' + fmt(HOURS[d].open[0][0]) };
      }
    }
  }

  function renderStatus() {
    var s = openStatus();
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.hidden = false;
    });
  }

  renderStatus();
  window.setInterval(renderStatus, 60000);

  /* ---------- Navigation ---------- */

  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.visually-hidden').textContent = open ? 'Close navigation' : 'Open navigation';
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('no-scroll', open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) {
        setNav(false);
        navToggle.focus();
      }
    });
    window.matchMedia('(min-width: 64em)').addEventListener('change', function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Gallery lightbox ---------- */

  var lightbox = document.querySelector('[data-lightbox]');
  var gallery = document.querySelector('[data-gallery]');

  if (lightbox && gallery && typeof lightbox.showModal === 'function') {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('[data-full]'));
    var lbImg = lightbox.querySelector('[data-lightbox-img]');
    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      lbImg.src = item.getAttribute('data-full');
      lbImg.alt = item.querySelector('img').alt;
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        show(i);
        lightbox.showModal();
      });
    });

    lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }

  /* ---------- Enquiry form (front end only) ---------- */

  var form = document.querySelector('[data-enquiry-form]');
  var success = document.querySelector('[data-enquiry-success]');

  if (form && success) {
    var dateInput = form.querySelector('[name="date"]');
    var errorEl = form.querySelector('[data-form-error]');
    if (dateInput) dateInput.min = londonNow().iso;

    function prettyDate(iso) {
      var p = iso.split('-');
      var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.add('was-validated');

      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector(':invalid');
        errorEl.textContent = 'Please check the highlighted fields.';
        errorEl.hidden = false;
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      errorEl.hidden = true;

      var data = new FormData(form);
      var name = data.get('name').trim();
      var guests = data.get('guests');
      var date = prettyDate(data.get('date'));
      var space = data.get('space');
      var message = (data.get('message') || '').trim();

      var body = [
        'Name: ' + name,
        'Email: ' + data.get('email'),
        'Date: ' + date,
        'Guests: ' + guests,
        'Space: ' + space,
        '',
        message
      ].join('\n');

      success.querySelector('[data-mailto]').href =
        'mailto:enquiries@thekerfieldarms.co.uk' +
        '?subject=' + encodeURIComponent('Group enquiry: ' + guests + ' guests, ' + date) +
        '&body=' + encodeURIComponent(body);

      success.querySelector('[data-success-summary]').textContent =
        'Your enquiry for ' + guests + (guests === '1' ? ' guest' : ' guests') + ' on ' + date + ' (' + space.toLowerCase() + ') is ready.';

      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    success.querySelector('[data-enquiry-reset]').addEventListener('click', function () {
      form.reset();
      form.classList.remove('was-validated');
      success.hidden = true;
      form.hidden = false;
      form.querySelector('input').focus();
    });
  }
})();


(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Solid navigation bar after scrolling past the top of the hero
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    var nl = document.documentElement.lang === 'nl';
    toggle.setAttribute('aria-label', open ? (nl ? 'Menu sluiten' : 'Close menu') : (nl ? 'Menu openen' : 'Open menu'));
    toggle.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
  }
  toggle.addEventListener('click', function () {
    setMenu(!links.classList.contains('open'));
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .draw-line').forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  // Highlight the menu item of the section in view. Sections without their own
  // menu item (hero, key figures, how I can help) clear it or map to the
  // nearest one: "How I can help" belongs to About.
  var menuLinks = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
  var owner = { help: 'about' };
  function setActive(id) {
    menuLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
  }
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  function updateSpy() {
    var mid = window.innerHeight / 2, id = '';
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) id = s.id;
    });
    setActive(owner[id] || id);
  }
  window.addEventListener('scroll', updateSpy, { passive: true });
  window.addEventListener('resize', updateSpy);
  updateSpy();

  // Reveal elements on scroll
  var revealEls = document.querySelectorAll('.reveal, .draw-line');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      revealer.observe(el);
    });
  }

  // Rotating focus areas in the hero
  var rotator = document.getElementById('rotator');
  var words = ['Microsoft Teams', 'Teams Phone', 'Direct Routing', 'Operator Connect', 'Teams Rooms', 'Microsoft Copilot', 'Azure Communication Services'];
  if (rotator && !reduceMotion) {
    var i = 0;
    setInterval(function () {
      rotator.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove('out');
      }, 350);
    }, 2600);
  }

  // Count up the key figures when they come into view
  var counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion) {
    var counter = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var start = null;
        var duration = 2600;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) { requestAnimationFrame(step); } else { el.classList.add('pop'); }
        }
        el.textContent = prefix + '0' + suffix;
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counter.observe(el); });
  }

  // Running call timer on the "Teams Phone · Connected" card
  var timer = document.getElementById('callTimer');
  if (timer) {
    var seconds = 0;
    setInterval(function () {
      seconds++;
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      timer.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }
})();

// Floating "back to top" button: appears after the first screen, its ring shows how far down you are
(function () {
  var btn = document.getElementById('toTop');
  if (!btn) return;
  var ring = document.getElementById('toTopProgress');
  var LENGTH = 150.8; // circumference of the ring (2 * pi * 24)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY;
    btn.classList.toggle('show', y > window.innerHeight * 0.6);
    if (ring) ring.style.strokeDashoffset = String(LENGTH * (1 - (max > 0 ? Math.min(y / max, 1) : 0)));
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    btn.blur();
  });
})();

// Keep the footer year current
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

// Selectable, auto-rotating carousels (Talks and Recommendations)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = 7000;

  function carousel(o) {
    var root = document.getElementById(o.root);
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll(o.tab));
    var slides = Array.prototype.slice.call(root.querySelectorAll(o.slide));
    var dots = o.dot ? Array.prototype.slice.call(root.querySelectorAll(o.dot)) : [];
    var count = o.count ? document.getElementById(o.count) : null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var current = 0, elapsed = 0, last = null;

    function show(i, focus) {
      current = (i + tabs.length) % tabs.length;
      tabs.forEach(function (tab, n) {
        var on = n === current;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        slides[n].classList.toggle('is-active', on);
        if (dots[n]) dots[n].classList.toggle('is-active', on);
        tab.querySelector(o.progress).style.width = '0';
      });
      if (count) count.textContent = pad(current + 1) + ' / ' + pad(tabs.length);
      elapsed = 0;
      var active = tabs[current];
      // keep the active tab visible in a horizontally scrolling list on small screens
      var list = active.parentNode;
      if (list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: active.offsetLeft - list.offsetLeft - 16, behavior: 'smooth' });
      }
      if (focus) active.focus();
    }

    tabs.forEach(function (tab, n) {
      tab.addEventListener('click', function () { show(n); });
      tab.addEventListener('keydown', function (e) {
        var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (keys[e.key]) { e.preventDefault(); show(current + keys[e.key], true); }
        else if (e.key === 'Home') { e.preventDefault(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1, true); }
      });
    });
    dots.forEach(function (dot, n) { dot.addEventListener('click', function () { show(n); }); });
    if (o.prev) document.getElementById(o.prev).addEventListener('click', function () { show(current - 1); });
    if (o.next) document.getElementById(o.next).addEventListener('click', function () { show(current + 1); });

    if (reduce) return;
    // pause while the visitor is reading or using it, and while it is off screen
    var hover = false, focusIn = false, visible = false;
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    root.addEventListener('focusin', function () { focusIn = true; });
    root.addEventListener('focusout', function () { focusIn = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }, { threshold: 0.3 }).observe(root);
    } else {
      visible = true;
    }

    // advance every 7 seconds, with a progress bar on the active tab
    setInterval(function () {
      var now = performance.now();
      if (last !== null && !hover && !focusIn && visible) {
        elapsed += now - last;
        tabs[current].querySelector(o.progress).style.width = Math.min(elapsed / DURATION, 1) * 100 + '%';
        if (elapsed >= DURATION) show(current + 1);
      }
      last = now;
    }, 100);
  }

  carousel({ root: 'talksCarousel', tab: '.talk-tab', slide: '.talk-slide', dot: '.talk-dot', progress: '.talk-progress' });
  carousel({ root: 'reco', tab: '.reco-tab', slide: '.reco-slide', progress: '.reco-progress', count: 'recoCount', prev: 'recoPrev', next: 'recoNext' });
})();

// Birthday (16 November, Dutch time): confetti, a party hat on the photo and a small note.
// Preview on any day with ?birthday in the URL.
(function () {
  var md = '';
  try {
    md = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch (e) {
    var d = new Date();
    md = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  if (md !== '16/11' && !/[?&]birthday\b/.test(location.search)) return;

  var nl = document.documentElement.lang === 'nl';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('is-birthday');

  // Party hat on the hero photo
  var visual = document.querySelector('.hero-visual');
  if (visual) {
    var hat = document.createElement('span');
    hat.className = 'bday-hat';
    hat.setAttribute('aria-hidden', 'true');
    hat.innerHTML = '<span class="bday-cone"></span><span class="bday-pom"></span>';
    visual.appendChild(hat);
  }

  // Note, dismissable for the rest of the day
  var key = 'bday-closed-' + new Date().getFullYear();
  var closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) {}
  if (!closed) {
    var note = document.createElement('div');
    note.className = 'bday-note';
    note.setAttribute('role', 'status');
    var text = document.createElement('span');
    text.textContent = nl ? '🎉 Ik ben vandaag jarig!' : '🎉 It’s my birthday today!';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'bday-close';
    close.setAttribute('aria-label', nl ? 'Sluiten' : 'Close');
    close.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    close.addEventListener('click', function () {
      note.classList.add('is-hiding');
      setTimeout(function () { note.remove(); }, 300);
      try { localStorage.setItem(key, '1'); } catch (e) {}
    });
    note.appendChild(text);
    note.appendChild(close);
    document.body.appendChild(note);
    requestAnimationFrame(function () { note.classList.add('show'); });
  }

  // Confetti burst, a few seconds only
  if (reduce) return;
  var canvas = document.createElement('canvas');
  canvas.className = 'bday-confetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h;
  function size() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener('resize', size);
  var colors = ['#8b5cf6', '#6366f1', '#f472b6', '#c4b5fd', '#38bdf8', '#facc15'];
  var count = w < 640 ? 90 : 170;
  var parts = [];
  for (var i = 0; i < count; i++) {
    parts.push({
      x: Math.random() * w,
      y: -20 - Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 2.2,
      vy: 2 + Math.random() * 3,
      s: 6 + Math.random() * 6,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      c: colors[i % colors.length],
      round: Math.random() < 0.3
    });
  }
  var start = null, duration = 4500;
  function frame(t) {
    if (start === null) start = t;
    var el = t - start;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = el > duration - 1000 ? Math.max(0, (duration - el) / 1000) : 1;
    parts.forEach(function (p) {
      p.x += p.vx + Math.sin((el / 400) + p.r) * 0.6;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.6, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    if (el < duration) requestAnimationFrame(frame);
    else { window.removeEventListener('resize', size); canvas.remove(); }
  }
  requestAnimationFrame(frame);
})();

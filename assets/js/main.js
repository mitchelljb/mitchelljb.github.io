
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

// Birthday (16 November, Dutch time): confetti and a note
// that opens a LinkedIn post with a congratulation. Preview with ?birthday in the URL.
(function () {
  var md = '';
  try {
    md = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch (e) {
    var d = new Date();
    md = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  if (md !== '16/11' && !/[?&]birthday\b/.test(location.search)) return;

  var root = document.documentElement;
  var nl = root.lang === 'nl';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('is-birthday');

  // Confetti over the whole screen. 'explode': cannons from the centre and both bottom
  // corners plus a rain from the top; 'pop': a fountain from the bottom and a centre burst.
  var colors = ['#8b5cf6', '#6366f1', '#f472b6', '#c4b5fd', '#38bdf8', '#facc15', '#34d399', '#fb7185'];
  function burst(mode, scale) {
    if (reduce) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'bday-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w, h;
    function size() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
    }
    size();
    window.addEventListener('resize', size);
    var parts = [], rnd = Math.random;
    // x, y: start point; angle (radians) and spread; speed range; delay range in ms
    function emit(n, x, y, angle, spread, vMin, vMax, dMax) {
      n = Math.round(n * scale);
      for (var i = 0; i < n; i++) {
        var a = angle + (rnd() - 0.5) * spread, v = vMin + rnd() * (vMax - vMin);
        parts.push({
          x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          s: 8 + rnd() * 12, r: rnd() * 6.3, vr: (rnd() - 0.5) * 0.35,
          f: rnd() * 6.3, vf: 0.05 + rnd() * 0.12, sway: rnd() * 6.3,
          c: colors[(rnd() * colors.length) | 0], round: rnd() < 0.25,
          delay: rnd() * dMax, g: 0.2 + rnd() * 0.25, d: 0.955 + rnd() * 0.035, tv: 2.2 + rnd() * 2
        });
      }
    }
    var up = -Math.PI / 2;
    if (mode === 'explode') {
      emit(320, w / 2, h * 0.42, 0, Math.PI * 2, 6, 24, 150);           // centre explosion
      emit(220, -10, h + 10, up + 0.62, 0.55, 18, 34, 400);             // bottom-left cannon
      emit(220, w + 10, h + 10, up - 0.62, 0.55, 18, 34, 400);          // bottom-right cannon
      emit(160, w * 0.25, h * 0.3, 0, Math.PI * 2, 4, 16, 700);         // second pops
      emit(160, w * 0.75, h * 0.3, 0, Math.PI * 2, 4, 16, 900);
      for (var k = 0; k < Math.round(260 * scale); k++) {               // rain over the full width
        parts.push({
          x: rnd() * w, y: -20 - rnd() * 60, vx: (rnd() - 0.5) * 2, vy: 2 + rnd() * 2,
          s: 8 + rnd() * 12, r: rnd() * 6.3, vr: (rnd() - 0.5) * 0.35,
          f: rnd() * 6.3, vf: 0.05 + rnd() * 0.12, sway: rnd() * 6.3,
          c: colors[(rnd() * colors.length) | 0], round: rnd() < 0.25,
          delay: 600 + rnd() * 3800, g: 0.2 + rnd() * 0.25, d: 0.955 + rnd() * 0.035, tv: 2.2 + rnd() * 2
        });
      }
    } else {
      emit(260, w / 2, h + 10, up, 0.7, 20, 36, 250);                   // fountain from the bottom
      emit(180, w / 2, h * 0.45, 0, Math.PI * 2, 5, 20, 100);           // centre pop
    }
    var start = null, last = null, maxTime = 11000;
    function frame(t) {
      if (start === null) { start = last = t; }
      var el = t - start, dt = Math.min((t - last) / 16.7, 3);
      last = t;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = el > maxTime - 1500 ? Math.max(0, (maxTime - el) / 1500) : 1;
      var alive = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.done) continue;
        alive++;
        if (el < p.delay) continue;
        p.vy += p.g * dt;                                  // gravity (light and heavy pieces)
        p.vx *= Math.pow(p.d, dt); if (p.vy < 0) p.vy *= Math.pow(p.d, dt); // air drag
        if (p.vy > p.tv) p.vy -= (p.vy - p.tv) * 0.04 * dt; // ease to a slow flutter
        p.x += (p.vx + Math.sin(el / 350 + p.sway) * 0.8) * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        p.f += p.vf * dt;
        if (p.y > h + 40 && p.vy > 0) { p.done = true; continue; }
        var c = Math.cos(p.r), s = Math.sin(p.r), flip = Math.cos(p.f);
        ctx.setTransform(dpr * c, dpr * s, -dpr * s * flip, dpr * c * flip, dpr * p.x, dpr * p.y);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.6, 0, 6.283); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      }
      if (alive && el < maxTime) requestAnimationFrame(frame);
      else { window.removeEventListener('resize', size); canvas.remove(); }
    }
    requestAnimationFrame(frame);
  }
  var small = window.innerWidth < 640;
  burst('explode', small ? 0.5 : 1);

  // Note: the whole note opens a prefilled LinkedIn post; the cross closes it for today
  var key = 'bday-closed-' + new Date().getFullYear();
  var closed = false;
  try { closed = localStorage.getItem(key) === '1'; } catch (e) {}
  if (closed) return;

  var post = nl
    ? 'Gefeliciteerd met je verjaardag, Mitchell Bakker! 🎉🎂 https://www.linkedin.com/in/mitchelljoshuabakker/'
    : 'Happy birthday, Mitchell Bakker! 🎉🎂 https://www.linkedin.com/in/mitchelljoshuabakker/';
  var note = document.createElement('div');
  note.className = 'bday-note';
  var link = document.createElement('a');
  link.className = 'bday-link';
  link.href = 'https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(post);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.innerHTML =
    '<span class="bday-emoji" aria-hidden="true">🎉</span>' +
    '<span class="bday-text"><strong></strong><small></small><em class="bday-tip"></em></span>' +
    '<span class="bday-in" aria-hidden="true"><i class="fab fa-linkedin-in"></i></span>';
  link.querySelector('strong').textContent = nl ? 'Ik ben vandaag jarig!' : 'It’s my birthday today!';
  link.querySelector('small').textContent = nl ? 'Feliciteer me op LinkedIn →' : 'Congratulate me on LinkedIn →';
  link.querySelector('.bday-tip').textContent = nl ? 'Tip: tag me met @Mitchell Bakker' : 'Tip: tag me with @Mitchell Bakker';
  link.addEventListener('click', function () { burst('pop', small ? 0.6 : 1); });
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'bday-close';
  close.setAttribute('aria-label', nl ? 'Sluiten' : 'Close');
  close.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
  close.addEventListener('click', function () {
    note.classList.remove('show');
    root.classList.remove('bday-note-open');
    setTimeout(function () { note.remove(); }, 450);
    try { localStorage.setItem(key, '1'); } catch (e) {}
  });
  note.appendChild(link);
  note.appendChild(close);
  document.body.appendChild(note);
  root.classList.add('bday-note-open');
  requestAnimationFrame(function () { requestAnimationFrame(function () { note.classList.add('show'); }); });
})();

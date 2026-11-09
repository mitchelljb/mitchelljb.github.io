
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

// Keep the footer year current
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

// Recommendations: selectable, auto-rotating testimonials
(function () {
  var root = document.getElementById('reco');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.reco-tab'));
  var slides = Array.prototype.slice.call(root.querySelectorAll('.reco-slide'));
  var count = document.getElementById('recoCount');
  var current = 0;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var elapsed = 0, paused = true;

  function show(i, focus) {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (tab, n) {
      var on = n === current;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      slides[n].classList.toggle('is-active', on);
    });
    if (count) count.textContent = pad(current + 1) + ' / ' + pad(tabs.length);
    var active = tabs[current];
    elapsed = 0;
    tabs.forEach(function (tab) { tab.querySelector('.reco-progress').style.width = '0'; });
    // keep the active tab visible in the horizontal list on small screens
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
  document.getElementById('recoPrev').addEventListener('click', function () { show(current - 1); });
  document.getElementById('recoNext').addEventListener('click', function () { show(current + 1); });

  // pause while the visitor is reading or using it, and while it is off screen
  var hover = false, focusIn = false, visible = false;
  function update() { paused = hover || focusIn || !visible; }
  root.addEventListener('mouseenter', function () { hover = true; update(); });
  root.addEventListener('mouseleave', function () { hover = false; update(); });
  root.addEventListener('focusin', function () { focusIn = true; update(); });
  root.addEventListener('focusout', function () { focusIn = false; update(); });
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; update(); }, { threshold: 0.3 }).observe(root);
  update();

  // advance every 7 seconds, with a progress bar on the active tab
  var DURATION = 7000, last = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  setInterval(function () {
    var now = performance.now();
    if (last !== null && !paused) {
      elapsed += now - last;
      tabs[current].querySelector('.reco-progress').style.width = Math.min(elapsed / DURATION, 1) * 100 + '%';
      if (elapsed >= DURATION) show(current + 1);
    }
    last = now;
  }, 100);
})();

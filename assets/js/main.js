
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
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  // Highlight the menu item of the section in view
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['about', 'experience', 'certifications'].forEach(function (id) {
    var section = document.getElementById(id);
    if (section) spy.observe(section);
  });

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

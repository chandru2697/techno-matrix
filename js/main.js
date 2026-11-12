(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Build dynamic content (works even without GSAP)
  $('#slides').innerHTML = [1, 2, 3, 4, 5].map(function () {
    return '<div class="slide"><img src="img/inner/recent-product-1.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-2.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-3.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-4.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>';
  }).join('');
  var logos = ['tuv', 'uca', 'aub', 'lls', 'pon','san','syn','ama','lmw','hub','sch','kd','jay','bro','pav','roots','vti','mub','krish','ss','mer','aero','iam','sky','bos','adv','pri','lcb'], lh = '';
  for (var r = 0; r < 6; r++) lh += logos.map(function (n) { return '<img src="img/client/cllogo-' + n + '.jpg" alt="' + n + '" loading="lazy">'; }).join('');
  $('#logoTrack').innerHTML = lh;

  // Mobile menu
  var burger = $('#burger'), mm = $('#mmenu');
  function toggleMenu(open) { burger.classList.toggle('open', open); mm.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; }
  burger.addEventListener('click', function () { toggleMenu(!mm.classList.contains('open')); });
  $$('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  // Service panels (works without GSAP)
  var panels = $$('.panel');
  panels.forEach(function (p) {
    function on() { panels.forEach(function (x) { x.classList.remove('active'); }); p.classList.add('active'); }
    p.addEventListener('mouseenter', function () { if (window.innerWidth > 991) on(); });
    p.addEventListener('click', on);
  });

  // Expertise showcase (works without GSAP)
  var shots = $$('.shot'), inds = $$('.ind'), cur = 0, ptimer, hovering = false, visible = false;
  function showInd(i) {
    if (i === cur && shots[i].classList.contains('active')) return;
    shots.forEach(function (s) { s.classList.remove('prev'); });
    shots[cur].classList.remove('active'); shots[cur].classList.add('prev');
    cur = i; shots[cur].classList.add('active');
    inds.forEach(function (b, k) { b.classList.toggle('active', k === i); });
    $('#curNum').textContent = '0' + (i + 1);
    var lab = $('.stage-label'); $('#curName').textContent = $('h3', inds[i]).textContent;
    lab.classList.remove('swap'); void lab.offsetWidth; lab.classList.add('swap');
    runBar();
  }
  function runBar() { var b = $('#bar'); b.classList.remove('run'); void b.offsetWidth; if (visible && !hovering) b.classList.add('run'); }
  function tick() { clearInterval(ptimer); ptimer = setInterval(function () { if (visible && !hovering) showInd((cur + 1) % shots.length); }, 5500); runBar(); }
  inds.forEach(function (b, k) {
    b.addEventListener('click', function () { showInd(k); tick(); });
    b.addEventListener('mouseenter', function () { if (window.innerWidth > 991) { showInd(k); } });
  });
  var sc = $('.showcase');
  sc.addEventListener('mouseenter', function () { hovering = true; $('#bar').classList.remove('run'); });
  sc.addEventListener('mouseleave', function () { hovering = false; tick(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; tick(); }, { threshold: .35 }).observe(sc);
  else visible = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { visible = false; }

  // Fallback: no GSAP, show everything
  if (!window.gsap) {
    var st = document.createElement('style');
    st.textContent = '.ch{opacity:1!important}[data-hero],[data-rise]{opacity:1!important}';
    document.head.appendChild(st);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = reduce ? 0 : 1;

  // Single-letter split
  function split(el) {
    var t = el.textContent; el.setAttribute('aria-label', t); el.textContent = '';
    t.split('').forEach(function (c) {
      var s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.innerHTML = c === ' ' ? '&nbsp;' : c; el.appendChild(s);
    });
    return $$('.ch', el);
  }

  // HERO intro: letter-by-letter fade
  var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  var tc = split($('#heroTitle')), sc = split($('#heroSub'));
  gsap.set('[data-hero]', { opacity: 0 });
  tl.to('.kicker', { opacity: 1, duration: .6 * D })
    .fromTo(tc, { opacity: 0, y: 30 * D, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8 * D, stagger: .07 * D }, '-=.2')
    .fromTo(sc, { opacity: 0 }, { opacity: 1, duration: .45 * D, stagger: .03 * D }, '-=.3')
    .to('[data-hero]', { opacity: 1, y: 0, duration: .7 * D, stagger: .15 * D }, '-=.2');
  gsap.set('[data-hero]', { y: 20 * D });
  if (!reduce) {
    gsap.fromTo('.hero-bg', { scale: 1.15 }, { scale: 1, duration: 2.6, ease: 'power2.out' });
    gsap.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  // Counters
  $$('.count').forEach(function (el) {
    var o = { v: 0 };
    gsap.to(o, { v: +el.dataset.to, duration: 2.2, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });

  // Generic rise-in reveals
  gsap.set('[data-rise]', { opacity: 0, y: 40 * D });
  ScrollTrigger.batch('[data-rise]', { start: 'top 90%', once: true,
    onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .9 * D, stagger: .1 * D, ease: 'power3.out' }); } });

  // About: mask wipe + parallax + float card
  gsap.from('.img-mask.big', { clipPath: 'inset(0 100% 0 0 round 24px)', duration: 1.3 * D, ease: 'power3.inOut', scrollTrigger: { trigger: '.collage', start: 'top 80%', once: true } });
  gsap.from('.img-mask.small', { clipPath: 'inset(100% 0 0 0 round 28px)', duration: 1.2 * D, delay: .4, ease: 'power3.inOut', scrollTrigger: { trigger: '.collage', start: 'top 80%', once: true } });
  gsap.from('.float-card', { x: -40 * D, opacity: 0, duration: .9, delay: .9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.collage', start: 'top 80%', once: true } });
  if (!reduce) {
    gsap.to('.img-mask.big img', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.collage', scrub: true } });
    gsap.to('.float-card', { y: -14, repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut' });
  }

  // Services: stagger panels in
  gsap.from('.panel', { y: 80 * D, opacity: 0, duration: 1, stagger: .15 * D, ease: 'power3.out', scrollTrigger: { trigger: '#panels', start: 'top 82%', once: true } });

  // Recent work: outlined text marquee scrubbed by scroll + slider
  if (!reduce) gsap.to('.big-text span', { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.work', scrub: 1, start: 'top bottom', end: 'bottom top' } });
  var idx = 0, slides = $('#slides'), n = $$('.slide').length, timer;
  function go(i) { idx = (i + n) % n; gsap.to(slides, { xPercent: -100 * idx, duration: .9 * D, ease: 'power3.inOut' });
    gsap.fromTo($$('.slide img')[idx], { scale: .85, rotate: -4 }, { scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.4)' }); }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(idx + 1); }, 4500); }
  $('#next').addEventListener('click', function () { go(idx + 1); auto(); });
  $('#prev').addEventListener('click', function () { go(idx - 1); auto(); });
  auto();

  // Logos marquee
  window.addEventListener('load', function () {
    if (reduce) return;
    var tr = $('#logoTrack'), half = tr.scrollWidth / 2;
    var tw = gsap.to(tr, { x: -half, duration: half / 50, ease: 'none', repeat: -1 });
    tr.addEventListener('mouseenter', function () { tw.pause(); });
    tr.addEventListener('mouseleave', function () { tw.play(); });
    ScrollTrigger.refresh();
  });

  // CTA rings
  if (!reduce) gsap.to('.rings i', { scale: 1.12, repeat: -1, yoyo: true, duration: 3, stagger: .5, ease: 'sine.inOut' });

  // Magnetic buttons
  if (!reduce && window.matchMedia('(hover:hover)').matches) $$('.magnetic').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
    b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); });
  });

  // Nav: solid on scroll, active link, progress bar
  ScrollTrigger.create({ start: 80, onUpdate: function (s) { $('#nav').classList.toggle('solid', s.scroll() > 80); } });
  gsap.to('.progress-bar-tm', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: .3, start: 0, end: 'max' } });
  $$('.menu a').forEach(function (a) {
    var sec = $(a.getAttribute('href')); if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (s) {
      if (s.isActive) { $$('.menu a').forEach(function (l) { l.classList.remove('on'); }); a.classList.add('on'); } } });
  });
})();

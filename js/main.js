/* Techno Matrix: one script for every page.
   Each block checks that its elements exist, so it is safe on index.html and about.html. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const G = window.gsap;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover:hover)').matches;
  const D = reduce ? 0 : 1; // multiply durations/distances: 0 = no motion

  /* ========== 1. Navigation: menu, solid bar, progress, active link ========== */
  const burger = $('#burger'), mmenu = $('#mmenu'), nav = $('#nav'), bar = $('.progress-bar-tm');
  const setMenu = open => {
    burger.classList.toggle('open', open);
    mmenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!mmenu.classList.contains('open')));
  $$('#mmenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  const spy = $$('.menu a[href^="#"], .sol-nav a[href^="#"]').map(a => [a, $(a.getAttribute('href'))]).filter(p => p[1]);
  const onScroll = () => {
    nav.classList.toggle('solid', scrollY > 80);
    bar.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight || 1)})`;
    let cur = null, best = -Infinity;
    spy.forEach(p => { const t = p[1].getBoundingClientRect().top; if (t < innerHeight * .45 && t > best) { best = t; cur = p; } });
    spy.forEach(p => p[0].classList.toggle('on', p === cur));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

/* ========== 2. Content built in JS (slider slides, logo strip) ========== */
  const slides = $('#slides'), logoTrack = $('#logoTrack');
  if (slides) slides.innerHTML = '<div class="slide"><img src="img/inner/recent-product-1.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-2.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-3.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>,<div class="slide"><img src="img/inner/recent-product-4.webp" alt="Worm gearbox with hydraulic motor" loading="lazy"></div>'.repeat(5);
  if (logoTrack) {
    const one = ['tuv', 'uca', 'aub', 'lls', 'pon','san','syn','ama','lmw','hub','sch','kd','jay','bro','pav','roots','vti','mub','krish','ss','mer','aero','iam','sky','bos','adv','pri','lcb'].map(n => `<img src="img/client/cllogo-${n}.jpg" alt="${n}" loading="lazy">`).join('');
    logoTrack.innerHTML = one.repeat(6);
  }

  /* ========== 3. Services panels (hover on desktop, tap on mobile) ========== */
  const panels = $$('.panel');
  panels.forEach(p => {
    const open = () => { panels.forEach(x => x.classList.remove('active')); p.classList.add('active'); };
    p.addEventListener('click', open);
    p.addEventListener('mouseenter', () => innerWidth > 991 && open());
  });

  /* ========== 4. Industries showcase (auto-plays while on screen) ========== */
  const showcase = $('.showcase');
  if (showcase) {
    const shots = $$('.shot'), items = $$('.ind'), fill = $('#bar'), label = $('.stage-label');
    let cur = 0, timer, paused = false, seen = false;
    const restartBar = () => { fill.classList.remove('run'); void fill.offsetWidth; if (seen && !paused) fill.classList.add('run'); };
    const show = i => {
      if (i === cur) return;
      shots.forEach(s => s.classList.remove('prev'));
      shots[cur].classList.replace('active', 'prev');
      shots[i].classList.add('active');
      items.forEach((b, k) => b.classList.toggle('active', k === i));
      cur = i;
      $('#curNum').textContent = '0' + (i + 1);
      $('#curName').textContent = $('h3', items[i]).textContent;
      label.classList.remove('swap'); void label.offsetWidth; label.classList.add('swap');
      restartBar();
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => seen && !paused && show((cur + 1) % shots.length), 5500); restartBar(); };
    items.forEach((b, k) => {
      b.addEventListener('click', () => { show(k); play(); });
      b.addEventListener('mouseenter', () => innerWidth > 991 && show(k));
    });
    showcase.addEventListener('mouseenter', () => { paused = true; fill.classList.remove('run'); });
    showcase.addEventListener('mouseleave', () => { paused = false; play(); });
    new IntersectionObserver(([e]) => { seen = e.isIntersecting && !reduce; play(); }, { threshold: .35 }).observe(showcase);
  }

  /* ========== 5. Certificates: 3D tilt + full-size viewer ========== */
  const tilt = (el, target, lift = '') => {
    if (!canHover || reduce) return;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      target.style.transform = `${lift} perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });
    el.addEventListener('mouseleave', () => (target.style.transform = ''));
  };
  $$('.cert-doc').forEach(d => tilt(d, d));

  const cards = $$('[data-img]'), modalEl = $('#certModal');
  if (cards.length && modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    let list = cards, n = 0; // list = cards currently visible on the page
    const view = i => {
      n = (i + list.length) % list.length;
      const d = list[n].dataset;
      $('#cmImg').src = d.img; $('#cmImg').alt = d.title;
      $('#cmTitle').textContent = d.title; $('#cmSub').textContent = d.sub;
    };
    cards.forEach(c => {
      const inner = $('.cert-inner', c);
      if (inner) tilt(c, inner, 'translateY(-10px)');
      c.addEventListener('click', () => { list = cards.filter(x => x.offsetParent); view(list.indexOf(c)); modal.show(); });
    });
    $('#cmPrev').addEventListener('click', () => view(n - 1));
    $('#cmNext').addEventListener('click', () => view(n + 1));
    modalEl.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') view(n - 1); if (e.key === 'ArrowRight') view(n + 1); });
  }

  /* ========== 5b. Products page: category filter (tabs + chooser cards) ========== */
  const filters = $$('[data-filter]');
  if (filters.length) {
    const secs = $$('.prod-sec');
    const apply = (f, scroll) => {
      filters.forEach(b => b.classList.toggle('on', b.dataset.filter === f));
      secs.forEach(s => (s.hidden = f !== 'all' && s.dataset.cat !== f));
      history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
      if (scroll) $('#categories').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (G) {
        G.fromTo('.prod-sec:not([hidden]) .prod-card', { opacity: 0, y: 40 * D, scale: .94 },
          { opacity: 1, y: 0, scale: 1, duration: .7 * D, stagger: .04 * D, ease: 'power3.out', clearProps: 'transform', overwrite: true });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }
    };
    filters.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter, !b.closest('.sol-nav'))));
    const start = location.hash.slice(1);
    if (secs.some(s => s.dataset.cat === start)) apply(start, false);
  }

  /* ========== Without GSAP: show everything and stop here ========== */
  if (!G) {
    document.head.insertAdjacentHTML('beforeend', '<style>.ch{opacity:1!important}</style>');
    $$('.count').forEach(c => (c.textContent = c.dataset.to));
    return;
  }
  G.registerPlugin(ScrollTrigger);
  const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });

  /* ========== 6. Hero: letter-by-letter fade ========== */
  const title = $('#heroTitle'), sub = $('#heroSub');
  if (title) {
    const split = el => {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      el.innerHTML = [...text].map(c => `<span class="ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
      return $$('.ch', el);
    };
    const t = split(title), s = split(sub);
    G.set('[data-hero]', { opacity: 0, y: 20 * D });
    G.timeline({ defaults: { ease: 'power2.out' } })
      .to('.kicker, .crumbs', { opacity: 1, y: 0, duration: .6 * D, stagger: .1 * D })
      .fromTo(t, { opacity: 0, y: 30 * D, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8 * D, stagger: .07 * D }, '-=.2')
      .fromTo(s, { opacity: 0 }, { opacity: 1, duration: .45 * D, stagger: .03 * D }, '-=.3')
      .to('[data-hero]:not(.kicker):not(.crumbs)', { opacity: 1, y: 0, duration: .7 * D, stagger: .15 * D }, '-=.2');
    if (!reduce) {
      G.fromTo('.hero-bg', { scale: 1.15 }, { scale: 1, duration: 2.5, ease: 'power2.out' });
      G.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ========== 7. Scroll reveals ========== */
  G.set('[data-rise]', { opacity: 0, y: 40 * D });
  ScrollTrigger.batch('[data-rise]', {
    start: 'top 90%', once: true,
    onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9 * D, stagger: .1 * D, ease: 'power3.out' })
  });

  $$('.count').forEach(el => {
    const o = { v: 0 };
    G.to(o, { v: +el.dataset.to, duration: 2.2, ease: 'power1.out', scrollTrigger: once(el, 'top 90%'), onUpdate: () => (el.textContent = Math.round(o.v)) });
  });

  /* ========== 8. About collage (home + about page) ========== */
  if ($('.collage')) {
    const st = once('.collage', 'top 80%');
    G.from('.img-mask.big', { clipPath: 'inset(0 100% 0 0 round 24px)', duration: 1.3 * D, ease: 'power3.inOut', scrollTrigger: st });
    G.from('.img-mask.small', { clipPath: 'inset(100% 0 0 0 round 28px)', duration: 1.2 * D, delay: .4, ease: 'power3.inOut', scrollTrigger: st });
    G.from('.float-card', { x: -40 * D, opacity: 0, duration: .9, delay: .9, ease: 'back.out(1.6)', scrollTrigger: st });
    if (!reduce) {
      G.to('.img-mask.big img', { yPercent: -9, ease: 'none', scrollTrigger: { trigger: '.collage', scrub: true } });
      G.to('.float-card', { y: -14, repeat: -1, yoyo: true, duration: 2.2, ease: 'sine.inOut' });
    }
  }

  /* ========== 9. Services panels entrance ========== */
  if (panels.length) G.from(panels, { y: 80 * D, opacity: 0, duration: 1, stagger: .15 * D, ease: 'power3.out', scrollTrigger: once('#panels', 'top 82%') });

  /* ========== 10. Recent work: scrolling outline text + slider ========== */
  if (slides) {
    if (!reduce) G.to('.big-text span', { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.work', scrub: 1, start: 'top bottom', end: 'bottom top' } });
    const total = slides.children.length;
    let i = 0, timer;
    const go = n => {
      i = (n + total) % total;
      G.to(slides, { xPercent: -100 * i, duration: .9 * D, ease: 'power3.inOut' });
      G.fromTo(slides.children[i].firstChild, { scale: .85, rotate: -4 }, { scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.4)' });
    };
    const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 4500); };
    $('#next').addEventListener('click', () => { go(i + 1); auto(); });
    $('#prev').addEventListener('click', () => { go(i - 1); auto(); });
    auto();
  }

  /* ========== 11. Customer logos: endless marquee ========== */
  if (logoTrack && !reduce) {
    addEventListener('load', () => {
      const half = logoTrack.scrollWidth / 2;
      const loop = G.to(logoTrack, { x: -half, duration: half / 50, ease: 'none', repeat: -1 });
      logoTrack.addEventListener('mouseenter', () => loop.pause());
      logoTrack.addEventListener('mouseleave', () => loop.play());
      ScrollTrigger.refresh();
    });
  }

  /* ========== 12. About page timeline ========== */
  if ($('#tl')) {
    if (!reduce) G.fromTo('#tlLine', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 65%', end: 'bottom 65%', scrub: .4 } });
    const wide = matchMedia('(min-width:768px)').matches;
    $$('.tl-item').forEach((item, k) => {
      const st = once(item);
      G.from($('.tl-card', item), { x: (wide ? (k % 2 ? 60 : -60) : 40) * D, opacity: 0, duration: .9 * D, ease: 'power3.out', scrollTrigger: st });
      G.from($('.dot', item), { scale: 0, duration: .6 * D, ease: 'back.out(2)', scrollTrigger: st });
    });
    $$('.cert-doc').forEach((d, k) => G.from(d, { x: (k % 2 ? 60 : -60) * D, opacity: 0, duration: 1.1 * D, ease: 'power3.out', scrollTrigger: once(d) }));
  }

  /* ========== 12b. Solutions page: image wipe + parallax ========== */
  $$('.sol-img').forEach((box, k) => {
    G.from(box, { clipPath: k % 2 ? 'inset(0 0 0 100% round 26px)' : 'inset(0 100% 0 0 round 26px)', duration: 1.3 * D, ease: 'power3.inOut', scrollTrigger: once(box) });
    if (!reduce) G.to($('img', box), { yPercent: -8, ease: 'none', scrollTrigger: { trigger: box, scrub: true } });
  });

  /* ========== 12c. Products page: cards pop in ========== */
  if ($('.prod-card')) {
    G.set('.prod-card', { opacity: 0, y: 50 * D, scale: .94 });
    ScrollTrigger.batch('.prod-card', { start: 'top 92%', once: true,
      onEnter: b => G.to(b, { opacity: 1, y: 0, scale: 1, duration: .8 * D, stagger: .07 * D, ease: 'power3.out', clearProps: 'transform' }) });
  }

  /* ========== 13. Extras: magnetic buttons, pulsing rings ========== */
  if (canHover && !reduce) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        G.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 });
      });
      b.addEventListener('mouseleave', () => G.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }
  if (!reduce) G.to('.rings i', { scale: 1.12, repeat: -1, yoyo: true, duration: 3, stagger: .5, ease: 'sine.inOut' });
})();

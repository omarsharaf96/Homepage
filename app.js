// Mobile navigation drawer
const navToggle = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');
const navBackdrop = document.getElementById('nav-backdrop');
const navLinks = document.getElementById('nav-links');
const siteNav = document.getElementById('site-nav');

function setNavOpen(open) {
  if (!navDrawer || !navToggle) return;
  navDrawer.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (navBackdrop) {
    navBackdrop.classList.toggle('open', open);
    navBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  document.body.classList.toggle('nav-open', open);
}

function closeNav() { setNavOpen(false); }

if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => setNavOpen(!navDrawer.classList.contains('open')));
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  if (navLinks) navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) closeNav();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeNav(); });
}

// Nav shadow on scroll
if (siteNav) {
  const onScroll = () => siteNav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Reveal on scroll
const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Active nav tab follows the section in view. Sections without a tab (logo strip,
// tech stack) keep the previous tab lit; the last tab wins at the bottom of the page.
const tabLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const tabSections = tabLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

function setActiveTab(id) {
  tabLinks.forEach(a => {
    const on = a.getAttribute('href') === '#' + id;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  });
}

if (tabSections.length) {
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
  const spy = () => {
    const line = navH + window.innerHeight * 0.3;
    let current = tabSections[0].id;
    tabSections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = tabSections[tabSections.length - 1].id;
    }
    setActiveTab(current);
  };

  // After a tab click, keep that tab lit until the smooth scroll settles,
  // instead of flickering through every section on the way.
  let clickLock = false;
  let lockTimer;
  const releaseLockSoon = () => {
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { clickLock = false; }, 150);
  };
  tabLinks.forEach(a => a.addEventListener('click', () => {
    setActiveTab(a.getAttribute('href').slice(1));
    clickLock = true;
    releaseLockSoon();
  }));

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (clickLock) { releaseLockSoon(); return; }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; spy(); });
  }, { passive: true });
  window.addEventListener('load', spy);
  spy();
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const accent = el.classList.contains('accent');
  if (reduceMotion || Number.isNaN(target)) {
    el.innerHTML = target + (suffix ? `<span class="plus">${suffix}</span>` : '');
    return;
  }
  const duration = 1100;
  const start = performance.now();
  const tick = now => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * eased);
    el.className = 'stat-num' + (accent ? ' accent' : '');
    el.innerHTML = value + (suffix ? `<span class="plus">${suffix}</span>` : '');
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statEls = document.querySelectorAll('.stat-num[data-count]');
if (statEls.length) {
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      statObs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statObs.observe(el));
}

// Photo frame pointer highlight
const photoFrame = document.getElementById('hero-photo-frame');
if (photoFrame && finePointer && !reduceMotion) {
  photoFrame.addEventListener('mousemove', e => {
    const r = photoFrame.getBoundingClientRect();
    photoFrame.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    photoFrame.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

// Contact form -> mailto fallback
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();
    const email = document.getElementById('femail').value.trim();
    const subject = document.getElementById('fsubject').value.trim();
    const message = document.getElementById('fmessage').value.trim();
    const body = `${message}\n\n— ${name}${email ? ' · ' + email : ''}`;
    const mailto = `mailto:omarsharaf96@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}

// Keep "N+ years" copy current: whole years elapsed since the YYYY-MM in data-years-since.
document.querySelectorAll('[data-years-since]').forEach(el => {
  const [y, m] = el.dataset.yearsSince.split('-').map(Number);
  const now = new Date();
  const years = now.getFullYear() - y - (now.getMonth() + 1 < m ? 1 : 0);
  if (el.dataset.count !== undefined) {
    el.dataset.count = years; // count-up stat: animation reads this when it runs
    el.firstChild.textContent = years;
  } else {
    el.textContent = years;
  }
});

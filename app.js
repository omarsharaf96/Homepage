// Mobile navigation drawer
const navToggle = document.getElementById('nav-toggle');
const navDrawer = document.getElementById('nav-drawer');
const navBackdrop = document.getElementById('nav-backdrop');
const navLinks = document.getElementById('nav-links');
const siteNav = document.getElementById('site-nav');

function setNavOpen(open) {
  if (!navDrawer || !navToggle) return;
  navDrawer.classList.toggle('open', open);
  navDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
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

// Active nav link
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
});

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

// Tilt on project cards
if (finePointer && !reduceMotion) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const glare = card.querySelector('.card-glare');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 7;
      const ry = (x - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      if (glare) glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.7), transparent 42%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      if (glare) glare.style.background = '';
    });
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

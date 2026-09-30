(function () {
  const root = document.documentElement;

  // Theme toggle — dark by default, choice persisted in localStorage.
  const btn = document.getElementById('theme-toggle');
  const sync = () => {
    const t = root.dataset.theme === 'light' ? 'light' : 'dark';
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  btn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('arn0-theme', root.dataset.theme); } catch (e) {}
    sync();
  });
  sync();

  // Fade-in on scroll.
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }
})();

const root = document.documentElement;

// Theme toggle — dark by default, choice persisted in localStorage.
const btn = document.getElementById('theme-toggle')!;
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

// Live Minecraft status on the Pi card. Stays hidden unless the Worker answers.
const piParts = document.querySelectorAll<HTMLElement>('[data-pi]');
if (piParts.length) {
  fetch('/api/pi', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((s) => {
      if (!s || typeof s.online !== 'boolean') return;
      const running = s.online && s.state === 'active';
      const set = (name: string, text: string) => (document.querySelector(`[data-pi-${name}]`)!.textContent = text);
      set('state', running ? 'online' : 'offline');
      set('players', `${s.players.online}/${s.players.max}`);
      set('mood', s.mood ?? '–');
      document.querySelector('[data-pi-live]')!.classList.toggle('on', running);
      piParts.forEach((el) => (el.hidden = false));
    })
    .catch(() => {});
}

// Reading list, served by the Worker at /api/books. Like the Pi card, it stays
// hidden unless the Worker answers with at least one book.
type Book = { title?: string; author?: string | null; href?: string };
const booksLog = document.querySelector<HTMLElement>('[data-books]');
if (booksLog) {
  fetch('/api/books', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((reading: { current?: Book[]; recent?: Book[] }) => {
      const shelves = [
        { books: reading?.current ?? [], label: 'reading', tagClass: 'mono acc', current: true },
        { books: reading?.recent ?? [], label: 'done', tagClass: 'mono muted', current: false },
      ];

      for (const shelf of shelves) {
        for (const book of shelf.books) {
          if (!book?.title || !book.href) continue;

          const tag = document.createElement('span');
          tag.className = shelf.tagClass;
          tag.textContent = shelf.label;

          // Titles and authors come from Hardcover: text nodes, never innerHTML.
          const link = document.createElement('a');
          link.href = book.href;
          link.target = '_blank';
          link.append(book.title);

          if (shelf.current) {
            link.className = 'w500';
            if (book.author) {
              const author = document.createElement('span');
              author.className = 'muted w400';
              author.textContent = `— ${book.author}`;
              link.append(' ', author);
            }
          }

          booksLog.append(tag, link);
        }
      }

      booksLog.hidden = booksLog.childElementCount === 0;
    })
    .catch(() => {});
}

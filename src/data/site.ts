// All the site's content. The page, llms.txt and the JSON-LD are generated from here.

export const profile = {
  name: 'Arnaud Etienne',
  url: 'https://arn0.be/',
  description: 'Arnaud Etienne, software engineer from Belgium. Writing, projects and CV.',
  image: '/img/profile.png',
  cv: '/cv/arnaud_etienne_CV.pdf',
  jobTitle: 'Software Engineer',
  intro: "Welcome to my personal website 👋 I'm Arnaud, a software engineer from Belgium 🇧🇪",
  // HTML allowed in `about` and `interests` (stripped for llms.txt).
  about:
    'Full-stack engineer with a backend-heavy focus, comfortable writing solid SQL and designing event-driven systems (RabbitMQ). Cares about test coverage as a tool for confidence rather than a box to tick. At ease across the infra stack, from Docker and Kubernetes to Terraform and CI/CD <span class="ink">("Started from Heroku, now we here.")</span>. Uses AI coding assistants daily as leverage on top of solid fundamentals. Values clean, readable solutions, mentoring, thorough code reviews and honest technical feedback.',
  now: 'Software Engineer at Commuty, since Nov 2023.',
  interests:
    'Off the keyboard: hiking, squash, skiing in the 4 Vallées, beers with friends, sci-fi/fantasy, catching up on classic video games, and <a href="https://chez.arn0.be" target="_blank" class="ink underline">eating</a>.',
  stack: ['Rails', 'Quarkus', 'JS', 'PostgreSQL', 'RabbitMQ', 'Docker', 'Kubernetes', 'Terraform', 'AWS'],
  knowsAbout: [
    'Ruby on Rails', 'Quarkus', 'Java', 'Angular', 'React', 'TypeScript', 'PostgreSQL', 'Kubernetes',
    'Docker', 'AWS', 'Microservices', 'System Architecture', 'RabbitMQ', 'Terraform',
  ],
};

export const goodreads = {
  userId: '74340196',
  profile: 'https://www.goodreads.com/user/show/74340196-arnaud-etienne',
  recentlyRead: 3,
};

export const links = [
  { label: 'github.com/NelsonEU', href: 'https://github.com/NelsonEU' },
  { label: 'linkedin.com/in/arnaud-etienne', href: 'https://www.linkedin.com/in/arnaud-etienne-1655ba68' },
  { label: 'medium.com/@arnaudetienne', href: 'https://medium.com/@arnaudetienne' },
];

export type Article = { title: string; date: string; dek: string; href: string };

// Newest first. The first one gets the `new` badge.
export const articles: Article[] = [
  {
    title: 'From a forgotten PDF to a full-stack app with an AI sous-chef',
    date: '2026-09-18',
    dek: 'How a simple food menu PDF grew into a full-stack app with an AI that fills in the recipes for you.',
    href: 'https://medium.com/@arnaudetienne/from-a-forgotten-pdf-to-a-full-stack-app-with-an-ai-sous-chef-38dccca5b36a',
  },
  {
    title: 'Is Your Staging Environment Secure?',
    date: '2026-01-26',
    dek: 'A personal story about discovering a public staging environment.',
    href: 'https://medium.com/@arnaudetienne/is-your-staging-environment-secure-d6985250f145',
  },
  {
    title: 'Self-Hosting Minecraft on a Raspberry Pi 5, Part 2',
    date: '2025-11-27',
    dek: 'A lightweight monitoring dashboard with FastAPI, system metrics and server controls.',
    href: 'https://medium.com/@arnaudetienne/self-hosting-minecraft-on-a-raspberry-pi-5-part-2-92fba5da794d',
  },
  {
    title: 'Self-Hosting Minecraft on a Raspberry Pi 5',
    date: '2025-11-25',
    dek: 'From bare Pi to a self-hosted Minecraft server with backups and remote access.',
    href: 'https://medium.com/@arnaudetienne/self-hosting-minecraft-on-a-raspberry-pi-5-ff4463cdeb47',
  },
  {
    title: 'Optimizing database queries in Rails with Active Record',
    date: '2023-07-05',
    dek: 'Practical techniques to track, understand and fix slow queries in real projects.',
    href: 'https://medium.com/@arnaudetienne/optimizing-database-queries-in-rails-with-active-record-b84295866af0',
  },
];

export type Project = {
  dir: string;
  title: string;
  text: string;
  href: string;
  wip?: boolean;
  // Shows the live Minecraft server status, served by the Worker at /api/pi (see worker/).
  liveStatus?: boolean;
};

export const projects: Project[] = [
  {
    dir: 'chez/',
    title: 'chez.arn0.be ↗',
    text: 'My food and recipe app. A forgotten menu PDF turned full-stack app, with an AI sous-chef that fills in the recipes.',
    href: 'https://chez.arn0.be',
  },
  {
    dir: 'tools/',
    title: 'tools.arn0.be ↗',
    text: 'Small dev utilities in one place: JSON, JWT, Base64, hashes, IDs, timestamps, cron and regex. Everything runs in the browser, nothing you paste leaves it.',
    href: 'https://tools.arn0.be',
  },
  {
    dir: 'pi-minecraft/',
    title: 'Minecraft on a Raspberry Pi 5',
    text: 'Self-hosted with backups and remote access, monitored by a small FastAPI dashboard.',
    href: 'https://medium.com/@arnaudetienne/self-hosting-minecraft-on-a-raspberry-pi-5-ff4463cdeb47',
    liveStatus: true,
  },
];

export type Experience = {
  when: string;
  role: string;
  org: string;
  href?: string;
  note: string;
  bullets?: string[];
};

export const experience: Experience[] = [
  {
    when: '2023-11 → now',
    role: 'Software Engineer',
    org: 'Commuty',
    href: 'https://commuty.com',
    note: 'Core parking booking features, public APIs and statistics pipelines, across the whole stack:',
    bullets: [
      'Rails and Quarkus services in a 10+ microservices, event-driven architecture over RabbitMQ',
      'Angular web app built on an internal component library, plus an Ionic mobile app',
      'Connectors between our Parking Access API and external access-control systems (Syntegro, SALTO KS…)',
      'Kubernetes deployments with Helm, AWS infrastructure with Terraform, CI/CD pipelines',
    ],
  },
  {
    when: '2022-07 → 2023-10',
    role: 'Lead Developer',
    org: 'Squarehub',
    href: 'https://squarehub.eu',
    note: "Led the development of Squarehub's recruitment platform: product decisions, architecture and day-to-day delivery.",
    bullets: [
      'Managed and coached a team of 3 software engineers',
      'Defined product priorities and technical roadmap',
      'Improved internal tools and automation',
      'Oversaw data security and compliance',
      'Handled internal IT hiring',
      'Worked closely with founders on business needs',
    ],
  },
  {
    when: '2019-12 → 2022-06',
    role: 'Full-stack Developer',
    org: 'Overloop',
    href: 'https://overloop.com',
    note: 'Ember.js + Rails CRM.',
  },
  {
    when: '2019-02 → 2019-05',
    role: 'Mobile Development Intern',
    org: 'RiseUp',
    note: 'Xamarin app built from scratch.',
  },
];

export const education = {
  when: '2015 → 2019',
  role: 'BSc Computer Science and Management',
  org: 'Institut Paul Lambin',
  href: 'https://www.vinci.be/en',
  note: 'Cum Laude. Exchange at Cégep de Chicoutimi, Canada (2018).',
};

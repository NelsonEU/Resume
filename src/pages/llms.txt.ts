import type { APIRoute } from 'astro';
import { profile, articles, projects, experience, education, links } from '../data/site';

const text = (html: string) => html.replace(/<[^>]+>/g, '');
const abs = (path: string) => new URL(path, profile.url).href;
const title = (t: string) => t.replace(/ ↗$/, '');

// Markdown summary of the site for LLMs (https://llmstxt.org), generated from the same data as the page.
export const GET: APIRoute = () => {
  const body = `# ${profile.name}

> ${profile.description}

${text(profile.about)}

Currently: ${profile.now}

Stack: ${profile.stack.join(', ')}.

## Experience

${experience
  .map((e) => {
    const org = e.href ? `[${e.org}](${e.href})` : e.org;
    const bullets = e.bullets ? ' ' + e.bullets.join('; ') + '.' : '';
    return `- ${e.role}, ${org} (${e.when}): ${e.note}${bullets}`;
  })
  .join('\n')}

## Education

- ${education.role}, [${education.org}](${education.href}) (${education.when}): ${education.note}

## Articles

${articles.map((a) => `- [${a.title}](${a.href}) (${a.date}): ${a.dek}`).join('\n')}

## Projects

${projects.map((p) => `- [${title(p.title)}](${p.href})${p.wip ? ' (work in progress)' : ''}: ${p.text}`).join('\n')}

## Links

- [Website](${profile.url})
- [CV (PDF)](${abs(profile.cv)})
${links.map((l) => `- [${l.label}](${l.href})`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

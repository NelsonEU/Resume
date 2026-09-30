import { XMLParser } from 'fast-xml-parser';
import { goodreads } from '../data/site';

export type Book = { title: string; author: string; href: string; readAt?: Date };
export type Reading = { current: Book[]; recent: Book[] };

type Item = {
  title: string | number;
  author_name: string;
  book_id: string | number;
  user_read_at?: string;
};

// Goodreads' public RSS feeds, undocumented since the API was retired in 2020.
// Fetched once per build; the page is rebuilt daily by CI to stay current.
async function shelf(name: string): Promise<Item[]> {
  const url = `https://www.goodreads.com/review/list_rss/${goodreads.userId}?shelf=${name}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'arn0.be build' } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const xml = new XMLParser().parse(await res.text());
  const items = xml?.rss?.channel?.item ?? [];
  return Array.isArray(items) ? items : [items];
}

const toBook = (item: Item): Book => ({
  // Drop the series suffix: "Jade City (The Green Bone Saga, #1)" → "Jade City".
  title: String(item.title).replace(/\s*\([^)]*#\d+(\.\d+)?\)$/, ''),
  author: item.author_name,
  href: `https://www.goodreads.com/book/show/${item.book_id}`,
  readAt: item.user_read_at ? new Date(item.user_read_at) : undefined,
});

let cache: Promise<Reading> | undefined;

// A Goodreads outage shouldn't block a deploy: warn and render without books.
export function getReading(): Promise<Reading> {
  cache ??= Promise.all([shelf('currently-reading'), shelf('read')])
    .then(([current, read]) => ({
      current: current.map(toBook),
      recent: read
        .map(toBook)
        .filter((b) => b.readAt)
        .sort((a, b) => b.readAt!.getTime() - a.readAt!.getTime())
        .slice(0, goodreads.recentlyRead),
    }))
    .catch((err) => {
      console.warn(`[goodreads] ${err.message}. Rendering without the reading list.`);
      return { current: [], recent: [] };
    });
  return cache;
}

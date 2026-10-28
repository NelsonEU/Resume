// Public, cached proxy for the reading list on Hardcover.
// Hardcover needs a bearer token; it stays here as a Worker secret, and only
// the title, author and link of each book are passed on to the browser.

import { cachedJson } from './cache';

export interface BooksEnv {
  HARDCOVER_TOKEN: string;
}

export type Book = { title: string; author: string | null; href: string; readAt?: string };
export type Reading = { current: Book[]; recent: Book[] };

const ENDPOINT = 'https://api.hardcover.app/v1/graphql';

// A reading list moves a few times a month; no point asking Hardcover more often.
const TTL_SECONDS = 6 * 60 * 60;
const FAILURE_TTL_SECONDS = 60;
const UPSTREAM_TIMEOUT_MS = 8000;

const RECENTLY_READ = 3;
const STATUS_CURRENTLY_READING = 2;
const STATUS_READ = 3;

// A finish date lives on the child read rows rather than on user_books, and a
// book may have several (a reread is a row of its own), so the whole read shelf
// comes back and the sorting happens here. Books that came over from Goodreads
// often arrive without those rows at all, so the denormalized last_read_date is
// kept as a fallback. The limit is a guard, not a page: it only has to stay
// ahead of the shelf.
const QUERY = `
  query Reading($currentStatus: Int!, $readStatus: Int!, $shelfLimit: Int!) {
    me {
      current: user_books(where: { status_id: { _eq: $currentStatus } }, limit: $shelfLimit) {
        book { title slug contributions { author { name } } }
      }
      read: user_books(where: { status_id: { _eq: $readStatus } }, limit: $shelfLimit) {
        last_read_date
        book { title slug contributions { author { name } } }
        user_book_reads { finished_at }
      }
    }
  }
`;

const SHELF_LIMIT = 500;

type GqlBook = {
  title?: string | null;
  slug?: string | null;
  contributions?: ({ author?: { name?: string | null } | null } | null)[] | null;
};

type GqlUserBook = {
  last_read_date?: string | null;
  book?: GqlBook | null;
  user_book_reads?: ({ finished_at?: string | null } | null)[] | null;
};

export function handleBooks(request: Request, env: BooksEnv, ctx: ExecutionContext): Promise<Response> {
  return cachedJson(request, ctx, {
    path: '/api/books',
    ttlSeconds: TTL_SECONDS,
    failureTtlSeconds: FAILURE_TTL_SECONDS,
    load: () => fetchReading(env),
  });
}

async function fetchReading(env: BooksEnv): Promise<Reading> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.HARDCOVER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: {
        currentStatus: STATUS_CURRENTLY_READING,
        readStatus: STATUS_READ,
        shelfLimit: SHELF_LIMIT,
      },
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`upstream returned ${res.status}`);

  // GraphQL answers 200 even when it refuses: a dead token or a renamed field
  // comes back as an `errors` array, so an empty list would otherwise look like
  // an empty shelf and quietly render nothing.
  const payload = (await res.json()) as {
    data?: { me?: unknown } | null;
    errors?: { message?: string }[] | null;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((e) => e.message ?? 'unknown error').join('; '));
  }

  const { current, read } = shelves(payload.data?.me);
  return {
    current: current.map((row) => toBook(row)).filter(isBook),
    recent: read
      .map((row) => ({ row, finishedAt: finishedAt(row) }))
      .filter((entry): entry is { row: GqlUserBook; finishedAt: string } => !!entry.finishedAt)
      // ISO timestamps, so lexical order is chronological order.
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
      .slice(0, RECENTLY_READ)
      .map(({ row, finishedAt }) => toBook(row, finishedAt))
      .filter(isBook),
  };
}

// `me` comes back as a single-row list.
function shelves(me: unknown): { current: GqlUserBook[]; read: GqlUserBook[] } {
  const node = (Array.isArray(me) ? me[0] : me) as
    | { current?: GqlUserBook[] | null; read?: GqlUserBook[] | null }
    | null
    | undefined;
  return { current: node?.current ?? [], read: node?.read ?? [] };
}

function finishedAt(row: GqlUserBook): string | undefined {
  const dates = (row.user_book_reads ?? [])
    .map((read) => read?.finished_at)
    .filter((date): date is string => !!date)
    .sort();
  return dates.at(-1) ?? row.last_read_date ?? undefined;
}

function toBook(row: GqlUserBook, readAt?: string): Book | null {
  const book = row.book;
  if (!book?.title || !book.slug) return null;
  return {
    // Drop the series suffix: "Jade City (The Green Bone Saga, #1)" -> "Jade City".
    title: book.title.replace(/\s*\([^)]*#\d+(\.\d+)?\)$/, ''),
    author: book.contributions?.[0]?.author?.name ?? null,
    href: `https://hardcover.app/books/${book.slug}`,
    ...(readAt ? { readAt } : {}),
  };
}

const isBook = (book: Book | null): book is Book => book !== null;

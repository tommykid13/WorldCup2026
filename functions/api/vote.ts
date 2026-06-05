interface Env {
  VOTES: KVNamespace;
}

const CATEGORIES = ['champion', 'runnerup', 'semifinal'] as const;
const CACHE_KEY = 'cache:votes';
const CACHE_TTL = 30; // seconds

const headers = {
  'Content-Type': 'application/json',
};

async function aggregateVotes(kv: KVNamespace): Promise<Record<string, Record<string, number>>> {
  const result: Record<string, Record<string, number>> = {
    champion: {},
    runnerup: {},
    semifinal: {},
  };
  for (const cat of CATEGORIES) {
    let cursor: string | undefined;
    do {
      const list = await kv.list({ prefix: `v:${cat}:`, cursor });
      for (const key of list.keys) {
        // key.name = "v:{category}:{teamId}:{ts}:{rand}"
        const teamId = key.name.split(':')[2];
        if (teamId) {
          result[cat][teamId] = (result[cat][teamId] || 0) + 1;
        }
      }
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);
  }
  return result;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const method = request.method;

  if (!env.VOTES) {
    return new Response(JSON.stringify({ error: 'KV not bound' }), { status: 500, headers });
  }

  if (method === 'GET') {
    try {
      const cached = await env.VOTES.get(CACHE_KEY, 'json');
      if (cached) return new Response(JSON.stringify(cached), { headers });

      const result = await aggregateVotes(env.VOTES);
      await env.VOTES.put(CACHE_KEY, JSON.stringify(result), { expirationTtl: CACHE_TTL });
      return new Response(JSON.stringify(result), { headers });
    } catch {
      return new Response(JSON.stringify({ error: 'KV read failed' }), { status: 500, headers });
    }
  }

  if (method === 'POST') {
    try {
      const body = (await request.json()) as { category?: string; teamId?: string };
      if (
        !body.category ||
        !(CATEGORIES as readonly string[]).includes(body.category) ||
        !body.teamId ||
        typeof body.teamId !== 'string'
      ) {
        return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers });
      }

      // Append-only: each vote is a unique key — no read-modify-write, no race condition
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      await env.VOTES.put(`v:${body.category}:${body.teamId}:${ts}:${rand}`, '1', {
        expirationTtl: 86400 * 90, // auto-cleanup after 90 days
      });

      // Invalidate cache
      await env.VOTES.delete(CACHE_KEY);

      // Return fresh aggregated data
      const result = await aggregateVotes(env.VOTES);
      return new Response(JSON.stringify(result), { headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

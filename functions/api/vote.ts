interface Env {
  VOTES: KVNamespace;
}

const CATEGORIES = new Set(['champion', 'runnerup', 'semifinal']);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMPTY = { champion: {}, runnerup: {}, semifinal: {} };

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (method === 'GET') {
    const data = await env.VOTES.get('poll', 'json') || EMPTY;
    return new Response(JSON.stringify(data), { headers });
  }

  if (method === 'POST') {
    try {
      const body = (await request.json()) as { category?: string; teamId?: string };
      if (!body.category || !CATEGORIES.has(body.category) || !body.teamId || typeof body.teamId !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid' }), { status: 400, headers });
      }

      const data = (await env.VOTES.get('poll', 'json')) as Record<string, Record<string, number>> | null;
      const votes = data || { champion: {}, runnerup: {}, semifinal: {} };
      const cat = body.category;
      if (!votes[cat]) votes[cat] = {};
      votes[cat][body.teamId] = (votes[cat][body.teamId] || 0) + 1;
      await env.VOTES.put('poll', JSON.stringify(votes));

      return new Response(JSON.stringify(votes), { headers });
    } catch {
      return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400, headers });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};

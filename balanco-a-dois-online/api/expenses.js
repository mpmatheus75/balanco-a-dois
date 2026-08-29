const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const map = await redis.hgetall('expenses');
      const list = map ? Object.values(map) : [];
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || typeof body.amount !== 'number' || body.amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }
      const entry = {
        amount: body.amount,
        category: body.category || 'outros',
        desc: body.desc || '',
        date: body.date || new Date().toISOString().slice(0, 10),
        person: body.person || '',
        id: 'e' + Date.now() + Math.random().toString(36).slice(2, 7),
        createdAt: Date.now(),
      };
      await redis.hset('expenses', { [entry.id]: entry });
      return res.status(201).json(entry);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

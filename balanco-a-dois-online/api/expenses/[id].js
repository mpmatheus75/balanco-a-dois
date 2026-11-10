const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      await redis.hdel('expenses', id);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PUT') {
      const body = req.body;
      if (!body || typeof body.amount !== 'number' || body.amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }
      const current = await redis.hget('expenses', id);
      if (!current) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }
      const entry = {
        ...current,
        amount: body.amount,
        category: body.category || current.category || 'outros',
        payment: body.payment || '',
        desc: body.desc || '',
        date: body.date || current.date,
        person: body.person || current.person,
        id: current.id,
        updatedAt: Date.now(),
      };
      await redis.hset('expenses', { [id]: entry });
      return res.status(200).json(entry);
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

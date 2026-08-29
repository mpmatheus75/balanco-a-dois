const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      await redis.hdel('expenses', id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const { Redis } = require('@upstash/redis');
const redis = Redis.fromEnv();

const DEFAULT_SETTINGS = { names: ['Você', 'Esposa'] };

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      let settings = await redis.get('settings');
      if (!settings) {
        settings = DEFAULT_SETTINGS;
        await redis.set('settings', settings);
      }
      return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
      const settings = req.body;
      if (!settings || !Array.isArray(settings.names) || settings.names.length !== 2) {
        return res.status(400).json({ error: 'Formato inválido: esperado { names: [nome1, nome2] }' });
      }
      await redis.set('settings', settings);
      return res.status(200).json(settings);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

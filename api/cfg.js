export default function handler(req, res) {
  const cfg = {
    apiKey:            process.env.FB_API_KEY            || '',
    authDomain:        process.env.FB_AUTH_DOMAIN        || '',
    databaseURL:       process.env.FB_DATABASE_URL       || '',
    projectId:         process.env.FB_PROJECT_ID         || '',
    storageBucket:     process.env.FB_STORAGE_BUCKET     || '',
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID || '',
    appId:             process.env.FB_APP_ID             || '',
  };

  if (!cfg.apiKey || !cfg.databaseURL) {
    return res.status(503).json({ error: 'Firebase not configured on server' });
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(cfg);
}

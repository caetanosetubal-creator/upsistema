export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return res.status(500).json({ ok: false, error: 'APPS_SCRIPT_URL não configurada no Vercel' });
  }

  try {
    const payload =
      typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body || {});

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload,
      redirect: 'follow'
    });

    const text = await upstream.text();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Erro ao conectar com Apps Script'
    });
  }
}

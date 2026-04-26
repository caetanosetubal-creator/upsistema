export default async function handler(req, res) {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbzO5DKp1jAB0_hQSHYy0m6ISr0bF8Cy0RTNTWUKC20lnsbUtF8fa6hKsZDTDtRjiX_K/exec';

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Proxy ativo',
      hasEnv: true
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Método não permitido'
    });
  }

  try {
    const payload =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body || {});

    const action = payload.action || '';

    // Para sincronização/leitura, usa GET no Apps Script
    if (action === 'getAll') {
      const upstream = await fetch(scriptUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      const text = await upstream.text();
      const contentType =
        upstream.headers.get('content-type') || 'application/json; charset=utf-8';

      res.setHeader('Content-Type', contentType);
      return res.status(upstream.status || 200).send(text);
    }

    // Para outras ações, mantém POST
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await upstream.text();
    const contentType =
      upstream.headers.get('content-type') || 'application/json; charset=utf-8';

    res.setHeader('Content-Type', contentType);
    return res.status(upstream.status || 200).send(text);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Erro ao conectar com Apps Script',
      name: error?.name || null
    });
  }
}

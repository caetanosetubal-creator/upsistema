export default async function handler(req, res) {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbweD5kT1VBX6Nuxpi37TwT20wtNbWRB5xkStYKsWHx2Pv__pOxatMPiY0cESLQ4E6kPCA/exec';

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
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

    const payload =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body || {});

    const action = String(payload.action || '').trim();

    if (action === 'getAll') {
      const upstream = await fetch(scriptUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      const text = await upstream.text();

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return res.status(502).json({
          ok: false,
          error: 'Resposta inválida do Apps Script em getAll',
          raw: text
        });
      }

      return res.status(200).json({
        ok: !!parsed.success || !!parsed.ok,
        user: parsed.user || null,
        data: parsed.data || {},
        error: parsed.error || null,
        raw: parsed
      });
    }

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const text = await upstream.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Resposta inválida do Apps Script em POST',
        raw: text
      });
    }

    return res.status(200).json({
      ok: !!parsed.success || !!parsed.ok,
      user: parsed.user || null,
      data: parsed.data || {},
      error: parsed.error || null,
      raw: parsed
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Erro interno no proxy',
      name: error?.name || null
    });
  }
}

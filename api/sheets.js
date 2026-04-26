export default async function handler(req, res) {
 const scriptUrl = process.env.APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzO5DKp1jAB0_hQSHYy0m6ISr0bF8Cy0RTNTWUKC20lnsbUtF8fa6hKsZDTDtRjiX_K/exec';

  if (!scriptUrl) {
    return res.status(500).json({
      ok: false,
      error: 'APPS_SCRIPT_URL não configurada no Vercel'
    });
  }

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

    if (action === 'getAll') {
      const upstream = await fetch(scriptUrl, {
        method: 'GET',
        redirect: 'follow'
      });

      const text = await upstream.text();
      const parsed = JSON.parse(text);

      return res.status(200).json({
        ok: !!parsed.success,
        data: parsed.data || {},
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
      parsed = { success: false, error: text };
    }

    return res.status(200).json({
      ok: !!parsed.success || !!parsed.ok,
      data: parsed.data || {},
      raw: parsed
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Erro ao conectar com Apps Script',
      name: error?.name || null
    });
  }
}

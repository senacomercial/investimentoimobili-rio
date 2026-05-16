exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const PIXEL_ID = '2667374110326634';
  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

  if (!ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Token não configurado' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  const { eventId, userAgent, eventSourceUrl } = body;

  const clientIp =
    event.headers['x-forwarded-for']?.split(',')[0].trim() ||
    event.headers['client-ip'] ||
    '0.0.0.0';

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: userAgent,
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  return {
    statusCode: response.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
};

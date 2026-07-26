exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  try {
    const { password } = JSON.parse(event.body || '{}');
    const valid = !!password && password === process.env.ADMIN_PASSWORD;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid })
    };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ valid: false, error: 'Bad request' }) };
  }
};

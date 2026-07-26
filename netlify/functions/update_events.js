const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const pw = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const bucket = process.env.SUPABASE_DATA_BUCKET || 'site-data';

    let events = [];
    const { data } = await supabase.storage.from(bucket).download('events.json');
    if (data) {
      try {
        events = JSON.parse(await data.text());
      } catch (e) {
        events = [];
      }
    }

    if (body.operation === 'delete' && body.id) {
      events = events.filter((e) => e.id !== body.id);
    } else if (body.event) {
      const newEvent = { id: body.event.id || `${Date.now()}`, ...body.event };
      events = events.filter((e) => e.id !== newEvent.id);
      events.push(newEvent);
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'event or delete operation required' }) };
    }

    const payload = Buffer.from(JSON.stringify(events, null, 2));
    const { error: upErr } = await supabase.storage.from(bucket).upload('events.json', payload, {
      contentType: 'application/json',
      upsert: true
    });
    if (upErr) throw upErr;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, events })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Update failed' })
    };
  }
};

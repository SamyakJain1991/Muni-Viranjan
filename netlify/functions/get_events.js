const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const bucket = process.env.SUPABASE_DATA_BUCKET || 'site-data';

    const { data, error } = await supabase.storage.from(bucket).download('events.json');

    if (error) {
      // File may not exist yet - treat as no events instead of erroring out
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: '[]'
      };
    }

    const text = await data.text();
    let events = [];
    try {
      events = JSON.parse(text);
    } catch (e) {
      events = [];
    }

    events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to fetch events' })
    };
  }
};

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
    const { filePath } = JSON.parse(event.body || '{}');
    if (!filePath) {
      return { statusCode: 400, body: JSON.stringify({ error: 'filePath is required' }) };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const bucket = process.env.SUPABASE_BUCKET || 'gallery';

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Delete failed' })
    };
  }
};

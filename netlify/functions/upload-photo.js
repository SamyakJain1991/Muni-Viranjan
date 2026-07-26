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
    const { filename, contentType, dataBase64 } = JSON.parse(event.body || '{}');
    if (!filename || !dataBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'filename and dataBase64 are required' })
      };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const bucket = process.env.SUPABASE_BUCKET || 'gallery';

    const buffer = Buffer.from(dataBase64, 'base64');
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(safeName, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      });

    if (error) throw error;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(safeName);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: pub.publicUrl, filePath: safeName })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Upload failed' })
    };
  }
};

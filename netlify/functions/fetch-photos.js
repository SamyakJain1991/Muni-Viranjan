const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const bucket = process.env.SUPABASE_BUCKET || 'gallery';

    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw error;

    const files = (data || []).filter((f) => f.name && !f.name.startsWith('.'));

    const photos = files.map((f) => {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(f.name);
      return { url: pub.publicUrl, filePath: f.name };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photos)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to fetch photos' })
    };
  }
};

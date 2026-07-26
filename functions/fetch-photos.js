export async function onRequestGet(context) {
  try {
    const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } = context.env;
    const bucket = SUPABASE_BUCKET || 'gallery-images';

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ prefix: '', sortBy: { column: 'created_at', order: 'desc' } })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    const files = (data || []).filter((f) => f.name && !f.name.startsWith('.'));
    const photos = files.map((f) => ({
      url: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(f.name)}`,
      filePath: f.name
    }));

    return new Response(JSON.stringify(photos), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch photos' }), { status: 500 });
  }
}

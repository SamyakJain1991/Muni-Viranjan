export async function onRequestPost(context) {
  const pw = context.request.headers.get('x-admin-password');
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { filename, contentType, dataBase64 } = await context.request.json();
    if (!filename || !dataBase64) {
      return new Response(JSON.stringify({ error: 'filename and dataBase64 are required' }), { status: 400 });
    }

    const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } = context.env;
    const bucket = SUPABASE_BUCKET || 'gallery-images';
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const binary = Uint8Array.from(atob(dataBase64), (c) => c.charCodeAt(0));

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(safeName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: binary
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(safeName)}`;
    return new Response(JSON.stringify({ url, filePath: safeName }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), { status: 500 });
  }
}

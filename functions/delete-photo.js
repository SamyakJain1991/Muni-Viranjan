export async function onRequestPost(context) {
  const pw = context.request.headers.get('x-admin-password');
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { filePath } = await context.request.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: 'filePath is required' }), { status: 400 });
    }

    const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } = context.env;
    const bucket = SUPABASE_BUCKET || 'gallery-images';

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ prefixes: [filePath] })
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Delete failed' }), { status: 500 });
  }
}

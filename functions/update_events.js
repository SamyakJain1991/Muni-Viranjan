export async function onRequestPost(context) {
  const pw = context.request.headers.get('x-admin-password');
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await context.request.json();
    const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_DATA_BUCKET } = context.env;
    const bucket = SUPABASE_DATA_BUCKET || 'site-data';

    let events = [];
    const getRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/events.json`);
    if (getRes.ok) {
      events = await getRes.json().catch(() => []);
    }

    if (body.operation === 'delete' && body.id) {
      events = events.filter((e) => e.id !== body.id);
    } else if (body.event) {
      const newEvent = { id: body.event.id || `${Date.now()}`, ...body.event };
      events = events.filter((e) => e.id !== newEvent.id);
      events.push(newEvent);
    } else {
      return new Response(JSON.stringify({ error: 'event or delete operation required' }), { status: 400 });
    }

    const putRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/events.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'x-upsert': 'true'
      },
      body: JSON.stringify(events, null, 2)
    });

    if (!putRes.ok) {
      throw new Error(await putRes.text());
    }

    return new Response(JSON.stringify({ success: true, events }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Update failed' }), { status: 500 });
  }
}

export async function onRequestGet(context) {
  try {
    const { SUPABASE_URL, SUPABASE_DATA_BUCKET } = context.env;
    const bucket = SUPABASE_DATA_BUCKET || 'site-data';

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/events.json`);
    let events = [];
    if (res.ok) {
      events = await res.json().catch(() => []);
    }

    events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    return new Response(JSON.stringify(events), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch events' }), { status: 500 });
  }
}

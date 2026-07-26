export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();
    const valid = !!password && password === context.env.ADMIN_PASSWORD;
    return new Response(JSON.stringify({ valid }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: 'Bad request' }), { status: 400 });
  }
}

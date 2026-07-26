import { onRequestPost as verifyPassword } from './functions/verify-password.js';
import { onRequestGet as fetchPhotos } from './functions/fetch-photos.js';
import { onRequestPost as uploadPhoto } from './functions/upload-photo.js';
import { onRequestPost as deletePhoto } from './functions/delete-photo.js';
import { onRequestGet as getEvents } from './functions/get_events.js';
import { onRequestPost as updateEvents } from './functions/update_events.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const context = { request, env, ctx };

    try {
      if (path === '/verify-password' && request.method === 'POST') return await verifyPassword(context);
      if (path === '/fetch-photos' && request.method === 'GET') return await fetchPhotos(context);
      if (path === '/upload-photo' && request.method === 'POST') return await uploadPhoto(context);
      if (path === '/delete-photo' && request.method === 'POST') return await deletePhoto(context);
      if (path === '/get_events' && request.method === 'GET') return await getEvents(context);
      if (path === '/update_events' && request.method === 'POST') return await updateEvents(context);
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Everything else: serve static files (HTML, CSS, JS, images)
    if (path === '/') {
      const homeUrl = new URL('/jansant1.html', url.origin);
      return env.ASSETS.fetch(new Request(homeUrl.toString(), request));
    }

    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && !path.includes('.')) {
      const htmlUrl = new URL(`${path}.html`, url.origin);
      response = await env.ASSETS.fetch(new Request(htmlUrl.toString(), request));
    }
    return response;
  }
};

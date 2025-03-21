/**
 * Handler untuk Cloudflare Worker
 * Ini membantu mengoptimalkan deployment Next.js di Cloudflare Pages
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * Handler event untuk Cloudflare Worker
 * @param {Event} event - Request event
 */
async function handleEvent(event) {
  const url = new URL(event.request.url);
  let options = {};

  try {
    // Mencoba mengambil aset statis dari KV storage
    const page = await getAssetFromKV(event, options);
    
    // Menambahkan header cache yang optimal
    const response = new Response(page.body, page);
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'public, max-age=86400');
    
    return response;
  } catch (e) {
    // Jika aset tidak ditemukan, kembalikan ke halaman index.html untuk SPA routing
    try {
      let notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
      });

      return new Response(notFoundResponse.body, {
        ...notFoundResponse,
        status: 200,
      });
    } catch (e) {
      return new Response('Error: Halaman tidak ditemukan', { status: 404 });
    }
  }
}

/**
 * Event listener untuk semua requests
 */
addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    event.respondWith(new Response('Error: ' + e.message, { status: 500 }));
  }
}); 
// Cloudflare Worker - CORS Proxy for Fish Audio API
// Deploy at: https://dash.cloudflare.com → Workers & Pages → Create
// Name it: fish-proxy

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, model',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Build the Fish Audio API URL
    const url = new URL(request.url);
    const fishUrl = 'https://api.fish.audio' + url.pathname;

    // Forward the request to Fish Audio
    const fishResponse = await fetch(fishUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'model': request.headers.get('model') || 'speech-1.5',
      },
      body: request.body,
    });

    // Return response with CORS headers
    const response = new Response(fishResponse.body, {
      status: fishResponse.status,
      headers: {
        'Content-Type': fishResponse.headers.get('Content-Type') || 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
    });

    return response;
  },
};

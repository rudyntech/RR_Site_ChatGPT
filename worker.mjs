export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'home.roadratings.com') {
      url.hostname = 'roadratings.com';
      url.protocol = 'https:';
      return Response.redirect(url.href, 308);
    }
    if (url.hostname === 'about.roadratings.com' && url.pathname === '/') {
      url.pathname = '/about/';
    }
    const response = await env.ASSETS.fetch(new Request(url, request));
    const result = new Response(response.body, response);
    // Also apply these explicitly to Worker-served responses.
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Referrer-Policy', 'no-referrer');
    result.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    result.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://roadratings.com; connect-src 'self' https://roadratings.com; img-src 'self' data: https://images.pexels.com; style-src 'self' https://roadratings.com; base-uri 'self'; form-action 'none'; frame-ancestors 'none'");
    if (url.pathname === '/availability.json') {
      result.headers.set('Access-Control-Allow-Origin', '*');
      result.headers.set('Cache-Control', 'no-store');
    }
    return result;
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const production = /(^|\.)roadratings\.com$/.test(url.hostname);
    if (url.hostname === 'home.roadratings.com' || url.hostname === 'www.roadratings.com') {
      url.hostname = 'roadratings.com';
      url.protocol = 'https:';
      return Response.redirect(url.href, 308);
    }
    const aboutHost = url.hostname === 'about.roadratings.com';
    // Legal information is always available at one public canonical URL.
    if (['/privacy','/privacy/','/privacy/index.html'].includes(url.pathname) &&
        ((production && url.hostname !== 'roadratings.com') || url.pathname !== '/privacy/')) {
      return Response.redirect((production ? 'https://roadratings.com' : url.origin) + '/privacy/' + url.search, 308);
    }
    if (production && ['/about','/about/','/about/index.html','/about/preview.html'].includes(url.pathname)) {
      return Response.redirect('https://about.roadratings.com/' + url.search, 308);
    }
    if (production && ['/index.html','/preview-home.html'].includes(url.pathname)) {
      return Response.redirect((aboutHost ? 'https://about.roadratings.com/' : 'https://roadratings.com/') + url.search, 308);
    }
    if (url.pathname === '/robots.txt') {
      const body = 'User-agent: *\nAllow: /\n' + (production ? 'Sitemap: https://' + (aboutHost ? 'about.roadratings.com' : 'roadratings.com') + '/sitemap.xml\n' : '');
      return new Response(body, {headers:{'Content-Type':'text/plain; charset=utf-8', ...(production ? {} : {'X-Robots-Tag':'noindex, follow'})}});
    }
    if (url.pathname === '/sitemap.xml') {
      const canonical = aboutHost ? 'https://about.roadratings.com/' : 'https://roadratings.com/';
      const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + (production ? '<url><loc>' + canonical + '</loc></url>' + (aboutHost ? '' : '<url><loc>https://roadratings.com/privacy/</loc></url>') : '') + '</urlset>';
      return new Response(xml, {headers:{'Content-Type':'application/xml; charset=utf-8', ...(production ? {} : {'X-Robots-Tag':'noindex, follow'})}});
    }
    if (url.hostname === 'about.roadratings.com' && url.pathname === '/') {
      url.pathname = '/about/';
    }
    if (!/(^|\.)roadratings\.com$/.test(url.hostname)) {
      const previews = {'/':'/preview-home.html', '/index.html':'/preview-home.html', '/about':'/about/preview.html', '/about/':'/about/preview.html', '/about/index.html':'/about/preview.html'};
      if (previews[url.pathname]) url.pathname = previews[url.pathname];
    }
    const response = await env.ASSETS.fetch(new Request(url, request));
    const result = new Response(response.body, response);
    if (!production) result.headers.set('X-Robots-Tag', 'noindex, follow');
    // Also apply these explicitly to Worker-served responses.
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('Referrer-Policy', 'no-referrer');
    result.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    result.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' https://roadratings.com https://about.roadratings.com; connect-src 'self' https://roadratings.com https://about.roadratings.com; img-src 'self' data: https://images.pexels.com; style-src 'self' https://roadratings.com https://about.roadratings.com; base-uri 'self'; form-action 'none'; frame-ancestors 'none'");
    if (url.pathname === '/availability.json') {
      result.headers.set('Access-Control-Allow-Origin', '*');
      result.headers.set('Cache-Control', 'no-store');
    }
    return result;
  }
};

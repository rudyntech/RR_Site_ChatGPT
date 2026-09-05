// Serve the About page at its own subdomain while sharing one Pages project.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'about.roadratings.com') {
    url.pathname = '/about/';
    return context.env.ASSETS.fetch(new Request(url, context.request));
  }
  return context.next();
}

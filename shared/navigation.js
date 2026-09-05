(() => {
  const script = document.currentScript;
  // Production subdomains always read the same canonical file. Previews use their own copy.
  const endpoint = /(^|\.)roadratings\.com$/.test(location.hostname)
    ? 'https://home.roadratings.com/availability.json'
    : new URL('../availability.json', script.src).href;
  const links = [...document.querySelectorAll('[data-page]')];
  function unavailable(link, label) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('role', 'link');
    link.setAttribute('tabindex', '-1');
    link.setAttribute('aria-label', label + ' — Coming Soon');
    link.classList.add('is-unavailable');
    const badge = link.querySelector('.availability-badge');
    if (badge) badge.hidden = false;
  }
  links.forEach(link => unavailable(link, link.dataset.page));
  async function refresh() {
    try {
      const response = await fetch(endpoint, {cache:'no-store', signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('Availability unavailable');
      const pages = await response.json();
      links.forEach(link => {
        const page = pages[link.dataset.page];
        if (!page || page.available !== true || !/^https:\/\//.test(page.url)) {
          unavailable(link, page?.label || link.dataset.page); return;
        }
        link.href = page.url;
        link.removeAttribute('aria-disabled');
        link.removeAttribute('role');
        link.removeAttribute('tabindex');
        link.setAttribute('aria-label', link.dataset.label || page.label);
        link.classList.remove('is-unavailable');
        const badge = link.querySelector('.availability-badge');
        if (badge) badge.hidden = true;
      });
    } catch { links.forEach(link => unavailable(link, link.dataset.page)); }
  }
  refresh();
  setInterval(refresh, 60000);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) refresh();});
})();

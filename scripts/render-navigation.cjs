// Render only our controlled navigation templates; CMS values are always escaped.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(pages) {
  for (const key of ['home','map','data','pitch','about']) {
    const page = pages?.[key];
    if (!page || typeof page.label !== 'string' || typeof page.available !== 'boolean' || typeof page.url !== 'string' || !/^https:\/\//.test(page.url)) throw new Error('Invalid settings for ' + key);
    new URL(page.url);
    if (page.subtitle !== undefined && typeof page.subtitle !== 'string') throw new Error('Invalid subtitle for ' + key);
  }
}
function renderNavigation(html, pages, preview = false) {
  validate(pages);
  return html.replace(/<a\b([^>]*\bdata-page="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g, (match, attrs, key, body) => {
    const page = pages[key];
    if (!page) throw new Error('Unknown destination: ' + key);
    const enabled = preview && page.previewAvailable !== undefined ? page.previewAvailable === true : page.available;
    const customLabel = attrs.match(/\bdata-label="([^"]*)"/)?.[1];
    const oldAriaLabel = attrs.match(/\baria-label="([^"]*)"/)?.[1];
    attrs = attrs.replace(/\s(?:href|aria-disabled|role|tabindex|aria-label)="[^"]*"/g, '');
    attrs = attrs.replace(/class="([^"]*)"/, (_, classes) => 'class="' + classes.split(/\s+/).filter(c => c !== 'is-unavailable').concat(enabled ? [] : ['is-unavailable']).join(' ') + '"');
    const label = customLabel || (key === 'home' ? oldAriaLabel : null) || escape(page.label);
    if (enabled) {
      const href = preview && /^\/(?!\/)/.test(page.previewPath || '') ? page.previewPath : page.url;
      attrs += ' href="' + escape(href) + '" aria-label="' + label + '"';
    } else attrs += ' aria-disabled="true" role="link" tabindex="-1" aria-label="' + escape(page.label + ' — Coming Soon') + '"';
    body = body.replace(/<span\b([^>]*)>([^<]*)<\/span>/g, (span, attributes, text) => {
      const classes = attributes.match(/class="([^"]*)"/)?.[1].split(/\s+/) || [];
      let hidden;
      if (classes.includes('availability-badge')) hidden = enabled;
      else if (classes.includes('quadrant__subtitle')) { text = escape(page.subtitle ?? text); hidden = !text.trim(); }
      else if (classes.includes('page-label')) text = escape(page.label);
      if (hidden !== undefined) attributes = attributes.replace(/\s+hidden(?:="[^"]*")?/g, '') + (hidden ? ' hidden' : '');
      return '<span' + attributes + '>' + text + '</span>';
    });
    return '<a' + attrs + '>' + body + '</a>';
  });
}
module.exports = {renderNavigation, validate};

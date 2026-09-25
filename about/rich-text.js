// Build a fresh DOM containing formatting only. Never copy attributes or executable markup.
window.renderRoadRatingsText = function (value) {
  const container = document.createElement('div');
  container.className = 'rich-paragraph';
  // CMS paragraphs use objects so rich-text edits notify the Save button.
  // Keep legacy strings readable during migration and in older previews.
  const text = typeof value === 'string' ? value : value?.text;
  const parsed = new DOMParser().parseFromString(typeof text === 'string' ? text : '', 'text/html');
  const allowed = new Set(['P','BR','STRONG','B','EM','I','U','S','STRIKE','UL','OL','LI','BLOCKQUOTE','H2','H3','H4','CODE','PRE','HR']);
  const blocked = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','TEMPLATE']);
  function copy(source, target) {
    for (const child of source.childNodes) {
      if (child.nodeType === 3) target.append(document.createTextNode(child.textContent));
      else if (child.nodeType === 1 && !blocked.has(child.tagName)) {
        const next = allowed.has(child.tagName) ? document.createElement(child.tagName.toLowerCase()) : target;
        if (next !== target) target.append(next);
        copy(child, next);
      }
    }
  }
  copy(parsed.body, container);
  return container;
};

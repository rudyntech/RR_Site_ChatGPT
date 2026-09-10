(async () => {
  const header = document.querySelector('.site-header');
  if (header) new ResizeObserver(() => {
    document.documentElement.style.setProperty('--about-header-height', header.getBoundingClientRect().height + 'px');
  }).observe(header);
  const main = document.getElementById('story');
  const element = (tag, text, className) => {const node=document.createElement(tag); if(text)node.textContent=text; if(className)node.className=className; return node;};
  function photoFigure(photo, hero = false) {
    const figure = element('figure', null, hero ? 'about-hero' : 'story-photo');
    const img = element('img'); img.src = photo.src; img.alt = photo.alt || '';
    img.loading = hero ? 'eager' : 'lazy'; img.decoding = 'async';
    if (hero) { img.fetchPriority = 'high'; img.width = 2048; img.height = 1365; }
    figure.append(img);
    if (photo.caption) figure.append(element('figcaption', photo.caption));
    return figure;
  }
  function bikeTable(data) {
    const container = element('div', null, 'bike-history');
    const table = element('table', null, 'bike-table');
    table.append(element('caption', data.title));
    const rows = element('tbody');
    const rowCount = Math.ceil(data.bikes.length / 3);
    const dialog = element('dialog', null, 'bike-dialog');
    const close = element('button', 'Close photo', 'bike-close');
    close.type = 'button';
    const title = element('h3'); title.id = 'bike-photo-title';
    dialog.setAttribute('aria-labelledby', title.id);
    const image = element('img');
    const status = element('p', '', 'bike-photo-status');
    status.setAttribute('role', 'status');
    image.addEventListener('load', () => { status.textContent = ''; });
    image.addEventListener('error', () => { status.textContent = 'The photo could not load. Please close it and try again.'; });
    const credit = element('p', '', 'bike-credit');
    dialog.append(close, title, image, credit, status);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    let opener;
    dialog.addEventListener('close', () => { document.body.classList.remove('photo-open'); opener?.focus(); });
    for (let row = 0; row < rowCount; row++) {
      const tr = element('tr');
      for (let column = 0; column < 3; column++) {
        const bike = data.bikes[column * rowCount + row];
        const td = element('td');
        if (bike) {
          if (bike.image) {
            const link = element('a', bike.name); link.href = bike.image;
            link.setAttribute('aria-haspopup', 'dialog');
            link.addEventListener('click', event => {
              if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); opener = link;
              title.textContent = bike.name; image.alt = bike.name;
              credit.replaceChildren();
              if (bike.note) credit.append(document.createTextNode(bike.note + ' '));
              if (bike.credit) credit.append(document.createTextNode('Photo: ' + bike.credit + '. '));
              for (const [label, url] of [[bike.license, bike.licenseUrl], ['Source', bike.source]]) {
                if (label && /^https?:\/\//.test(url || '')) { const a = element('a', label); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; credit.append(a, document.createTextNode(' ')); }
                else if (label !== 'Source' && label) credit.append(document.createTextNode(label + '. '));
              }
              status.textContent = 'Loading photo…'; image.src = bike.image;
              dialog.showModal(); document.body.classList.add('photo-open');
            });
            td.append(link);
          } else td.textContent = bike.name;
        }
        tr.append(td);
      }
      rows.append(tr);
    }
    table.append(rows); container.append(table, dialog);
    return container;
  }
  try {
    const response=await fetch('/about/content.json', {cache:'no-cache'});
    if(!response.ok)throw new Error('Content unavailable');
    const content=await response.json();
    const bikes = await fetch('/about/bikes.json', {cache:'no-cache'})
      .then(response => response.ok ? response.json() : null).catch(() => null);
    const fragment=document.createDocumentFragment();
    if (content.hero?.src) fragment.append(photoFigure(content.hero, true));
    content.sections.forEach((section,index)=>{
      const details=element('details',null,section.id); details.id=section.id; details.open=section.open === true;
      const summary=element('summary');
      const heading=element('h2',section.title);
      const datedTitle=section.id === 'who-is-rudy' && section.title.match(/^(.*?)\s+(\(\d{1,2}\/\d{1,2}\/\d{2,4}\))$/);
      if (datedTitle) {
        heading.textContent=datedTitle[1] + ' ';
        heading.append(element('span',datedTitle[2],'section-date'));
      }
      summary.append(element('span',String(index+1).padStart(2,'0'),'number'),heading);
      const body=element('div',null,'section-content');
      const photos = (section.images || []).slice(0, 2);
      if (section.id === 'summary') {
        const copy = element('div', null, 'summary-copy');
        section.paragraphs.forEach(text => copy.append(window.renderRoadRatingsText(text)));
        const gallery = element('div', null, 'story-gallery');
        photos.forEach(photo => gallery.append(photoFigure(photo)));
        body.append(copy, gallery);
      } else {
        const count = Math.max(photos.length, 1);
        const chunk = Math.ceil(section.paragraphs.length / count);
        for (let i = 0; i < count; i++) {
          const row = element('div', null, 'story-row' + (photos[i] ? '' : ' story-row--text'));
          const copy = element('div', null, 'copy');
          section.paragraphs.slice(i * chunk, (i + 1) * chunk).forEach(text => copy.append(window.renderRoadRatingsText(text)));
          row.append(copy);
          if (photos[i]) row.append(photoFigure(photos[i]));
          body.append(row);
        }
      }
      details.append(summary,body);
      if (section.id === 'who-is-rudy' && bikes) details.append(bikeTable(bikes));
      fragment.append(details);
    });
    main.replaceChildren(fragment);
  } catch {document.getElementById('content-status').textContent='The story could not load. Please refresh the page to try again.';}
})();

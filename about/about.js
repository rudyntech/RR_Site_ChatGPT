(async () => {
  const main = document.getElementById('story');
  const element = (tag, text, className) => {const node=document.createElement(tag); if(text)node.textContent=text; if(className)node.className=className; return node;};
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
    content.sections.forEach((section,index)=>{
      const details=element('details',null,section.id); details.id=section.id; details.open=section.open === true;
      const summary=element('summary'); summary.append(element('span',String(index+1).padStart(2,'0'),'number'),element('h2',section.title));
      const body=element('div',null,'section-content'); const copy=element('div',null,'copy');
      section.paragraphs.forEach(text=>copy.append(window.renderRoadRatingsText(text)));
      const pictures=element('div',null,'pictures');
      section.images.forEach(photo=>{const figure=element('figure'); const img=element('img'); img.src=photo.src; img.alt=photo.alt; img.loading='lazy'; img.decoding='async'; img.width=720; img.height=540; figure.append(img); if(photo.caption)figure.append(element('figcaption',photo.caption)); pictures.append(figure);});
      if (section.id === 'deep-dive') {
        const paragraphs = [...copy.children];
        const photos = [...pictures.children];
        const midpoint = Math.ceil(paragraphs.length / 2);
        [paragraphs.slice(0, midpoint), paragraphs.slice(midpoint)].forEach((items, column) => {
          const block = element('div', null, 'deep-column');
          items.forEach((paragraph, i) => {block.append(paragraph); if (i === 2 && photos[column]) block.append(photos[column]);});
          if (items.length < 3 && photos[column]) block.append(photos[column]);
          body.append(block);
        });
      } else body.append(copy,pictures);
      details.append(summary,body);
      if (section.id === 'who-is-rudy' && bikes) details.append(bikeTable(bikes));
      fragment.append(details);
    });
    main.replaceChildren(fragment);
  } catch {document.getElementById('content-status').textContent='The story could not load. Please refresh the page to try again.';}
})();

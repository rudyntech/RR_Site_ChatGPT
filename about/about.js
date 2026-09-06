(async () => {
  const main = document.getElementById('story');
  const element = (tag, text, className) => {const node=document.createElement(tag); if(text)node.textContent=text; if(className)node.className=className; return node;};
  try {
    const response=await fetch('/about/content.json', {cache:'no-cache'});
    if(!response.ok)throw new Error('Content unavailable');
    const content=await response.json();
    const fragment=document.createDocumentFragment();
    content.sections.forEach((section,index)=>{
      const details=element('details',null,section.id); details.id=section.id; details.open=section.open === true;
      const summary=element('summary'); summary.append(element('span',String(index+1).padStart(2,'0'),'number'),element('h2',section.title));
      const body=element('div',null,'section-content'); const copy=element('div',null,'copy');
      section.paragraphs.forEach(text=>copy.append(element('p',text)));
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
      details.append(summary,body);fragment.append(details);
    });
    main.replaceChildren(fragment);
  } catch {document.getElementById('content-status').textContent='The story could not load. Please refresh the page to try again.';}
})();

const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');
async function renderContent(html, root, kind, preview) {
  const dom = new JSDOM(html, {url:'https://roadratings.com/', runScripts:'outside-only'});
  const {window} = dom, document = window.document;
  window.eval(fs.readFileSync(path.join(root,'about/rich-text.js'),'utf8'));
  if (kind === 'about') {
    window.__buildRoadRatings = true;
    window.ResizeObserver = class {observe(){}};
    window.fetch = async url => ({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url.slice(1)),'utf8'))});
    await window.eval(fs.readFileSync(path.join(root,'about/about.js'),'utf8'));
    document.getElementById('story').dataset.rendered = 'true';
    const data = document.createElement('script'); data.id='bike-data'; data.type='application/json';
    data.textContent=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'about/bikes.json'),'utf8'))).replace(/</g,'\\u003c');
    document.body.append(data);
    document.querySelector('noscript')?.remove();
  } else {
    const data=JSON.parse(fs.readFileSync(path.join(root,'home-content.json'),'utf8'));
    const section=document.createElement('section'); section.className='home-story'; section.id='discover';
    const heading=document.createElement('h1'); heading.textContent=data.heading; section.append(heading);
    for (const text of data.introduction) section.append(window.renderRoadRatingsText(text));
    for (const block of data.sections) {
      const article=document.createElement('section'); const h=document.createElement('h2'); h.textContent=block.heading; article.append(h);
      for (const text of block.paragraphs) article.append(window.renderRoadRatingsText(text));
      if (block.destination) {
        if (!['map','data','about','pitch'].includes(block.destination)) throw new Error('Invalid homepage destination');
        const link=document.createElement('a'); link.dataset.page=block.destination; link.className='home-story-link';
        const label=document.createElement('span'); label.className='page-label'; link.append(label);
        const badge=document.createElement('span'); badge.className='availability-badge'; badge.textContent='Coming Soon'; link.append(badge);
        article.append(link);
      }
      section.append(article);
    }
    document.querySelector('.landing').insertAdjacentElement('afterend',section);
  }
  const seo=JSON.parse(fs.readFileSync(path.join(root,'seo.json'),'utf8'))[kind];
  document.title=seo.title;
  document.querySelector('meta[name="description"]').setAttribute('content',seo.description);
  const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=kind==='home'?'https://roadratings.com/':'https://about.roadratings.com/';document.head.append(canonical);
  if (preview) {const robots=document.createElement('meta');robots.name='robots';robots.content='noindex, follow';document.head.append(robots);}
  const result=dom.serialize();dom.window.close();return result;
}
module.exports={renderContent};

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import worker from '../worker.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('About article and chronological bike links exist without JavaScript',()=>{
 const dom=new JSDOM(read('public/about/index.html'));const d=dom.window.document;
 const content=JSON.parse(read('about/content.json')), bikes=JSON.parse(read('about/bikes.json'));
 assert.equal(d.querySelectorAll('details').length,3);
 for(const section of content.sections){const el=d.getElementById(section.id);assert(el);assert(!el.open);assert.equal(el.querySelectorAll('.rich-paragraph').length,section.paragraphs.length);assert.equal(el.querySelectorAll('.story-photo').length,Math.min(section.images.length,2));}
 assert.equal(d.querySelectorAll('.bike-table a').length,bikes.bikes.filter(b=>b.image).length);
 assert(!d.getElementById('content-status'));assert.deepEqual(JSON.parse(d.getElementById('bike-data').textContent),bikes);
 dom.window.close();
});
test('About popup enhancement works without fetching or replacing the article',async()=>{
 const dom=new JSDOM(read('public/about/index.html'),{runScripts:'outside-only'});const w=dom.window;
 w.ResizeObserver=class{observe(){}};w.fetch=()=>{throw new Error('Unexpected content fetch')};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 const section=w.document.querySelector('details');await w.eval(read('about/about.js'));
 assert.equal(w.document.querySelector('details'),section);
 w.document.querySelector('.bike-table a').click();assert(w.document.querySelector('dialog').open);
 w.document.querySelector('.bike-close').click();assert(!w.document.querySelector('dialog').open);w.close();
});
test('CMS rich text strips executable markup at build time',()=>{
 const dom=new JSDOM('',{runScripts:'outside-only'});dom.window.eval(read('about/rich-text.js'));
 const el=dom.window.renderRoadRatingsText('<p onclick="alert(1)">Hello <strong>rider</strong><script>alert(1)</script><img src=x onerror=alert(1)></p>');
 assert.equal(el.textContent,'Hello rider');assert(el.querySelector('strong'));assert(!el.querySelector('script,img,[onclick]'));dom.window.close();
});
test('Home content and editable search metadata are in initial HTML',()=>{
 const home=JSON.parse(read('home-content.json')),seo=JSON.parse(read('seo.json'));
 for(const [file,key,url] of [['index.html','home','https://roadratings.com/'],['about/index.html','about','https://about.roadratings.com/']]){
 const dom=new JSDOM(read('public/'+file)),d=dom.window.document;
 assert.equal(d.title,seo[key].title);assert.equal(d.querySelector('meta[name=description]').content,seo[key].description);assert.equal(d.querySelector('link[rel=canonical]').href,url);
 if(key==='home'){assert.equal(d.querySelector('h1').textContent,home.heading);assert(d.querySelector('.landing').nextElementSibling.matches('.home-story'));}dom.window.close();}
});
test('Canonical redirects, host sitemaps and preview indexing policy',async()=>{
 const env={ASSETS:{fetch:async()=>new Response('asset')}};
 for(const url of ['https://roadratings.com/about/','https://about.roadratings.com/about/index.html']){const r=await worker.fetch(new Request(url),env);assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://about.roadratings.com/');}
 for(const host of ['roadratings.com','about.roadratings.com']){const robots=await worker.fetch(new Request('https://'+host+'/robots.txt'),env);assert((await robots.text()).includes('https://'+host+'/sitemap.xml'));const sitemap=await worker.fetch(new Request('https://'+host+'/sitemap.xml'),env);assert((await sitemap.text()).includes('<loc>https://'+host+'/</loc>'));}
 const preview=await worker.fetch(new Request('https://test.workers.dev/about/'),env);assert.equal(preview.headers.get('x-robots-tag'),'noindex, follow');
 assert(read('public/preview-home.html').includes('noindex, follow'));assert(read('public/about/preview.html').includes('noindex, follow'));
});

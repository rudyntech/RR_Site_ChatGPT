import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../worker.mjs';
const read = path => fs.readFileSync(new URL('../'+path, import.meta.url),'utf8');
const config=JSON.parse(read('availability.json'));
test('root hostname routing and home redirect preserve paths and queries',async()=>{
  for(const [input,expected] of [
    ['https://about.roadratings.com/','https://about.roadratings.com/about/'],
    ['https://roadratings.com/','https://roadratings.com/'],
    ['https://preview.workers.dev/about/','https://preview.workers.dev/about/preview.html'],
    ['https://about.roadratings.com/about/about.css','https://about.roadratings.com/about/about.css']]) {
    let target;
    const response=await worker.fetch(new Request(input),{ASSETS:{fetch:async r=>{target=r.url;return new Response('asset')}}});
    assert.equal(target,expected);assert.equal(response.status,200);
  }
  const redirect=await worker.fetch(new Request('https://home.roadratings.com/about/?test=1'),{});
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://roadratings.com/about/?test=1');
});
test('availability response permits cross-account subdomains without caching',async()=>{
  const response=await worker.fetch(new Request('https://about.roadratings.com/availability.json'),{ASSETS:{fetch:async()=>new Response(JSON.stringify(config))}});
  assert.equal(response.headers.get('access-control-allow-origin'),'*');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.ok(response.headers.get('content-security-policy').includes('https://roadratings.com'));
  for (const policy of [response.headers.get('content-security-policy'),read('_headers')]) {
    assert.match(policy,/connect-src[^;]*https:\/\/about\.roadratings\.com/);
  }
});
test('About assets resolve at domain root and preview path',()=>{
  const html=read('about/index.html');
  for(const base of ['https://about.roadratings.com/','https://preview.workers.dev/about/']) {
    for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if(!ref.startsWith('/'))continue;
      const pathname=new URL(ref,base).pathname;
      assert.ok(fs.existsSync(new URL('../public'+pathname,import.meta.url)),pathname);
    }
  }
  assert.ok(html.includes('<h1 class="page-title">About</h1>'));
  assert.ok(JSON.parse(read('about/content.json')).sections.every(s=>s.open===false));
});
async function navigation(host,pages) {
  const links=Object.keys(config).map(key=>({dataset:{page:key},attrs:{},badge:{},title:{},subtitle:{},classes:new Set(),
    setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},
    set href(v){this.attrs.href=v},querySelector(selector){return selector === '.availability-badge' ? this.badge : selector === '.quadrant__subtitle' ? this.subtitle : this.title}}));
  links.forEach(l=>l.classList={add:k=>l.classes.add(k),remove:k=>l.classes.delete(k)});
  let endpoint;
  vm.runInNewContext(read('shared/navigation.js'),{document:{currentScript:{src:'https://'+host+'/shared/navigation.js'},querySelectorAll:()=>links,addEventListener(){}},location:{hostname:host,origin:'https://'+host},URL,AbortSignal,setInterval(){},fetch:async url=>{endpoint=url;return {ok:true,json:async()=>pages}}});
  await new Promise(resolve=>setImmediate(resolve));
  return {links,endpoint};
}
test('preview Home/About remain internal; production reads canonical availability',async()=>{
  const preview=await navigation('rr-site-chatgpt.rudyntech.workers.dev',config);
  assert.equal(preview.links.find(l=>l.dataset.page==='home').attrs.href,'https://rr-site-chatgpt.rudyntech.workers.dev/');
  assert.equal(preview.links.find(l=>l.dataset.page==='about').attrs.href,'https://rr-site-chatgpt.rudyntech.workers.dev/about/');
  for(const host of ['roadratings.com','about.roadratings.com','map.roadratings.com']) {
    const result=await navigation(host,config);
    assert.equal(result.endpoint,'https://about.roadratings.com/availability.json');
    for (const [key,page] of Object.entries(config)) assert.equal(result.links.find(l=>l.dataset.page===key).attrs.href,page.available ? page.url : undefined);
  }
});
test('all four quadrant states follow central production settings',async()=>{
  for(const key of ['map','data','pitch','about']) for(const available of [true,false]) {
    const result=await navigation('roadratings.com',{...config,[key]:{...config[key],available}});
    const link=result.links.find(l=>l.dataset.page===key);
    assert.equal(link.attrs.href,available?config[key].url:undefined);
    assert.equal(link.badge.hidden,available);
    assert.equal(link.classes.has('is-unavailable'),!available);
  }
});

test('CMS labels and subtitles update even when a quadrant is unavailable',async()=>{
  for(const available of [true,false]) {
    const result=await navigation('roadratings.com',{...config,pitch:{...config.pitch,label:'Invest',subtitle:'The Opportunity',available}});
    const link=result.links.find(l=>l.dataset.page==='pitch');
    assert.equal(link.title.textContent,'Invest');
    assert.equal(link.subtitle.textContent,'The Opportunity');
    assert.equal(link.badge.hidden,available);
  }
  const result=await navigation('roadratings.com',{...config,pitch:{...config.pitch,subtitle:''}});
  assert.equal(result.links.find(l=>l.dataset.page==='pitch').subtitle.hidden,true);
});

const {renderNavigation} = await import('../scripts/render-navigation.cjs').then(m=>m.default);
test('built HTML contains correct links, labels and badges before JavaScript runs',()=>{
  for (const file of ['public/index.html','public/about/index.html']) {
    const html=read(file);
    for (const [,attrs,key,body] of html.matchAll(/<a\b([^>]*data-page="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/g)) {
      const page=config[key];
      assert.equal(/class="[^"]*is-unavailable/.test(attrs),!page.available,key);
      assert.equal(/ href="/.test(attrs),page.available,key);
      const badge=body.match(/<span([^>]*availability-badge[^>]*)>/)[1];
      assert.equal(/\bhidden\b/.test(badge),page.available,key);
      if(page.available) assert.ok(attrs.includes('href="'+page.url.replaceAll('&','&amp;')+'"'));
    }
  }
  assert.match(read('public/preview-home.html'),/href="\/about\/"/);
});
test('renderer handles availability changes, preview overrides and escapes CMS text',()=>{
  for(const available of [true,false]) {
    const pages={...config,map:{...config.map,available,previewAvailable:!available,label:'Map & <test>',subtitle:'"<script>"'}};
    const html=renderNavigation(read('index.html'),pages);
    const map=html.match(/<a([^>]*data-page="map"[^>]*)>([\s\S]*?)<\/a>/);
    assert.equal(/ href="/.test(map[1]),available);
    assert.ok(map[2].includes('Map &amp; &lt;test&gt;'));
    assert.ok(map[2].includes('&quot;&lt;script&gt;&quot;'));
    const preview=renderNavigation(read('index.html'),pages,true).match(/<a([^>]*data-page="map"[^>]*)>/)[1];
    assert.equal(/ href="/.test(preview),!available);
  }
  assert.throws(()=>renderNavigation(read('index.html'),{...config,map:{...config.map,url:'javascript:alert(1)'}}));
});
test('pending, failed and malformed refreshes preserve the rendered state',async()=>{
  for(const failure of ['network','invalid']) {
    const link={dataset:{page:'map'},attrs:{href:config.map.url},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},classList:{add(){throw new Error('Unexpected state change')},remove(){}},querySelector(){return null}};
    let resolve,reject;
    const pending=new Promise((a,b)=>{resolve=a;reject=b});
    vm.runInNewContext(read('shared/navigation.js'),{document:{currentScript:{src:'https://roadratings.com/shared/navigation.js'},querySelectorAll:()=>[link],addEventListener(){}},location:{hostname:'roadratings.com'},URL,AbortSignal,setInterval(){},fetch:()=>pending});
    assert.deepEqual(link.attrs,{href:config.map.url});
    if(failure==='network') reject(new Error('offline'));
    else resolve({ok:true,json:async()=>({})});
    await new Promise(r=>setImmediate(r));
    assert.deepEqual(link.attrs,{href:config.map.url});
  }
});

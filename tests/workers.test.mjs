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
    ['https://preview.workers.dev/about/','https://preview.workers.dev/about/'],
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
      if(ref.startsWith('#'))continue;
      const pathname=new URL(ref,base).pathname;
      assert.ok(fs.existsSync(new URL('../public'+pathname,import.meta.url)),pathname);
    }
  }
  assert.ok(html.includes('<h1 class="page-title">About</h1>'));
  assert.ok(JSON.parse(read('about/content.json')).sections.every(s=>s.open===false));
});
async function navigation(host,pages) {
  const links=Object.keys(config).map(key=>({dataset:{page:key},attrs:{},badge:{},classes:new Set(),
    setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},
    set href(v){this.attrs.href=v},querySelector(){return this.badge}}));
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
    for (const key of ['home','data','about']) assert.equal(result.links.find(l=>l.dataset.page===key).attrs.href,config[key].url);
    for (const key of ['map','pitch']) assert.equal(result.links.find(l=>l.dataset.page===key).attrs.href,undefined);
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

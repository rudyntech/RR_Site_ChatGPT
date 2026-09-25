import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import worker from '../worker.mjs';

test('privacy is packaged as readable HTML and linked from both production and preview pages', () => {
  const read = path => fs.readFileSync(new URL('../public/' + path, import.meta.url), 'utf8');
  const html = read('privacy/index.html');
  assert.match(html, /Rudolfs Namikis/);
  assert.match(html, /roadratings@gmail\.com/);
  assert.doesNotMatch(html, /Technical check|\[REVIEW|\[Publication/);
  const policy = new JSDOM(html);
  assert.equal(policy.window.document.querySelectorAll('time[datetime="2026-09-25"]').length, 2);
  for (const file of ['index.html', 'preview-home.html', 'about/index.html', 'about/preview.html']) {
    const page = new JSDOM(read(file));
    const link = page.window.document.querySelector('footer a[href="/privacy/"]');
    assert.ok(link, file);
    assert.equal(link.hasAttribute('data-page'), false, 'Legal link must not depend on product availability');
    page.window.close();
  }
  policy.window.close();
});

test('privacy has one production URL, stays accessible in preview, and appears in the apex sitemap', async () => {
  for (const input of ['https://roadratings.com/privacy', 'https://about.roadratings.com/privacy/', 'https://roadratings.com/privacy/index.html']) {
    const response = await worker.fetch(new Request(input), {});
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), 'https://roadratings.com/privacy/');
  }
  for (const host of ['roadratings.com', 'preview.workers.dev']) {
    let asset;
    const response = await worker.fetch(new Request('https://' + host + '/privacy/'), {ASSETS:{fetch:async request => {
      asset = new URL(request.url).pathname;
      return new Response('privacy');
    }}});
    assert.equal(asset, '/privacy/');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), host === 'roadratings.com' ? null : 'noindex, follow');
  }
  const sitemap = await worker.fetch(new Request('https://roadratings.com/sitemap.xml'), {});
  assert.match(await sitemap.text(), /<loc>https:\/\/roadratings\.com\/privacy\/<\/loc>/);
});

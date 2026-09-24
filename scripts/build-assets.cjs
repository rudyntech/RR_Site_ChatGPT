(async () => {
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
// Only the generated public directory is replaced. Never package repository metadata.
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html','styles.css','_headers','availability.json','about','shared','assets']) {
  fs.cpSync(path.join(root, name), path.join(output, name), {recursive:true,
    filter: source => !source.endsWith('.md')});
}
const {renderContent} = require('./render-content.cjs');
const {renderNavigation} = require('./render-navigation.cjs');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'availability.json'), 'utf8'));
for (const [source, preview] of [['index.html','preview-home.html'], ['about/index.html','about/preview.html']]) {
  const template = fs.readFileSync(path.join(root, source), 'utf8');
  fs.writeFileSync(path.join(output, source), renderNavigation(await renderContent(template, root, source === 'index.html' ? 'home' : 'about', false), pages));
  fs.writeFileSync(path.join(output, preview), renderNavigation(await renderContent(template, root, source === 'index.html' ? 'home' : 'about', true), pages, true));
}
console.log('Static assets packaged with navigation rendered from availability.json.');

})().catch(error => {console.error(error);process.exitCode=1;});

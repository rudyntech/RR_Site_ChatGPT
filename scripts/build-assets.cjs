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
console.log('Static assets packaged in public/');

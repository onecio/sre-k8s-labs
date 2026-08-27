import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const files = ['index.html', 'style.css', 'script.js', 'service-worker.js', 'manifest.json', 'offline.html', 'icon.svg', 'og.png', 'README.md', 'labs'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await cp(resolve(root, file), resolve(output, file), { recursive: true });
await writeFile(resolve(output, '.nojekyll'), '');
console.log(`Build concluído em ${output}`);

import { access, readFile, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = ['index.html', 'style.css', 'script.js', 'manifest.json', 'service-worker.js', 'og.png'];
const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md', '.yml', '.yaml', '.sh']);
const failures = [];

for (const file of required) {
  try { await access(resolve(root, file)); } catch { failures.push(`Arquivo obrigatório ausente: ${file}`); }
}

const labEntries = await readdir(resolve(root, 'labs'), { withFileTypes: true });
for (let number = 1; number <= 12; number += 1) {
  const prefix = String(number).padStart(2, '0');
  const directory = labEntries.find(entry => entry.isDirectory() && entry.name.startsWith(`${prefix}-`));
  if (!directory) {
    failures.push(`Laboratório ${prefix} ausente`);
    continue;
  }
  for (const file of ['README.md', 'scripts/validate.sh']) {
    try { await access(resolve(root, 'labs', directory.name, file)); }
    catch { failures.push(`Artefato ausente: labs/${directory.name}/${file}`); }
  }
}

async function scan(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'dist' || entry.name === 'node_modules') continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await scan(path);
      continue;
    }
    if (!textExtensions.has(extname(entry.name))) continue;
    const content = await readFile(path, 'utf8');
    const relative = path.slice(root.length + 1).replaceAll('\\', '/');
    if (content.includes(String.fromCodePoint(0x2014))) failures.push(`Traço longo encontrado em ${relative}`);
    if (content.includes('\\u' + '2014')) failures.push(`Escape de traço longo encontrado em ${relative}`);
    if (/\\u(?:d83c|d83d|d83e)/i.test(content) || /[\u{1F300}-\u{1FAFF}]/u.test(content)) {
      failures.push(`Emoji encontrado em ${relative}`);
    }
  }
}

await scan(root);

const html = await readFile(resolve(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) failures.push(`IDs HTML duplicados: ${[...new Set(duplicates)].join(', ')}`);
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  const dynamicLab = /^lab-(0[1-9]|1[0-2])$/.test(match[1]);
  if (!ids.includes(match[1]) && !dynamicLab) failures.push(`Âncora sem destino: #${match[1]}`);
}
if ((html.match(/<main\b/g) || []).length !== 1 || (html.match(/<\/main>/g) || []).length !== 1) {
  failures.push('Estrutura principal inválida: esperado exatamente um elemento main.');
}
const script = await readFile(resolve(root, 'script.js'), 'utf8');
const renderedLabs = [...script.matchAll(/\{num:'(\d{2})', title:/g)].map(match => match[1]);
if (renderedLabs.length !== 12 || new Set(renderedLabs).size !== 12) {
  failures.push(`Catálogo interativo inválido: esperados 12 laboratórios, encontrados ${renderedLabs.length}.`);
}
const renderedLabPaths = [...script.matchAll(/\{num:'\d{2}', title:[\s\S]*?path:'([^']+)'/g)].map(match => match[1]);
if (renderedLabPaths.length !== 12 || new Set(renderedLabPaths).size !== 12) {
  failures.push(`Catálogo de diretórios inválido: esperados 12 caminhos únicos, encontrados ${renderedLabPaths.length}.`);
}
for (const labPath of renderedLabPaths) {
  try { await access(resolve(root, labPath, 'README.md')); }
  catch { failures.push(`Caminho do catálogo não existe: ${labPath}`); }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Conteúdo, estrutura e tipografia validados.');

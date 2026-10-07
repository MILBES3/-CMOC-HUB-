import {readFile,writeFile,copyFile,mkdir,rm,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=path.join(root,'source');
const backup=path.join(root,'sites-original-config');
try { await access(backup); throw new Error('Conversie is al uitgevoerd. Begin met een nieuwe uitgepakte kopie.'); }
catch(e) { if(e.code!=='ENOENT') throw e; }
await mkdir(backup);
for(const rel of ['vite.config.ts','package.json','pnpm-workspace.yaml','.gitignore','README.md','public/verisure-international-move-hub-18-landen.html']){
 const dest=path.join(backup,rel);await mkdir(path.dirname(dest),{recursive:true});
 await copyFile(path.join(source,rel),dest);
}
await copyFile(path.join(here,'vite.config.ts'),path.join(source,'vite.config.ts'));
await copyFile(path.join(here,'wrangler.jsonc'),path.join(source,'wrangler.jsonc'));
const pkg=JSON.parse(await readFile(path.join(source,'package.json'),'utf8'));
pkg.name='verisure-international-move-hub';
pkg.scripts={dev:'vite',build:'vite build',preview:'vite preview',deploy:'wrangler deploy',
 'db:generate':'drizzle-kit generate','db:migrate':'wrangler d1 migrations apply DB --remote --config wrangler.jsonc'};
// Keep all dependency versions and the original lockfile unchanged.
await writeFile(path.join(source,'package.json'),JSON.stringify(pkg,null,2)+'\n');
// Use ordinary project-local pnpm storage; keep dependency build approvals.
const policy=await readFile(path.join(source,'pnpm-workspace.yaml'),'utf8');
await writeFile(path.join(source,'pnpm-workspace.yaml'),policy.split('\n').filter(line=>!line.startsWith('storeDir:')&&!line.startsWith('cacheDir:')).join('\n'));
await writeFile(path.join(source,'.gitignore'),await readFile(path.join(source,'.gitignore'),'utf8')+'\n.dev.vars*\n!.env.example\n');
await writeFile(path.join(source,'README.md'),'# Verisure International Move Hub\n\nZelfstandige Cloudflare Workers/D1-configuratie. Zie ../README-IT.md en ../docs/.\n');
await rm(path.join(source,'public/verisure-international-move-hub-18-landen.html'));
console.log('Zelfbeheerconfiguratie aangemaakt in source/. Vul database_id in wrangler.jsonc in. Originele configuratie: sites-original-config/.');

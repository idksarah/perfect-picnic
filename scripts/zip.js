import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const outDir = path.join(root, 'release');
const outPath = path.join(outDir, 'itch.zip');

if (!fs.existsSync(distDir)) {
  console.error('dist/ not found — run `npm run build` first');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const output = fs.createWriteStream(outPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created ${outPath} (${archive.pointer()} total bytes)`);
});
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') console.warn(err.message);
  else throw err;
});
archive.on('error', (err) => { throw err; });

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();

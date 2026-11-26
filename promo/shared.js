// Shared by the promo builders: the signature and a fake origin that serves files from disk,
// so the stage and the site load from one http origin without starting a server.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'http://vakt.promo';
// Shown on every frame and slide. Override with HANDLE="@your_nick".
const HANDLE = process.env.HANDLE || '@naimhakimov13';

async function serve(context) {
  await context.route(`${HOST}/**`, (route) => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname);
    const base = p.startsWith('/site/') ? ROOT : path.join(__dirname, p.split('/')[1]);
    const rel = p.startsWith('/site/') ? p.slice('/site/'.length) : p.split('/').slice(2).join('/');
    const file = path.join(base, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return route.fulfill({ status: 404, body: 'not found' });
    }
    return route.fulfill({ path: file });
  });
}

module.exports = { ROOT, HOST, HANDLE, serve };

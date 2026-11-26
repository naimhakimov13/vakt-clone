// Records the Instagram Reel: the redesigned site in a phone frame, driven like a real visit.
// Output: promo/out/reel.mp4 (1080x1920, 30 fps, H.264 + silent AAC) and promo/out/reel-cover.jpg.
// Run: node promo/build-video.js        (HANDLE="@nick" to change the signature)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { HANDLE, serve, HOST } = require('./shared');

const OUT = path.join(__dirname, 'out');
const FRAMES = path.join(OUT, '.frames');
const FPS = 30;

(async () => {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  fs.mkdirSync(FRAMES, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 675, height: 1200 }, deviceScaleFactor: 1.6, hasTouch: true });
  await serve(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${HOST}/stage/reel.html`, { waitUntil: 'networkidle' });
  const site = await (await page.$('#site')).contentFrame();
  await site.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await site.evaluate(() => document.fonts.ready);
  // Photos are lazy: load them all now so none fades in mid-scroll on camera.
  await site.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
  await site.waitForFunction(() => [...document.images].every((i) => i.complete));
  await page.waitForTimeout(800);
  await page.evaluate((h) => stage.setSign(`Концепт · <b>${h}</b>`), HANDLE);

  // ---------- helpers ----------
  const wait = (ms) => page.waitForTimeout(ms);
  const caption = (html) => page.evaluate((h) => stage.caption(h), html);
  const $ = (sel) => site.locator(sel).first();

  async function tap(sel, after = 450) {
    const loc = $(sel);
    // The scenario scrolls on purpose; a target off screen would make Playwright jump-scroll mid-video.
    const inView = await loc.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    });
    if (!inView) throw new Error(`off screen, scroll to it first: ${sel}`);
    const box = await loc.boundingBox();
    if (!box) throw new Error(`not visible: ${sel}`);
    await page.evaluate(([x, y]) => stage.tap(x, y), [box.x + box.width / 2, box.y + box.height / 2]);
    await wait(130);
    await loc.tap();
    await wait(after);
  }

  // Eased scroll of the page (or a scrollable element) inside the phone, like a finger swipe.
  function scroll(to, ms = 1000, el = null, axis = 'y') {
    return site.evaluate(([to, ms, el, axis]) => new Promise((done) => {
      const box = el ? document.querySelector(el) : null;
      const key = axis === 'x' ? 'scrollLeft' : 'scrollTop';
      const get = () => (box ? box[key] : scrollY);
      const set = (v) => (box ? (box[key] = v) : window.scrollTo({ top: v, behavior: 'instant' }));
      if (box) to = Math.min(to, axis === 'x' ? box.scrollWidth - box.clientWidth : box.scrollHeight - box.clientHeight);
      const from = get();
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms);
        set(from + (to - from) * ease(t));
        t < 1 ? requestAnimationFrame(step) : done();
      };
      requestAnimationFrame(step);
    }), [to, ms, el, axis]);
  }
  // Swipe the category strip so the given tab sits in the middle.
  const swipeCategoriesTo = async (cat, ms) => {
    const x = await site.$eval(`.cat[data-cat="${cat}"]`, (tab) => tab.offsetLeft - (tab.parentElement.clientWidth - tab.offsetWidth) / 2);
    await scroll(Math.max(0, x), ms, '.categories', 'x');
  };

  // ---------- recorder ----------
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = path.join(FRAMES, `${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 94, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await wait(300);
  const t0 = Date.now() / 1000;

  // ---------- scenario ----------
  await page.evaluate(() => document.body.classList.add('go'));
  await caption('Редизайн сайта ВАКТ<small>Новая мобильная версия заказа</small>');
  await wait(2600);

  await caption('Цена и кнопка «+»<br>видны сразу');
  await wait(900);
  await tap('[data-action="44"] [data-inc="44"]', 1100);
  await tap('[data-action="2"] [data-inc="2"]', 1000);

  await caption('Меню по категориям<small>одно касание — и вы в разделе</small>');
  await wait(700);
  await tap('.cat[data-cat="burgers"]', 1400);
  await tap('[data-action="8"] [data-inc="8"]', 900);
  await tap('[data-action="43"] [data-inc="43"]', 1000);
  // Inside the stage's iframe the scroll-spy measures against the stage, not the phone,
  // so the demo moves between sections with the category tabs rather than a free scroll.
  await swipeCategoriesTo('drinks', 900);
  await wait(250);
  await tap('.cat[data-cat="drinks"]', 1400);
  await tap('[data-action="24"] [data-inc="24"]', 1100);

  await caption('Корзина всегда<br>под рукой');
  await wait(600);
  await tap('#cartBar', 1100);
  await tap('#cartBody [data-inc="24"]', 700);
  await tap('#cartBody [data-inc="8"]', 1100);

  await caption('Оформление<br>в пару касаний');
  await wait(500);
  await tap('#orderBtn', 1000);
  await tap('#checkoutForm input[name=phone]', 200);
  await $('#checkoutForm input[name=phone]').pressSequentially('922006699', { delay: 85 });
  await wait(500);
  await tap('#checkoutForm label.radio:has-text("Самовывоз")', 800);
  await scroll(10000, 900, '#checkout');
  await wait(300);
  await tap('#bankRadios label.radio:has-text("Алиф")', 800);
  await tap('#checkoutForm [type=submit]', 2200);

  await page.evaluate(() => document.body.classList.add('outro'));
  await caption('Хотите такой сайт<br>для ВАКТ?<div class="cta">Напишите в директ</div>');
  await wait(3600);

  const t1 = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await browser.close();

  // ---------- encode ----------
  // Screencast frames arrive only when the picture changes, so each frame lasts until the next one.
  const kept = frames.filter((f) => f.t >= t0 - 0.05);
  const lines = [];
  kept.forEach((f, i) => {
    const end = i + 1 < kept.length ? kept[i + 1].t : t1;
    lines.push(`file '${f.file}'`, `duration ${Math.max(end - f.t, 0.001).toFixed(4)}`);
  });
  lines.push(`file '${kept[kept.length - 1].file}'`);
  const list = path.join(FRAMES, 'list.txt');
  fs.writeFileSync(list, lines.join('\n'));
  const fps = kept.length / (t1 - t0);
  console.log(`${kept.length} frames over ${(t1 - t0).toFixed(1)}s (${fps.toFixed(1)} captured fps)`);

  const mp4 = path.join(OUT, 'reel.mp4');
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', list,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-vf', `fps=${FPS},scale=1080:1920:flags=lanczos,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-level', '4.1',
    '-c:a', 'aac', '-b:a', '128k', '-shortest',
    '-movflags', '+faststart', mp4,
  ], { stdio: 'inherit' });

  // Cover: the first moment the phone is fully in place with the title showing.
  const cover = kept.find((f) => f.t - t0 > 1.6) || kept[0];
  fs.copyFileSync(cover.file, path.join(OUT, 'reel-cover.jpg'));
  fs.rmSync(FRAMES, { recursive: true, force: true });
  console.log('wrote', path.relative(process.cwd(), mp4));
})().catch((e) => { console.error(e); process.exit(1); });

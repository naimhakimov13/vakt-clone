// Builds the Instagram carousel: promo/out/slide-1.png … slide-8.png (1080x1350, 4:5).
// Screens of the redesign are captured fresh each run. Screens of the current vakt.tj are cached in
// promo/assets/ (pass --refresh-old to capture them again from the live site).
// Run: node promo/build-slides.js        (HANDLE="@nick" to change the signature)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { HANDLE, HOST, serve } = require('./shared');

const OUT = path.join(__dirname, 'out');
const ASSETS = path.join(__dirname, 'assets');
const SCREENS = path.join(OUT, '.screens');
const PHONE = { width: 390, height: 716 }; // phone browser viewport, same as in the reel

const add = (page, id) => page.locator(`[data-action="${id}"] [data-inc="${id}"]`).first().click();

async function captureNew(browser) {
  const shot = async (viewport, scale, name, steps) => {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, reducedMotion: 'reduce' });
    await serve(ctx);
    const page = await ctx.newPage();
    await page.goto(`${HOST}/site/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.evaluate(() => document.fonts.ready);
    if (steps) await steps(page);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENS, `${name}.png`) });
    if (name === 'new-added') {
      await page.locator('.product:has([data-action="44"])').screenshot({ path: path.join(SCREENS, 'new-card.png') });
    }
    await ctx.close();
  };

  await shot(PHONE, 2, 'new-menu');
  await shot(PHONE, 2, 'new-added', async (p) => { await add(p, 44); await add(p, 2); });
  await shot(PHONE, 2, 'new-cart', async (p) => {
    for (const id of [44, 2, 8, 43, 24, 24]) await add(p, id);
    await p.click('#cartBar');
  });
  await shot(PHONE, 2, 'new-checkout', async (p) => {
    for (const id of [44, 8, 24]) await add(p, id);
    await p.click('#cartBar');
    await p.click('#orderBtn');
    await p.fill('input[name=phone]', '+992 92 200 66 99');
    await p.click('label.radio:has-text("Самовывоз")');
    await p.click('#bankRadios label.radio:has-text("Алиф")');
    await p.locator('.checkout__body').evaluate((el) => (el.scrollTop = 0));
    await p.locator('input[name=phone]').blur();
  });
  await shot(PHONE, 2, 'new-success', async (p) => {
    for (const id of [44, 8, 24]) await add(p, id);
    await p.click('#cartBar');
    await p.click('#orderBtn');
    await p.fill('input[name=phone]', '+992 92 200 66 99');
    await p.click('label.radio:has-text("Самовывоз")');
    await p.click('#checkoutForm [type=submit]');
    await p.waitForSelector('#success', { state: 'visible' });
  });
  await shot({ width: 1440, height: 900 }, 1.5, 'new-desktop', async (p) => {
    for (const id of [44, 2, 8, 24, 24]) await add(p, id);
    // Adding scrolls down to each card; show the top of the menu with the first category lit.
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await p.locator('.cat[data-cat="strips"]').click();
  });
}

async function captureOld(browser) {
  const ctx = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('https://vakt.tj/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(ASSETS, 'old-menu.png') });
  await page.locator('.product-card-add').first().click();
  await page.waitForTimeout(1200);
  await page.locator('app-product-card').first().screenshot({ path: path.join(ASSETS, 'old-card.png') });
  await ctx.close();
}

// ---------- slide markup ----------
const img = (name) => (name.startsWith('old-') ? `/assets/${name}.png` : `/out/.screens/${name}.png`);

const phone = (screen, zoom, extra = '') => `
  <div class="phone" style="zoom:${zoom};${extra}">
    <div class="screen">
      <div class="status"><span>9:41</span><div class="island"></div>
        <div class="icons">
          <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
          <svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".5"/><rect x="2.5" y="2.5" width="17" height="8" rx="2"/><rect x="25" y="4.5" width="2" height="4" rx="1" fill-opacity=".5"/></svg>
        </div>
      </div>
      <img class="shot" src="${img(screen)}" alt="">
      <div class="addr"><div class="addr__pill"><span class="aa">AA</span>
        <svg viewBox="0 0 11 13"><path d="M2.5 5.5V3.8a3 3 0 0 1 6 0v1.7h.5a1.5 1.5 0 0 1 1.5 1.5v4.5A1.5 1.5 0 0 1 9 13H2A1.5 1.5 0 0 1 .5 11.5V7A1.5 1.5 0 0 1 2 5.5zm1.5 0h3V3.8a1.5 1.5 0 0 0-3 0z"/></svg>
        vakt.tj</div><div class="home"></div></div>
    </div>
  </div>`;

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const CSS = `
  :root { --red: #d81f2a; --ink: #121214; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 540px; height: 675px; overflow: hidden; }
  body {
    position: relative; font-family: Manrope, system-ui, sans-serif; color: #fff; -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(420px 460px at 50% 78%, rgba(216, 31, 42, .5), rgba(216, 31, 42, 0) 70%),
      radial-gradient(700px 380px at 50% -10%, #2a1416, rgba(42, 20, 22, 0) 70%),
      var(--ink);
  }
  .label {
    position: absolute; left: 36px; top: 32px; display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 13px;
    border-radius: 999px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16);
    font-size: 12px; font-weight: 700; color: rgba(255,255,255,.92);
  }
  .label i { width: 7px; height: 7px; border-radius: 50%; background: var(--red); box-shadow: 0 0 0 3px rgba(216,31,42,.35); }
  .num { position: absolute; right: 36px; top: 38px; font-size: 13px; font-weight: 700; color: rgba(255,255,255,.5); }
  h1 { position: absolute; left: 36px; right: 36px; top: 78px; margin: 0; font-size: 34px; line-height: 1.1; font-weight: 800; letter-spacing: -.8px; text-wrap: balance; }
  .sub { position: absolute; left: 36px; right: 36px; top: 162px; margin: 0; font-size: 15px; line-height: 1.45; font-weight: 600; color: rgba(255,255,255,.72); text-wrap: pretty; }
  .sign { position: absolute; left: 0; right: 0; bottom: 18px; text-align: center; font-size: 12px; font-weight: 700; color: rgba(255,255,255,.55); }
  .sign b { color: #fff; }
  .red { color: #ff4a55; }

  .phone {
    width: 414px; height: 864px; border-radius: 60px; padding: 12px; background: #0b0b0c;
    box-shadow: 0 0 0 2px #2c2c30, 0 40px 90px rgba(0,0,0,.55), inset 0 0 0 1px #3a3a3f;
  }
  .screen { position: relative; width: 390px; height: 840px; border-radius: 48px; overflow: hidden; background: #f5f5f5; }
  .status { position: relative; height: 50px; background: var(--red); display: flex; align-items: center; justify-content: space-between; padding: 4px 30px 0 38px; font-size: 16px; font-weight: 700; color: #fff; }
  .island { position: absolute; left: 50%; top: 11px; width: 118px; height: 32px; margin-left: -59px; border-radius: 20px; background: #000; }
  .status svg { display: block; height: 13px; fill: #fff; }
  .icons { display: flex; gap: 6px; align-items: center; }
  .shot { display: block; width: 390px; height: 716px; }
  .addr { position: relative; height: 74px; background: #f7f7f8; border-top: 1px solid #e4e4e6; }
  .addr__pill { position: absolute; left: 16px; right: 16px; top: 9px; height: 40px; border-radius: 13px; background: #e8e8ea; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 15px; font-weight: 600; color: #1c1c1e; }
  .addr__pill svg { width: 11px; height: 13px; fill: #1c1c1e; }
  .addr__pill .aa { position: absolute; left: 14px; font-size: 14px; font-weight: 700; }
  .home { position: absolute; left: 50%; bottom: 7px; width: 134px; height: 5px; margin-left: -67px; border-radius: 3px; background: #111; }

  .row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: flex-start; gap: 34px; }
  .col { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .tag { height: 26px; padding: 0 12px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 12px; font-weight: 800; letter-spacing: .3px; text-transform: uppercase; }
  .tag--old { background: rgba(255,255,255,.12); color: rgba(255,255,255,.8); }
  .tag--new { background: var(--red); color: #fff; }
  .note { width: 210px; text-align: center; font-size: 13px; line-height: 1.4; font-weight: 600; color: rgba(255,255,255,.75); }

  .card { width: 196px; border-radius: 16px; overflow: hidden; background: #f5f5f5; box-shadow: 0 20px 50px rgba(0,0,0,.45); }
  .card img { display: block; width: 100%; }

  .browser { width: 468px; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 30px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08); }
  .browser__bar { height: 28px; background: #ececee; display: flex; align-items: center; gap: 6px; padding: 0 10px; position: relative; }
  .browser__bar i { width: 9px; height: 9px; border-radius: 50%; background: #d4d4d8; }
  .browser__bar i:nth-child(1) { background: #ff5f57; } .browser__bar i:nth-child(2) { background: #febc2e; } .browser__bar i:nth-child(3) { background: #28c840; }
  .browser__url { position: absolute; left: 50%; top: 5px; width: 180px; margin-left: -90px; height: 18px; border-radius: 6px; background: #fff; font-size: 10px; font-weight: 600; color: #3a3a3c; display: grid; place-items: center; }
  .browser img { display: block; width: 100%; }

  .list { position: absolute; left: 36px; right: 36px; top: 156px; display: grid; gap: 21px; }
  .item { display: grid; grid-template-columns: 32px 1fr; gap: 15px; align-items: start; }
  .item .ic { width: 32px; height: 32px; border-radius: 50%; background: var(--red); display: grid; place-items: center; box-shadow: 0 4px 14px rgba(216,31,42,.45); }
  .item .ic svg { width: 18px; height: 18px; }
  .item b { display: block; font-size: 18px; line-height: 1.3; font-weight: 800; }
  .item span { display: block; margin-top: 3px; font-size: 14.5px; line-height: 1.4; font-weight: 600; color: rgba(255,255,255,.68); }

  .bullets { display: grid; gap: 14px; width: 200px; }
  .bullets div { display: grid; grid-template-columns: 24px 1fr; gap: 10px; font-size: 14px; line-height: 1.35; font-weight: 700; }
  .bullets .ic { width: 24px; height: 24px; border-radius: 50%; background: var(--red); display: grid; place-items: center; }
  .bullets .ic svg { width: 14px; height: 14px; }
`;

// The cover carries the handle top-right instead of the page number, since its phones run to the bottom edge.
const page = (n, total, body, { sign = true } = {}) => `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="label"><i></i>Концепт редизайна · vakt.tj</div>
<div class="num"${n === 1 ? ' style="color:#fff"' : ''}>${n === 1 ? HANDLE : `${n}/${total}`}</div>
${body}
${sign ? `<div class="sign">Концепт · <b>${HANDLE}</b></div>` : ''}
</body></html>`;

const bullet = (text) => `<div><span class="ic">${CHECK}</span><span>${text}</span></div>`;
const item = (title, text) => `<div class="item"><span class="ic">${CHECK}</span><div><b>${title}</b><span>${text}</span></div></div>`;

const SLIDES = [
  // 1. Cover
  `<h1 style="font-size:46px;top:84px">Новый сайт<br>для <span class="red">ВАКТ</span></h1>
   <p class="sub" style="top:196px;font-size:16px">Редизайн страницы заказа:<br>меню, корзина и оформление</p>
   <div style="position:absolute;left:250px;top:250px;transform:rotate(6deg)">${phone('new-cart', 0.56)}</div>
   <div style="position:absolute;left:62px;top:282px;transform:rotate(-4deg)">${phone('new-menu', 0.6)}</div>`,

  // 2. Before / after
  `<h1>Было → <span class="red">стало</span></h1>
   <p class="sub" style="top:124px">Тот же бренд, фото и меню — аккуратнее и понятнее</p>
   <div class="row" style="top:184px">
     <div class="col"><span class="tag tag--old">Сейчас</span>${phone('old-menu', 0.48)}</div>
     <div class="col"><span class="tag tag--new">Редизайн</span>${phone('new-menu', 0.48)}</div>
   </div>`,

  // 3. Product card
  `<h1>Цена больше<br>не пропадает</h1>
   <p class="sub">Сейчас после нажатия цена исчезает. В редизайне она остаётся на месте, а рядом — отдельная кнопка «+».</p>
   <div class="row" style="top:262px;gap:28px">
     <div class="col"><span class="tag tag--old">Сейчас</span><div class="card"><img src="${img('old-card')}" alt=""></div></div>
     <div class="col"><span class="tag tag--new">Редизайн</span><div class="card"><img src="${img('new-card')}" alt=""></div></div>
   </div>`,

  // 4. Cart
  `<h1>Корзина<br>всегда под рукой</h1>
   <div class="row" style="top:180px;gap:26px;align-items:center;height:440px">
     ${phone('new-cart', 0.5)}
     <div class="bullets">
       ${bullet('Кнопка корзины с суммой — внизу экрана')}
       ${bullet('Количество меняется прямо в корзине')}
       ${bullet('Итог и «Заказать» всегда видны')}
       ${bullet('Крупные кнопки — легко попасть пальцем')}
     </div>
   </div>`,

  // 5. Checkout
  `<h1>Оформление<br>в пару касаний</h1>
   <p class="sub">Доставка или самовывоз, точка, оплата — всё выбирается касанием</p>
   <div class="row" style="top:226px;gap:26px">
     ${phone('new-checkout', 0.47)}
     ${phone('new-success', 0.47)}
   </div>`,

  // 6. Desktop
  `<h1>И на компьютере</h1>
   <p class="sub" style="top:124px">Одна страница подстраивается под любой экран: меню во всю ширину, корзина справа</p>
   <div style="position:absolute;left:36px;top:226px">
     <div class="browser"><div class="browser__bar"><i></i><i></i><i></i><div class="browser__url">vakt.tj</div></div>
       <img src="${img('new-desktop')}" alt=""></div>
   </div>
   <div style="position:absolute;right:30px;top:352px">${phone('new-added', 0.32)}</div>`,

  // 7. What changed
  `<h1>Что улучшено</h1>
   <div class="list">
     ${item('Цена и кнопка «+» на каждой карточке', 'Сразу понятно, куда нажать. Цена видна и после добавления.')}
     ${item('Состав блюда в карточке', 'Например: «Стрипсы 200 гр + булочка + соус».')}
     ${item('Живые анимации', 'Блюдо «летит» в корзину, категории переключаются плавно.')}
     ${item('Легко читать и нажимать', 'Контраст текста по стандарту WCAG AA, кнопки от 40 px.')}
     ${item('Ровная сетка и фото', 'Фото внутри карточек, меню заполняет экран без пустот.')}
     ${item('Ваши фото, меню и цены — уже внутри', 'Можно быстро подключить к вашей системе заказов.')}
   </div>`,

  // 8. CTA
  `<div style="position:absolute;left:0;right:0;top:150px;text-align:center">
     <img src="/site/images/logo.svg" alt="ВАКТ" style="width:150px;height:auto">
     <h1 style="position:static;margin:34px auto 0;font-size:40px;max-width:440px">Хотите такой сайт для ВАКТ?</h1>
     <p style="margin:16px auto 0;max-width:400px;font-size:16px;line-height:1.45;font-weight:600;color:rgba(255,255,255,.75)">Напишите мне в директ — покажу живую версию и расскажу, как быстро её запустить.</p>
     <div style="display:inline-flex;align-items:center;height:52px;padding:0 28px;margin-top:28px;border-radius:999px;background:var(--red);font-size:18px;font-weight:800;box-shadow:0 10px 30px rgba(216,31,42,.5)">Написать в директ</div>
     <div style="margin-top:22px;font-size:22px;font-weight:800">${HANDLE}</div>
   </div>`,
];

(async () => {
  fs.mkdirSync(SCREENS, { recursive: true });
  fs.mkdirSync(ASSETS, { recursive: true });
  const browser = await chromium.launch();

  await captureNew(browser);
  const oldCached = ['old-menu', 'old-card'].every((n) => fs.existsSync(path.join(ASSETS, `${n}.png`)));
  if (!oldCached || process.argv.includes('--refresh-old')) await captureOld(browser);

  const ctx = await browser.newContext({ viewport: { width: 540, height: 675 }, deviceScaleFactor: 2 });
  await serve(ctx);
  await ctx.route(`${HOST}/slide/*`, (route) => {
    const n = +route.request().url().split('/').pop();
    const sign = n !== 1 && n !== SLIDES.length;
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: page(n, SLIDES.length, SLIDES[n - 1], { sign }) });
  });
  const tab = await ctx.newPage();
  for (let n = 1; n <= SLIDES.length; n++) {
    await tab.goto(`${HOST}/slide/${n}`, { waitUntil: 'networkidle' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: path.join(OUT, `slide-${n}.png`) });
  }
  await browser.close();
  console.log(`wrote ${SLIDES.length} slides to ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => { console.error(e); process.exit(1); });

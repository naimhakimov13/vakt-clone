// Browser tests for the ordering page. Run: npm test (needs Playwright's Chromium).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const PAGE_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function withPage(viewport, fn) {
  // Reduced motion turns off CSS transitions, so computed colors are the settled ones.
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(PAGE_URL);
  try {
    await fn(page);
    assert.deepEqual(errors, [], 'page threw errors');
  } finally {
    await context.close();
  }
}

const card = (id) => `[data-action="${id}"]`;
const add = (page, id) => page.click(`${card(id)} [data-inc="${id}"]`);
const text = (page, sel) => page.$eval(sel, (el) => el.textContent.trim());

// WCAG contrast ratio between an element's text color and the first opaque background behind it.
const contrastOf = (page, sel) => page.$eval(sel, (el) => {
  const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const bgOf = (n) => {
    for (; n; n = n.parentElement) {
      const [r, g, b, a = 1] = parse(getComputedStyle(n).backgroundColor);
      if (a > 0) return [r, g, b];
    }
    return [255, 255, 255];
  };
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [lum(parse(getComputedStyle(el).color).slice(0, 3)), lum(bgOf(el))].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
});

// ---------- Behaviour that the redesign must keep ----------

test('adding a product puts it in the cart and updates the total', () => withPage(DESKTOP, async (page) => {
  await add(page, 44);
  await add(page, 8);
  await add(page, 8);
  assert.equal(await page.locator('#cartBody .cart-item').count(), 2);
  assert.equal(await text(page, '#cartTotal'), '110 смн');
  assert.equal(await text(page, `${card(8)} .stepper b`), '2');
}));

test('decrementing to zero removes the product from the cart', () => withPage(DESKTOP, async (page) => {
  await add(page, 46);
  await page.click(`${card(46)} [data-dec="46"]`);
  assert.equal(await page.locator('#cartBody .cart-item').count(), 0);
  assert.equal(await page.locator(`${card(46)} .stepper`).count(), 0);
  assert.equal(await page.isDisabled('#orderBtn'), true);
}));

test('cart is saved to localStorage under the original key', () => withPage(DESKTOP, async (page) => {
  await add(page, 90);
  await add(page, 90);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('__cart')));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, 90);
  assert.equal(saved[0].quantity, 2);
}));

test('clear button empties the cart', () => withPage(DESKTOP, async (page) => {
  await add(page, 44);
  await page.click('#clearCart');
  assert.equal(await page.locator('#cartBody .cart-item').count(), 0);
  assert.equal(await text(page, '#cartTotal'), '0 смн');
}));

test('checkout validates phone and address, then submits', () => withPage(DESKTOP, async (page) => {
  await add(page, 44);
  await page.click('#orderBtn');
  const submit = '#checkoutForm [type=submit]';

  await page.fill('input[name=phone]', '+992 92');
  await page.click(submit);
  assert.equal(await page.$eval('input[name=phone]', (el) => el.closest('.field').classList.contains('is-invalid')), true);

  await page.fill('input[name=phone]', '+992 92 200 66 99');
  await page.click(submit);
  assert.equal(await page.$eval('#addressField', (el) => el.classList.contains('is-invalid')), true);

  await page.click('label.radio:has-text("Самовывоз")');
  assert.equal(await page.isHidden('#addressField'), true);
  await page.click(submit);
  await page.waitForSelector('#success', { state: 'visible' });
  assert.equal(await page.locator('#cartBody .cart-item').count(), 0);
}));

test('mobile cart bar opens and closes the cart drawer', () => withPage(MOBILE, async (page) => {
  assert.equal(await page.isHidden('#cartBar'), true);
  await add(page, 44);
  await page.click('#cartBar');
  assert.equal(await page.$eval('#cart', (el) => el.classList.contains('is-open')), true);
  await page.click('#closeCart');
  assert.equal(await page.$eval('#cart', (el) => el.classList.contains('is-open')), false);
}));

// ---------- Redesign requirements ----------

test('product card shows the price next to a separate add button', () => withPage(DESKTOP, async (page) => {
  assert.equal(await text(page, `${card(44)} .product__price`), '80 смн');
  const label = await page.getAttribute(`${card(44)} .product__add`, 'aria-label');
  assert.match(label, /Стрипсы 940гр/);
}));

test('price stays visible after the product is added', () => withPage(DESKTOP, async (page) => {
  await add(page, 44);
  assert.equal(await page.isVisible(`${card(44)} .product__price`), true);
  assert.equal(await text(page, `${card(44)} .stepper b`), '1');
}));

test('cart header shows how many items are in the cart', () => withPage(DESKTOP, async (page) => {
  assert.equal(await page.isHidden('#cartCount'), true);
  await add(page, 44);
  await add(page, 8);
  await add(page, 8);
  assert.equal(await text(page, '#cartCount'), '3');
}));

test('key text meets WCAG AA contrast', () => withPage(DESKTOP, async (page) => {
  const check = async (sel) => {
    const ratio = await contrastOf(page, sel);
    assert.ok(ratio >= 4.5, `${sel}: ${ratio.toFixed(2)} < 4.5`);
  };
  await check('.cart__empty span');
  await check(`${card(44)} .product__price`);
  await check('.cat.is-active .cat__name');
  await check('.cat:not(.is-active) .cat__name');
  await add(page, 44);
  await check('#orderBtn');
  await check('.cart-item__price');
  await page.click('#orderBtn');
  await check('#checkoutForm [type=submit]');
  await check('.checkout__sum strong');
}));

test('focused input is not styled like an error', () => withPage(DESKTOP, async (page) => {
  await add(page, 44);
  await page.click('#orderBtn');
  await page.focus('input[name=delivery_address]');
  const focusColor = await page.$eval('input[name=delivery_address]', (el) => getComputedStyle(el).borderTopColor);
  await page.fill('input[name=phone]', '+992 92 200 66 99');
  await page.click('#checkoutForm [type=submit]');
  await page.focus('input[name=phone]');
  const errorColor = await page.$eval('input[name=delivery_address]', (el) => getComputedStyle(el).borderTopColor);
  assert.notEqual(focusColor, errorColor);
}));

test('product grid fills the menu column on desktop', () => withPage(DESKTOP, async (page) => {
  const slack = await page.$eval('#cat-drinks .grid', (grid) => {
    const cards = [...grid.children].map((c) => c.getBoundingClientRect());
    const top = Math.min(...cards.map((r) => r.top));
    const right = Math.max(...cards.filter((r) => Math.abs(r.top - top) < 2).map((r) => r.right));
    return grid.getBoundingClientRect().right - right;
  });
  assert.ok(slack < 2, `first row ends ${slack}px short of the column edge`);
}));

test('product illustrations stay inside their cards', () => withPage(DESKTOP, async (page) => {
  const overflow = await page.$$eval('.product', (cards) => cards.filter((c) =>
    c.querySelector('.product__img').getBoundingClientRect().top < c.getBoundingClientRect().top).length);
  assert.equal(overflow, 0);
}));

test('touch targets are at least 40px on mobile', () => withPage(MOBILE, async (page) => {
  const size = (sel) => page.$eval(sel, (el) => Math.min(el.offsetWidth, el.offsetHeight));
  assert.ok(await size(`${card(44)} [data-inc="44"]`) >= 40);
  await add(page, 44);
  await page.click('#cartBar');
  assert.ok(await size('.cart-item [data-inc="44"]') >= 40);
  assert.ok(await size('.cart-item [data-dec="44"]') >= 40);
}));

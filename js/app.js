(function () {
  const { SITE_CONFIG: cfg, CATEGORIES, PRODUCTS, ART } = window;
  const CART_KEY = '__cart'; // same localStorage key the original site uses
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) => `${n} ${cfg.currency}`;
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

  // ---------- Cart state ----------
  let cart = loadCart();
  // Lines already in the cart at load do not animate in; only lines added afterwards do.
  let renderedLines = new Set(cart.map((i) => i.id));
  let leaveTimer;
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return raw.filter((i) => byId.has(i.id) && i.quantity > 0).map((i) => ({ id: i.id, quantity: i.quantity }));
    } catch {
      return [];
    }
  }

  function saveCart() {
    try {
      // Stored shape matches the original: product fields plus quantity.
      localStorage.setItem(CART_KEY, JSON.stringify(cart.map((i) => ({ ...byId.get(i.id), quantity: i.quantity }))));
    } catch { /* storage unavailable: cart stays in memory */ }
  }

  const qtyOf = (id) => cart.find((i) => i.id === id)?.quantity || 0;
  const total = () => cart.reduce((s, i) => s + byId.get(i.id).price * i.quantity, 0);
  const count = () => cart.reduce((s, i) => s + i.quantity, 0);

  function setQty(id, qty) {
    const before = qtyOf(id);
    const item = cart.find((i) => i.id === id);
    if (qty <= 0) cart = cart.filter((i) => i.id !== id);
    else if (item) item.quantity = qty;
    else cart.push({ id, quantity: qty });
    saveCart();
    renderProductAction(id);
    // Only the swap between the price button and the stepper pops; a +/- tap on an item already in the cart does not.
    if (before === 0 || qty <= 0) {
      document.querySelector(`[data-action="${id}"] .stepper, [data-action="${id}"] .product__add`)?.classList.add('is-fresh');
    }
    // A removed line fades out first; totals and the order button update immediately.
    const line = qty <= 0 && !reduceMotion() ? $(`.cart-item[data-id="${id}"]`) : null;
    if (line) {
      renderTotals();
      line.classList.add('is-leaving');
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(renderCart, 140);
    } else {
      renderCart();
    }
  }

  // ---------- Rendering ----------
  const MINUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg>';
  const PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg>';
  const stepper = (id, qty, small = false) => `
    <div class="stepper${small ? ' stepper--sm' : ''}">
      <button type="button" data-dec="${id}" aria-label="Убрать одну">${MINUS}</button>
      <b>${qty}</b>
      <button type="button" data-inc="${id}" aria-label="Добавить ещё">${PLUS}</button>
    </div>`;

  // A photo with an opaque background carries its own tile colour so the tile blends into it.
  const plateStyle = (p) => (p.plate ? ` style="--plate:${p.plate}"` : '');

  function renderCategories() {
    $('#categories').innerHTML = '<span class="cat-indicator" aria-hidden="true"></span>' + CATEGORIES.map((c, i) => `
      <button class="cat${i === 0 ? ' is-active' : ''}" type="button" data-cat="${c.id}">
        <span class="cat__icon${c.iconBare ? ' cat__icon--bare' : ''}">${c.iconImage ? `<img src="images/${c.iconImage}" alt="">` : ART.icon(c.icon)}</span>
        <span class="cat__name">${c.name}</span>
      </button>`).join('');
  }

  // Active-tab pill: one element slides behind the tabs. Only transform animates; its size is set instantly.
  function placeIndicator(animate) {
    const pill = $('.cat-indicator');
    const tab = $('.cat.is-active');
    if (!pill || !tab) return;
    if (!animate) pill.style.transition = 'none';
    pill.style.width = `${tab.offsetWidth}px`;
    pill.style.height = `${tab.offsetHeight}px`;
    pill.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
  }
  function initTabIndicator() {
    placeIndicator(false);
    // Fonts loading or a breakpoint change can resize the tabs: re-snap without animating.
    new ResizeObserver(() => placeIndicator(false)).observe($('#categories'));
  }

  function renderSections() {
    $('#sections').innerHTML = CATEGORIES.map((c) => {
      const items = PRODUCTS.filter((p) => p.cat === c.id);
      if (!items.length) return '';
      return `
        <section class="section" id="cat-${c.id}" data-section="${c.id}">
          <h2>${c.name}</h2>
          <div class="grid">${items.map(productCard).join('')}</div>
        </section>`;
    }).join('');
  }

  const productCard = (p) => `
    <article class="product">
      <div class="product__img"${plateStyle(p)}>${ART.product(p)}</div>
      <h3 class="product__name">${p.name}</h3>
      ${p.note ? `<p class="product__note">${p.note}</p>` : ''}
      <div class="product__foot" data-action="${p.id}">${actionHtml(p)}</div>
    </article>`;

  const actionHtml = (p) => {
    const q = qtyOf(p.id);
    const control = q
      ? stepper(p.id, q)
      : `<button class="product__add" type="button" data-inc="${p.id}" aria-label="Добавить: ${p.name}">${PLUS}</button>`;
    return `<span class="product__price">${money(p.price)}</span>${control}`;
  };

  // Photos start transparent and fade in once loaded. Cached ones are shown straight away, with no fade.
  function revealImages() {
    document.querySelectorAll('.product__img img:not(.is-loaded)').forEach((img) => {
      const show = () => img.classList.add('is-loaded');
      if (img.complete) show();
      else {
        img.addEventListener('load', show, { once: true });
        img.addEventListener('error', show, { once: true });
      }
    });
  }

  function renderProductAction(id) {
    const el = document.querySelector(`[data-action="${id}"]`);
    if (el) el.innerHTML = actionHtml(byId.get(id));
  }

  function renderCart() {
    const body = $('#cartBody');
    if (!cart.length) {
      body.innerHTML = `
        <div class="cart__empty">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3.5h3l.6 2.5H21l-2.2 8.2a1.5 1.5 0 0 1-1.4 1.1H8.6a1.5 1.5 0 0 1-1.4-1.1L5 5"/><circle cx="9.5" cy="19.5" r="1.8"/><circle cx="16.5" cy="19.5" r="1.8"/></svg>
          <span>Корзина пуста, чтобы добавить выберите из списка</span>
        </div>`;
    } else {
      const seen = renderedLines;
      body.innerHTML = cart.map(({ id, quantity }) => {
        const p = byId.get(id);
        return `
          <div class="cart-item${seen.has(id) ? '' : ' is-new'}" data-id="${id}">
            <div class="cart-item__left">
              <div class="cart-item__img"${plateStyle(p)}>${ART.product(p)}</div>
              <div class="cart-item__text">
                <div class="cart-item__name">${p.name}</div>
                <div class="cart-item__price">${money(p.price)}</div>
              </div>
            </div>
            ${stepper(id, quantity, true)}
          </div>`;
      }).join('');
    }
    renderedLines = new Set(cart.map((i) => i.id));
    renderTotals();
  }

  function renderTotals() {
    const sum = money(total());
    $('#cartTotal').textContent = sum;
    $('#cartBarTotal').textContent = sum;
    $('#cartBarCount').textContent = count();
    $('#cartCount').textContent = count();
    $('#cartCount').hidden = !cart.length;
    $('#cartBar').classList.toggle('is-shown', cart.length > 0);
    $('#orderBtn').disabled = !cart.length;
    if (!cart.length) toggleCartDrawer(false);
  }

  // ---------- Fly to cart ----------
  // Same recipe as the add-to-cart on harid.disti.site: the product photo lifts off the card and falls into the cart
  // badge on an accelerating curve (shrinking, fading to 40%), then the badge bumps. Skipped with reduced motion.
  const FLY = { photo: 88, dot: 32, ms: 560, ease: 'cubic-bezier(.5, 0, .75, 0)', bumpMs: 320, bumpEase: 'cubic-bezier(.34, 1.56, .64, 1)' };
  const centerOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const inViewport = (r) => {
    const c = centerOf(r);
    return r.width > 0 && r.height > 0 && c.x >= 0 && c.x <= innerWidth && c.y >= 0 && c.y <= innerHeight;
  };

  function flyToCart(...sources) {
    if (reduceMotion() || typeof Element.prototype.animate !== 'function') return;
    // The last visible target wins: the phone bar's badge when it is shown, else the cart panel's badge.
    const visible = [...document.querySelectorAll('[data-cart-target]')].filter((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const target = visible[visible.length - 1];
    const source = sources.find((el) => el && el.isConnected && inViewport(el.getBoundingClientRect()));
    if (!target || !source) return;

    const from = source.getBoundingClientRect();
    const img = source instanceof HTMLImageElement ? source : source.querySelector('img');
    const size = img ? Math.max(24, Math.min(FLY.photo, from.width, from.height)) : FLY.dot;
    const flyer = document.createElement(img ? 'img' : 'div');
    if (img) {
      flyer.src = img.currentSrc || img.src;
      flyer.alt = '';
      const plate = img.closest('.product__img');
      Object.assign(flyer.style, {
        objectFit: 'contain', padding: '6px', boxSizing: 'border-box', borderRadius: '14px',
        boxShadow: '0 6px 20px rgb(0 0 0 / .25)', background: plate ? getComputedStyle(plate).backgroundColor : '#f8f8f8',
      });
    } else {
      Object.assign(flyer.style, { borderRadius: '50%', background: '#d81f2a', boxShadow: '0 4px 14px rgb(0 0 0 / .25)' });
    }
    const a = centerOf(from);
    const to = target.getBoundingClientRect();
    const b = centerOf(to);
    // The phone bar slides up as it appears: aim for where its badge will rest, not where it is this instant.
    const bar = target.closest('.cart-bar');
    if (bar) {
      const lift = new DOMMatrix(getComputedStyle(bar).transform);
      b.x -= lift.m41;
      b.y -= lift.m42;
    }
    const scale = Math.min(1, Math.max(0.12, Math.max(to.width, to.height) / size));
    Object.assign(flyer.style, {
      position: 'fixed', left: `${a.x - size / 2}px`, top: `${a.y - size / 2}px`, width: `${size}px`, height: `${size}px`,
      margin: '0', zIndex: '1000', pointerEvents: 'none', willChange: 'transform, opacity',
    });
    flyer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flyer);

    let done = false;
    const finish = (landed) => {
      if (done) return;
      done = true;
      flyer.remove();
      if (landed) bump(target);
    };
    const flight = flyer.animate(
      [{ transform: 'translate(0, 0) scale(1)', opacity: 1 }, { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(${scale})`, opacity: 0.4 }],
      { duration: FLY.ms, easing: FLY.ease, fill: 'forwards' },
    );
    flight.onfinish = () => finish(true);
    flight.oncancel = () => finish(false);
    setTimeout(() => finish(false), FLY.ms + 500); // never leave a flyer behind
  }

  function bump(el) {
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.22)', offset: 0.4 }, { transform: 'scale(1)' }],
      { duration: FLY.bumpMs, easing: FLY.bumpEase },
    );
  }

  // ---------- Interactions ----------
  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) {
      // Look up the card first: the add button is replaced as soon as the quantity changes.
      const card = inc.closest('.product');
      setQty(+inc.dataset.inc, qtyOf(+inc.dataset.inc) + 1);
      // Adding from a product card sends its photo flying to the cart; the stepper inside the cart does not.
      if (card) flyToCart(card.querySelector('.product__img img'), card.querySelector('.product__img'));
    }
    if (dec) setQty(+dec.dataset.dec, qtyOf(+dec.dataset.dec) - 1);
  });

  $('#categories').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    setActiveCategory(btn.dataset.cat);
    lockSpy = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => (lockSpy = false), 800);
    $(`#cat-${btn.dataset.cat}`).scrollIntoView({ behavior: 'smooth' });
  });

  $('#clearCart').addEventListener('click', () => {
    if (!cart.length) return;
    const ids = cart.map((i) => i.id);
    cart = [];
    saveCart();
    ids.forEach(renderProductAction);
    renderCart();
  });

  // Scroll-spy: highlight the category whose section is near the top.
  let lockSpy = false;
  let lockTimer;
  function setActiveCategory(id) {
    document.querySelectorAll('.cat').forEach((b) => {
      const on = b.dataset.cat === id;
      b.classList.toggle('is-active', on);
      if (on && matchMedia('(max-width: 900px)').matches) {
        b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });
    placeIndicator(true);
  }
  function initScrollSpy() {
    const io = new IntersectionObserver((entries) => {
      if (lockSpy) return;
      const visible = entries.filter((en) => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveCategory(visible[0].target.dataset.section);
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('[data-section]').forEach((s) => io.observe(s));
  }

  // Mobile cart drawer
  function toggleCartDrawer(open) {
    $('#cart').classList.toggle('is-open', open);
    $('#cartScrim').classList.toggle('is-open', open);
  }
  $('#cartBar').addEventListener('click', () => toggleCartDrawer(true));
  $('#closeCart').addEventListener('click', () => toggleCartDrawer(false));
  $('#cartScrim').addEventListener('click', () => toggleCartDrawer(false));

  // ---------- Checkout ----------
  const dialog = $('#checkout');
  const form = $('#checkoutForm');

  function initCheckout() {
    $('#pointSelect').innerHTML = cfg.points.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
    $('#bankRadios').innerHTML = cfg.banks.map((b, i) => `
      <label class="radio"><input type="radio" name="bank_id" value="${b.id}"${i === 0 ? ' checked' : ''}><span>${b.name}</span></label>`).join('');

    form.addEventListener('change', (e) => {
      if (e.target.name === 'order_is_now') setCollapsed($('#timeWrap'), e.target.value === '1');
      if (e.target.name === 'order_is_delivery') setCollapsed($('#addressWrap'), e.target.value === '0');
    });
    form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));
    form.phone.addEventListener('input', () => (form.phone.value = formatPhone(form.phone.value)));

    $('#orderBtn').addEventListener('click', openCheckout);
    $('#cancelCheckout').addEventListener('click', closeDialog);
    $('#successClose').addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
    // Esc closes through the same fade-out instead of cutting the dialog off.
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });
    form.addEventListener('submit', submitOrder);
  }

  const setCollapsed = (wrap, collapsed) => wrap.classList.toggle('is-collapsed', collapsed);

  // A <dialog> vanishes the moment it closes, so play the exit first, then close it.
  let closing = false;
  function closeDialog() {
    if (!dialog.open || closing) return;
    if (reduceMotion()) { dialog.close(); return; }
    closing = true;
    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing');
      closing = false;
    }, 140);
  }

  function openCheckout() {
    if (!cart.length || dialog.open) return;
    form.hidden = false;
    $('#success').hidden = true;
    $('#checkoutTotal').textContent = money(total());
    toggleCartDrawer(false);
    dialog.showModal();
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').replace(/^992/, '').slice(0, 9);
    const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
    return `+992 ${parts.join(' ')}`.trimEnd() + (parts.length ? '' : ' ');
  }

  function validate() {
    let ok = true;
    const phoneDigits = form.phone.value.replace(/\D/g, '');
    const phoneField = form.phone.closest('.field');
    phoneField.classList.toggle('is-invalid', phoneDigits.length !== 12);
    if (phoneDigits.length !== 12) ok = false;

    const delivery = form.order_is_delivery.value === '1';
    const addrBad = delivery && !form.delivery_address.value.trim();
    $('#addressField').classList.toggle('is-invalid', addrBad);
    if (addrBad) ok = false;
    return ok;
  }

  async function submitOrder(e) {
    e.preventDefault();
    if (!validate()) return;

    // Payload mirrors the original Angular form group + cart lines.
    const payload = {
      phone: form.phone.value.replace(/\s/g, ''),
      point_id: +form.point_id.value,
      order_is_now: +form.order_is_now.value,
      order_time: form.order_is_now.value === '1' ? '' : form.order_time.value,
      order_is_delivery: +form.order_is_delivery.value,
      delivery_address: form.order_is_delivery.value === '1' ? form.delivery_address.value.trim() : '',
      bank_id: +form.bank_id.value,
      comment: form.comment.value.trim(),
      products: cart.map((i) => ({ id: i.id, quantity: i.quantity, price: byId.get(i.id).price })),
      total: total(),
    };

    const submitBtn = form.querySelector('[type=submit]');
    submitBtn.disabled = true;
    try {
      if (cfg.apiBase) {
        const res = await fetch(`${cfg.apiBase}/submitOrder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        console.info('[vakt-clone] demo order (not sent):', payload);
        await new Promise((r) => setTimeout(r, 400));
      }
      $('#successPhone').textContent = form.phone.value;
      form.hidden = true;
      $('#success').hidden = false;
      const ids = cart.map((i) => i.id);
      cart = [];
      saveCart();
      ids.forEach(renderProductAction);
      renderCart();
      form.reset();
      setCollapsed($('#timeWrap'), true);
      setCollapsed($('#addressWrap'), false);
    } catch (err) {
      toast('Не удалось оформить заказ. Попробуйте ещё раз.');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  // ---------- Boot ----------
  if (cfg.logo) {
    const logo = $('#logo');
    logo.classList.remove('logo--text');
    logo.innerHTML = `<img src="${cfg.logo}" alt="Вакт">`;
  }
  const phoneLink = $('#headerPhone');
  phoneLink.href = `tel:${cfg.phone.replace(/\s/g, '')}`;
  phoneLink.querySelector('span').textContent = cfg.phone;

  renderCategories();
  initTabIndicator();
  renderSections();
  revealImages();
  renderCart();
  initScrollSpy();
  initCheckout();
})();

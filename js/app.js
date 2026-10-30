(function () {
  const { SITE_CONFIG: cfg, CATEGORIES, PRODUCTS, ART } = window;
  const CART_KEY = '__cart'; // same localStorage key the original site uses
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = (n) => `${n} ${cfg.currency}`;
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

  // ---------- Cart state ----------
  let cart = loadCart();

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
    const item = cart.find((i) => i.id === id);
    if (qty <= 0) cart = cart.filter((i) => i.id !== id);
    else if (item) item.quantity = qty;
    else cart.push({ id, quantity: qty });
    saveCart();
    renderProductAction(id);
    renderCart();
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

  function renderCategories() {
    $('#categories').innerHTML = CATEGORIES.map((c, i) => `
      <button class="cat${i === 0 ? ' is-active' : ''}" type="button" data-cat="${c.id}">
        <span class="cat__icon">${ART.icon(c.icon)}</span>
        <span class="cat__name">${c.name}</span>
      </button>`).join('');
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
      <div class="product__img">${ART.product(p)}</div>
      <h3 class="product__name">${p.name}</h3>
      <div class="product__foot" data-action="${p.id}">${actionHtml(p)}</div>
    </article>`;

  const actionHtml = (p) => {
    const q = qtyOf(p.id);
    const control = q
      ? stepper(p.id, q)
      : `<button class="product__add" type="button" data-inc="${p.id}" aria-label="Добавить: ${p.name}">${PLUS}</button>`;
    return `<span class="product__price">${money(p.price)}</span>${control}`;
  };

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
      body.innerHTML = cart.map(({ id, quantity }) => {
        const p = byId.get(id);
        return `
          <div class="cart-item">
            <div class="cart-item__left">
              <div class="cart-item__img">${ART.product(p)}</div>
              <div class="cart-item__text">
                <div class="cart-item__name">${p.name}</div>
                <div class="cart-item__price">${money(p.price)}</div>
              </div>
            </div>
            ${stepper(id, quantity, true)}
          </div>`;
      }).join('');
    }
    const sum = money(total());
    $('#cartTotal').textContent = sum;
    $('#cartBarTotal').textContent = sum;
    $('#cartBarCount').textContent = count();
    $('#cartCount').textContent = count();
    $('#cartCount').hidden = !cart.length;
    $('#cartBar').hidden = !cart.length;
    $('#orderBtn').disabled = !cart.length;
    if (!cart.length) toggleCartDrawer(false);
  }

  // ---------- Interactions ----------
  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) setQty(+inc.dataset.inc, qtyOf(+inc.dataset.inc) + 1);
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
    $('#cartScrim').hidden = !open;
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
      if (e.target.name === 'order_is_now') form.order_time.hidden = e.target.value === '1';
      if (e.target.name === 'order_is_delivery') $('#addressField').hidden = e.target.value === '0';
    });
    form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('is-invalid'));
    form.phone.addEventListener('input', () => (form.phone.value = formatPhone(form.phone.value)));

    $('#orderBtn').addEventListener('click', openCheckout);
    $('#cancelCheckout').addEventListener('click', () => dialog.close());
    $('#successClose').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    form.addEventListener('submit', submitOrder);
  }

  function openCheckout() {
    if (!cart.length) return;
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
      form.order_time.hidden = true;
      $('#addressField').hidden = false;
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
  renderSections();
  renderCart();
  initScrollSpy();
  initCheckout();
})();

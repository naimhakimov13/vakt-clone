# vakt-clone

Static clone of the vakt.tj café ordering page (menu, cart, checkout). No build step.

## Run

```sh
npx serve .        # or any static server, then open the printed URL
```

Opening `index.html` directly also works.

## Tests

```sh
npm install        # Playwright; run `npx playwright install chromium` if the browser is missing
npm test
```

## Structure

- `index.html` — header, category bar, product sections, cart, checkout dialog
- `css/styles.css` — layout and theme (desktop sticky cart, mobile cart drawer under 900px)
- `js/menu.js` — site config, categories and products (names/prices from the live menu)
- `js/art.js` — line icons and placeholder product illustrations
- `js/app.js` — cart state (persisted in `localStorage["__cart"]`), scroll-spy, checkout
- `tests/ui.test.js` — Playwright checks for the cart, checkout, contrast and layout

## Notes

- Menu, prices, pickup points, payment methods, product photos (`images/product/`), category icons (`images/category/`) and the logo are the real ones from vakt.tj, copied from its public read-only API (`/services/getProducts`, `/services/getConfigs`). Product ids match the live site. The internal Telegram chat ids the API returns for each point are intentionally not copied.
- The line-art illustrations in `js/art.js` are only a fallback for a product or category without an image.
- Orders are not sent anywhere by default; the payload is logged to the console.
  Set `SITE_CONFIG.apiBase` to POST to `${apiBase}/submitOrder` with the same fields as the original form:
  `phone, point_id, order_is_now, order_time, order_is_delivery, delivery_address, bank_id, comment` plus `products` and `total`.

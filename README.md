# vakt-clone

Static clone of the vakt.tj café ordering page (menu, cart, checkout). No build step.

## Run

```sh
npx serve .        # or any static server, then open the printed URL
```

Opening `index.html` directly also works.

## Structure

- `index.html` — header, category bar, product sections, cart, checkout dialog
- `css/styles.css` — layout and theme (desktop sticky cart, mobile cart drawer under 900px)
- `js/menu.js` — site config, categories and products (names/prices from the live menu)
- `js/art.js` — line icons and placeholder product illustrations
- `js/app.js` — cart state (persisted in `localStorage["__cart"]`), scroll-spy, checkout

## Notes

- Product photos are placeholder illustrations. Put real images in `images/` and set `image: 'file.png'` on a product.
- Orders are not sent anywhere by default; the payload is logged to the console.
  Set `SITE_CONFIG.apiBase` to POST to `${apiBase}/submitOrder` with the same fields as the original form:
  `phone, point_id, order_is_now, order_time, order_is_delivery, delivery_address, bank_id, comment` plus `products` and `total`.

// Menu data copied from the live vakt.tj API on 2026-11-25:
//   GET https://vakt.tj/services/getConfigs   -> categories, points, banks
//   GET https://vakt.tj/services/getProducts  -> products (ids, names, prices, image files, descriptions)
// Ids, names, prices and image file names are exactly as the site serves them.
// Photos live in images/product/ and images/category/. Pickup points keep only id and name:
// the API also returns internal Telegram chat ids, which are deliberately not copied.
// `note` is a description that adds a composition (bun, sauce, fries, drink); `description` is the raw text.
// `plate` (presentation only, not from the API) is the background colour of a photo that is not a transparent cutout,
// so its tile can match it. `iconBare` marks a category icon that has no tile of its own.
window.SITE_CONFIG = {
  phone: '+992 92 200 66 99',
  currency: 'смн',
  // The real logo, downloaded from https://vakt.tj/assets/images/logo.svg
  logo: 'images/logo.svg',
  // Set to a real backend base URL to POST orders to `${apiBase}/submitOrder`.
  // Left null on purpose so the clone never sends orders to the real café.
  apiBase: null,
  points: [
    { id: 1, name: 'Вакт - Мир' },
    { id: 2, name: 'Вакт - Ленин' },
    { id: 3, name: 'Вакт - Универмаг' },
    { id: 5, name: 'Вакт - Панчшанбе' },
    { id: 12, name: 'Вакт - 31мк' },
    { id: 13, name: 'Вакт - Доро' },
    { id: 14, name: 'Вакт Исмоил' },
  ],
  banks: [
    { id: 0, name: 'Наличными' },
    { id: 1, name: 'DC' },
    { id: 2, name: 'Эсхата' },
    { id: 3, name: 'Алиф' },
  ],
};

window.CATEGORIES = [
  { id: 'strips', liveId: 2, name: 'Сочные стрипсы', brief: 'Сочные стрипсы', icon: 'strips', iconImage: 'category/1717844977728.png' },
  { id: 'wings', liveId: 3, name: 'Острые крылья', brief: 'Острые крылья', icon: 'wings', iconImage: 'category/1711873678058.png' },
  { id: 'burgers', liveId: 4, name: 'Бургеры и роллы', brief: 'Бургеры и роллы', icon: 'burger', iconImage: 'category/1711105333526.png' },
  { id: 'combo', liveId: 5, name: 'Комбо', brief: 'Комбо', icon: 'combo', iconImage: 'category/1711105657877.png' },
  { id: 'fries', liveId: 6, name: 'Картош. фри', brief: 'Картофель фри', icon: 'fries', iconImage: 'category/1711105691690.png' },
  { id: 'sauces', liveId: 7, name: 'Соусы и булочки', brief: 'Соусы и булочки', icon: 'sauce', iconImage: 'category/1711105754874.png' },
  { id: 'drinks', liveId: 8, name: 'Напитки', brief: 'Напитки', icon: 'drink', iconImage: 'category/1711105787119.png' },
  { id: 'cup', liveId: 9, name: 'Стаканчик', brief: 'Стаканчик', icon: 'cup', iconImage: 'category/1730465248005.png', iconBare: true },
];

window.PRODUCTS = [
  { id: 44, cat: 'strips', name: 'Стрипсы 940гр', price: 80, image: 'product/1789276079578.png' },
  { id: 2, cat: 'strips', name: 'Стрипсы 470гр', price: 40, image: 'product/1783265525295.png', description: 'Стрипсы 500г' },
  { id: 5, cat: 'strips', name: 'Стрипсы 1 порция', price: 25, image: 'product/1783265504539.png', description: 'Стрипсы 200 гр+булочка, +соус', note: 'Стрипсы 200 гр+булочка, +соус' },
  { id: 1, cat: 'strips', name: 'Стрипсы 1кг', price: 85, image: 'product/1783266140473.png', plate: '#f5f4fc', description: 'Стрипсы 1кг' },
  { id: 4, cat: 'wings', name: 'Крылья 470 гр', price: 40, image: 'product/1783266398494.png', description: 'Крылья' },
  { id: 3, cat: 'wings', name: 'Крылья 1кг', price: 85, image: 'product/1783266445873.png', plate: '#f5f4fc', description: 'Крылья 1кг' },
  { id: 6, cat: 'wings', name: 'Крылья 1 порция', price: 25, image: 'product/1783266185540.png', description: 'Крылья 200гр+булочка, +соус', note: 'Крылья 200гр+булочка, +соус' },
  { id: 8, cat: 'burgers', name: 'Вактбургер', price: 15, image: 'product/1715820525108.png', description: 'Вактбургер' },
  { id: 43, cat: 'burgers', name: 'Чикенбургер с сыром', price: 20, image: 'product/1789024259117.png', plate: '#fefefe' },
  { id: 42, cat: 'burgers', name: 'Твистер с сыром', price: 20, image: 'product/1783267898871.jpg', plate: '#ffffff' },
  { id: 7, cat: 'burgers', name: 'Чикенбургер', price: 15, image: 'product/1715820484313.png', description: 'Чикенбургер' },
  { id: 9, cat: 'burgers', name: 'Биг вактбургер', price: 20, image: 'product/1715820572430.png', description: 'Биг вактбургер' },
  { id: 10, cat: 'burgers', name: 'Твистер', price: 15, image: 'product/1715820596666.png', description: 'Твистер' },
  { id: 16, cat: 'combo', name: 'Баскет микс 1кг', price: 85, image: 'product/1783267010494.png', plate: '#f5f4fc', description: 'Баскет микс 1кг' },
  { id: 12, cat: 'combo', name: 'Комбо Вакт-бургер', price: 30, image: 'product/1783266949928.png', description: 'Вакт-бургер, фри, напиток 0.5л', note: 'Вакт-бургер, фри, напиток 0.5л' },
  { id: 11, cat: 'combo', name: 'Комбо Чикен-бургер', price: 30, image: 'product/1783267140754.png', description: 'Чикенбургер, фри, напиток 0.5л', note: 'Чикенбургер, фри, напиток 0.5л' },
  { id: 38, cat: 'combo', name: 'Комбо крылья', price: 40, image: 'product/1783267399078.png' },
  { id: 37, cat: 'combo', name: 'Комбо стрипсы', price: 40, image: 'product/1783267303955.png' },
  { id: 14, cat: 'combo', name: 'Комбо Твистер', price: 30, image: 'product/1783267531001.png', description: 'Твистер, фри, напиток 0.5л', note: 'Твистер, фри, напиток 0.5л' },
  { id: 15, cat: 'combo', name: 'Баскет микс 500гр', price: 40, image: 'product/1783268586839.png', description: 'Баскет микс 500гр' },
  { id: 17, cat: 'fries', name: 'Фри стандарт', price: 12, image: 'product/1780038359037.png', description: 'Фри' },
  { id: 19, cat: 'sauces', name: 'Сырный соус', price: 3, image: 'product/1715822043017.png', description: 'Сырный соус' },
  { id: 18, cat: 'sauces', name: 'Булочка', price: 3, image: 'product/1715821925859.png', description: 'Булочка' },
  { id: 20, cat: 'sauces', name: 'Чесночный соус', price: 3, image: 'product/1715822095853.png', description: 'Чесночный соус' },
  { id: 21, cat: 'sauces', name: 'Острый соус', price: 3, image: 'product/1715822148837.png', description: 'Острый соус' },
  { id: 24, cat: 'drinks', name: 'Кола 0,5л', price: 6, image: 'product/1716066879772.png', description: 'Кола 0,5л' },
  { id: 27, cat: 'drinks', name: 'Фанта 0,5л', price: 6, image: 'product/1716067057927.png', description: 'Фанта 0,5л' },
  { id: 29, cat: 'drinks', name: 'Спрайт 1л', price: 10, image: 'product/1716067128783.png', description: 'Спрайт 1л' },
  { id: 30, cat: 'drinks', name: 'Спрайт 0,5л', price: 6, image: 'product/1716067172526.png', description: 'Спрайт 0,5л' },
  { id: 26, cat: 'drinks', name: 'Фанта 1л', price: 10, image: 'product/1716067025951.png', description: 'Фанта 1л' },
  { id: 40, cat: 'drinks', name: 'Кофе', price: 5, image: 'product/1781238723555.png' },
  { id: 32, cat: 'drinks', name: 'Бонаква 1л', price: 5, image: 'product/1716067248448.png', description: 'Бонаква 1л' },
  { id: 31, cat: 'drinks', name: 'Бонаква 1,5л', price: 6, image: 'product/1781238153711.png', description: 'Спрайт 1,5л' },
  { id: 41, cat: 'drinks', name: 'Bon aqua 0.5', price: 4, image: 'product/1781238111094.png' },
  { id: 34, cat: 'drinks', name: 'Fuse tea лимон 0.45', price: 7, image: 'product/1716911597500.png' },
  { id: 35, cat: 'drinks', name: 'Fuse tea персик 0.45', price: 7, image: 'product/1716911641318.png' },
  { id: 23, cat: 'drinks', name: 'Кола 1л', price: 10, image: 'product/1716066845068.png', description: 'Кола 1л' },
  { id: 39, cat: 'cup', name: 'Стаканчик', price: 1, image: 'product/1730464618090.png' },
];

// Menu data mirrored from the live site's catalogue (names, prices, categories).
// `art` picks the placeholder illustration; set `image` to a file in /images to use a real photo.
window.SITE_CONFIG = {
  phone: '+992 92 200 66 99',
  currency: 'смн',
  // Path to a logo image (e.g. 'images/logo.svg'); null renders the text wordmark.
  logo: null,
  // Set to a real backend base URL to POST orders to `${apiBase}/submitOrder`.
  // Left null on purpose so the clone never sends orders to the real café.
  apiBase: null,
  points: [{ id: 1, name: 'Вакт - Мир' }],
  banks: [
    { id: 0, name: 'Наличными' },
    { id: 1, name: 'DC' },
    { id: 2, name: 'Эсхата' },
    { id: 3, name: 'Алиф' },
  ],
};

window.CATEGORIES = [
  { id: 'strips', name: 'Сочные стрипсы', icon: 'strips' },
  { id: 'wings', name: 'Острые крылья', icon: 'wings' },
  { id: 'burgers', name: 'Бургеры и роллы', icon: 'burger' },
  { id: 'combo', name: 'Комбо', icon: 'combo' },
  { id: 'fries', name: 'Картош. фри', icon: 'fries' },
  { id: 'sauces', name: 'Соусы и булочки', icon: 'sauce' },
  { id: 'drinks', name: 'Напитки', icon: 'drink' },
  { id: 'cup', name: 'Стаканчик', icon: 'cup' },
];

window.PRODUCTS = [
  { id: 44, cat: 'strips', name: 'Стрипсы 940гр', price: 80, art: 'bucket' },
  { id: 45, cat: 'strips', name: 'Стрипсы 470гр', price: 40, art: 'boat' },
  { id: 46, cat: 'strips', name: 'Стрипсы 1 порция', price: 25, art: 'strips' },
  { id: 47, cat: 'strips', name: 'Стрипсы 1кг', price: 85, art: 'bucket' },

  { id: 50, cat: 'wings', name: 'Крылья 470 гр', price: 40, art: 'boat' },
  { id: 51, cat: 'wings', name: 'Крылья 1кг', price: 85, art: 'bucket' },
  { id: 52, cat: 'wings', name: 'Крылья 1 порция', price: 25, art: 'wings' },

  { id: 8, cat: 'burgers', name: 'Вактбургер', price: 15, art: 'burger' },
  { id: 9, cat: 'burgers', name: 'Чикенбургер с сыром', price: 20, art: 'burger' },
  { id: 10, cat: 'burgers', name: 'Твистер с сыром', price: 20, art: 'twister' },
  { id: 11, cat: 'burgers', name: 'Чикенбургер', price: 15, art: 'burger' },
  { id: 12, cat: 'burgers', name: 'Биг вактбургер', price: 20, art: 'burger' },
  { id: 13, cat: 'burgers', name: 'Твистер', price: 15, art: 'twister' },

  { id: 60, cat: 'combo', name: 'Баскет микс 1кг', price: 85, art: 'bucket' },
  { id: 61, cat: 'combo', name: 'Комбо Вакт-бургер', price: 30, art: 'combo' },
  { id: 62, cat: 'combo', name: 'Комбо Чикен-бургер', price: 30, art: 'combo' },
  { id: 63, cat: 'combo', name: 'Комбо крылья', price: 40, art: 'combo' },
  { id: 64, cat: 'combo', name: 'Комбо стрипсы', price: 40, art: 'combo' },
  { id: 65, cat: 'combo', name: 'Комбо Твистер', price: 30, art: 'combo' },
  { id: 66, cat: 'combo', name: 'Баскет микс 500гр', price: 40, art: 'boat' },

  { id: 70, cat: 'fries', name: 'Фри стандарт', price: 12, art: 'fries' },

  { id: 80, cat: 'sauces', name: 'Сырный соус', price: 3, art: 'sauce' },
  { id: 81, cat: 'sauces', name: 'Булочка', price: 3, art: 'bun' },
  { id: 82, cat: 'sauces', name: 'Чесночный соус', price: 3, art: 'sauce' },
  { id: 83, cat: 'sauces', name: 'Острый соус', price: 3, art: 'sauce' },

  { id: 90, cat: 'drinks', name: 'Кола 0,5л', price: 6, art: 'soda' },
  { id: 91, cat: 'drinks', name: 'Фанта 0,5л', price: 6, art: 'soda' },
  { id: 92, cat: 'drinks', name: 'Спрайт 1л', price: 10, art: 'soda' },
  { id: 93, cat: 'drinks', name: 'Спрайт 0,5л', price: 6, art: 'soda' },
  { id: 94, cat: 'drinks', name: 'Фанта 1л', price: 10, art: 'soda' },
  { id: 95, cat: 'drinks', name: 'Кофе', price: 5, art: 'coffee' },
  { id: 96, cat: 'drinks', name: 'Бонаква 1л', price: 5, art: 'water' },
  { id: 97, cat: 'drinks', name: 'Бонаква 1,5л', price: 6, art: 'water' },
  { id: 98, cat: 'drinks', name: 'Bon aqua 0.5', price: 4, art: 'water' },
  { id: 99, cat: 'drinks', name: 'Fuse tea лимон 0.45', price: 7, art: 'tea' },
  { id: 100, cat: 'drinks', name: 'Fuse tea персик 0.45', price: 7, art: 'tea' },
  { id: 101, cat: 'drinks', name: 'Кола 1л', price: 10, art: 'soda' },

  { id: 110, cat: 'cup', name: 'Стаканчик', price: 1, art: 'cup' },
];

// Original line icons for categories and flat placeholder illustrations for products.
(function () {
  const line = (d) =>
    `<svg viewBox="0 0 48 48" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  const ICONS = {
    strips: line('<path d="M12 30c-3-5 1-12 7-13 3-5 11-5 14 0 5 1 7 7 4 11 1 5-4 9-9 8-3 3-9 3-11-1-4 0-6-2-5-5z"/><path d="M18 24c3-1 5 1 7 0M22 30c3 0 5-2 8-1"/>'),
    wings: line('<path d="M16 38c-4-6-3-14 3-19l6-6c2-2 6-1 6 2-1 3-3 4-2 6 2-1 5 0 5 3l-2 4c2 1 3 4 1 6-3 3-8 5-12 5"/><path d="M14 40l-3 3M18 41l-2 4"/>'),
    burger: line('<path d="M9 22c0-7 7-11 15-11s15 4 15 11z"/><path d="M8 27h32M10 32h28l-2 5H12z"/><path d="M8 27c3 2 5 2 8 0 3 2 5 2 8 0 3 2 5 2 8 0 3 2 5 2 8 0"/>'),
    combo: line('<path d="M8 18h32l-3 18H11z"/><path d="M8 18l5-6h22l5 6M16 26h16"/>'),
    fries: line('<path d="M14 22h20l-3 18H17z"/><path d="M17 22l-2-12M21 22l-1-14M25 22V7M29 22l1-14M32 22l2-11"/><circle cx="24" cy="30" r="3"/>'),
    sauce: line('<path d="M7 22h34c0 9-7 15-17 15S7 31 7 22z"/><ellipse cx="24" cy="22" rx="17" ry="4"/><path d="M16 21c3 2 13 2 16 0"/>'),
    drink: line('<path d="M20 6h6v6c3 2 4 4 4 8v20H16V20c0-4 1-6 4-8z"/><path d="M16 26h14M16 33h14"/><rect x="31" y="22" width="8" height="18" rx="1"/>'),
    cup: line('<path d="M12 12h24l-3 30H15z"/><path d="M10 12h28l-1-5H11z"/><circle cx="24" cy="27" r="6"/><path d="M24 23v8M20 27h8"/>'),
  };

  const svg = (body) => `<svg viewBox="0 0 120 110" aria-hidden="true">${body}</svg>`;
  const shadow = '<ellipse cx="60" cy="100" rx="40" ry="5" fill="#000" opacity=".08"/>';
  const crumbs = (cx, cy, n = 7) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const x = cx + Math.cos(a) * 14 + (i % 2) * 4;
      const y = cy + Math.sin(a) * 6;
      return `<path d="M${x - 9} ${y}c2-7 14-7 18 0-2 6-15 7-18 0z" fill="${i % 2 ? '#e0902f' : '#d07b20'}"/>`;
    }).join('');

  const ART = {
    bucket: svg(`${shadow}<path d="M26 38h68l-8 58H34z" fill="#e31e2b"/><path d="M26 38h68l-2 10H28z" fill="#c4141f"/>${crumbs(60, 34, 9)}<rect x="40" y="62" width="40" height="14" rx="3" fill="#fff"/><text x="60" y="73" font-family="Rubik" font-style="italic" font-weight="900" font-size="11" fill="#e31e2b" text-anchor="middle">ВАКТ</text>`),
    boat: svg(`${shadow}<path d="M12 56l96-6-10 30H24z" fill="#e31e2b"/><path d="M12 56l96-6-3 9-90 5z" fill="#c4141f"/>${crumbs(60, 50, 8)}<text x="70" y="74" font-family="Rubik" font-style="italic" font-weight="900" font-size="8" fill="#fff" text-anchor="middle" transform="rotate(-3 70 74)">ВАКТ</text>`),
    strips: svg(`${shadow}<ellipse cx="60" cy="86" rx="30" ry="9" fill="#fff" stroke="#eee"/><path d="M28 66c4-10 30-12 34-2-6 8-28 10-34 2zM50 72c6-10 34-10 38 0-6 8-32 9-38 0z" fill="#d9822a"/><path d="M38 44c0-14 44-14 44 0z" fill="#e6a352"/><path d="M38 44h44c0 4-44 4-44 0z" fill="#c98a3c"/>`),
    wings: svg(`${shadow}<ellipse cx="60" cy="86" rx="30" ry="9" fill="#fff" stroke="#eee"/><path d="M30 70c-4-14 18-24 28-12 8-10 30-2 26 12-4 8-50 10-54 0z" fill="#c8641c"/><path d="M38 44c0-14 44-14 44 0z" fill="#e6a352"/><path d="M38 44h44c0 4-44 4-44 0z" fill="#c98a3c"/>`),
    burger: svg(`${shadow}<path d="M24 50c0-24 72-24 72 0z" fill="#e8a24d"/><circle cx="46" cy="36" r="1.5" fill="#fff6e0"/><circle cx="60" cy="31" r="1.5" fill="#fff6e0"/><circle cx="74" cy="37" r="1.5" fill="#fff6e0"/><path d="M20 54c10 5 70 5 80 0l-3 6H23z" fill="#6cb33f"/><rect x="22" y="58" width="76" height="9" rx="4" fill="#b8641c"/><path d="M24 66l72 0-6 6H30z" fill="#ffd34d"/><path d="M24 72h72c0 12-72 12-72 0z" fill="#e0953f"/>`),
    twister: svg(`${shadow}<path d="M30 92L60 18l30 74z" fill="#f2dcae"/><path d="M42 62l18-44 18 44c-10 4-26 4-36 0z" fill="#e8c88a"/><path d="M46 50c6-6 22-6 28 0l-4 10H50z" fill="#d9822a"/><path d="M48 46c4 2 20 2 24 0" stroke="#6cb33f" stroke-width="5" stroke-linecap="round"/><path d="M30 92l30-20 30 20" fill="#e31e2b"/>`),
    combo: svg(`${shadow}<path d="M14 58c0-16 44-16 44 0z" fill="#e8a24d"/><rect x="12" y="58" width="48" height="7" rx="3" fill="#b8641c"/><path d="M14 65h44c0 9-44 9-44 0z" fill="#e0953f"/><path d="M68 40h18l-3 52H71z" fill="#e31e2b"/><path d="M76 40l3-14" stroke="#555" stroke-width="2"/><path d="M90 60h18l-3 32H93z" fill="#e31e2b"/><path d="M92 60l-2-14M96 60l-1-16M100 60v-16M104 60l1-14" stroke="#f4c542" stroke-width="3" stroke-linecap="round"/>`),
    fries: svg(`${shadow}<path d="M40 54l-4-36M47 54l-2-40M54 54V12M61 54V14M68 54l2-38M75 54l3-34M82 54l4-30" stroke="#f4c542" stroke-width="6" stroke-linecap="round"/><path d="M34 48h52l-8 48H42z" fill="#e31e2b"/><circle cx="60" cy="70" r="9" fill="#fff"/><text x="60" y="74" font-family="Rubik" font-style="italic" font-weight="900" font-size="10" fill="#e31e2b" text-anchor="middle">В</text>`),
    sauce: svg(`${shadow}<path d="M28 54h64l-6 38H34z" fill="#fff" stroke="#e5e5e5" stroke-width="2"/><ellipse cx="60" cy="54" rx="32" ry="7" fill="#f2c45a"/><ellipse cx="60" cy="54" rx="32" ry="7" fill="none" stroke="#e5e5e5" stroke-width="2"/>`),
    bun: svg(`${shadow}<path d="M22 80c0-32 76-32 76 0z" fill="#e8a24d"/><path d="M22 80h76c0 10-76 10-76 0z" fill="#d38c38"/><circle cx="44" cy="62" r="2" fill="#fff6e0"/><circle cx="60" cy="56" r="2" fill="#fff6e0"/><circle cx="76" cy="62" r="2" fill="#fff6e0"/>`),
    soda: svg(`${shadow}<path d="M52 10h16v10c8 6 10 12 10 22v52c0 3-2 5-5 5H47c-3 0-5-2-5-5V42c0-10 2-16 10-22z" fill="#3a2a22" opacity=".9"/><rect x="42" y="50" width="36" height="22" fill="#e31e2b"/><rect x="52" y="6" width="16" height="6" rx="2" fill="#e31e2b"/>`),
    water: svg(`${shadow}<path d="M52 10h16v10c8 6 10 12 10 22v52c0 3-2 5-5 5H47c-3 0-5-2-5-5V42c0-10 2-16 10-22z" fill="#cfe9f7"/><rect x="42" y="50" width="36" height="22" fill="#2f8fd6"/><rect x="52" y="6" width="16" height="6" rx="2" fill="#2f8fd6"/>`),
    tea: svg(`${shadow}<path d="M52 10h16v10c8 6 10 12 10 22v52c0 3-2 5-5 5H47c-3 0-5-2-5-5V42c0-10 2-16 10-22z" fill="#f3c86b"/><rect x="42" y="50" width="36" height="22" fill="#2a7a3b"/><rect x="52" y="6" width="16" height="6" rx="2" fill="#2a7a3b"/>`),
    coffee: svg(`${shadow}<path d="M38 30h44l-6 66H44z" fill="#fff" stroke="#e5e5e5" stroke-width="2"/><rect x="34" y="22" width="52" height="10" rx="3" fill="#3a2a22"/><rect x="40" y="52" width="40" height="18" fill="#e31e2b"/>`),
    cup: svg(`${shadow}<path d="M36 26h48l-6 70H42z" fill="#e31e2b"/><rect x="32" y="20" width="56" height="9" rx="3" fill="#c4141f"/><circle cx="60" cy="60" r="11" fill="#fff"/><text x="60" y="64" font-family="Rubik" font-style="italic" font-weight="900" font-size="11" fill="#e31e2b" text-anchor="middle">В</text>`),
  };

  window.ART = {
    icon: (name) => ICONS[name] || ICONS.combo,
    product: (p) =>
      p.image
        ? `<img src="images/${p.image}" alt="" loading="lazy">`
        : ART[p.art] || ART.combo,
  };
})();

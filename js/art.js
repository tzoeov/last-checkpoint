'use strict';

const Art = (() => {
  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    const f = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  function painter(ctx, ox, oy, dim) {
    return (x, y, w, h, col) => {
      ctx.fillStyle = dim ? mixCss(col, dim) : col;
      ctx.fillRect(ox + x, oy + y, w, h);
    };
  }
  function mixCss(col, dim) {
    if (col[0] === '#') return mix(col, '#1b2026', dim);
    const m = col.match(/\d+/g).map(Number);
    return `rgb(${m.slice(0, 3).map((v) => Math.round(v + (27 - v) * dim)).join(',')})`;
  }

  const FACE = {
    round: { l: 14, r: 33, t: 12, b: 35, cut: 3 },
    oval: { l: 15, r: 32, t: 11, b: 36, cut: 3 },
    long: { l: 16, r: 31, t: 10, b: 37, cut: 2 },
    square: { l: 14, r: 33, t: 12, b: 36, cut: 1 }
  };

  function faceRows(F) {
    const rows = [];
    for (let y = F.t; y <= F.b; y++) {
      let inset = 0;
      const dt = y - F.t, db = F.b - y;
      if (dt < F.cut) inset = F.cut - dt;
      if (db < F.cut + 1) inset = Math.max(inset, F.cut + 1 - db);
      if (db < 2 && F.cut > 1) inset += 1;
      rows.push([y, F.l + inset, F.r - inset]);
    }
    return rows;
  }

  function drawClothes(p, L, F) {
    const base = L.clothes === 'leather' ? '#3a2a22' : L.clothes === 'priest' ? '#1c1c1f' : L.clothes === 'fisher' ? (L.clothesColor || '#4a6a7a') : L.clothes === 'overalls' ? '#2f4f7a' : (L.clothesColor || '#3f4a5a');
    const dark = shade(base, -0.35), light = shade(base, 0.18);
    for (let y = 42; y < 56; y++) {
      const spread = y < 46 ? 10 - (y - 42) * 1.5 : 4 - Math.min(3, (y - 46) * 0.4);
      const l = Math.round(Math.max(1, spread)), r = 47 - l;
      p(l, y, r - l + 1, 1, base);
      p(l, y, 2, 1, dark);
      p(r - 1, y, 2, 1, dark);
    }
    p(12, 43, 2, 2, light); p(34, 43, 2, 2, light);
    const skin = SKIN_TONES[L.skin];
    switch (L.clothes) {
      case 'suit': {
        p(20, 42, 8, 3, '#e8e4da'); p(21, 45, 6, 2, '#e8e4da'); p(22, 47, 4, 1, '#e8e4da');
        p(23, 43, 2, 9, '#7a2a2a'); p(23, 43, 2, 1, '#9a3a3a');
        for (let i = 0; i < 6; i++) { p(19 - Math.floor(i / 2), 43 + i, 1, 1, dark); p(28 + Math.floor(i / 2), 43 + i, 1, 1, dark); }
        p(24, 52, 1, 1, dark); p(24, 54, 1, 1, dark);
        break;
      }
      case 'shirt': case 'blouse': {
        p(19, 42, 3, 2, light); p(26, 42, 3, 2, light);
        p(23, 44, 1, 12, dark);
        [46, 49, 52].forEach((y) => p(24, y, 1, 1, '#e8e4da'));
        p(21, 42, 6, 1, skin);
        break;
      }
      case 'sweater': {
        p(19, 42, 10, 2, dark);
        for (let y = 45; y < 56; y += 2) for (let x = 6; x < 42; x += 3) p(x, y, 1, 1, dark);
        break;
      }
      case 'fisher': {
        p(18, 41, 12, 3, light); p(18, 43, 12, 1, dark);
        for (let x = 8; x < 40; x += 5) for (let y = 45; y < 56; y += 2) { p(x, y, 1, 1, light); p(x + 1, y + 1, 1, 1, dark); }
        break;
      }
      case 'leather': {
        p(17, 42, 4, 4, '#4d3a2e'); p(27, 42, 4, 4, '#4d3a2e');
        p(23, 44, 1, 12, '#9a8a7a');
        p(10, 47, 2, 1, '#5d4a3e'); p(36, 47, 2, 1, '#5d4a3e'); p(15, 50, 1, 5, '#2a1e18');
        p(21, 42, 6, 2, '#d8d0c0');
        break;
      }
      case 'tshirt': {
        p(20, 42, 8, 2, skin); p(20, 44, 8, 1, dark);
        break;
      }
      case 'coat': {
        p(15, 40, 5, 6, light); p(28, 40, 5, 6, light);
        p(20, 42, 8, 3, skin === SKIN_TONES[0] ? '#e8e4da' : '#e8e4da');
        p(23, 45, 2, 11, dark); [47, 51, 55].forEach((y) => { p(20, y, 1, 1, '#c9b48a'); p(27, y, 1, 1, '#c9b48a'); });
        break;
      }
      case 'tracksuit': {
        p(23, 43, 1, 13, '#d8d8d0');
        for (let y = 44; y < 56; y++) { p(8 - Math.min(3, Math.floor((y - 44) / 3)), y, 1, 1, '#e8e4da'); p(39 + Math.min(3, Math.floor((y - 44) / 3)), y, 1, 1, '#e8e4da'); }
        p(20, 42, 8, 1, '#e8e4da');
        break;
      }
      case 'floral': {
        const fl = ['#e8b84a', '#d86a5a', '#e8e4da'];
        for (let y = 44; y < 56; y += 3) for (let x = 6 + (y % 2) * 2; x < 42; x += 4) p(x, y, 1, 1, fl[(x + y) % 3]);
        p(20, 42, 3, 3, light); p(25, 42, 3, 3, light); p(22, 42, 4, 2, skin);
        break;
      }
      case 'dress': {
        p(19, 42, 10, 3, skin); p(20, 45, 8, 1, skin); p(18, 42, 1, 4, dark); p(29, 42, 1, 4, dark);
        break;
      }
      case 'priest': {
        p(22, 42, 4, 2, '#f0eee8');
        break;
      }
      case 'overalls': {
        p(18, 42, 12, 4, '#8a3a32');
        p(16, 42, 3, 14, '#284468'); p(29, 42, 3, 14, '#284468');
        p(17, 47, 1, 1, '#d8c86a'); p(30, 47, 1, 1, '#d8c86a');
        break;
      }
      case 'uniform': case 'military': {
        p(20, 42, 8, 2, shade(base, 0.3)); p(22, 44, 4, 3, '#e8e4da'); p(23, 44, 2, 8, '#2a2a2a');
        p(6, 44, 6, 2, '#c9a24a'); p(36, 44, 6, 2, '#c9a24a');
        p(18, 44, 2, 2, '#a8322d'); p(28, 44, 2, 2, '#a8322d');
        [48, 51, 54].forEach((y) => { p(20, y, 1, 1, '#c9a24a'); p(27, y, 1, 1, '#c9a24a'); });
        if (L.clothes === 'military') { p(12, 49, 4, 3, '#a8322d'); p(12, 49, 4, 1, '#c9a24a'); }
        break;
      }
      default: break;
    }
  }

  function drawHairBack(p, L, F, hc) {
    const dk = shade(hc, -0.3);
    if (['long', 'perm', 'ponytail'].includes(L.hair)) {
      const ext = L.hair === 'perm' ? 4 : 2;
      p(F.l - ext, F.t + 2, 3 + ext - 1, F.b - F.t + (L.hair === 'long' ? 10 : 2), hc);
      p(F.r - 1, F.t + 2, 3 + ext - 1, F.b - F.t + (L.hair === 'long' ? 10 : 2), hc);
      p(F.l - ext, F.b, 2, 8, dk);
    }
    if (L.hair === 'bob') {
      p(F.l - 2, F.t + 2, 4, F.b - F.t - 4, hc); p(F.r - 1, F.t + 2, 4, F.b - F.t - 4, hc);
    }
    if (L.hair === 'scarf') {
      const sc = L.clothesColor ? shade(L.clothesColor, 0.25) : '#7a5a6a';
      p(F.l - 3, F.t - 3, F.r - F.l + 7, F.b - F.t + 4, sc);
    }
  }

  function drawHairFront(p, L, F, hc) {
    const dk = shade(hc, -0.3), lt = shade(hc, 0.25);
    const w = F.r - F.l + 1;
    switch (L.hair) {
      case 'short': case 'parted': case 'slick':
        p(F.l - 1, F.t - 2, w + 2, 4, hc); p(F.l - 1, F.t + 2, 2, 7, hc); p(F.r, F.t + 2, 2, 7, hc);
        p(F.l + 1, F.t - 3, w - 2, 1, hc);
        if (L.hair === 'parted') p(F.l + 6, F.t - 2, 1, 3, dk);
        if (L.hair === 'slick') { p(F.l + 3, F.t - 2, 6, 1, lt); p(F.l + 4, F.t - 1, 4, 1, lt); }
        break;
      case 'curly': case 'perm': {
        const ext = L.hair === 'perm' ? 3 : 1;
        p(F.l - ext - 1, F.t - 4, w + 2 * ext + 2, 6, hc); p(F.l - ext - 1, F.t + 2, 3, 9, hc); p(F.r + ext - 1, F.t + 2, 3, 9, hc);
        for (let x = F.l - ext - 1; x < F.r + ext + 2; x += 2) { p(x, F.t - 5, 1, 1, hc); p(x, F.t - 2 + ((x / 2) % 2), 1, 1, dk); }
        for (let y = F.t; y < F.t + 10; y += 2) { p(F.l - ext, y, 1, 1, lt); p(F.r + ext, y, 1, 1, lt); }
        break;
      }
      case 'balding':
        p(F.l - 1, F.t + 3, 3, 8, hc); p(F.r - 1, F.t + 3, 3, 8, hc);
        p(F.l + 6, F.t - 1, 3, 1, hc);
        break;
      case 'bald':
        break;
      case 'long': case 'bob': case 'ponytail':
        p(F.l - 1, F.t - 2, w + 2, 4, hc); p(F.l + 1, F.t - 3, w - 2, 1, hc);
        p(F.l - 1, F.t + 2, 2, 4, hc); p(F.r, F.t + 2, 2, 4, hc);
        p(F.l + 2, F.t + 1, 5, 2, hc); p(F.l + 4, F.t - 2, 6, 1, lt);
        if (L.hair === 'ponytail') { p(F.r + 1, F.t + 3, 3, 3, hc); p(F.r + 2, F.t + 6, 3, 10, hc); }
        break;
      case 'bun':
        p(F.l - 1, F.t - 2, w + 2, 4, hc); p(F.l + 1, F.t - 3, w - 2, 1, hc);
        p(F.l - 1, F.t + 2, 2, 5, hc); p(F.r, F.t + 2, 2, 5, hc);
        p(22, F.t - 8, 6, 5, hc); p(23, F.t - 9, 4, 1, hc); p(23, F.t - 7, 2, 1, lt);
        break;
      case 'scarf': {
        const sc = L.clothesColor ? shade(L.clothesColor, 0.25) : '#7a5a6a';
        const sd = L.clothesColor ? shade(L.clothesColor, -0.1) : '#5a3a4a';
        p(F.l - 2, F.t - 4, w + 4, 6, sc); p(F.l - 3, F.t + 2, 4, F.b - F.t - 1, sc); p(F.r, F.t + 2, 4, F.b - F.t - 1, sc);
        for (let x = F.l; x < F.r; x += 3) p(x, F.t - 3, 1, 1, sd);
        p(21, F.b + 1, 6, 3, sd);
        break;
      }
      default: break;
    }
  }

  function drawHat(p, L, F) {
    const hc = '#2c2a28';
    switch (L.hat) {
      case 'cap':
        p(F.l - 1, F.t - 5, F.r - F.l + 3, 5, '#2d4f6b'); p(F.l - 3, F.t - 1, F.r - F.l + 5, 2, '#24405a'); p(23, F.t - 4, 3, 2, '#e8e4da');
        break;
      case 'flatcap':
        p(F.l - 2, F.t - 4, F.r - F.l + 5, 4, '#5a5048'); p(F.l - 3, F.t - 1, F.r - F.l + 6, 2, '#4a4038');
        for (let x = F.l; x < F.r; x += 2) p(x, F.t - 3, 1, 1, '#6a6058');
        break;
      case 'fedora':
        p(F.l, F.t - 7, F.r - F.l + 1, 6, hc); p(F.l - 4, F.t - 1, F.r - F.l + 9, 2, hc); p(F.l, F.t - 3, F.r - F.l + 1, 1, '#7a2a2a');
        break;
      case 'peaked':
        p(F.l - 2, F.t - 7, F.r - F.l + 5, 6, '#3d4a3a'); p(F.l - 1, F.t - 1, F.r - F.l + 3, 1, '#1e1e1e'); p(F.l - 2, F.t, F.r - F.l + 5, 2, '#141414');
        p(22, F.t - 5, 4, 3, '#c9a24a'); p(23, F.t - 4, 2, 1, '#a8322d');
        break;
      case 'sunhat':
        p(F.l - 6, F.t - 1, F.r - F.l + 13, 2, '#d8c48a'); p(F.l, F.t - 6, F.r - F.l + 1, 5, '#d8c48a'); p(F.l, F.t - 2, F.r - F.l + 1, 1, '#a8322d');
        break;
      default: break;
    }
  }

  function drawFace(p, L, F, t) {
    const skin = SKIN_TONES[L.skin];
    const sd = shade(skin, -0.16), sd2 = shade(skin, -0.32), hl = shade(skin, 0.12);
    const hc = HAIR_COLORS[L.hairColor] || '#2a2420';
    const rows = faceRows(F);
    rows.forEach(([y, l, r]) => { p(l, y, r - l + 1, 1, skin); p(r - 1, y, 2, 1, sd); });
    p(F.l + 2, F.t + 3, 2, 6, hl);
    const ey = F.t + Math.round((F.b - F.t) * 0.42);
    p(F.l - 2, ey - 1, 2, 5, sd); p(F.r + 1, ey - 1, 2, 5, sd);
    if (L.earrings) { p(F.l - 2, ey + 5, 1, 2, '#d8b84a'); p(F.r + 2, ey + 5, 1, 2, '#d8b84a'); }
    const lx = 19, rx = 27;
    const blink = t && (Math.floor(t / 180) % 23 === 0);
    const iris = EYE_COLORS[L.eyes] || '#3a2a1a';
    if (blink) {
      p(lx, ey + 1, 3, 1, sd2); p(rx, ey + 1, 3, 1, sd2);
    } else {
      p(lx, ey, 3, 2, '#f2efe6'); p(rx, ey, 3, 2, '#f2efe6');
      p(lx + 1, ey, 2, 2, iris); p(rx, ey, 2, 2, iris);
      p(lx + 1, ey, 1, 1, '#0f0f10'); p(rx + 1, ey, 1, 1, '#0f0f10');
    }
    const bc = L.hair === 'bald' ? sd2 : shade(hc, -0.1);
    const e = L.expression;
    if (e === 'angry') { p(lx, ey - 3, 2, 1, bc); p(lx + 2, ey - 2, 1, 1, bc); p(rx + 1, ey - 3, 2, 1, bc); p(rx, ey - 2, 1, 1, bc); }
    else if (e === 'sad' || e === 'nervous') { p(lx, ey - 2, 2, 1, bc); p(lx + 2, ey - 3, 1, 1, bc); p(rx + 1, ey - 2, 2, 1, bc); p(rx, ey - 3, 1, 1, bc); }
    else { p(lx, ey - 2, 3, 1, bc); p(rx, ey - 2, 3, 1, bc); }
    if (e === 'tired') { p(lx, ey + 2, 3, 1, sd); p(rx, ey + 2, 3, 1, sd); }
    p(24, ey + 1, 1, 4, sd); p(23, ey + 5, 3, 1, sd2);
    if (L.age > 52) {
      p(F.l + 1, ey + 1, 1, 1, sd); p(F.r - 1, ey + 1, 1, 1, sd); p(21, F.t + 3, 6, 1, sd);
      p(20, ey + 6, 1, 3, sd); p(28, ey + 6, 1, 3, sd);
    }
    const my = ey + 8;
    const lip = shade(skin, -0.42);
    switch (e) {
      case 'smile': p(21, my - 1, 1, 1, lip); p(22, my, 5, 1, lip); p(27, my - 1, 1, 1, lip); p(23, my + 1, 3, 1, sd); break;
      case 'angry': p(21, my + 1, 1, 1, lip); p(22, my, 5, 1, lip); p(27, my + 1, 1, 1, lip); break;
      case 'sad': p(22, my + 1, 1, 1, lip); p(23, my, 3, 1, lip); p(26, my + 1, 1, 1, lip); break;
      case 'nervous': p(21, my, 2, 1, lip); p(23, my + 1, 2, 1, lip); p(25, my, 2, 1, lip); break;
      case 'tired': p(22, my, 4, 1, lip); break;
      default: p(22, my, 5, 1, lip);
    }
    if (L.mole) p(F.r - 4, my - 2, 1, 1, '#4a3020');
    if (L.scar) { for (let i = 0; i < 6; i++) p(F.l + 2 + i, ey + 2 + i, 1, 1, '#d89a8a'); }
    const fhc = L.hairColor === 'white' || L.hairColor === 'grey' ? HAIR_COLORS[L.hairColor] : shade(hc, 0.05);
    switch (L.facial) {
      case 'mustache': p(20, my - 2, 9, 2, fhc); p(19, my - 1, 1, 2, fhc); p(29, my - 1, 1, 2, fhc); break;
      case 'beard':
        rows.filter(([y]) => y >= my - 3).forEach(([y, l, r]) => p(l, y, r - l + 1, 1, fhc));
        p(F.l, ey + 3, 2, my - ey - 3, fhc); p(F.r - 1, ey + 3, 2, my - ey - 3, fhc);
        p(22, my, 5, 1, lip); p(21, F.b + 1, 7, 2, fhc);
        break;
      case 'stubble':
        rows.filter(([y]) => y >= my - 2).forEach(([y, l, r]) => { for (let x = l + ((y) % 2); x <= r; x += 2) p(x, y, 1, 1, sd2); });
        p(22, my, 5, 1, lip);
        break;
      case 'goatee': p(22, my + 2, 5, 3, fhc); p(20, my - 2, 9, 1, fhc); break;
      default: break;
    }
    if (L.glasses === 'round' || L.glasses === 'square') {
      const gc = '#2a2622';
      const box = (x) => { p(x - 1, ey - 1, 5, 1, gc); p(x - 1, ey + 2, 5, 1, gc); p(x - 1, ey - 1, 1, 4, gc); p(x + 3, ey - 1, 1, 4, gc); };
      box(lx); box(rx); p(23, ey, 2, 1, gc); p(F.l - 1, ey, 1, 1, gc); p(F.r + 1, ey, 1, 1, gc);
      if (L.glasses === 'round') { p(lx - 1, ey - 1, 1, 1, skin); p(lx + 3, ey + 2, 1, 1, skin); p(rx - 1, ey - 1, 1, 1, skin); p(rx + 3, ey + 2, 1, 1, skin); }
    } else if (L.glasses === 'sun') {
      p(lx - 1, ey - 1, 5, 4, '#141414'); p(rx - 1, ey - 1, 5, 4, '#141414'); p(23, ey, 2, 1, '#141414');
      p(lx, ey, 1, 1, '#4a4a5a'); p(rx, ey, 1, 1, '#4a4a5a');
    }
    if (e === 'nervous' && t !== undefined && Math.floor(t / 900) % 3 !== 0) { p(F.r - 2, F.t + 4, 1, 2, '#bfe0f0'); p(F.r - 2, F.t + 6, 1, 1, '#8fc0e0'); }
  }

  function bust(ctx, ox, oy, L, opts) {
    if (!L) return;
    const o = opts || {};
    const p = painter(ctx, ox, oy, o.dim || 0);
    const F = FACE[L.faceShape] || FACE.oval;
    const hc = HAIR_COLORS[L.hairColor] || '#2a2420';
    drawHairBack(p, L, F, hc);
    drawClothes(p, L, F);
    const skin = SKIN_TONES[L.skin];
    p(20, F.b - 2, 8, 44 - F.b + 2, shade(skin, -0.12));
    p(20, F.b, 8, 2, shade(skin, -0.25));
    drawFace(p, L, F, o.t);
    drawHairFront(p, L, F, hc);
    drawHat(p, L, F);
  }

  function kid(ctx, ox, oy, k, look, dim) {
    const p = painter(ctx, ox, oy, dim || 0);
    const skin = SKIN_TONES[look.skin];
    const hc = HAIR_COLORS[look.hairColor === 'grey' || look.hairColor === 'white' ? 'brown' : look.hairColor] || '#3b2a1e';
    const shirt = ['#c9563a', '#3a7aa8', '#d8b84a', '#5a8a4a'][(k.name.length + k.age) % 4];
    for (let y = 22; y < 32; y++) { const l = y < 25 ? 5 : 2; p(l, y, 26 - 2 * l, 1, shirt); }
    p(11, 19, 6, 4, shade(skin, -0.12));
    for (let y = 6; y < 21; y++) { const inset = y < 8 ? 2 : y > 18 ? 1 : 0; p(7 + inset, y, 14 - 2 * inset, 1, skin); }
    p(10, 12, 2, 2, '#2a1e18'); p(16, 12, 2, 2, '#2a1e18');
    p(12, 17, 4, 1, shade(skin, -0.4));
    p(6, 3, 16, 5, hc); p(6, 8, 2, 4, hc); p(20, 8, 2, 4, hc);
    if (k.sex === 'F') { p(4, 8, 3, 9, hc); p(21, 8, 3, 9, hc); p(4, 8, 2, 2, '#d86a5a'); }
  }

  function sky(ctx, W, H, weather, t) {
    const pal = {
      clear: ['#8fb3c2', '#d9d2b4'], storm: ['#3e4850', '#6a7276'], haze: ['#b9b6a4', '#e0d6b8'], dusk: ['#2e2c46', '#c9875a']
    }[weather] || ['#8fb3c2', '#d9d2b4'];
    const horizon = Math.round(H * 0.46);
    for (let y = 0; y < horizon; y++) {
      ctx.fillStyle = mix(pal[0], pal[1], y / horizon);
      ctx.fillRect(0, y, W, 1);
    }
    if (weather === 'dusk') {
      ctx.fillStyle = '#e8b06a'; ctx.fillRect(Math.round(W * 0.7), horizon - 6, 8, 4);
    }
    if (weather === 'clear' || weather === 'haze') {
      ctx.fillStyle = weather === 'clear' ? '#f0eacc' : '#efe4c6';
      const cx = (Math.floor(t / 400) % (W + 40)) - 20;
      ctx.fillRect(cx, 8, 14, 2); ctx.fillRect(cx + 3, 6, 7, 2);
      ctx.fillRect((cx + 70) % (W + 40) - 20, 14, 10, 2);
    }
    if (weather === 'storm') {
      ctx.fillStyle = '#2f373e';
      for (let i = 0; i < 5; i++) ctx.fillRect(((i * 37 + Math.floor(t / 300)) % (W + 30)) - 15, 4 + i * 4, 30, 4);
    }
    return horizon;
  }

  function harbour(ctx, W, H, weather, t, horizon) {
    const dim = weather === 'storm' ? 0.35 : weather === 'dusk' ? 0.45 : 0;
    const P = (x, y, w, h, c) => { ctx.fillStyle = dim ? mix(c, '#20242c', dim) : c; ctx.fillRect(x, y, w, h); };
    P(0, horizon - 6, Math.round(W * 0.45), 6, '#8a9a8a');
    P(0, horizon - 9, Math.round(W * 0.25), 3, '#7a8a7a');
    const houses = ['#e6d2b0', '#d8b48a', '#e8dcc8', '#c99a7a', '#dccaa0', '#e2c6a0'];
    for (let i = 0; i < 9; i++) {
      const x = 2 + i * 6, h = 4 + ((i * 7) % 5);
      P(x, horizon - h, 5, h, houses[i % houses.length]);
      P(x + 1, horizon - h + 1, 1, 1, '#5a4a3a');
      P(x, horizon - h - 1, 5, 1, '#b05a3a');
    }
    P(24, horizon - 14, 7, 5, '#e8dcc8'); P(25, horizon - 16, 5, 2, '#e8dcc8'); P(26, horizon - 17, 3, 1, '#d8ccb8');
    P(34, horizon - 20, 2, 12, '#e8dcc8'); P(34, horizon - 21, 2, 1, '#b05a3a'); P(33, horizon - 15, 4, 1, '#d8ccb8');
    const cx = Math.round(W * 0.66);
    for (let k = 0; k < 2; k++) {
      const x = cx + k * 14;
      P(x, horizon - 18, 2, 18, '#5a5048'); P(x - 6, horizon - 18, 16, 2, '#5a5048'); P(x + 8, horizon - 16, 1, 8, '#3a3430');
      P(x - 6, horizon - 17, 1, 1, '#c9563a');
    }
    const lx = W - 12;
    P(lx, horizon - 16, 4, 16, '#e8e4da'); P(lx, horizon - 12, 4, 2, '#a8322d'); P(lx, horizon - 6, 4, 2, '#a8322d'); P(lx - 1, horizon - 18, 6, 2, '#3a3430');
    if (weather === 'dusk' || weather === 'storm') { P(lx + 1, horizon - 17, 2, 1, '#ffe08a'); }
    const seaTop = horizon;
    const seaH = Math.round(H * 0.2);
    const sea = weather === 'storm' ? ['#33505a', '#2a434c'] : weather === 'dusk' ? ['#3a4a62', '#2c3a50'] : ['#4b8592', '#3c707d'];
    for (let y = seaTop; y < seaTop + seaH; y++) { ctx.fillStyle = mix(sea[0], sea[1], (y - seaTop) / seaH); ctx.fillRect(0, y, W, 1); }
    ctx.fillStyle = weather === 'dusk' ? '#e8b06a' : '#cfe6e6';
    for (let i = 0; i < 14; i++) {
      const sx = (i * 29 + Math.floor(t / 220) * (i % 3 + 1)) % W;
      const sy = seaTop + 2 + ((i * 7) % (seaH - 3));
      if ((Math.floor(t / 300) + i) % 3) ctx.fillRect(sx, sy, 2 + (i % 2), 1);
    }
    const fx = W - ((Math.floor(t / 90)) % (W + 60));
    P(fx, seaTop + 3, 26, 4, '#e8e4da'); P(fx + 2, seaTop + 7, 22, 2, '#a8322d'); P(fx + 6, seaTop, 12, 3, '#d8d4ca'); P(fx + 10, seaTop - 3, 3, 3, '#3a3430');
    for (let w = 0; w < 4; w++) P(fx + 8 + w * 3, seaTop + 4, 1, 1, '#3a5a6a');
    if (weather !== 'storm') {
      for (let g = 0; g < 3; g++) {
        const gx = (Math.floor(t / (60 + g * 25)) + g * 50) % (W + 20) - 10;
        const gy = 10 + g * 7 + Math.round(Math.sin(t / 500 + g) * 2);
        const flap = Math.floor(t / 200 + g) % 2;
        ctx.fillStyle = '#f2efe6';
        ctx.fillRect(gx, gy + flap, 2, 1); ctx.fillRect(gx + 2, gy + 1, 1, 1); ctx.fillRect(gx + 3, gy + flap, 2, 1);
      }
    }
    return seaTop + seaH;
  }

  function scene(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    const t = opts.t || 0;
    const weather = opts.weather || 'clear';
    const horizon = sky(ctx, W, H, weather, t);
    const quayTop = harbour(ctx, W, H, weather, t, horizon);
    const dimQ = weather === 'storm' || weather === 'dusk' ? 0.35 : 0;
    const Q = (x, y, w, h, c) => { ctx.fillStyle = dimQ ? mix(c, '#20242c', dimQ) : c; ctx.fillRect(x, y, w, h); };
    Q(0, quayTop, W, H - quayTop, '#9a948a');
    Q(0, quayTop, W, 1, '#c8c2b4');
    for (let x = 6; x < W; x += 22) { Q(x, quayTop + 3, 4, 4, '#3a3430'); Q(x, quayTop + 3, 4, 1, '#5a5048'); }
    for (let x = 0; x < W; x += 9) Q(x, quayTop + 9, 1, H - quayTop, '#8a8478');
    const people = opts.people || [];
    const bob = Math.floor(t / 700) % 2;
    people.forEach((pp) => {
      if (pp.kind === 'kid') kid(ctx, pp.x, H - 46 + bob, pp.kidInfo, pp.look, pp.dim);
      else bust(ctx, pp.x, H - 70 + (pp.main ? bob : 0) + (pp.dy || 0), pp.look, { t, dim: pp.dim });
    });
    const fr = '#2a2e30', fr2 = '#3a4044';
    ctx.fillStyle = fr; ctx.fillRect(0, 0, W, 3); ctx.fillRect(0, 0, 3, H); ctx.fillRect(W - 3, 0, 3, H);
    ctx.fillStyle = fr2; ctx.fillRect(3, 3, W - 6, 1); ctx.fillRect(3, 3, 1, H - 3); ctx.fillRect(W - 4, 3, 1, H - 3);
    ctx.fillStyle = 'rgba(220,235,240,0.08)';
    for (let i = 0; i < 3; i++) ctx.fillRect(10 + i * 4, 6 + i * 3, 30 - i * 6, 1);
    const cy = H - 14;
    ctx.fillStyle = '#5a4a38'; ctx.fillRect(0, cy, W, 14);
    ctx.fillStyle = '#7a6a52'; ctx.fillRect(0, cy, W, 2);
    ctx.fillStyle = '#3e3326'; ctx.fillRect(0, cy + 2, W, 1);
    ctx.fillStyle = '#e6dcc1'; ctx.fillRect(14, cy + 4, 14, 8); ctx.fillStyle = '#c8bca0'; ctx.fillRect(16, cy + 6, 10, 1); ctx.fillRect(16, cy + 8, 8, 1);
    ctx.fillStyle = '#a8322d'; ctx.fillRect(W - 26, cy + 5, 6, 6); ctx.fillStyle = '#6b2420'; ctx.fillRect(W - 25, cy + 3, 4, 2);
    if (weather === 'storm') {
      ctx.fillStyle = 'rgba(200,215,225,0.45)';
      for (let i = 0; i < 60; i++) {
        const rx = (i * 53 + Math.floor(t / 16) * 3) % (W + 20) - 10;
        const ry = (i * 31 + Math.floor(t / 16) * 5) % H;
        ctx.fillRect(rx, ry, 1, 3); ctx.fillRect(rx - 1, ry + 3, 1, 2);
      }
      if (Math.floor(t / 100) % 97 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, 0, W, H); }
    }
  }

  function photo(canvas, look, bg, opts) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bg || '#c9c2ae';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < canvas.height; y += 2) ctx.fillRect(0, y, canvas.width, 1);
    bust(ctx, Math.round((canvas.width - 48) / 2), canvas.height - 56, Object.assign({}, look, { expression: 'neutral', hat: look.hair === 'scarf' ? 'scarf' : (opts && opts.keepHat ? look.hat : 'none') }), {});
  }

  function title(canvas, t) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.imageSmoothingEnabled = false;
    const horizon = sky(ctx, W, H, 'dusk', t);
    const bottom = harbour(ctx, W, H, 'dusk', t, horizon);
    ctx.fillStyle = '#23252c'; ctx.fillRect(0, bottom, W, H - bottom);
    ctx.fillStyle = '#34363c';
    for (let x = 0; x < W; x += 12) ctx.fillRect(x, bottom + 2, 8, 2);
    const lx = W - 10, ly = horizon - 17;
    const ang = (t / 1400) % (Math.PI * 2);
    const vis = Math.cos(ang);
    if (vis > -0.2) {
      ctx.fillStyle = `rgba(255,224,138,${0.12 + 0.18 * Math.max(0, vis)})`;
      const len = Math.round(W * (0.3 + 0.7 * Math.abs(Math.sin(ang))));
      const dir = Math.sin(ang) > 0 ? -1 : 1;
      for (let i = 0; i < len; i++) {
        const spread = Math.floor(i / 9);
        ctx.fillRect(lx + dir * i, ly - spread, 1, 1 + spread * 2);
      }
    }
    for (let i = 0; i < 18; i++) {
      const sx = (i * 47) % W, sy = (i * 13) % (horizon - 20);
      if ((Math.floor(t / 600) + i) % 4) { ctx.fillStyle = '#e8e0c8'; ctx.fillRect(sx, sy, 1, 1); }
    }
    ctx.fillStyle = '#1a1c22';
    ctx.fillRect(Math.round(W * 0.12), bottom - 22, 22, 22);
    ctx.fillStyle = '#e8c06a'; ctx.fillRect(Math.round(W * 0.12) + 4, bottom - 17, 14, 7);
    ctx.fillStyle = '#a8322d'; ctx.fillRect(Math.round(W * 0.12) - 2, bottom - 24, 26, 3);
    ctx.fillStyle = '#e8e4da'; ctx.fillRect(Math.round(W * 0.12) + 8, bottom - 30, 1, 6);
    ctx.fillStyle = '#a8322d'; ctx.fillRect(Math.round(W * 0.12) + 9, bottom - 30, 5, 3);
  }

  return { scene, photo, bust, title, shade, mix };
})();

'use strict';

function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    shuffle: (arr) => {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    weighted: (obj) => {
      const entries = Object.entries(obj);
      const total = entries.reduce((s, [, w]) => s + w, 0);
      let x = next() * total;
      for (const [k, w] of entries) {
        x -= w;
        if (x <= 0) return k;
      }
      return entries[entries.length - 1][0];
    }
  };
  return r;
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const DAY_MS = 86400000;

function dayDate(day) {
  return new Date(Date.UTC(START_DATE.y, START_DATE.m - 1, START_DATE.d + day - 1));
}
function addDays(date, n) { return new Date(date.getTime() + n * DAY_MS); }
function fmtDate(date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getUTCFullYear()}`;
}
function longDate(date) {
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
function ordinalDate(date) {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

function femaleSurname(nat, s) {
  const g = COUNTRIES[nat].gendered;
  if (nat === 'GR') {
    if (s.endsWith('os')) return s.slice(0, -2) + 'ou';
    if (s.endsWith('is')) return s.slice(0, -1);
    if (s.endsWith('as')) return s.slice(0, -1);
    return s;
  }
  if (g === 'slavic') {
    if (/(ov|ev|in)$/.test(s)) return s + 'a';
    return s;
  }
  if (g === 'polish') {
    if (s.endsWith('ski')) return s.slice(0, -1) + 'a';
    if (s.endsWith('cki')) return s.slice(0, -1) + 'a';
    return s;
  }
  if (g === 'czech') {
    if (s.endsWith('ý')) return s.slice(0, -1) + 'á';
    if (s.endsWith('a')) return s.slice(0, -1) + 'ová';
    if (s.endsWith('ec')) return s.slice(0, -2) + 'cová';
    return s + 'ová';
  }
  return s;
}

function fillFormat(fmt, rng) {
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  return fmt.replace(/[#@]/g, (c) => (c === '#' ? String(rng.int(0, 9)) : L[rng.int(0, L.length - 1)]));
}
function breakFormat(fmt, rng) {
  const variants = [
    () => fillFormat(fmt.replace('#', ''), rng),
    () => fillFormat(fmt + '#', rng),
    () => fillFormat(fmt.replace(/#/, '@'), rng),
    () => fillFormat(fmt.replace(/-/, ''), rng) + (fmt.includes('-') ? '' : '-' + rng.int(1, 9))
  ];
  let out = rng.pick(variants)();
  if (out.replace(/\d/g, '#').replace(/[A-Z]/g, '@') === fmt.replace(/[A-Z]/g, '@')) out = fillFormat(fmt + '#', rng);
  return out;
}
function matchesFormat(no, fmt) {
  if (no.length !== fmt.length) return false;
  for (let i = 0; i < fmt.length; i++) {
    const f = fmt[i], c = no[i];
    if (f === '#' && !/\d/.test(c)) return false;
    if (f === '@' && !/[A-Z]/.test(c)) return false;
    if (f !== '#' && f !== '@' && f !== c) return false;
  }
  return true;
}

const SKIN_TONES = ['#f1d3b8', '#e6bc98', '#d6a37c', '#c08a5f', '#9c6a45', '#6f4a30'];
const HAIR_COLORS = { black: '#1d1a18', darkbrown: '#3b2a1e', brown: '#6a4a2c', auburn: '#7d3b22', blond: '#c7a25a', grey: '#9a9690', white: '#d8d5cf', red: '#a24a24' };
const EYE_COLORS = { brown: '#4a2e1a', blue: '#3c6ea6', green: '#4d7a45', grey: '#7c8488', hazel: '#7a5a2c' };
const CLOTH_COLORS = ['#3f4a5a', '#6b3a32', '#3d5a45', '#7a6a4a', '#5a4a6a', '#2f3a40', '#8a5a2a', '#4a6a7a', '#7a3a4a', '#9a8a6a', '#2d4f6b', '#5d6b3a'];
const CLOTH_NAMES = { '#3f4a5a': 'slate', '#6b3a32': 'oxblood', '#3d5a45': 'bottle-green', '#7a6a4a': 'khaki', '#5a4a6a': 'plum', '#2f3a40': 'charcoal', '#8a5a2a': 'rust', '#4a6a7a': 'denim-blue', '#7a3a4a': 'wine', '#9a8a6a': 'sand', '#2d4f6b': 'navy', '#5d6b3a': 'olive' };

const NAT_SKIN = {
  VA: [1, 2, 3], IT: [1, 2, 3], GR: [1, 2, 3], YU: [0, 1, 2], RO: [0, 1, 2], DE: [0, 1], GB: [0, 1], FR: [0, 1, 2, 4],
  BG: [0, 1, 2], HU: [0, 1], AT: [0, 1], TR: [2, 3], ES: [1, 2, 3], NL: [0, 1], DD: [0, 1], MT: [2, 3], PL: [0, 1],
  CS: [0, 1], TN: [3, 4], CY: [2, 3], SU: [0, 1, 2], SE: [0], US: [0, 1, 4, 5], LB: [2, 3], EG: [3, 4, 5]
};

function genLook(rng, sex, age, nat, over) {
  const skin = rng.pick(NAT_SKIN[nat] || [1, 2]);
  const fair = ['DE', 'GB', 'NL', 'SE', 'PL', 'CS', 'DD', 'AT', 'SU', 'HU', 'US'].includes(nat);
  let hairColor = fair ? rng.pick(['blond', 'brown', 'darkbrown', 'auburn', 'blond', 'red']) : rng.pick(['black', 'darkbrown', 'black', 'brown']);
  if (age > 58) hairColor = rng.pick(['grey', 'white', 'grey']);
  else if (age > 46 && rng.chance(0.4)) hairColor = 'grey';
  const hairM = ['short', 'short', 'slick', 'curly', 'balding', 'bald', 'long', 'parted'];
  const hairF = ['long', 'bob', 'bun', 'curly', 'ponytail', 'perm', 'long', 'bob'];
  let hair = sex === 'M' ? rng.pick(age > 50 ? ['balding', 'bald', 'short', 'parted', 'slick'] : hairM) : rng.pick(age > 60 ? ['bun', 'perm', 'scarf', 'bob'] : hairF);
  const facial = sex === 'M' ? rng.weighted({ none: 4, mustache: 2.5, beard: 1.2, stubble: 1.5, goatee: 0.5 }) : 'none';
  const eyesKey = fair ? rng.pick(['blue', 'grey', 'green', 'brown', 'blue', 'hazel']) : rng.pick(['brown', 'brown', 'hazel', 'green', 'brown']);
  const clothesM = ['suit', 'shirt', 'sweater', 'leather', 'tshirt', 'coat', 'tracksuit', 'shirt', 'floral'];
  const clothesF = ['dress', 'blouse', 'sweater', 'coat', 'blouse', 'dress', 'tshirt', 'floral'];
  const look = {
    sex, age, skin, hair, hairColor, facial, eyes: eyesKey,
    faceShape: rng.pick(['round', 'long', 'square', 'oval']),
    glasses: rng.chance(age > 45 ? 0.35 : 0.15) ? rng.pick(['round', 'square']) : (rng.chance(0.08) ? 'sun' : 'none'),
    clothes: sex === 'M' ? rng.pick(clothesM) : rng.pick(clothesF),
    clothesColor: rng.pick(CLOTH_COLORS),
    hat: rng.chance(0.12) ? rng.pick(sex === 'M' ? ['cap', 'fedora', 'flatcap'] : ['sunhat', 'scarf']) : 'none',
    earrings: sex === 'F' && rng.chance(0.5),
    scar: rng.chance(0.04),
    mole: rng.chance(0.15),
    expression: 'neutral'
  };
  if (look.hat === 'scarf') look.hair = 'scarf';
  return Object.assign(look, over || {});
}

function lookVariant(look, rng, kind) {
  const v = JSON.parse(JSON.stringify(look));
  if (kind === 'natural') {
    const opts = [];
    if (v.sex === 'M') opts.push(() => { v.facial = v.facial === 'none' ? rng.pick(['mustache', 'beard']) : 'none'; });
    opts.push(() => { v.hair = rng.pick(v.sex === 'M' ? ['short', 'long', 'curly', 'parted'] : ['long', 'bob', 'curly', 'perm']); });
    opts.push(() => { v.glasses = v.glasses === 'none' ? 'square' : 'none'; });
    opts.push(() => { v.hairColor = v.hairColor === 'grey' ? 'darkbrown' : v.hairColor; v.age = Math.max(18, v.age - 9); });
    rng.pick(opts)();
  } else {
    const opts = [
      () => { v.faceShape = rng.pick(['round', 'long', 'square', 'oval'].filter((s) => s !== look.faceShape)); },
      () => { v.eyes = rng.pick(Object.keys(EYE_COLORS).filter((e) => e !== look.eyes)); },
      () => { v.skin = look.skin >= 3 ? look.skin - 2 : look.skin + 2; }
    ];
    rng.pick(opts)();
    if (rng.chance(0.5)) v.hair = rng.pick(['short', 'long', 'curly', 'bob']);
    v.scar = false;
  }
  v.expression = 'neutral';
  v.hat = 'none';
  return v;
}

const ARCH_WEIGHTS = { beach: 16, history: 8, family: 7, relatives: 9, angler: 4, business: 8, returning: 9, departing: 7, leaving: 11, trucker: 6, student: 4, pilgrim: 3, musician: 3, conference: 3, worker: 4, fisher: 4, journalist: 3 };
const ARCH_MINDAY = { worker: 4, fisher: 4, journalist: 7, departing: 2 };

function natsFor(arch, rng) {
  const A = ARCHETYPES[arch];
  if (A.citizen) return 'VA';
  const all = Object.keys(COUNTRIES).filter((k) => k !== 'VA');
  if (arch === 'trucker') return rng.pick(['IT', 'GR', 'YU', 'BG', 'TR', 'DE', 'AT', 'HU', 'RO', 'NL', 'CS', 'PL']);
  if (arch === 'fisher') return rng.chance(0.55) ? 'VA' : rng.pick(['IT', 'GR', 'MT', 'TN', 'YU']);
  if (arch === 'pilgrim') return rng.pick(['IT', 'GR', 'MT', 'YU', 'PL', 'CY', 'ES', 'AT', 'LB']);
  if (arch === 'relatives') return rng.pick(['IT', 'GR', 'YU', 'US', 'DE', 'AT', 'TR', 'FR', 'GB', 'SE']);
  return rng.pick(all);
}

function buildRoster(seed, count, offset) {
  const rng = makeRng(seed + (offset || 0) * 7919);
  const out = [];
  const usedNames = new Set();
  const crimeKeys = Object.keys(CRIMES);
  const start = offset || 0;
  for (let i = 0; i < count; i++) {
    const roll = rng.next();
    let crime = null, paper = false;
    if (roll < 0.36) crime = rng.weighted({ cigarettes: 13, stolen: 9, forged: 15, cocaine: 10, heroin: 9, currency: 10, weapons: 8, fugitive: 8, spy: 8, trafficker: 6 });
    else if (roll < 0.49) paper = true;
    let arch;
    if (crime) arch = rng.pick(CRIMES[crime].covers);
    else arch = rng.weighted(ARCH_WEIGHTS);
    const A = ARCHETYPES[arch];
    let nat = natsFor(arch, rng);
    if (crime === 'fugitive') nat = rng.pick(['IT', 'GR', 'YU', 'AT', 'FR', 'DE']);
    if (crime && arch === 'returning') nat = 'VA';
    const sex = crime === 'trafficker' ? 'M' : (rng.chance(arch === 'trucker' || arch === 'fisher' || arch === 'worker' ? 0.08 : 0.5) ? 'F' : 'M');
    const C = COUNTRIES[crime === 'fugitive' ? 'VA' : nat];
    let first, last, tries = 0;
    do {
      first = rng.pick(sex === 'M' ? C.m : C.f);
      last = rng.pick(C.s);
      if (sex === 'F') last = femaleSurname(crime === 'fugitive' ? 'VA' : nat, last);
      tries++;
    } while (usedNames.has(first + last) && tries < 40);
    usedNames.add(first + last);
    let age = rng.int(A.ages[0], A.ages[1]);
    if (crime === 'trafficker') age = rng.int(30, 55);
    const company = rng.weighted(A.company);
    const pers = (() => {
      if (arch === 'family') return rng.pick(['anxious', 'anxious', 'tired', 'cheerful', 'polite']);
      if (age > 66) return rng.pick(['elderly', 'elderly', 'polite', 'gruff', 'chatty']);
      if (arch === 'business' || arch === 'conference') return rng.pick(['businesslike', 'businesslike', 'arrogant', 'polite', 'irritable']);
      if (arch === 'trucker' || arch === 'fisher') return rng.pick(['gruff', 'gruff', 'tired', 'cheerful', 'irritable']);
      if (crime === 'spy') return rng.pick(['charming', 'polite', 'cheerful', 'businesslike']);
      return rng.pick(PERSONALITY_KEYS.filter((k) => k !== 'anxious'));
    })();
    let oddity = null;
    if (!crime && rng.chance(0.42)) {
      const pool = ODDITIES.filter((o) => !o.archetypes || o.archetypes.includes(arch));
      oddity = rng.pick(pool).id;
    }
    const lookOver = {};
    const od = oddity && ODDITIES.find((o) => o.id === oddity);
    if (od && od.look) Object.assign(lookOver, od.look);
    if (arch === 'fisher') Object.assign(lookOver, { clothes: 'fisher', hat: rng.chance(0.5) ? 'flatcap' : 'none' });
    if (arch === 'trucker') lookOver.clothes = rng.pick(['tshirt', 'shirt', 'tracksuit']);
    if (arch === 'business' || arch === 'conference') lookOver.clothes = sex === 'M' ? 'suit' : rng.pick(['blouse', 'suit']);
    if (arch === 'pilgrim' && rng.chance(0.4)) lookOver.clothes = 'priest';
    if (arch === 'worker') lookOver.clothes = rng.pick(['overalls', 'tshirt', 'shirt']);
    const look = genLook(rng, sex, age, crime === 'fugitive' ? 'VA' : nat, lookOver);
    const minDay = Math.max(COUNTRIES[nat].minDay, crime ? CRIMES[crime].minDay : 1, ARCH_MINDAY[arch] || 1);
    const ctry = COUNTRIES[nat];
    const home = rng.pick(ctry.cities);
    const town = rng.pick(A.towns);
    const staysInTown = STAYS.filter((s) => s.town === town);
    const stay = staysInTown.length ? rng.pick(staysInTown) : rng.pick(STAYS);
    const dur = A.dur[1] ? rng.int(A.dur[0], A.dur[1]) : 0;
    let veh = null;
    if (rng.chance(A.vehicle) || (crime && CRIMES[crime].hides.some((h) => h.where === 'vehicle') && rng.chance(0.5))) {
      const kind = A.vehicleKind || (crime === 'trafficker' ? 'van' : (arch === 'family' && rng.chance(0.3) ? 'van' : 'car'));
      const model = kind === 'car' ? rng.pick(CARS[ctry.bloc === 'east' ? 'east' : 'west']) : rng.pick(CARS[kind]);
      veh = { kind, model, color: rng.pick(CAR_COLORS), plate: `${nat === 'VA' ? 'VA' : nat} ${rng.int(100, 999)}-${rng.int(10, 99)}` };
    }
    let hideIdx = null;
    if (crime) {
      const hides = CRIMES[crime].hides;
      let opts = hides.map((h, k) => k).filter((k) => hides[k].where !== 'vehicle' || veh);
      hideIdx = rng.pick(opts);
    }
    const kids = company === 'family' ? Array.from({ length: rng.int(1, 3) }, () => ({ name: rng.pick(KID_NAMES), age: rng.int(2, 13), sex: rng.chance(0.5) ? 'M' : 'F' })) : [];
    const spouseSex = sex === 'M' ? 'F' : 'M';
    const spouse = company === 'spouse' || company === 'family'
      ? { first: rng.pick(spouseSex === 'M' ? C.m : C.f), sex: spouseSex, look: genLook(rng, spouseSex, Math.max(18, age + rng.int(-6, 6)), crime === 'fugitive' ? 'VA' : nat) }
      : null;
    const friend = company === 'friend' ? { first: rng.pick(C.m.concat(C.f)) } : null;
    const relKey = rng.pick(['brother', 'sister', 'cousin', 'aunt', 'uncle', 'grandmother', 'daughter', 'son']);
    const relName = rng.pick(COUNTRIES.VA[['sister', 'aunt', 'grandmother', 'daughter'].includes(relKey) ? 'f' : 'm']) + ' ' + rng.pick(COUNTRIES.VA.s);
    const usdBase = arch === 'business' ? rng.int(400, 950) : rng.int(60, 800);
    const person = {
      pid: 'P' + String(start + i + 1).padStart(3, '0'),
      nat, sex, first, last, age, look, arch, personality: pers, crime, hideIdx, paper, oddity, minDay,
      occ: rng.pick(A.occ), home, town, stayName: stay.name, stayTown: stay.town, stayKind: stay.kind, dur,
      vehicle: veh, company, spouse, kids, friend, rel: relKey, relName,
      relAddr: `${rng.pick(STREETS)} ${rng.int(2, 88)}`,
      contact: rng.pick(CONTACTS), visits: rng.chance(0.5) ? 0 : rng.int(1, 6),
      usd: usdBase, height: sex === 'M' ? rng.int(164, 192) : rng.int(152, 178),
      birthMonth: rng.int(1, 12), birthDay: rng.int(1, 28),
      cargo: A.cargos ? rng.pick(A.cargos) : null,
      boat: rng.pick(BOAT_NAMES),
      abroad: rng.pick(['IT', 'GR', 'YU', 'AT', 'FR', 'DE', 'MT', 'TN']),
      bribe: crime && rng.chance(0.35) ? rng.int(3, 9) * 50 : (paper && rng.chance(0.3) ? rng.int(1, 3) * 50 : 0),
      seed: rng.int(1, 1e9)
    };
    person.abroadCity = rng.pick(COUNTRIES[person.abroad].cities);
    if (crime === 'fugitive') {
      person.vaName = { first: rng.pick(sex === 'M' ? COUNTRIES.VA.m : COUNTRIES.VA.f), last: rng.pick(COUNTRIES.VA.s) };
      const fc = COUNTRIES[nat];
      person.first = rng.pick(sex === 'M' ? fc.m : fc.f);
      person.last = rng.pick(fc.s);
      if (sex === 'F') person.last = femaleSurname(nat, person.last);
    }
    out.push(person);
  }
  return out;
}

const TONE_HELLO_CHANCE = 0.55;

function tpl(str, ctx) {
  return str.replace(/\{(\w+)\}/g, (m, k) => (ctx[k] !== undefined ? ctx[k] : m))
    .replace(/\[([^\]]+)\]/g, (m, body) => {
      const opts = body.split('|');
      return opts[Math.floor(Math.random() * opts.length)];
    });
}

const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
function durWords(n) {
  if (n === 7) return 'One week';
  if (n === 14) return 'Two weeks';
  if (n === 21) return 'Three weeks';
  if (n < NUM_WORDS.length) return NUM_WORDS[n][0].toUpperCase() + NUM_WORDS[n].slice(1) + ' days';
  if (n >= 28 && n <= 31) return 'A month';
  return `${n} days`;
}

function cashString(usd, nat) {
  const c = COUNTRIES[nat];
  const local = Math.round(usd / c.usdRate);
  const round = local > 10000 ? Math.round(local / 1000) * 1000 : local > 1000 ? Math.round(local / 100) * 100 : Math.round(local / 10) * 10;
  return `${round.toLocaleString('en-GB')} ${c.cur}`;
}

function requiredDocTypes(c, day, endless) {
  const d = endless ? 99 : day;
  const req = ['passport'];
  const citizen = c.nat === 'VA' && !c.fugitiveVa;
  if (citizen) req.push('idcard');
  if (!citizen && c.dir === 'in' && !c.diplomat) req.push('permit');
  if (!citizen && c.dir === 'out') req.push('permit');
  if (citizen && c.dir === 'out' && d >= 2) req.push('exitvisa');
  if (d >= 4 && c.arch === 'worker' && !citizen) req.push('workpermit');
  if (d >= 4 && c.arch === 'fisher') req.push('maritime');
  if (d >= 6 && VACCINE_NATS.includes(c.nat) && c.dir === 'in') req.push('vaccine');
  if (d >= 7 && c.arch === 'journalist') req.push('press');
  if (d >= 3 && c.declaredUsd > CASH_LIMIT_USD) req.push('currency');
  if (c.diplomat) req.push('diplomatic');
  return req;
}

function sealFor(nat) { return Object.assign({}, COUNTRIES[nat].seal); }
function wrongSeal(seal, rng) {
  const s = Object.assign({}, seal);
  if (rng.chance(0.5)) {
    s.color = rng.pick(Object.keys(SEAL_COLORS).filter((k) => k !== seal.color));
  } else {
    const glyphs = ['★', '✦', '✚', '✶', '❂', '✠', '◆', '♛', '✿', '♚', '☾', '❖', '❀', '☼'];
    s.glyph = rng.pick(glyphs.filter((g) => g !== seal.glyph));
  }
  return s;
}

const INNOCENT_DEFECTS = [
  { code: 'expired', day: 1, when: () => true },
  { code: 'nopermit', day: 1, when: (c) => c.nat !== 'VA' && c.dir === 'in' },
  { code: 'nameTypo', day: 1, when: (c) => c.nat !== 'VA' },
  { code: 'overstay', day: 1, when: (c) => c.nat !== 'VA' && c.dir === 'out' },
  { code: 'noid', day: 1, when: (c) => c.nat === 'VA' },
  { code: 'numberTypo', day: 2, when: (c) => c.nat !== 'VA' },
  { code: 'noexit', day: 2, when: (c) => c.nat === 'VA' && c.dir === 'out' },
  { code: 'permitExpired', day: 2, when: (c) => c.nat !== 'VA' && c.dir === 'in' },
  { code: 'nowork', day: 4, when: (c) => c.arch === 'worker' },
  { code: 'nomaritime', day: 4, when: (c) => c.arch === 'fisher' },
  { code: 'novaccine', day: 6, when: (c) => VACCINE_NATS.includes(c.nat) && c.dir === 'in' },
  { code: 'nopress', day: 7, when: (c) => c.arch === 'journalist' },
  { code: 'noendorse', day: 10, when: (c) => c.nat === 'VA' && c.dir === 'out' }
];
const FORGERY_DEFECTS = [
  { code: 'foreignCity', day: 1, weight: (d) => (d < 4 ? 3 : 0.5) },
  { code: 'wrongSeal', day: 2, weight: () => 2.5 },
  { code: 'wrongCity', day: 3, weight: (d) => (d >= 5 ? 3 : 1.5) },
  { code: 'photo', day: 3, weight: () => 2 },
  { code: 'dobMismatch', day: 3, weight: () => 2, when: (c) => c.nat === 'VA' && !c.fugitiveVa },
  { code: 'badFormat', day: 5, weight: () => 3 },
  { code: 'district', day: 8, weight: () => 3, when: (c) => c.nat === 'VA' && !c.fugitiveVa }
];

const DEFECT_NOTES = {
  expired: 'Passport expired',
  nopermit: 'No Entry Permit',
  nameTypo: 'Name on permit does not match passport',
  overstay: 'Entry Permit expired: traveller overstayed',
  noid: 'No National Identity Card',
  numberTypo: 'Passport number on permit does not match',
  numberMismatch: 'Passport number on permit does not match',
  noexit: 'No Exit Visa',
  permitExpired: 'Entry Permit not valid on today’s date',
  nowork: 'No Work Permit',
  nomaritime: 'No Maritime Licence',
  novaccine: 'No Vaccination Certificate',
  nopress: 'Journalist without Press Accreditation',
  noendorse: 'Exit Visa lacks Directorate endorsement',
  foreignCity: 'Issuing city belongs to another country',
  wrongSeal: 'Wrong passport seal',
  wrongCity: 'Passport issued in a city with no passport office',
  photo: 'Photograph does not match the holder',
  dobMismatch: 'Date of birth differs between passport and ID card',
  badFormat: 'Passport number in the wrong format',
  district: 'ID number letters do not match the district'
};

function pickDefect(list, c, day, rng, weighted) {
  const pool = list.filter((d) => d.day <= day && (!d.when || d.when(c)));
  if (!pool.length) return null;
  if (!weighted) return rng.pick(pool).code;
  const w = {};
  pool.forEach((d) => { w[d.code] = d.weight(day); });
  return rng.weighted(w);
}

function instantiate(p, state, overrides) {
  const day = state.endless ? 10 : state.day;
  const rng = makeRng(hashStr(p.pid + ':' + state.day + ':' + (state.seed || 1)));
  const today = dayDate(state.day);
  const A = ARCHETYPES[p.arch];
  const crime = p.crime ? CRIMES[p.crime] : null;
  const odd = p.oddity ? ODDITIES.find((o) => o.id === p.oddity) : null;
  const c = {
    pid: p.pid, story: null, nat: p.nat, sex: p.sex, first: p.first, last: p.last, age: p.age,
    look: JSON.parse(JSON.stringify(p.look)), arch: p.arch, dir: A.dir, purpose: A.purpose,
    personality: p.personality, occ: p.occ, crime: p.crime, guilty: !!p.crime,
    home: p.home, town: p.town, stay: p.stayName, stayTown: p.stayTown, stayKind: p.stayKind, dur: p.dur,
    vehicle: p.vehicle ? Object.assign({}, p.vehicle) : null, company: p.company, spouse: p.spouse, kids: p.kids, friend: p.friend,
    rel: p.rel, relName: p.relName, relAddr: p.relAddr, contact: p.contact, visits: p.visits, height: p.height,
    cargo: p.cargo, boat: p.boat, abroad: p.abroad, abroadCity: p.abroadCity,
    usd: p.usd, declaredUsd: 0, defects: [], clues: [], lies: {}, items: [], docs: [],
    hiddenBody: null, hiddenVehicle: null, appearanceExtra: [], irritation: 0, asked: {}, flags: [],
    bribe: p.bribe, oddity: p.oddity, fugitiveVa: p.crime === 'fugitive' ? p.vaName : null,
    wanted: null, diplomat: false, extraQuestions: [], storyHooks: null, photoLook: null,
    minutes: 0, log: []
  };
  if (c.arch === 'fisher' && rng.chance(0.4)) c.dir = 'out';
  if (c.arch === 'trucker' && rng.chance(0.3)) c.dir = 'out';
  if (c.arch === 'family' && c.nat === 'VA') c.dir = 'in';

  const dob = new Date(Date.UTC(today.getUTCFullYear() - p.age - (p.birthMonth > today.getUTCMonth() + 1 ? 1 : 0), p.birthMonth - 1, p.birthDay));
  c.dob = dob;
  c.passportNo = fillFormat(COUNTRIES[c.nat].fmt, rng);
  const ctry = COUNTRIES[c.nat];
  c.issuedIn = rng.pick(ctry.issuing);
  c.birthPlace = c.fugitiveVa ? rng.pick(ctry.cities) : c.home;
  c.passExpiry = addDays(today, rng.int(60, 3200));
  c.passSeal = sealFor(c.nat);
  if (c.nat === 'VA') {
    const dk = rng.pick(Object.keys(DISTRICTS));
    c.district = dk;
    c.idNo = `${dk}-${rng.int(100000, 999999)}`;
    c.idExpiry = addDays(today, rng.int(90, 2500));
    if (A.citizen) c.town = DISTRICTS[dk];
  }
  c.entryFrom = c.dir === 'in' ? addDays(today, -rng.int(0, 12)) : addDays(today, -c.dur);
  c.entryUntil = c.dir === 'in' ? addDays(today, c.dur + rng.int(1, 10)) : addDays(today, rng.int(0, 6));
  c.permitPurpose = c.purpose;

  if (odd && odd.cashDeclared && day >= 3) {
    c.usd = odd.cashDeclared + rng.int(0, 500);
    c.declaredUsd = c.usd;
  }

  if (p.paper) {
    const code = pickDefect(INNOCENT_DEFECTS, c, day, rng, false);
    if (code) applyDefect(c, code, rng, today, false);
  }
  if (crime && crime.forged) {
    const n = day >= 7 && rng.chance(0.3) ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const code = pickDefect(FORGERY_DEFECTS.filter((f) => !c.defects.some((d) => d.code === f.code)), c, day, rng, true);
      if (code) applyDefect(c, code, rng, today, true);
    }
  }

  buildItems(c, p, rng, day);

  if (crime) {
    const h = crime.hides[p.hideIdx] || crime.hides[0];
    if (h.where === 'luggage') {
      c.items.splice(rng.int(0, c.items.length), 0, mkItem(rng.pick(luggageContainers(c)), h.item[0], h.item[1], h.item[2], h.item[3], true));
      c.clues.push(`Luggage: ${h.item[0].toLowerCase()} — ${h.item[2].toLowerCase()}`);
    } else if (h.where === 'vehicle' && c.vehicle) {
      c.hiddenVehicle = h.reveal;
      c.vehicle.tell = h.vtell;
      c.clues.push(`Vehicle: ${h.vtell.toLowerCase()}`);
    } else if (h.where === 'clothing' || h.where === 'body') {
      c.hiddenBody = h.reveal;
      c.appearanceExtra.push(h.atell);
      c.clues.push(`Appearance: ${h.atell.toLowerCase()}`);
    }
    c.crimeText = h.reveal || (h.item && h.item[3]) || crime.label;
    if (crime.trafficking) c.passengers = rng.int(2, 3);
    assignLies(c, rng, day);
    if (c.crime === 'currency') {
      c.hiddenUsd = rng.int(6, 15) * 1000;
    }
  }
  if (crime && crime.trafficking) {
    c.appearanceExtra.push(`${NUM_WORDS[c.passengers][0].toUpperCase() + NUM_WORDS[c.passengers].slice(1)} young women wait in the van. They do not look up. None of them holds a passport.`);
    c.clues.push('Passengers hold no documents of their own; driver speaks for them');
  }
  if (c.fugitiveVa) c.clues.push('Speaks with a Vardonian accent despite a foreign passport');

  if (!crime && rng.chance(0.28)) {
    c.photoLook = lookVariant(c.look, rng, 'natural');
    c.photoNatural = true;
  }

  if (state.bulletin && state.bulletin.some((b) => b.pid === p.pid)) {
    c.wanted = state.bulletin.find((b) => b.pid === p.pid);
    c.guilty = true;
    c.clues.push(`Matches the wanted bulletin (${c.wanted.alias})`);
  }

  buildDocs(c, rng, today, day, state);

  const ctx = ctxFor(c, today);
  c.ctx = ctx;
  c.greet = makeGreeting(c, rng, state);
  c.appearance = appearanceText(c, odd);
  c.demeanour = baseDemeanour(c, rng, odd);
  c.look.expression = demeanourFace(c);
  c.expected = c.guilty ? 'detain' : (c.defects.length ? 'deny' : 'approve');
  if (overrides) Object.assign(c, overrides);
  return c;
}

function applyDefect(c, code, rng, today, forged) {
  const add = (doc, field, explain) => c.defects.push({ code, doc, field, note: DEFECT_NOTES[code], explain, forged });
  switch (code) {
    case 'expired':
      c.passExpiry = addDays(today, -rng.int(2, 300));
      add('passport', 'expiry', 'expired'); break;
    case 'nopermit': c.missing = (c.missing || []).concat('permit'); add('permit', null, 'missing'); break;
    case 'noid': c.missing = (c.missing || []).concat('idcard'); add('idcard', null, 'missing'); break;
    case 'noexit': c.missing = (c.missing || []).concat('exitvisa'); add('exitvisa', null, 'missing'); break;
    case 'nowork': c.missing = (c.missing || []).concat('workpermit'); add('workpermit', null, 'missing'); break;
    case 'nomaritime': c.missing = (c.missing || []).concat('maritime'); add('maritime', null, 'missing'); break;
    case 'novaccine': c.missing = (c.missing || []).concat('vaccine'); add('vaccine', null, 'vaccine'); break;
    case 'nopress': c.missing = (c.missing || []).concat('press'); add('press', null, 'missing'); break;
    case 'noendorse': c.noEndorse = true; add('exitvisa', 'endorse', 'missing'); break;
    case 'nameTypo': {
      const n = c.first;
      const i = rng.int(1, Math.max(1, n.length - 2));
      const vowels = 'aeiou';
      const ch = n[i];
      const rep = vowels.includes(ch) ? rng.pick(vowels.replace(ch, '').split('')) : (ch === ch.toUpperCase() ? ch : rng.pick(['n', 'r', 'l', 't']));
      c.permitFirst = n.slice(0, i) + rep + n.slice(i + 1);
      if (c.permitFirst === n) c.permitFirst = n + 'a';
      add('permit', 'name', 'name'); break;
    }
    case 'numberTypo':
    case 'numberMismatch': {
      const no = c.passportNo;
      const idx = [...no].findIndex((ch, k) => k > 1 && /\d/.test(ch));
      const j = idx >= 0 ? idx : no.length - 1;
      const d = /\d/.test(no[j]) ? String((+no[j] + rng.int(1, 8)) % 10) : 'X';
      c.permitNo = no.slice(0, j) + d + no.slice(j + 1);
      add('permit', 'passno', 'number'); break;
    }
    case 'overstay': c.entryUntil = addDays(today, -rng.int(1, 6)); add('permit', 'until', 'overstay'); break;
    case 'permitExpired': c.entryUntil = addDays(today, -rng.int(1, 20)); c.entryFrom = addDays(c.entryUntil, -30); add('permit', 'until', 'expired'); break;
    case 'foreignCity': {
      const other = rng.pick(Object.keys(COUNTRIES).filter((k) => k !== c.nat && k !== 'VA'));
      c.issuedIn = rng.pick(COUNTRIES[other].issuing);
      add('passport', 'issued', 'generic'); break;
    }
    case 'wrongCity': {
      const opts = COUNTRIES[c.nat].cities.filter((x) => !COUNTRIES[c.nat].issuing.includes(x));
      c.issuedIn = opts.length ? rng.pick(opts) : 'Capital';
      add('passport', 'issued', 'generic'); break;
    }
    case 'wrongSeal': c.passSeal = wrongSeal(c.passSeal, rng); add('passport', 'seal', 'generic'); break;
    case 'photo': c.photoLook = lookVariant(c.look, rng, 'forged'); c.photoForged = true; add('passport', 'photo', 'generic'); break;
    case 'dobMismatch': c.idDob = addDays(c.dob, rng.pick([-365, 365, -730, 31, -31])); add('idcard', 'dob', 'generic'); break;
    case 'badFormat': c.passportNo = breakFormat(COUNTRIES[c.nat].fmt, rng); add('passport', 'passno', 'generic'); break;
    case 'district': {
      const other = rng.pick(Object.keys(DISTRICTS).filter((k) => k !== c.district));
      c.idNo = `${other}-${c.idNo.split('-')[1]}`;
      add('idcard', 'idno', 'generic'); break;
    }
    default: break;
  }
}

function mkItem(container, name, desc, tell, probe, contraband) {
  return { id: 'i' + Math.random().toString(36).slice(2, 8), container, name, desc, tell: tell || null, probe: probe || null, contraband: !!contraband, examined: false, probed: false };
}

function luggageContainers(c) {
  const base = c.arch === 'trucker' ? ['Lorry cab'] : c.arch === 'business' || c.arch === 'conference' ? ['Leather suitcase', 'Briefcase'] : c.arch === 'fisher' || c.arch === 'angler' ? ['Canvas kitbag', 'Cool box'] : c.arch === 'family' ? ['Family suitcase', 'Car boot'] : ['Suitcase', 'Shoulder bag'];
  return base;
}

function buildItems(c, p, rng, day) {
  const A = ARCHETYPES[c.arch];
  const conts = luggageContainers(c);
  const tags = rng.shuffle(A.items).slice(0, rng.int(3, 5));
  const seen = new Set();
  tags.forEach((t) => {
    const lib = ITEM_LIB[t];
    if (!lib) return;
    const it = rng.pick(lib);
    if (seen.has(it[0])) return;
    seen.add(it[0]);
    c.items.push(mkItem(rng.pick(conts), it[0], it[1]));
  });
  const odd = p.oddity && ODDITIES.find((o) => o.id === p.oddity);
  if (odd && odd.item && (!odd.minDay || day >= odd.minDay)) {
    c.items.push(mkItem(rng.pick(conts), odd.item[0], odd.item[1], odd.item[2], odd.item[3], false));
  }
  if (c.vehicle) {
    c.items.push({ id: 'veh', container: 'Vehicle', name: `${c.vehicle.model}, ${c.vehicle.color}`, desc: `Plate ${c.vehicle.plate}. ${c.vehicle.kind === 'truck' ? 'Trailer sealed with customs wire.' : 'Dusty from the road.'}`, tell: null, probe: null, vehicle: true, examined: false, probed: false });
  }
}

function assignLies(c, rng, day) {
  const opts = [];
  if (c.dir === 'in' && c.nat !== 'VA' && !c.missing) opts.push('stay', 'dur');
  opts.push('visits', 'occupation');
  if (c.company === 'solo' && !c.passengers) opts.push('alone');
  if (c.dir === 'in' && c.nat !== 'VA') opts.push('purpose');
  const n = c.crime === 'spy' ? 1 : rng.pick([0, 1, 1, 2]);
  const chosen = rng.shuffle(opts).slice(0, n);
  chosen.forEach((k) => {
    if (k === 'stay') {
      const alt = rng.pick(STAYS.filter((s) => s.name !== c.stay));
      c.lies.stay = alt;
      c.clues.push(`Said they were staying at ${alt.name}; permit lists ${c.stay}`);
    } else if (k === 'dur') {
      const alt = c.dur + rng.pick([-3, 4, 7, 9]);
      c.lies.dur = Math.max(2, alt === c.dur ? c.dur + 5 : alt);
      c.clues.push(`Claimed a stay of ${c.lies.dur} days; permit says ${c.dur}`);
    } else if (k === 'visits') {
      if (c.visits === 0) c.visits = rng.int(3, 9);
      c.lies.visits = 0;
      c.clues.push(`Claimed a first visit; passport shows ${c.visits} prior entries`);
    } else if (k === 'occupation') {
      const alt = rng.pick(Object.keys(OCCUPATIONS).filter((o) => o !== c.occ && o !== 'unemployed'));
      c.lies.occ = alt;
      c.clues.push(`Claimed to be a ${OCCUPATIONS[alt].label.toLowerCase()}; passport says ${OCCUPATIONS[c.occ].label.toLowerCase()}`);
    } else if (k === 'alone') {
      c.lies.alone = true;
      c.ticketPax = 2;
      c.clues.push('Claimed to travel alone; ferry ticket is for two passengers');
    } else if (k === 'purpose') {
      const other = rng.pick(['beach', 'history', 'business', 'relatives'].filter((a) => a !== c.arch));
      c.lies.purpose = other;
      c.clues.push(`Gave a purpose (${ARCHETYPES[other].purpose.toLowerCase()}) that differs from the permit (${c.purpose.toLowerCase()})`);
    }
  });
}

function buildDocs(c, rng, today, day, state) {
  const full = (f, l) => `${l.toUpperCase()}, ${f}`;
  const docs = [];
  const missing = c.missing || [];
  const lookPhoto = c.photoLook || c.look;
  docs.push({
    type: 'passport', title: 'Passport', authority: COUNTRIES[c.nat].name.toUpperCase(), seal: c.passSeal, photo: lookPhoto,
    fields: [
      { k: 'name', label: 'Name', v: full(c.first, c.last) },
      { k: 'nat', label: 'Nationality', v: COUNTRIES[c.nat].adj },
      { k: 'dob', label: 'Date of birth', v: fmtDate(c.dob) },
      { k: 'sex', label: 'Sex', v: c.sex },
      { k: 'pob', label: 'Place of birth', v: c.birthPlace },
      { k: 'height', label: 'Height', v: `${c.height} cm` },
      { k: 'eyes', label: 'Eyes', v: c.photoForged && c.photoLook.eyes !== c.look.eyes ? c.photoLook.eyes : c.look.eyes },
      { k: 'occ', label: 'Occupation', v: OCCUPATIONS[c.occ].label },
      { k: 'passno', label: 'Passport no.', v: c.passportNo },
      { k: 'issued', label: 'Issued in', v: c.issuedIn },
      { k: 'expiry', label: 'Expires', v: fmtDate(c.passExpiry) },
      { k: 'stamps', label: 'Prior Vardonian entries', v: c.nat === 'VA' ? '—' : String(c.visits) }
    ]
  });
  if (c.nat === 'VA' && !missing.includes('idcard')) {
    docs.push({
      type: 'idcard', title: 'National Identity Card', authority: 'REPUBLIC OF VARDONIA', seal: VA_SEALS.interior, photo: c.look,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'dob', label: 'Date of birth', v: fmtDate(c.idDob || c.dob) },
        { k: 'idno', label: 'ID no.', v: c.idNo },
        { k: 'district', label: 'District', v: DISTRICTS[c.district] },
        { k: 'height', label: 'Height', v: `${c.height} cm` },
        { k: 'expiry', label: 'Valid until', v: fmtDate(c.idExpiry) }
      ]
    });
  }
  const needPermit = c.nat !== 'VA' && !c.diplomat;
  if (needPermit && !missing.includes('permit')) {
    docs.push({
      type: 'permit', title: 'Entry Permit', authority: 'MINISTRY OF INTERIOR · R.S. VARDONIA', seal: VA_SEALS.interior,
      fields: [
        { k: 'name', label: 'Name', v: full(c.permitFirst || c.first, c.last) },
        { k: 'passno', label: 'Passport no.', v: c.permitNo || c.passportNo },
        { k: 'nat', label: 'Nationality', v: COUNTRIES[c.nat].adj },
        { k: 'purpose', label: 'Purpose', v: c.permitPurpose },
        { k: 'address', label: 'Address in Vardonia', v: c.arch === 'trucker' ? `Consignee: State Trading Ent., ${c.town}` : c.arch === 'relatives' ? `c/o ${c.relName}, ${c.relAddr}, ${c.town}` : c.arch === 'fisher' ? `Cooperative pier, ${c.town}` : `${c.stay}, ${c.stayTown}` },
        { k: 'duration', label: 'Duration of stay', v: `${c.dur} days` },
        { k: 'from', label: 'Valid from', v: fmtDate(c.entryFrom) },
        { k: 'until', label: 'Valid until', v: fmtDate(c.entryUntil) }
      ]
    });
  }
  if (c.nat === 'VA' && c.dir === 'out' && day >= 2 && !missing.includes('exitvisa')) {
    const f = [
      { k: 'name', label: 'Name', v: full(c.first, c.last) },
      { k: 'idno', label: 'ID no.', v: c.idNo },
      { k: 'dest', label: 'Destination', v: `${c.abroadCity}, ${COUNTRIES[c.abroad].name}` },
      { k: 'purpose', label: 'Purpose', v: c.purpose },
      { k: 'until', label: 'Valid until', v: fmtDate(addDays(today, rng.int(3, 30))) }
    ];
    if (day >= 10) f.push({ k: 'endorse', label: 'Directorate endorsement', v: c.noEndorse ? '— none —' : '◉ DSS/' + rng.int(1000, 9999) });
    docs.push({ type: 'exitvisa', title: 'Exit Visa', authority: 'MINISTRY OF INTERIOR · R.S. VARDONIA', seal: VA_SEALS.interior, fields: f });
  }
  if (c.arch === 'worker' && day >= 4 && !missing.includes('workpermit')) {
    docs.push({
      type: 'workpermit', title: 'Work Permit', authority: 'MINISTRY OF LABOUR', seal: VA_SEALS.labour,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'employer', label: 'Employer', v: c.town === 'Tarsa' ? 'Tarsa State Shipyard' : `People’s Machine Works, ${c.town}` },
        { k: 'trade', label: 'Trade', v: OCCUPATIONS[c.occ].label },
        { k: 'until', label: 'Valid until', v: fmtDate(addDays(today, c.dur + 10)) }
      ]
    });
  }
  if (c.arch === 'fisher' && day >= 4 && !missing.includes('maritime')) {
    docs.push({
      type: 'maritime', title: 'Maritime Licence', authority: 'HARBOUR AUTHORITY OF SAN AURELIO', seal: VA_SEALS.harbour,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'vessel', label: 'Vessel', v: c.boat },
        { k: 'licno', label: 'Licence no.', v: `ML-${rng.int(1000, 9999)}` },
        { k: 'until', label: 'Valid until', v: fmtDate(addDays(today, rng.int(20, 300))) }
      ]
    });
  }
  if (VACCINE_NATS.includes(c.nat) && c.dir === 'in' && day >= 6 && !missing.includes('vaccine')) {
    docs.push({
      type: 'vaccine', title: 'Vaccination Certificate', authority: 'INTERNATIONAL HEALTH CERTIFICATE', seal: VA_SEALS.health,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'vaccine', label: 'Vaccine', v: 'Cholera' },
        { k: 'date', label: 'Administered', v: fmtDate(addDays(today, -rng.int(10, 170))) }
      ]
    });
  }
  if (c.arch === 'journalist' && day >= 7 && !missing.includes('press')) {
    docs.push({
      type: 'press', title: 'Press Accreditation', authority: 'MINISTRY OF INFORMATION', seal: VA_SEALS.information,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'outlet', label: 'Publication', v: `${rng.pick(['Daily', 'Evening', 'Morning'])} ${rng.pick(['Courier', 'Herald', 'Gazette', 'Post'])}, ${c.home}` },
        { k: 'until', label: 'Valid until', v: fmtDate(addDays(today, c.dur + 2)) }
      ]
    });
  }
  if (c.declaredUsd > CASH_LIMIT_USD && day >= 3) {
    docs.push({
      type: 'currency', title: 'Currency Declaration', authority: 'STATE CUSTOMS', seal: VA_SEALS.customs,
      fields: [
        { k: 'name', label: 'Name', v: full(c.first, c.last) },
        { k: 'amount', label: 'Amount', v: cashString(c.declaredUsd, c.nat) },
        { k: 'usd', label: 'USD value', v: `${c.declaredUsd.toLocaleString('en-GB')} USD` }
      ]
    });
  }
  if (!c.vehicle || c.vehicle.kind === 'car' || c.vehicle.kind === 'van') {
    const pax = c.ticketPax || (1 + (c.spouse ? 1 : 0) + (c.kids ? c.kids.length : 0) + (c.friend ? 1 : 0) + (c.passengers || 0));
    const port = c.dir === 'in' ? rng.pick(['Bari', 'Brindisi', 'Patras', 'Ancona', 'Valletta', 'Tunis', 'Split']) : rng.pick(['Bari', 'Brindisi', 'Patras', 'Ancona', 'Valletta']);
    docs.push({
      type: 'ticket', title: 'Ferry Ticket', authority: 'VARDOLINE STATE FERRIES', seal: null,
      fields: [
        { k: 'route', label: 'Route', v: c.dir === 'in' ? `${port} → San Aurelio` : `San Aurelio → ${port}` },
        { k: 'date', label: 'Date', v: fmtDate(today) },
        { k: 'pax', label: 'Passengers', v: String(pax) },
        { k: 'veh', label: 'Vehicle', v: c.vehicle ? c.vehicle.plate : 'none' }
      ]
    });
  }
  if (c.vehicle && c.vehicle.kind === 'truck') {
    docs.push({
      type: 'manifest', title: 'Cargo Manifest', authority: 'TIR CARNET', seal: null,
      fields: [
        { k: 'driver', label: 'Driver', v: full(c.first, c.last) },
        { k: 'cargo', label: 'Cargo', v: c.cargo },
        { k: 'weight', label: 'Weight', v: `${rng.int(6, 19)} t` },
        { k: 'dest', label: 'Consignee', v: `State Trading Enterprise, ${c.town}` }
      ]
    });
  }
  c.docs = docs;
}

function ctxFor(c, today) {
  const C = COUNTRIES[c.nat];
  const spouseWord = c.spouse ? (c.spouse.sex === 'F' ? 'wife' : 'husband') : 'partner';
  const companionClause = c.spouse ? `My ${spouseWord} and I are` : c.friend ? `My friend ${c.friend.first} and I are` : 'I am';
  return {
    first: c.first, last: c.last, hello: C.hello, thanks: C.thanks, stay: c.stay, town: c.stayTown || c.town,
    dur: c.dur, durWords: durWords(c.dur), endDate: ordinalDate(addDays(today, c.dur)), retDate: ordinalDate(addDays(today, c.dur)),
    home: c.home, country: C.name, lang: C.lang, rel: c.rel, relName: c.relName, relAddr: `${c.relAddr}, ${c.town}`,
    relPron: ['sister', 'aunt', 'grandmother', 'daughter'].includes(c.rel) ? 'her' : 'him',
    spouse: spouseWord, spouseName: c.spouse ? c.spouse.first : '', friendName: c.friend ? c.friend.first : '',
    kidsN: c.kids ? NUM_WORDS[c.kids.length] : 'no', kidName: c.kids && c.kids[0] ? c.kids[0].name : 'Luka',
    selfRole: c.sex === 'M' ? 'father' : 'mother', companionClause, ageRound: Math.ceil((c.age + 1) / 10) * 10,
    cargo: c.cargo || 'general goods', carColor: c.vehicle ? c.vehicle.color : 'red', contact: c.contact,
    abroad: COUNTRIES[c.abroad] ? COUNTRIES[c.abroad].name : 'Italy', abroadCity: c.abroadCity, boat: c.boat, occ: OCCUPATIONS[c.occ].label.toLowerCase(),
    visits: c.visits
  };
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

function makeGreeting(c, rng, state) {
  const A = ARCHETYPES[c.arch];
  const used = state.usedGreet || (state.usedGreet = {});
  let pool = A.greet.map((g, i) => ({ g, key: c.arch + i })).filter((x) => !used[x.key]);
  if (!pool.length) {
    A.greet.forEach((g, i) => { delete used[c.arch + i]; });
    pool = A.greet.map((g, i) => ({ g, key: c.arch + i }));
  }
  const pickG = rng.pick(pool);
  used[pickG.key] = 1;
  let line = tpl(pickG.g, c.ctx);
  const P = PERSONALITIES[c.personality];
  if (c.personality === 'chatty') line += ' ' + rng.pick(P.close).trim();
  if (c.personality === 'irritable' && rng.chance(0.5)) line = rng.pick(['Finally. ', 'Forty minutes in that queue. ']) + line;
  if (c.personality === 'arrogant' && rng.chance(0.5)) line += ' I trust this will be quick.';
  if (c.personality === 'nervous' && rng.chance(0.6)) line = 'Oh— hello. ' + line;
  if (c.lies.purpose) line = tpl(rng.pick(ARCHETYPES[c.lies.purpose].greet), c.ctx);
  if (c.fugitiveVa && rng.chance(0.5)) line = line.replace(c.ctx.hello, `${c.ctx.hello}... bonod— ${c.ctx.hello}`);
  if (c.passengers) line += ` These are my employees. Hotel staff, for the summer season.`;
  return [line];
}

function appearanceText(c, odd) {
  const L = c.look;
  const decade = c.age < 25 ? 'early twenties' : c.age < 30 ? 'late twenties' : `${Math.floor(c.age / 10) * 10}s`;
  const who = c.sex === 'M' ? 'Man' : 'Woman';
  const clothesName = CLOTH_NAMES[L.clothesColor] || 'dark';
  const clothes = {
    suit: `${cap(clothesName)} suit, tie loosened`, shirt: `Short-sleeved ${clothesName} shirt`, sweater: `${cap(clothesName)} wool sweater`,
    leather: 'Worn leather jacket', tshirt: `Faded ${clothesName} T-shirt`, coat: `Long ${clothesName} coat`, tracksuit: `${cap(clothesName)} nylon tracksuit`,
    floral: 'Loud floral holiday shirt', dress: `${cap(clothesName)} summer dress`, blouse: `${cap(clothesName)} blouse`,
    fisher: 'Cable-knit fisherman’s sweater, salt-stained', priest: 'Black cassock and white collar', overalls: 'Blue work overalls',
    uniform: 'Pressed military uniform', military: 'Pressed military uniform'
  }[L.clothes] || 'Plain clothes';
  const bits = [`${who} in ${c.sex === 'M' ? 'his' : 'her'} ${decade}.`, clothes + '.'];
  if (L.glasses === 'sun') bits.push('Sunglasses, not removed.');
  if (L.scar) bits.push('Scar across one cheek.');
  if (odd && odd.appearance) bits.push(odd.appearance);
  c.appearanceExtra.forEach((x) => bits.push(x));
  if (c.spouse) bits.push(`With ${c.spouse.sex === 'F' ? 'his wife' : 'her husband'}, ${c.spouse.first}.`);
  if (c.kids && c.kids.length) bits.push(`${cap(NUM_WORDS[c.kids.length])} child${c.kids.length > 1 ? 'ren' : ''}: ${c.kids.map((k) => `${k.name} (${k.age})`).join(', ')}.`);
  if (c.friend) bits.push(`Travelling companion ${c.friend.first} waits in the next queue.`);
  if (c.vehicle) bits.push(`Arrived in a ${c.vehicle.color} ${c.vehicle.model}.`);
  else bits.push('Foot passenger off the ferry.');
  return bits.join(' ');
}

const DEMEANOURS = { calm: 'Calm', uneasy: 'Uneasy', nervous: 'Nervous', hostile: 'Agitated', upset: 'Distressed' };

function baseDemeanour(c, rng, odd) {
  let d = PERSONALITIES[c.personality].base;
  if (c.guilty && c.crime && rng.chance(CRIMES[c.crime].nerv)) d = rng.chance(0.5) ? 'nervous' : 'uneasy';
  if (odd && odd.nervous) d = 'nervous';
  if (odd && odd.look && odd.look.expression === 'sad') d = 'upset';
  if (c.crime === 'cocaine' && c.hiddenBody) d = 'nervous';
  return d;
}

function demeanourFace(c) {
  const d = c.demeanour;
  if (d === 'nervous') return 'nervous';
  if (d === 'hostile') return 'angry';
  if (d === 'upset') return 'sad';
  if (d === 'uneasy') return c.personality === 'tired' || c.personality === 'anxious' ? 'tired' : 'neutral';
  return PERSONALITIES[c.personality].face;
}

const LOWERABLE = new Set(['The', 'My', 'We', 'A', 'An', 'It', 'Our', 'Nothing', 'No', 'Yes', 'Just', 'Only', 'With', 'About', 'Around', 'Until', 'At', 'Not', 'Never', 'Nobody', 'Some', 'To', 'Two', 'Three', 'One', 'Myself', 'Me', 'Back', 'Home', 'Holiday', 'Family', 'Business', 'Delivery', 'Freight', 'Fishing', 'Zero', 'Swimming', 'Sun', 'Going', 'Leaving', 'Selling', 'Bringing', 'Landing', 'Contract', 'Work', 'Technical', 'Summer', 'Language', 'Research', 'Approved', 'Visiting', 'Am', 'Nervous', 'Everybody', 'Because', 'That', 'This', 'There', 'Of', 'Nowhere', 'Alone', 'Sorry', 'Twice', 'Once', 'Old', 'History', 'Sun,', 'Export', 'Enough', 'Everyone']);

function wrapTone(c, text, rng) {
  const P = PERSONALITIES[c.personality];
  let out = text;
  if (rng.chance(0.45)) {
    const open = rng.pick(P.open);
    const firstWord = out.split(/[\s,.!?]/)[0];
    const soft = open.trim().endsWith(',') && LOWERABLE.has(firstWord);
    out = open + (soft ? out[0].toLowerCase() + out.slice(1) : out);
  }
  if (rng.chance(0.3)) out += rng.pick(P.close);
  if (rng.chance(0.14)) out = rng.pick(COUNTRIES[c.nat].interj) + '. ' + out;
  if (c.irritation >= 4) out = rng.pick(P.angry) + ' ' + out;
  return out.replace(/\s+/g, ' ').trim();
}

function answerQuestion(c, qid, state) {
  const rng = makeRng(hashStr(c.pid + qid + (c.asked[qid] || 0) + state.day));
  const again = c.asked[qid] || 0;
  c.asked[qid] = again + 1;
  const P = PERSONALITIES[c.personality];
  c.irritation += P.irrRate * (again ? 2 : 0.7);
  const ctx = c.ctx;
  const t = (arr) => tpl(rng.pick(arr), ctx);
  const crime = c.crime ? CRIMES[c.crime] : null;
  const odd = c.oddity ? ODDITIES.find((o) => o.id === c.oddity) : null;
  let text = '';
  let raw = false;
  if (c.storyAnswers && c.storyAnswers[qid]) {
    const sa = c.storyAnswers[qid];
    text = Array.isArray(sa) ? sa[Math.min(again, sa.length - 1)] : sa;
    if (c.irritation >= 5 && again) text = rng.pick(P.angry) + ' ' + text;
    return text;
  }
  if (again >= 2 && c.irritation >= 5) return rng.pick(P.angry);
  const citizen = c.nat === 'VA' && !c.fugitiveVa;
  switch (qid) {
    case 1: {
      if (c.lies.purpose) text = tpl(rng.pick(ARCHETYPES[c.lies.purpose].purposeLines), ctx);
      else text = t(ARCHETYPES[c.arch].purposeLines);
      break;
    }
    case 2: {
      if (c.lies.stay) text = tpl(rng.pick(ANSWERS.stay), Object.assign({}, ctx, { stay: c.lies.stay.name, town: c.lies.stay.town }));
      else if (c.arch === 'trucker') text = t(ANSWERS.stayTruck);
      else if (c.arch === 'fisher') text = `On my boat, the ${c.boat}. Pier three.`;
      else if (c.dir === 'out' && citizen) text = t(ANSWERS.stayAbroad);
      else if (c.dir === 'out') text = t(ANSWERS.stayOut);
      else if (citizen) text = t(ANSWERS.stayHome);
      else if (c.arch === 'relatives') text = t(ANSWERS.stayRel);
      else text = t(ANSWERS.stay);
      break;
    }
    case 3: {
      if (c.lies.dur) text = tpl(rng.pick(ANSWERS.dur), Object.assign({}, ctx, { dur: c.lies.dur, durWords: durWords(c.lies.dur), endDate: ordinalDate(addDays(dayDate(state.day), c.lies.dur)) }));
      else if (citizen && c.dir === 'in') text = t(ANSWERS.durHome);
      else if (c.dir === 'out' && !citizen) text = t(ANSWERS.durLeaving);
      else if (c.dir === 'out') text = t(ANSWERS.durOut);
      else text = t(ANSWERS.dur);
      break;
    }
    case 4: {
      const occ = c.lies.occ || c.occ;
      text = `${OCCUPATIONS[occ].label}. ${tpl(rng.pick(OCCUPATIONS[occ].lines), ctx)}`;
      break;
    }
    case 5: {
      if (odd && odd.declare) text = odd.declare;
      else if (crime) text = rng.pick(crime.declare);
      else if (c.items.some((i) => ITEM_LIB.gifts.some((g) => g[0] === i.name))) text = t(ANSWERS.declareGifts);
      else text = t(ANSWERS.declareNone);
      break;
    }
    case 6: {
      if (crime && rng.chance(0.4)) text = rng.pick(['A friend helped me. Why?', 'My cousin packed it. He is better at packing.', 'The... my employer prepared some things. I packed the rest.']);
      else if (c.spouse && rng.chance(0.6)) text = t(ANSWERS.packedSpouse);
      else text = t(ANSWERS.packedSelf);
      break;
    }
    case 7: {
      if (c.passengers) text = 'No. These women are my employees. For a hotel in Tarsa. They don’t speak much.';
      else if (c.lies.alone || c.company === 'solo') text = t(ANSWERS.alone);
      else if (c.company === 'family') text = t(ANSWERS.withFamily);
      else if (c.company === 'spouse') text = t(ANSWERS.withSpouse);
      else text = t(ANSWERS.withFriend);
      break;
    }
    case 8: {
      const v = c.lies.visits !== undefined ? c.lies.visits : c.visits;
      if (citizen) text = c.dir === 'out' ? rng.pick(['Twice. Both times with delegations.', 'Never. This is my first exit visa.', 'Once, in 1979.']) : 'I am Vardonian, officer. I was born here.';
      else if (v === 0) text = t(ANSWERS.visitsNone);
      else text = tpl(rng.pick(ANSWERS.visitsSome), Object.assign({}, ctx, { visits: v }));
      break;
    }
    case 9: {
      const f = c.flags[c.flags.length - 1];
      if (!f) { text = t(ANSWERS.explainNone); break; }
      const def = c.defects.find((d) => d.doc === f.doc && (d.field === f.field || d.field === null));
      if (f.field === 'photo' && c.photoNatural) {
        text = rng.pick(['That photograph is nine years old. I had more hair and fewer problems.', 'My wife made me change my look. Do not tell her you prefer the old one.', 'It is me! Look, the same nose. The same unhappy nose.']);
      } else if (def && def.forged) {
        text = rng.pick(crime && crime.explain ? crime.explain : CRIMES.forged.explain);
        c.irritation += 1;
        if (c.demeanour === 'calm') c.demeanour = 'uneasy';
      } else if (def) {
        text = rng.pick(DEFECT_EXPLAIN[def.explain] || DEFECT_EXPLAIN.generic);
        if (c.demeanour === 'calm') c.demeanour = 'upset';
      } else {
        text = t(ANSWERS.explainFine);
      }
      break;
    }
    case 10: {
      if (odd && odd.q10) text = tpl(odd.q10, ctx);
      else if (c.fugitiveVa && rng.chance(0.6)) text = CRIMES.fugitive.slip;
      else if (crime && (c.demeanour === 'nervous' || c.demeanour === 'uneasy')) text = rng.pick(crime.q10);
      else if (c.demeanour === 'calm') text = t(ANSWERS.calm);
      else text = rng.pick(['I don’t like uniforms.', 'It is a long queue, and a hot day.', 'Everybody is nervous at a border, no?']);
      break;
    }
    case 11: {
      if (c.declaredUsd > CASH_LIMIT_USD) text = tpl(rng.pick(ANSWERS.cashBig), Object.assign({}, ctx, { cashStr: cashString(c.declaredUsd, c.nat) }));
      else text = tpl(rng.pick(ANSWERS.cash), Object.assign({}, ctx, { cashStr: cashString(c.usd, c.nat) }));
      const claim = `Claimed to carry about ${cashString(c.usd, c.nat)}`;
      if (c.crime === 'currency' && !c.clues.includes(claim)) c.clues.push(claim);
      break;
    }
    case 12: {
      if (c.passengers) text = 'The hotel manager. A friend of mine.';
      else if (c.arch === 'relatives' || (citizen && c.dir === 'in')) text = t(ANSWERS.meetRel);
      else if (c.arch === 'business') text = t(ANSWERS.meetBiz);
      else if (['musician', 'angler', 'student', 'conference'].includes(c.arch)) text = t(ANSWERS.meetEvent);
      else if (c.arch === 'worker') text = t(ANSWERS.meetWork);
      else if (c.crime === 'spy') text = rng.pick(['No one. Why would I meet anyone?', 'Nobody. I came for the beaches. And the... history.']);
      else text = t(ANSWERS.meetNone);
      break;
    }
    default: text = '...';
  }
  if (raw) return text;
  return wrapTone(c, text, rng);
}

const EXIT_LINES = {
  approve: ['{thanks}! Have a good day, officer.', '{thanks}. Until next time.', 'Thank you. Long live... whatever needs to live long.', 'Wonderful. {thanks}!', 'Finally. {thanks}.'],
  deny: ['What? But I— fine. Fine.', 'You cannot be serious. I came all this way.', 'I will write to my embassy about this.', 'Please, is there nothing— no. I understand.', 'This is a disgrace.'],
  detain: ['What? No! I have done nothing!', 'Wait— I want a lawyer. I want my consul!', 'Get your hands off me!', '...I see.', 'You are making a mistake, officer. A big mistake.']
};

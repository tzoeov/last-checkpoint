'use strict';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const KEYS = { save: 'lastcheckpoint.save.', settings: 'lastcheckpoint.settings.v1', registry: 'lastcheckpoint.registry.v1', endings: 'lastcheckpoint.endings.v1' };
const store = {
  get(k, fallback) {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn('Storage read failed', k, err);
      return fallback;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (err) {
      console.warn('Storage write failed', k, err);
      return false;
    }
  },
  del(k) {
    try { localStorage.removeItem(k); } catch (err) { console.warn('Storage delete failed', k, err); }
  }
};

const DEFAULT_SETTINGS = { master: 0.8, music: 0.45, ambience: 0.6, sfx: 0.8, textSpeed: 'fast', crt: true, flicker: true, large: false, tips: true };
let settings = Object.assign({}, DEFAULT_SETTINGS, store.get(KEYS.settings, {}));

const DIFFICULTY = {
  relaxed: { label: 'Relaxed', security: 3, shiftLen: 180, penalty: 0.6 },
  standard: { label: 'Standard', security: 2, shiftLen: 150, penalty: 1 },
  strict: { label: 'Strict', security: 1, shiftLen: 130, penalty: 1.5 }
};

const COSTS = { passport: 2, idcard: 1, travel: 2, luggage: 3, examine: 3, probe: 5, question: 3, security: 15, walk: 2 };

const OUTCOME = {
  helped: { ok: 1, pay: 8, rep: 2, label: 'Correct decision' },
  correct_deny: { ok: 1, pay: 8, rep: 2, label: 'Correctly refused' },
  caught: { ok: 1, pay: 10, rep: 3, label: 'Criminal detained' },
  turned: { ok: 0.6, pay: 4, rep: 1, label: 'Criminal turned away' },
  missed: { ok: 0, pay: -20, rep: -5, label: 'Criminal admitted' },
  wrong_deny: { ok: 0, pay: -10, rep: -4, label: 'Innocent refused' },
  wrong_detain: { ok: 0, pay: -25, rep: -8, label: 'Innocent detained' },
  breach: { ok: 0, pay: -15, rep: -3, label: 'Regulation breach' }
};

let S = null;
const UI = { cur: null, deskTab: null, qOpen: false, typing: null, walk: null, tut: null, lastFrame: 0, frameT: 0, busy: false, sceneNext: null };

const MOBILE_Q = window.matchMedia('(max-width: 900px), (max-height: 520px) and (orientation: landscape)');
function isMobile() { return MOBILE_Q.matches; }

function setPane(p) {
  UI.pane = p;
  const booth = $('screen-booth');
  booth.classList.remove('pane-talk', 'pane-desk', 'pane-notes');
  booth.classList.add('pane-' + p);
  document.querySelectorAll('.pane-tab').forEach((t) => t.classList.toggle('on', t.dataset.pane === p));
  if (p === 'talk') $('talk-dot').hidden = true;
}

function rulesDay() { return S.endless ? 10 : S.day; }
function diff() { return DIFFICULTY[S.difficulty] || DIFFICULTY.standard; }
function plan() { return S.endless ? null : DAY_PLAN[S.day]; }
function weatherToday() { return S.weather || 'clear'; }
function fmtClock(m) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
function shiftEnd() { return SHIFT_START_MIN + diff().shiftLen + (S.day === 1 && !S.endless ? 30 : 0); }
function bump(stat, n) { S.stats[stat] = (S.stats[stat] || 0) + n; }
function applyFx(fx) { if (fx) Object.entries(fx).forEach(([k, v]) => bump(k, v)); }

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== id; });
  UI.screen = id;
}

function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(UI.toastTimer);
  UI.toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

function applySettings() {
  $('app').classList.toggle('crt-on', settings.crt);
  $('app').classList.toggle('flicker', settings.flicker);
  document.body.classList.toggle('large', settings.large);
  Sound.setVolumes({ master: settings.master, music: settings.music, ambience: settings.ambience, sfx: settings.sfx });
  store.set(KEYS.settings, settings);
}

function typeSpeed() { return { instant: 0, fast: 10, normal: 24 }[settings.textSpeed] || 0; }

function typeInto(el, text, done) {
  const sp = typeSpeed();
  if (UI.typing) { UI.typing.finish(); }
  if (!sp || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; if (done) done(); return; }
  let i = 0;
  const timer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i % 8 === 0) Sound.play('type');
    if (i >= text.length) finish();
  }, sp);
  function finish() {
    clearInterval(timer);
    el.textContent = text;
    UI.typing = null;
    if (done) done();
  }
  UI.typing = { finish };
}

/* ================= SAVE / LOAD ================= */
function saveGame(slot) {
  if (!S) return false;
  const meta = { officer: S.officer, day: S.day, endless: S.endless, money: S.money, rep: S.rep, when: new Date().toISOString() };
  const ok = store.set(KEYS.save + slot, { meta, state: S });
  if (slot !== 'auto') toast(ok ? `Saved to slot ${slot}` : 'Could not save: browser storage is unavailable');
  return ok;
}
function autosave() { saveGame('auto'); }
function readSave(slot) { return store.get(KEYS.save + slot, null); }
function loadGame(slot) {
  const data = readSave(slot);
  if (!data) { toast('That slot is empty'); return; }
  S = data.state;
  closeModal();
  resumeState();
}

function resumeState() {
  Sound.setWeather(weatherToday());
  if (S.phase === 'brief') return startDay(true);
  if (S.phase === 'booth') {
    show('screen-booth');
    Sound.setTrack(S.day >= 9 && !S.endless ? 'tense' : 'booth');
    renderTop();
    if (S.shift.current) { presentTraveller(S.shift.current, true); } else nextTraveller();
    return;
  }
  if (S.phase === 'report') return showReport();
  if (S.phase === 'evening') return playEvening();
  if (S.phase === 'ending') return showEnding(S.ending);
  startDay(true);
}

function registryAdd(c, rec) {
  const reg = store.get(KEYS.registry, {});
  reg[c.pid] = { name: `${c.first} ${c.last}`, nat: c.nat, occ: OCCUPATIONS[c.occ] ? OCCUPATIONS[c.occ].label : '', verdict: rec.outcome, truth: rec.truth.slice(0, 220), guilty: c.guilty, story: !!c.story };
  store.set(KEYS.registry, reg);
}

/* ================= MENU ================= */
function renderMenu() {
  show('screen-menu');
  Sound.setTrack('menu');
  Sound.setWeather('clear');
  const box = $('menu-buttons');
  box.innerHTML = '';
  const auto = readSave('auto');
  const add = (label, fn, sub) => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.innerHTML = `${esc(label)}${sub ? ` <span class="cost">${esc(sub)}</span>` : ''}`;
    b.addEventListener('click', () => { Sound.unlock(); Sound.play('click'); fn(); });
    box.appendChild(b);
    return b;
  };
  if (auto && auto.state && auto.state.phase !== 'ending') {
    const b = add('Continue', () => { S = auto.state; resumeState(); }, `${auto.meta.endless ? 'Endless' : 'Day ' + auto.meta.day} · ${auto.meta.officer}`);
    b.classList.add('primary');
  }
  add('New campaign', () => openNewGame(false));
  add('Endless duty', () => openNewGame(true));
  add('Load game', () => openLoad(false));
  add('Settings', openSettings);
  add('Registry of travellers', openRegistry);
  add('How to play', openHowTo);
}

function titleLoop(ts) {
  if (UI.screen === 'screen-menu') Art.title($('title-canvas'), ts);
  requestAnimationFrame(titleLoop);
}

/* ================= NEW GAME ================= */
let newOpts = { tutorial: true, difficulty: 'standard', endless: false };
function openNewGame(endless) {
  newOpts.endless = endless;
  newOpts.tutorial = !endless;
  show('screen-new');
  const seg = (el, opts, key) => {
    el.innerHTML = '';
    opts.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.className = 'btn' + (newOpts[key] === v ? ' on' : '');
      b.textContent = label;
      b.addEventListener('click', () => { newOpts[key] = v; seg(el, opts, key); Sound.play('click'); });
      el.appendChild(b);
    });
  };
  seg($('new-tut'), [[true, 'On'], [false, 'Off']], 'tutorial');
  seg($('new-diff'), [['relaxed', 'Relaxed'], ['standard', 'Standard'], ['strict', 'Strict']], 'difficulty');
  $('officer-name').focus();
}

function newGame() {
  const raw = $('officer-name').value.trim().replace(/[^\p{L}\s'-]/gu, '').slice(0, 18) || 'Danev';
  const surname = raw[0].toUpperCase() + raw.slice(1);
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  S = {
    version: 1, seed, officer: `Officer ${surname}`, surname, endless: newOpts.endless, difficulty: newOpts.difficulty,
    day: 1, money: 40, rep: 50, stats: { party: 0, conscience: 0, suspicion: 0, corruption: 0, truth: 0 }, flags: {},
    roster: buildRoster(seed, 270, 0), used: {}, phase: 'brief', shift: null, bulletin: [], usedGreet: {},
    totals: { inspected: 0, ok: 0, caught: 0, missed: 0, wrong: 0, helped: 0, earned: 0, penalties: 0, bribes: 0 },
    history: [], tutorial: newOpts.tutorial, tutDone: !newOpts.tutorial, weather: 'clear'
  };
  startDay();
}

/* ================= DAY FLOW ================= */
function startDay(resumed) {
  S.phase = 'brief';
  if (!resumed || !S.shift || S.shift.day !== S.day) prepareShift();
  Sound.setWeather(weatherToday());
  autosave();
  const date = dayDate(S.day);
  const lines = briefingLines();
  playScene(lines, {
    date: `<b>${esc(longDate(date).toUpperCase())}</b> · DAY ${String(S.day).padStart(2, '0')}${S.endless ? ' · ENDLESS DUTY' : ''} · ${weatherLabel()}`,
    side: briefingSide(),
    doneLabel: 'Open the booth',
    onDone: beginShift
  });
}

function weatherLabel() {
  return { clear: 'CLEAR, LIGHT MISTRAL', storm: 'STORM, FERRIES DELAYED', haze: 'HAZE, HUMID', dusk: 'OVERCAST' }[weatherToday()];
}

function briefingLines() {
  if (S.endless) {
    const rng = makeRng(S.seed + S.day);
    return [
      L('narrator', `Duty day ${S.day}. ${rng.pick(['The ferry from Bari is on time, which worries everyone.', 'A grey morning. The cranes stand still.', 'The queue already stretches past the fish market.', 'Hot. The tarmac smells of tar and oranges.'])}`),
      L('radio', rng.pick(RADIO_LINES)),
      L('vasko', rng.pick(['All regulations remain in force. All of them. Do not make me read them to you.', 'Five travellers. Do not make mistakes. Velkovgrad is counting.', 'The Directorate says the networks are getting cleverer. Be cleverer.']))
    ];
  }
  const f = SCENES['brief' + S.day];
  return f ? f(S) : [L('narrator', 'Another shift begins.')];
}

function briefingSide() {
  const d = rulesDay();
  const regs = REGULATIONS.filter((r) => r.day <= d);
  const newOnes = S.endless ? [] : regs.filter((r) => r.day === S.day);
  let html = `<div class="memo"><h3>DUTY ORDER · BOOTH ONE</h3><div class="from">${esc(S.officer)} · Port San Aurelio · Shift 08:00–${fmtClock(shiftEnd())}</div>`;
  html += `<ol>${(newOnes.length ? newOnes : regs.slice(-3)).map((r) => `<li><span class="${newOnes.length ? 'new' : ''}">${esc(r.title)}.</span> ${esc(r.text)}</li>`).join('')}</ol>`;
  html += `<p style="margin:10px 0 0">Travellers this shift: 5 · Security calls: ${diff().security}${S.bulletin.length ? ` · Wanted notices: ${S.bulletin.length}` : ''}</p>`;
  html += `<span class="stampmark">${newOnes.length ? 'NEW REGULATIONS' : 'IN FORCE'}</span></div>`;
  if (S.bulletin.length) html += bulletinHtml();
  html += `<div class="memo" style="transform:rotate(-.5deg)"><h3>PERSONNEL FILE</h3><div class="from">Savings ${S.money} aurels · Reputation ${S.rep}/100</div><p style="margin:0">Criminals caught: ${S.totals.caught} · Travellers helped: ${S.totals.helped} · Accuracy: ${accuracy()}%</p></div>`;
  return html;
}

function accuracy() { return S.totals.inspected ? Math.round((S.totals.ok / S.totals.inspected) * 100) : 100; }

function prepareShift() {
  const rng = makeRng(S.seed * 31 + S.day);
  const p = plan();
  S.weather = p ? p.weather : rng.pick(['clear', 'clear', 'haze', 'storm', 'dusk']);
  let slots;
  if (p) slots = p.slots.slice();
  else {
    const nCrime = rng.pick([1, 2, 2, 3]);
    const nPaper = rng.pick([0, 1, 1]);
    slots = rng.shuffle([...Array(nCrime).fill({ crime: true }), ...Array(nPaper).fill({ paper: true }), ...Array(5 - nCrime - nPaper).fill({})]);
  }
  const queue = [];
  const usedArch = new Set(), usedNat = new Set();
  slots.forEach((slot) => {
    if (typeof slot === 'string') {
      if (slot === 'claireOut' && !S.flags.claireIn) slot = {};
      else { queue.push({ story: slot }); return; }
    }
    const person = pickPerson(slot, usedArch, usedNat, rng);
    S.used[person.pid] = true;
    usedArch.add(person.arch); usedNat.add(person.nat);
    queue.push({ pid: person.pid });
  });
  S.shift = { day: S.day, queue, index: 0, clock: SHIFT_START_MIN, records: [], security: diff().security, current: null, midDone: false };
  S.bulletin = buildBulletin(queue, rng);
}

function pickPerson(spec, usedArch, usedNat, rng) {
  const d = rulesDay();
  const match = (p) => {
    if (S.used[p.pid] || p.minDay > d) return false;
    if (spec.crime === true) return !!p.crime;
    if (typeof spec.crime === 'string') return p.crime === spec.crime;
    if (spec.paper) return p.paper && !p.crime;
    if (spec.arch) return p.arch === spec.arch && !p.crime && !p.paper;
    return !p.crime && !p.paper;
  };
  let pool = S.roster.filter(match);
  if (pool.length < 3) {
    S.roster = S.roster.concat(buildRoster(S.seed + S.roster.length, 60, S.roster.length));
    pool = S.roster.filter(match);
  }
  if (!pool.length) pool = S.roster.filter((p) => !S.used[p.pid] && p.minDay <= d);
  const varied = pool.filter((p) => !usedArch.has(p.arch) && !usedNat.has(p.nat));
  return rng.pick(varied.length ? varied : pool);
}

function buildBulletin(queue, rng) {
  const out = [];
  const p = plan();
  const want = p ? !!p.bulletin : (S.day > 1 && rng.chance(0.5));
  if (!want) return out;
  if (p && (S.day === 5 || S.day === 6)) out.push({ story: 'varga', name: 'Lucan Varga', age: 41, nat: 'Vardonian', height: 181, eyes: 'brown', marks: 'Scar across the left cheek', crime: 'the murder of a customs officer in Tarsa', note: S.day === 5 ? 'Believed to be heading for the coast.' : 'May travel on forged Yugoslav papers. May have cut his hair and beard.', look: STORY_PEOPLE.varga.wantedLook });
  if (p && S.day === 8) out.push({ story: 'orlan', name: 'Prof. Matej Orlan', age: 58, nat: 'Vardonian', height: 174, eyes: 'blue', marks: 'Mole on the right cheek', crime: 'anti-state activity. Enemy of the people', note: 'Speaks fluent German. May have shaved his beard.', look: STORY_PEOPLE.orlan.wantedLook });
  const crimQueue = queue.filter((q) => q.pid).map((q) => S.roster.find((r) => r.pid === q.pid)).filter((r) => r && r.crime && r.crime !== 'fugitive' && r.crime !== 'trafficker');
  if (crimQueue.length && rng.chance(0.6)) {
    const r = rng.pick(crimQueue);
    const C = COUNTRIES[r.nat];
    out.push({ pid: r.pid, name: `${rng.pick(r.sex === 'M' ? C.m : C.f)} ${rng.pick(C.s)}`, age: r.age, nat: C.adj, height: r.height, eyes: r.look.eyes, marks: r.look.scar ? 'Facial scar' : r.look.mole ? 'Mole on the cheek' : 'None recorded', crime: rng.pick(BULLETIN_CRIMES), note: 'Uses false names. May have changed hairstyle.', look: JSON.parse(JSON.stringify(r.look)), alias: `${r.first} ${r.last}` });
  }
  const nat = rng.pick(Object.keys(COUNTRIES).filter((k) => COUNTRIES[k].minDay <= rulesDay()));
  const sex = rng.chance(0.7) ? 'M' : 'F';
  const age = rng.int(26, 60);
  const C = COUNTRIES[nat];
  const look = genLook(rng, sex, age, nat, { expression: 'neutral', hat: 'none' });
  out.push({ name: `${rng.pick(sex === 'M' ? C.m : C.f)} ${rng.pick(C.s)}`, age, nat: C.adj, height: sex === 'M' ? rng.int(166, 190) : rng.int(155, 176), eyes: look.eyes, marks: look.scar ? 'Facial scar' : 'None recorded', crime: rng.pick(BULLETIN_CRIMES), note: 'Armed. Do not approach alone.', look });
  return rng.shuffle(out);
}

function bulletinHtml() {
  return `<div class="label" style="color:var(--red)">DIRECTORATE WANTED BULLETIN</div>` + S.bulletin.map((b, i) => `
    <div class="wanted"><canvas class="px" width="48" height="56" data-wanted="${i}"></canvas>
    <div><div class="wh">WANTED</div><b>${esc(b.name)}</b>, ${b.age}, ${esc(b.nat)}<br>Height ${b.height} cm · Eyes ${esc(b.eyes)}<br>Marks: ${esc(b.marks)}<br>For ${esc(b.crime)}.<br><i>${esc(b.note)}</i></div></div>`).join('');
}
function paintWanted(root) {
  root.querySelectorAll('canvas[data-wanted]').forEach((cv) => {
    const b = S.bulletin[+cv.dataset.wanted];
    if (b) Art.photo(cv, b.look, '#bdb6a0');
  });
}

function beginShift() {
  S.phase = 'booth';
  show('screen-booth');
  Sound.setTrack(S.day >= 9 && !S.endless ? 'tense' : 'booth');
  $('btn-bulletin').hidden = !S.bulletin.length;
  $('ticker-text').textContent = makeRng(S.day * 7 + S.seed).shuffle(RADIO_LINES).slice(0, 5).join('     ★     ');
  renderTop();
  nextTraveller();
}

function nextTraveller() {
  const sh = S.shift;
  if (sh.index >= 5) return endShift();
  const p = plan();
  if (p && p.mid && p.mid.before === sh.index && !sh.midDone) {
    autosave();
    playScene(SCENES[p.mid.scene](S), { date: `<b>${fmtClock(sh.clock)}</b> · BOOTH ONE`, side: '', doneLabel: 'Back to the window', onDone: () => { sh.midDone = true; show('screen-booth'); nextTraveller(); } });
    return;
  }
  const slot = sh.queue[sh.index];
  let c;
  if (slot.story) c = STORY_PEOPLE[slot.story].make(S);
  else {
    const person = S.roster.find((r) => r.pid === slot.pid);
    c = instantiate(person, S);
    if (c.wanted) disguise(c);
  }
  c.story = slot.story || null;
  if (c.story && !c.crimeText) c.crimeText = '';
  sh.current = c;
  autosave();
  presentTraveller(c, false);
}

function disguise(c) {
  const rng = makeRng(hashStr(c.pid + 'disguise'));
  c.look.hair = rng.pick(c.sex === 'M' ? ['short', 'bald', 'slick', 'parted'] : ['bob', 'bun', 'curly']);
  if (c.sex === 'M') c.look.facial = c.look.facial === 'none' ? rng.pick(['mustache', 'beard']) : 'none';
  if (c.look.hairColor !== 'grey' && c.look.hairColor !== 'white') c.look.hairColor = rng.pick(['black', 'blond', 'darkbrown']);
}

function presentTraveller(c, resumed) {
  UI.cur = c;
  UI.deskTab = null;
  UI.qOpen = false;
  UI.busy = false;
  setPane('talk');
  $('qpanel').hidden = true;
  if (!resumed) {
    UI.walk = { from: -60, to: 0, start: performance.now(), dur: 650 };
    Sound.play('step');
    setTimeout(() => Sound.play('step'), 220);
  } else UI.walk = null;
  $('log').innerHTML = '';
  if (c.log && c.log.length && resumed) c.log.forEach((m) => logLine(m.who, m.text, false, true));
  else {
    c.log = [];
    sysLine(`${fmtClock(S.shift.clock)} — Traveller ${S.shift.index + 1} of 5 steps up to the window.`);
    c.greet.forEach((g, i) => setTimeout(() => themLine(g), 450 + i * 50));
  }
  renderTraveller();
  renderDesk();
  renderTop();
  renderEvidence();
  if (S.tutorial && !S.tutDone && S.day === 1 && S.shift.index === 0) startTutorial();
}

function travellerLabel(c) {
  return c.seenName ? `${c.first} ${c.last}` : 'Unidentified traveller';
}

function renderTraveller() {
  const c = UI.cur;
  if (!c) return;
  $('trav-name').textContent = `${travellerLabel(c)} · ${c.dir === 'out' ? 'DEPARTING' : 'ARRIVING'}`;
  const dem = $('trav-dem');
  dem.className = `chip ${c.demeanour}`;
  dem.textContent = DEMEANOURS[c.demeanour];
  $('trav-appear').textContent = c.appearance;
  const pat = Math.max(0, 5 - Math.round(c.irritation));
  $('irrit').textContent = `Patience ${'■'.repeat(pat)}${'□'.repeat(5 - pat)}`;
  c.look.expression = c.irritation >= 4 ? 'angry' : demeanourFace(c);
  $('sec-left').textContent = `Security calls left this shift: ${S.shift.security}`;
  $('sec-n').textContent = S.shift.security;
  $('notes-appear').textContent = `${DEMEANOURS[c.demeanour]}. ${c.appearance}`;
  $('a-security').disabled = S.shift.security <= 0 || c.searched;
}

function renderTop() {
  if (!S || !S.shift) return;
  $('t-day').textContent = String(S.day).padStart(2, '0');
  $('t-date').textContent = fmtDate(dayDate(S.day));
  const late = S.shift.clock > shiftEnd();
  $('t-clock').textContent = fmtClock(S.shift.clock) + (late ? ' OT' : '');
  $('t-clock').classList.toggle('warn', late);
  $('t-trav').textContent = `${Math.min(5, S.shift.index + 1)}/5`;
  $('t-money').textContent = S.money;
  $('t-rep').textContent = S.rep;
  $('t-rep').classList.toggle('warn', S.rep < 20);
}

function spend(min) {
  S.shift.clock += min;
  renderTop();
}

function logLine(who, text, animate, silentStore) {
  const c = UI.cur;
  if (c && !silentStore) c.log.push({ who, text });
  const box = $('log');
  if (who !== 'you' && UI.pane !== 'talk' && isMobile()) $('talk-dot').hidden = false;
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  const label = who === 'you' ? S.officer.toUpperCase() : who === 'them' ? (c ? (c.seenName ? c.first.toUpperCase() : 'TRAVELLER') : '') : '';
  div.innerHTML = label ? `<div class="who">${esc(label)}</div><div class="tx"></div>` : '<div class="tx"></div>';
  box.appendChild(div);
  const tx = div.querySelector('.tx');
  if (animate) typeInto(tx, text, () => { box.scrollTop = box.scrollHeight; });
  else tx.textContent = text;
  box.scrollTop = box.scrollHeight;
}
const themLine = (t) => logLine('them', t, true);
const youLine = (t) => logLine('you', t, false);
const sysLine = (t, kind) => logLine(kind || 'sys', t, false);

function renderEvidence() {
  const c = UI.cur;
  const ul = $('evidence-list');
  const notes = [];
  c.flags.forEach((f) => {
    const doc = c.docs.find((d) => d.type === f.doc);
    if (!doc) return;
    const label = f.field === 'photo' ? 'photograph' : f.field === 'seal' ? 'seal' : (doc.fields.find((x) => x.k === f.field) || {}).label;
    const val = f.field === 'photo' || f.field === 'seal' ? '' : `: ${(doc.fields.find((x) => x.k === f.field) || {}).v}`;
    notes.push(`Flagged ${doc.title} — ${label}${val}`);
  });
  c.items.filter((i) => i.examined && i.tell && !i.probed).forEach((i) => notes.push(`${i.name}: ${i.tell}`));
  c.items.filter((i) => i.probed && i.contraband).forEach((i) => notes.push(`FOUND: ${i.probe}`));
  if (c.vehicle && c.vehicle.tell && c.items.find((i) => i.vehicle && i.examined)) notes.push(`Vehicle: ${c.vehicle.tell}`);
  (c.searchNotes || []).forEach((n) => notes.push(n));
  ul.innerHTML = notes.length ? notes.map((n) => `<li>${esc(n)}</li>`).join('') : '<li style="color:var(--phos-faint);list-style:none;margin-left:-18px">Nothing noted yet. Flag suspicious fields on documents; examined luggage findings appear here.</li>';
  $('flag-count').textContent = c.flags.length ? `${c.flags.length} flagged` : 'Click a field to flag it';
}

/* ================= DESK ================= */
function docTabs(c) {
  const tabs = [];
  c.docs.forEach((d) => {
    if (d.type === 'passport' && c.openedPassport) tabs.push(['passport', 'Passport']);
    else if (d.type === 'idcard' && c.openedId) tabs.push(['idcard', 'ID card']);
    else if (d.type !== 'passport' && d.type !== 'idcard' && c.openedTravel) tabs.push([d.type, d.title]);
  });
  if (c.openedLuggage) tabs.push(['luggage', 'Luggage']);
  return tabs;
}

function renderDesk() {
  const c = UI.cur;
  const tabs = docTabs(c);
  const tabEl = $('desk-tabs');
  tabEl.innerHTML = '';
  tabs.forEach(([k, label]) => {
    const b = document.createElement('button');
    b.className = 'tab' + (UI.deskTab === k ? ' on' : '');
    b.textContent = label;
    b.addEventListener('click', () => { UI.deskTab = k; Sound.play('paper'); renderDesk(); });
    tabEl.appendChild(b);
  });
  const body = $('desk-body');
  if (!UI.deskTab) {
    body.innerHTML = '<div class="desk-empty">Papers will appear here. Use the inspection controls.</div>';
    return;
  }
  if (UI.deskTab === 'luggage') { renderLuggage(body); return; }
  const doc = c.docs.find((d) => d.type === UI.deskTab);
  if (!doc) { body.innerHTML = '<div class="desk-empty">No such document.</div>'; return; }
  body.innerHTML = docHtml(doc, c);
  const ph = body.querySelector('canvas.photo');
  if (ph) Art.photo(ph, doc.photo);
  body.querySelectorAll('[data-field]').forEach((el) => {
    el.addEventListener('click', () => toggleFlag(doc.type, el.dataset.field));
  });
  if (c.openedTravel && (UI.deskTab !== 'passport' && UI.deskTab !== 'idcard')) {
    const presented = c.docs.filter((d) => d.type !== 'passport' && d.type !== 'idcard').map((d) => d.title);
    const note = document.createElement('div');
    note.className = 'doc-hint';
    note.textContent = `Presented: ${presented.join(' · ') || 'nothing'}`;
    body.appendChild(note);
  }
}

function isFlagged(c, doc, field) { return c.flags.some((f) => f.doc === doc && f.field === field); }

function docHtml(doc, c) {
  const flagged = (k) => (isFlagged(c, doc.type, k) ? ' flagged' : '');
  const fields = doc.fields.map((f) => `<div class="field${flagged(f.k)}" data-field="${f.k}" tabindex="0"><div class="fl">${esc(f.label)}</div><div class="fv">${esc(f.v)}</div></div>`).join('');
  const photo = doc.photo ? `<canvas class="photo px${flagged('photo')}" width="48" height="56" data-field="photo" title="Photograph"></canvas>` : '';
  const seal = doc.seal ? `<div class="seal${flagged('seal')}" data-field="seal" style="color:${SEAL_COLORS[doc.seal.color]}"><div><div class="g">${doc.seal.glyph}</div><div class="t">${esc(doc.seal.text)}</div></div></div>` : '';
  const no = doc.type === 'passport' ? doc.fields.find((f) => f.k === 'passno').v : '';
  return `<div class="doc ${doc.type}">
    <div class="doc-h"><div><div class="doc-title">${esc(doc.title)}</div><div class="doc-auth">${esc(doc.authority)}</div></div><div class="doc-auth">${esc(no)}</div></div>
    <div class="doc-body${doc.photo ? '' : ' nophoto'}">${photo}<div class="fields">${fields}</div></div>
    <div class="doc-foot">${doc.seal ? 'Seal of issuing authority' : 'No seal required'}</div>${seal}</div>
    <div class="doc-hint">Click a field, the photograph or the seal to flag it.</div>`;
}

function toggleFlag(doc, field) {
  const c = UI.cur;
  const i = c.flags.findIndex((f) => f.doc === doc && f.field === field);
  if (i >= 0) c.flags.splice(i, 1);
  else { c.flags.push({ doc, field }); Sound.play('click'); }
  renderDesk();
  renderEvidence();
}

function renderLuggage(body) {
  const c = UI.cur;
  const groups = {};
  c.items.forEach((it) => { (groups[it.container] = groups[it.container] || []).push(it); });
  body.innerHTML = `<div class="lug">${Object.entries(groups).map(([g, items]) => `
    <div class="lug-group"><span class="label">${esc(g)}</span><div style="display:grid;gap:6px">${items.map((it) => itemHtml(it, c)).join('')}</div></div>`).join('')}
    <div class="doc-hint">Examine ${COSTS.examine} min · Search inside ${COSTS.probe} min. Clothing, bodies and vehicle panels need a security search.</div></div>`;
  body.querySelectorAll('[data-ex]').forEach((b) => b.addEventListener('click', () => examineItem(b.dataset.ex)));
  body.querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => probeItem(b.dataset.pr)));
}

function itemHtml(it, c) {
  const contra = it.probed && it.contraband;
  let inner = `<div class="in"><span>${esc(it.name)}</span>${!it.examined ? `<button class="btn" data-ex="${it.id}">Examine</button>` : ''}</div>`;
  if (it.examined) {
    inner += `<div>${esc(it.desc)}</div>`;
    const tell = it.vehicle ? (c.vehicle && c.vehicle.tell) : it.tell;
    if (tell) inner += `<div class="tell">Note: ${esc(tell)}</div>`;
    if (it.vehicle) inner += `<div class="probe">${c.searched ? (c.hiddenVehicle ? esc(c.hiddenVehicle) : 'Security search: vehicle clean.') : 'Door panels, tank and seats can only be opened by a security search.'}</div>`;
    else if (it.tell && !it.probed) inner += `<div><button class="btn" data-pr="${it.id}">Search inside</button></div>`;
    if (it.probed && !it.vehicle) inner += `<div class="probe">${contra ? 'CONTRABAND: ' : 'Searched: '}${esc(it.probe)}</div>`;
  }
  return `<div class="item${contra ? ' contra' : ''}">${inner}</div>`;
}

function examineItem(id) {
  const c = UI.cur;
  const it = c.items.find((i) => i.id === id);
  if (!it || it.examined) return;
  it.examined = true;
  spend(it.vehicle ? 4 : COSTS.examine);
  Sound.play('paper');
  renderDesk(); renderEvidence();
}

function probeItem(id) {
  const c = UI.cur;
  const it = c.items.find((i) => i.id === id);
  if (!it || it.probed) return;
  it.probed = true;
  spend(COSTS.probe);
  if (it.contraband) {
    Sound.play('buzz');
    sysLine(`You find something: ${it.probe}`, 'alert');
    c.evidenceFound = true;
    if (c.demeanour !== 'hostile') c.demeanour = 'nervous';
    themLine(c.guilty ? pickLine(['That is not mine. Someone put that there.', 'I can explain. I can explain everything.', 'Officer, please, let us be reasonable.', '...']) : 'That? That is for... it is not what it looks like.');
  } else {
    Sound.play('paper');
    if (!c.guilty) c.irritation += 0.5;
  }
  renderDesk(); renderEvidence(); renderTraveller();
}

function pickLine(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ================= ACTIONS ================= */
function act(kind) {
  const c = UI.cur;
  if (!c || UI.busy || S.phase !== 'booth') return;
  Sound.unlock();
  switch (kind) {
    case 'passport': {
      if (!c.openedPassport) { c.openedPassport = true; c.seenName = true; spend(COSTS.passport); youLine('Passport, please.'); }
      UI.deskTab = 'passport'; Sound.play('paper'); setPane('desk'); renderDesk(); renderTraveller(); tutEvent('passport');
      break;
    }
    case 'id': {
      const has = c.docs.some((d) => d.type === 'idcard');
      if (!c.askedId) {
        c.askedId = true; spend(COSTS.idcard); youLine('Identity card.');
        if (!has) themLine(c.nat === 'VA' && !c.fugitiveVa ? pickLine(['I... I forgot it. It is at home, in Kalimor.', 'I don’t have it with me. Is that a problem?']) : pickLine(['I am not Vardonian, officer. I have no Vardonian card.', 'An identity card? I only have my passport. I am a foreigner.']));
      }
      if (has) { c.openedId = true; UI.deskTab = 'idcard'; Sound.play('paper'); setPane('desk'); renderDesk(); } else setPane('talk');
      break;
    }
    case 'travel': {
      if (!c.openedTravel) {
        c.openedTravel = true; spend(COSTS.travel); youLine('Your travel documents.');
        const list = c.docs.filter((d) => d.type !== 'passport' && d.type !== 'idcard');
        if (!list.length) themLine('That is all I have, officer. Only the passport.');
      }
      const first = c.docs.find((d) => d.type !== 'passport' && d.type !== 'idcard');
      if (first) { UI.deskTab = first.type; Sound.play('paper'); setPane('desk'); } else setPane('talk');
      renderDesk(); tutEvent('travel');
      break;
    }
    case 'luggage': {
      if (!c.openedLuggage) { c.openedLuggage = true; spend(COSTS.luggage); youLine('Open your bags, please.'); if (c.personality === 'irritable' || c.personality === 'arrogant') themLine(pickLine(['Is this necessary?', 'Fine. Mind the shirts.', 'Go ahead, dig through my underwear. Very dignified.'])); }
      UI.deskTab = 'luggage'; setPane('desk'); renderDesk(); tutEvent('luggage');
      break;
    }
    case 'ask': if (isMobile() && UI.pane !== 'talk') { setPane('talk'); toggleQuestions(true); } else toggleQuestions(); break;
    case 'approve': decideStart('approve'); break;
    case 'deny': decideStart('deny'); break;
    case 'detain': decideStart('detain'); break;
    case 'security': callSecurity(); break;
    default: break;
  }
}

function toggleQuestions(force) {
  const c = UI.cur;
  UI.qOpen = force !== undefined ? force : !UI.qOpen;
  const q = $('qpanel');
  q.hidden = !UI.qOpen;
  if (!UI.qOpen) return;
  q.innerHTML = '';
  QUESTIONS.forEach((qq) => {
    const b = document.createElement('button');
    b.className = 'btn' + (c.asked[qq.id] ? ' asked' : '');
    b.textContent = `${qq.id}. ${c.dir === 'out' && qq.outText ? qq.outText : qq.text}`;
    b.addEventListener('click', () => ask(qq));
    q.appendChild(b);
  });
  (c.extraQuestions || []).filter((e) => !(e.once && c.asked[e.id])).forEach((e) => {
    const b = document.createElement('button');
    b.className = 'btn special';
    b.textContent = e.text;
    b.addEventListener('click', () => askExtra(e));
    q.appendChild(b);
  });
  tutEvent('ask');
}

function ask(qq) {
  const c = UI.cur;
  if (UI.busy) return;
  const text = c.dir === 'out' && qq.outText ? qq.outText : qq.text;
  let qtext = text;
  if (qq.id === 9) {
    const f = c.flags[c.flags.length - 1];
    if (f) {
      const doc = c.docs.find((d) => d.type === f.doc);
      const fl = f.field === 'photo' ? 'this photograph' : f.field === 'seal' ? 'this seal' : `the ${(doc.fields.find((x) => x.k === f.field) || { label: 'entry' }).label.toLowerCase()}`;
      qtext = `Can you explain ${fl} on your ${doc.title.toLowerCase()}?`;
    }
  }
  youLine(qtext);
  spend(COSTS.question);
  const ans = answerQuestion(c, qq.id, S);
  setTimeout(() => { themLine(ans); renderTraveller(); }, 250);
  toggleQuestions(true);
}

function askExtra(e) {
  const c = UI.cur;
  c.asked[e.id] = 1;
  youLine(e.text.replace(/^\[[^\]]+\]\s*/, ''));
  spend(COSTS.question);
  applyFx(e.fx);
  if (e.flag) S.flags[e.flag] = true;
  setTimeout(() => sysLine(e.answer), 250);
  toggleQuestions(true);
}

function callSecurity() {
  const c = UI.cur;
  if (S.shift.security <= 0 || c.searched) return;
  S.shift.security -= 1;
  c.searched = true;
  spend(COSTS.security);
  Sound.play('alarm');
  setPane('talk');
  youLine('Security to booth one.');
  sysLine('Two guards take the traveller to the search room. Fifteen minutes pass.');
  const found = [];
  if (c.hiddenBody) found.push(c.hiddenBody);
  if (c.hiddenVehicle) found.push(c.hiddenVehicle);
  c.items.filter((i) => i.contraband && !i.probed).forEach((i) => { i.examined = true; i.probed = true; found.push(i.probe); });
  c.searchNotes = c.searchNotes || [];
  if (found.length) {
    c.evidenceFound = true;
    found.forEach((f) => { sysLine(`SEARCH: ${f}`, 'alert'); c.searchNotes.push(`SEARCH: ${f}`); });
    c.demeanour = 'hostile';
  } else {
    sysLine('SEARCH: Nothing found on the traveller, in their clothes or in their vehicle.', 'good');
    c.searchNotes.push('Security search: nothing found');
    if (!c.guilty) { c.irritation += 2; c.complained = true; themLine(pickLine(['This is outrageous. I will complain to my consulate.', 'Satisfied? They made me take off my shoes.', 'I have never been so humiliated.'])); }
  }
  renderDesk(); renderEvidence(); renderTraveller();
}

function decideStart(dec) {
  const c = UI.cur;
  if (UI.busy) return;
  const bribeAllowed = c.bribe > 0 && !c.bribeOffered && (S.endless || S.day >= 3) && dec !== 'approve';
  if (bribeAllowed) {
    c.bribeOffered = true;
    openModal('A QUIET OFFER', `<p>${esc(c.seenName ? c.first : 'The traveller')} leans close to the glass. A folded envelope slides under the passport tray.</p><p style="color:var(--ochre)">“${esc(pickLine(['Perhaps we can forget all this, officer.', 'For your trouble. Nobody needs to know.', 'A small gift. For your children.']))}”</p><p>Inside: <b>${c.bribe} aurels</b>. That is ${Math.round(c.bribe / 40)} days’ pay.</p>`, [
      { label: 'Take it and approve', cls: 'deny', fn: () => { closeModal(); c.tookBribe = true; S.money += c.bribe; S.totals.bribes += c.bribe; bump('corruption', 1); bump('suspicion', 1); Sound.play('coin'); finalize('approve'); } },
      { label: 'Refuse', cls: 'primary', fn: () => { closeModal(); youLine('Put that away.'); decideStart(dec); } }
    ]);
    return;
  }
  if (dec === 'detain') {
    openModal('DETAIN SUSPECT', `<p>Detain <b>${esc(travellerLabel(c))}</b>? Guards will take them for questioning.</p><p style="color:var(--phos-dim)">Detaining an innocent traveller is the most serious error an officer can make.</p>`, [
      { label: 'Cancel', fn: closeModal },
      { label: 'Detain', cls: 'detain', fn: () => { closeModal(); finalize('detain'); } }
    ]);
    return;
  }
  finalize(dec);
}

function judgeGeneric(dec, c) {
  if (c.guilty) {
    if (c.crime === 'fugitive') {
      if (dec === 'approve') bump('conscience', 1);
      if (dec === 'detain') { bump('conscience', -1); bump('party', 1); }
    }
    if (dec === 'detain') return { outcome: 'caught' };
    if (dec === 'deny') return { outcome: 'turned' };
    return { outcome: 'missed' };
  }
  if (c.defects.length) {
    if (dec === 'deny') return { outcome: 'correct_deny' };
    if (dec === 'detain') return { outcome: 'wrong_detain' };
    return { outcome: 'breach' };
  }
  if (dec === 'approve') return { outcome: 'helped' };
  if (dec === 'deny') return { outcome: 'wrong_deny' };
  return { outcome: 'wrong_detain' };
}

function truthText(c) {
  const ctx = c.ctx;
  if (c.story) {
    if (c.crimeText) return c.crimeText;
    if (c.defects.length) return `Papers invalid: ${c.defects.map((d) => d.note).join('; ')}.`;
    return c.storyNote || 'Papers in order.';
  }
  const rng = makeRng(hashStr(c.pid + 'truth'));
  if (c.guilty) {
    const crime = CRIMES[c.crime];
    let t = `${crime.label}. ${c.crimeText || ''}`;
    if (c.defects.length) t += ` Forgery: ${c.defects.map((d) => d.note.toLowerCase()).join('; ')}.`;
    if (c.wanted) t += ` Wanted under another name (bulletin).`;
    if (c.crime === 'currency' && c.hiddenUsd) t += ` Undeclared: about ${c.hiddenUsd.toLocaleString('en-GB')} USD.`;
    t += ' ' + tpl(rng.pick(crime.backstory), ctx);
    return t.replace(/\s+/g, ' ').trim();
  }
  let t = `Innocent. ${c.first} is a ${OCCUPATIONS[c.occ].label.toLowerCase()} from ${c.home}, ${c.nat === 'VA' ? 'Vardonia' : COUNTRIES[c.nat].name}. ${ARCHETYPES[c.arch].purpose}.`;
  if (c.defects.length) t += ` But the papers were invalid: ${c.defects.map((d) => d.note.toLowerCase()).join('; ')}.`;
  const odd = c.oddity && ODDITIES.find((o) => o.id === c.oddity);
  if (odd && odd.item) t += ` The ${odd.item[0].toLowerCase()}: ${odd.item[3]}`;
  else if (odd && odd.q10) t += ' Their unusual look or manner meant nothing.';
  if (c.photoNatural) t += ' The passport photo was simply old.';
  return t;
}

function finalize(dec) {
  const c = UI.cur;
  UI.busy = true;
  toggleQuestions(false);
  setPane('talk');
  spend(1);
  const story = c.story && STORY_PEOPLE[c.story];
  const res = story && story.judge ? story.judge(dec, c, S) : judgeGeneric(dec, c);
  const O = OUTCOME[res.outcome];
  const mult = O.pay < 0 ? diff().penalty : 1;
  let pay = Math.round(O.pay * mult);
  let rep = O.rep;
  const flaggedDefect = c.defects.some((d) => c.flags.some((f) => f.doc === d.doc && (f.field === d.field || d.field === null)));
  const evidence = c.evidenceFound || flaggedDefect || (c.wanted && dec === 'detain');
  if (res.outcome === 'caught' && evidence) pay += 15;
  if (res.outcome === 'helped' && c.complained) rep -= 1;
  if (c.tookBribe) rep -= 1;
  if (S.flags && plan() && plan().watch && O.ok === 0) bump('suspicion', 1);
  S.money += pay;
  S.rep = Math.max(0, Math.min(100, S.rep + rep));
  const rec = {
    pid: c.pid, name: `${c.first} ${c.last}`, nat: c.nat, dir: c.dir, decision: dec, outcome: res.outcome, ok: O.ok, label: O.label,
    note: res.note || '', guilty: c.guilty, truth: truthText(c), clues: c.clues.concat(c.defects.map((d) => `Document: ${d.note.toLowerCase()}`)),
    evidence: !!evidence, pay, rep, bribe: c.tookBribe ? c.bribe : 0, story: !!c.story
  };
  S.shift.records.push(rec);
  registryAdd(c, rec);
  const stampTxt = dec === 'approve' ? (c.dir === 'out' ? 'CLEARED' : 'ADMITTED') : dec === 'deny' ? 'REFUSED' : 'DETAINED';
  stampFx(stampTxt, dec === 'approve' ? 'ok' : dec === 'deny' ? 'no' : 'det');
  Sound.play(dec === 'detain' ? 'alarm' : 'stamp');
  const ex = tpl(pickLine(EXIT_LINES[dec]), c.ctx);
  youLine(dec === 'approve' ? (c.dir === 'out' ? 'You may depart.' : 'Welcome to Vardonia.') : dec === 'deny' ? 'Entry refused. Step aside.' : 'Guards. Take this person.');
  setTimeout(() => themLine(ex), 300);
  if (res.note) setTimeout(() => sysLine(res.note), 700);
  tutEvent('decide');
  setTimeout(() => {
    UI.walk = { from: 0, to: 90, start: performance.now(), dur: 600 };
    setTimeout(() => {
      S.shift.current = null;
      S.shift.index += 1;
      S.shift.clock += COSTS.walk;
      UI.cur = null;
      UI.busy = false;
      nextTraveller();
    }, 650);
  }, 1900);
}

function stampFx(text, cls) {
  const d = document.createElement('div');
  d.className = `stampfx ${cls}`;
  d.textContent = text;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 900);
}

/* ================= REPORT ================= */
function endShift() {
  S.phase = 'report';
  const sh = S.shift;
  const over = Math.max(0, sh.clock - shiftEnd());
  const otPay = Math.round(Math.ceil(over / 15) * 5 * diff().penalty);
  const otRep = Math.floor(over / 30);
  const recs = sh.records;
  const earned = recs.reduce((s, r) => s + Math.max(0, r.pay), 0);
  const penalties = recs.reduce((s, r) => s + Math.min(0, r.pay), 0) - otPay;
  S.money += 30 - otPay;
  S.rep = Math.max(0, S.rep - otRep);
  const score = recs.reduce((s, r) => s + r.ok, 0);
  let stars = Math.max(1, Math.round(score));
  if (recs.some((r) => r.outcome === 'wrong_detain')) stars = Math.min(stars, 2);
  if (score >= 4.99) stars = 5; else stars = Math.min(stars, 4);
  const summary = {
    day: S.day, inspected: recs.length,
    innocent: recs.filter((r) => !r.guilty).length,
    caught: recs.filter((r) => r.outcome === 'caught').length,
    turned: recs.filter((r) => r.outcome === 'turned').length,
    missed: recs.filter((r) => r.outcome === 'missed').length,
    wrongRejected: recs.filter((r) => r.outcome === 'wrong_deny' || r.outcome === 'wrong_detain').length,
    breaches: recs.filter((r) => r.outcome === 'breach').length,
    success: recs.filter((r) => r.ok > 0).length,
    stars, earned, penalties, overtime: over, otPay, bribes: recs.reduce((s, r) => s + r.bribe, 0),
    rep: S.rep, money: S.money
  };
  S.totals.inspected += recs.length;
  S.totals.ok += summary.success;
  S.totals.caught += summary.caught;
  S.totals.missed += summary.missed;
  S.totals.wrong += summary.wrongRejected;
  S.totals.helped += recs.filter((r) => r.outcome === 'helped').length;
  S.totals.earned += earned + 30;
  S.totals.penalties += penalties;
  S.history.push(summary);
  S.lastReport = { summary, records: recs };
  autosave();
  showReport();
}

const RATING = { 5: 'Excellent officer!', 4: 'Commendable work.', 3: 'Adequate. The Republic expects more.', 2: 'Poor. A reprimand has been filed.', 1: 'Unacceptable. Your conduct is under review.' };

function showReport() {
  show('screen-report');
  Sound.setTrack('menu');
  const { summary: s, records } = S.lastReport;
  const marks = { helped: 'ok', correct_deny: 'ok', caught: 'ok', turned: 'part', missed: 'bad', wrong_deny: 'bad', wrong_detain: 'bad', breach: 'bad' };
  const decWord = (r) => (r.decision === 'approve' ? (r.dir === 'out' ? 'Cleared' : 'Admitted') : r.decision === 'deny' ? 'Refused' : 'Detained');
  const row = (label, v) => `<tr><td>${esc(label)}</td><td class="n">${v}</td></tr>`;
  const stars = '★'.repeat(s.stars) + `<span class="off">${'★'.repeat(5 - s.stars)}</span>`;
  const html = `<div class="report">
    <h2>SHIFT ${String(s.day).padStart(2, '0')} — DAILY REPORT</h2>
    <div class="sub">PORT SAN AURELIO · BOOTH ONE · ${esc(S.officer.toUpperCase())} · ${esc(longDate(dayDate(S.day)).toUpperCase())}</div>
    <div class="cols">
      <div><table>
        ${row('People inspected', s.inspected)}
        ${row('Innocent travellers', s.innocent)}
        ${row('Criminals caught', s.caught)}
        ${row('Criminals turned away', s.turned)}
        ${row('Criminals missed', s.missed)}
        ${row('Incorrectly rejected innocent people', s.wrongRejected)}
        ${row('Regulation breaches', s.breaches)}
        ${row('Successful inspections', `${s.success}/${s.inspected}`)}
      </table>
      <div class="stars" aria-label="${s.stars} of 5 stars">${stars}</div>
      <div class="verdict-line">${s.stars}-STAR PERFORMANCE — ${esc(RATING[s.stars].toUpperCase())}</div></div>
      <div><table>
        ${row('Base wage', '30')}
        ${row('Money earned', `+${s.earned}`)}
        ${row('Penalties received', s.penalties)}
        ${s.otPay ? row(`Overtime (${s.overtime} min past shift end)`, `−${s.otPay}`) : ''}
        ${s.bribes ? row('Envelopes (unrecorded)', `+${s.bribes}`) : ''}
        ${row('Savings', `${S.money} aurels`)}
        ${row('Reputation', `${S.rep}/100`)}
        ${row('Criminals caught overall', S.totals.caught)}
        ${row('Innocent travellers helped', S.totals.helped)}
        ${row('Total accuracy', `${accuracy()}%`)}
      </table></div>
    </div>
    <div class="case-list">${records.map((r) => `
      <div class="case"><div class="mark ${marks[r.outcome]}">${marks[r.outcome] === 'ok' ? '✓' : marks[r.outcome] === 'part' ? '~' : '✗'}</div>
      <div><div class="t">${esc(r.name)} (${esc(COUNTRIES[r.nat].adj)}) — ${decWord(r)} · ${esc(r.label)} · ${r.pay >= 0 ? '+' : ''}${r.pay}</div>
      <div class="d">${esc(r.truth)}</div>
      ${r.note ? `<div class="d"><i>${esc(r.note)}</i></div>` : ''}
      ${r.clues.length && marks[r.outcome] !== 'ok' ? `<div class="clue">Clues available: ${esc(r.clues.join(' · '))}</div>` : ''}</div></div>`).join('')}
    </div></div>
    <div class="report-actions"><button class="btn" id="rep-save">Save game</button><button class="btn primary" id="rep-next">${S.rep <= 0 ? 'Report to the Chief' : 'Clock out'}</button></div>`;
  $('report-wrap').innerHTML = html;
  $('report-wrap').scrollTop = 0;
  $('rep-save').addEventListener('click', () => openLoad(true));
  $('rep-next').addEventListener('click', () => {
    Sound.play('click');
    if (S.rep <= 0) return finishEnding('dismissed');
    S.phase = 'evening';
    autosave();
    playEvening();
  });
  Sound.play('type');
}

function playEvening() {
  S.phase = 'evening';
  if (S.endless) { nextDay(); return; }
  if (S.day >= CAMPAIGN_DAYS) {
    const lines = SCENES.final(S);
    playScene(lines, { date: `<b>NIGHT</b> · ${esc(longDate(dayDate(S.day)).toUpperCase())}`, side: eveningSide(), doneLabel: 'Continue', onDone: () => finishEnding(resolveEnding(S, 'stay')), onEnding: (e) => finishEnding(resolveEnding(S, e)) });
    return;
  }
  const f = SCENES['eve' + S.day];
  const lines = f ? f(S) : [L('narrator', 'You walk home along the harbour. The lighthouse turns.')];
  if (S.flags.detainedPenev && S.day === 2 && !S.flags.penevFined) { S.flags.penevFined = true; S.money -= 30; }
  playScene(lines, { date: `<b>EVENING</b> · ${esc(longDate(dayDate(S.day)).toUpperCase())}`, side: eveningSide(), doneLabel: 'Sleep', onDone: nextDay });
}

function eveningSide() {
  const h = S.history[S.history.length - 1];
  return `<div class="memo" style="transform:rotate(-.6deg)"><h3>POCKET NOTEBOOK</h3><div class="from">${esc(S.officer)}</div>
    <p style="margin:0 0 6px">Savings: ${S.money} aurels<br>Reputation: ${S.rep}/100<br>Last shift: ${h ? '★'.repeat(h.stars) : '—'}</p>
    <p style="margin:0;color:#6b5f4a">${esc(makeRng(S.day * 13).pick(RADIO_LINES))}</p></div>`;
}

function nextDay() {
  S.day += 1;
  S.shift = null;
  S.bulletin = [];
  startDay();
}

function finishEnding(key) {
  S.phase = 'ending';
  S.ending = key;
  const got = store.get(KEYS.endings, {});
  got[key] = true;
  store.set(KEYS.endings, got);
  autosave();
  showEnding(key);
}

function showEnding(key) {
  show('screen-ending');
  Sound.setTrack('menu');
  const E = ENDINGS[key] || ENDINGS.quiet;
  const got = store.get(KEYS.endings, {});
  const total = Object.keys(ENDINGS).length;
  const st = S.stats;
  $('ending').innerHTML = `
    <div class="eyebrow">ENDING ${Object.keys(got).length} OF ${total} DISCOVERED</div>
    <h2 class="glow">${esc(E.title)}</h2>
    ${E.text(S).map((p) => `<p>${esc(p)}</p>`).join('')}
    <div class="memo" style="transform:rotate(.4deg)"><h3>SERVICE RECORD</h3><div class="from">${esc(S.officer)} · ${S.history.length} shifts served</div>
      <p style="margin:0">Travellers inspected: ${S.totals.inspected} · Accuracy: ${accuracy()}% · Criminals caught: ${S.totals.caught} · Travellers helped: ${S.totals.helped}<br>
      Savings: ${S.money} aurels · Reputation: ${S.rep}/100 · Envelopes accepted: ${S.totals.bribes} aurels<br>
      Loyalty ${st.party} · Conscience ${st.conscience} · Directorate suspicion ${st.suspicion} · Truth uncovered ${st.truth}</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn primary" id="end-menu">Main menu</button>
      <button class="btn" id="end-new">New campaign</button>
      ${key !== 'dismissed' && key !== 'pier' && key !== 'santa_veronica' ? '<button class="btn" id="end-endless">Continue in endless duty</button>' : ''}
    </div>`;
  $('end-menu').addEventListener('click', renderMenu);
  $('end-new').addEventListener('click', () => openNewGame(false));
  const ee = $('end-endless');
  if (ee) ee.addEventListener('click', () => { S.endless = true; S.phase = 'brief'; S.day += 1; S.shift = null; startDay(); });
}

/* ================= SCENE PLAYER ================= */
function playScene(items, opts) {
  show('screen-scene');
  $('scene-date').innerHTML = opts.date || '';
  const side = $('scene-side');
  const sideHtml = opts.side || '';
  const hasWanted = /WANTED/.test(sideHtml);
  const sideLabel = /POCKET NOTEBOOK/.test(sideHtml) ? 'Pocket notebook' : `Duty order${hasWanted ? ' · wanted bulletin' : ''}`;
  side.innerHTML = sideHtml && isMobile()
    ? `<details class="side-details"${hasWanted ? ' open' : ''}><summary>${sideLabel}</summary><div class="side-inner">${sideHtml}</div></details>`
    : sideHtml;
  side.hidden = !sideHtml;
  paintWanted(side);
  const log = $('scene-log');
  log.innerHTML = '';
  const choicesEl = $('scene-choices');
  const queue = items.slice();
  let i = 0;
  const cont = (label, fn) => {
    choicesEl.innerHTML = '';
    const b = document.createElement('button');
    b.className = 'btn primary';
    b.textContent = label;
    b.addEventListener('click', () => { Sound.play('click'); fn(); });
    choicesEl.appendChild(b);
    UI.sceneNext = fn;
    b.focus({ preventScroll: true });
  };
  const step = () => {
    UI.sceneNext = null;
    if (UI.typing) { UI.typing.finish(); }
    if (i >= queue.length) { cont(opts.doneLabel || 'Continue', () => { UI.sceneNext = null; opts.onDone(); }); return; }
    const it = queue[i++];
    if (it.choices) {
      choicesEl.innerHTML = '';
      it.choices.forEach((ch) => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = ch.text;
        b.disabled = !!ch.disabled;
        b.addEventListener('click', () => {
          Sound.play('click');
          applyFx(ch.fx);
          if (ch.money) { S.money += ch.money; if (ch.money > 0) Sound.play('coin'); }
          if (ch.flag) S.flags[ch.flag] = true;
          addSceneLine({ who: 'you', text: ch.text }, false);
          if (ch.ending) { opts.onEnding ? opts.onEnding(ch.ending) : opts.onDone(); return; }
          queue.splice(i, 0, ...(ch.then || []));
          step();
        });
        choicesEl.appendChild(b);
      });
      return;
    }
    addSceneLine(it, true, () => {});
    cont('Continue ▸', step);
  };
  UI.sceneAdvance = () => { if (UI.typing) { UI.typing.finish(); return; } if (UI.sceneNext) UI.sceneNext(); };
  step();
}

function addSceneLine(it, animate, done) {
  const log = $('scene-log');
  const npc = NPC[it.who] || NPC.narrator;
  const div = document.createElement('div');
  const kind = it.who === 'narrator' ? 'narr' : it.who === 'radio' ? 'radio' : '';
  div.className = `scene-line ${kind}`;
  if (kind) div.innerHTML = '<div class="txt"></div>';
  else if (it.who === 'you') div.innerHTML = `<div></div><div><div class="who" style="color:var(--ochre)">${esc(S.officer.toUpperCase())}</div><div class="txt"></div></div>`;
  else div.innerHTML = `<canvas class="px" width="48" height="56"></canvas><div><div class="who">${esc(npc.name.toUpperCase())}</div><div class="txt"></div></div>`;
  log.appendChild(div);
  const cv = div.querySelector('canvas');
  if (cv && npc.look) Art.photo(cv, npc.look, '#3a4448', { keepHat: true });
  const tx = div.querySelector('.txt');
  if (animate) typeInto(tx, it.text, () => { log.scrollTop = log.scrollHeight; if (done) done(); });
  else tx.textContent = it.text;
  log.scrollTop = log.scrollHeight;
}

/* ================= MODALS ================= */
function openModal(title, bodyHtml, buttons, wide) {
  const m = $('modal');
  m.className = 'modal' + (wide ? ' wide' : '');
  m.innerHTML = `<div class="modal-h"><span>${esc(title)}</span><button class="btn small" id="modal-x" aria-label="Close">✕</button></div><div class="modal-b">${bodyHtml}</div>${buttons && buttons.length ? '<div class="modal-f"></div>' : ''}`;
  const f = m.querySelector('.modal-f');
  (buttons || []).forEach((b) => {
    const el = document.createElement('button');
    el.className = 'btn ' + (b.cls || '');
    el.textContent = b.label;
    el.disabled = !!b.disabled;
    el.addEventListener('click', () => { Sound.play('click'); b.fn(); });
    f.appendChild(el);
  });
  $('modal-x').addEventListener('click', closeModal);
  $('overlay').hidden = false;
  UI.modalOpen = true;
  return m;
}
function closeModal() { $('overlay').hidden = true; UI.modalOpen = false; }

function openPause() {
  if (!S) return;
  openModal('PAUSED', `<p>${esc(S.officer)} · ${S.endless ? 'Endless duty' : 'Day ' + S.day + ' of ' + CAMPAIGN_DAYS} · ${esc(fmtDate(dayDate(S.day)))}</p><p style="color:var(--phos-dim)">Progress autosaves after every traveller.</p>`, [
    { label: 'Quit to menu', fn: () => openModal('QUIT TO MENU', '<p>Return to the main menu? Your autosave from the last traveller will be kept.</p>', [{ label: 'Cancel', fn: openPause }, { label: 'Quit', cls: 'detain', fn: () => { closeModal(); renderMenu(); } }]) },
    { label: 'Settings', fn: openSettings },
    { label: 'Rulebook', fn: () => openRulebook() },
    { label: 'Save / Load', fn: () => openLoad(true) },
    { label: 'Resume', cls: 'primary', fn: closeModal }
  ]);
}

function openLoad(allowSave) {
  const slots = ['auto', 1, 2, 3];
  const body = slots.map((s) => {
    const d = readSave(s);
    const meta = d ? `${esc(d.meta.officer)} · ${d.meta.endless ? 'Endless' : 'Day ' + d.meta.day} · ${d.meta.money} aurels · ${esc(new Date(d.meta.when).toLocaleString('en-GB'))}` : 'Empty';
    return `<div class="slot"><div><b>${s === 'auto' ? 'Autosave' : 'Slot ' + s}</b><div class="meta">${meta}</div></div><div style="display:flex;gap:6px">
      ${allowSave && s !== 'auto' && S ? `<button class="btn small" data-save="${s}">Save here</button>` : ''}
      ${d ? `<button class="btn small primary" data-load="${s}">Load</button>` : ''}</div></div>`;
  }).join('');
  const m = openModal(allowSave ? 'SAVE / LOAD' : 'LOAD GAME', body, [{ label: 'Close', fn: closeModal }]);
  m.querySelectorAll('[data-save]').forEach((b) => b.addEventListener('click', () => { saveGame(b.dataset.save); openLoad(allowSave); }));
  m.querySelectorAll('[data-load]').forEach((b) => b.addEventListener('click', () => loadGame(b.dataset.load === 'auto' ? 'auto' : +b.dataset.load)));
}

function openSettings() {
  const range = (k, label) => `<div class="set-row"><label class="label" for="set-${k}">${label}</label><input type="range" id="set-${k}" min="0" max="1" step="0.05" value="${settings[k]}"></div>`;
  const seg = (k, label, opts) => `<div class="set-row"><span class="label">${label}</span><div class="seg">${opts.map(([v, l]) => `<button class="btn${settings[k] === v ? ' on' : ''}" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  const body = range('master', 'Master volume') + range('music', 'Music') + range('ambience', 'Port ambience') + range('sfx', 'Effects') +
    seg('textSpeed', 'Text speed', [['instant', 'Instant'], ['fast', 'Fast'], ['normal', 'Typewriter']]) +
    seg('crt', 'CRT scanlines', [[true, 'On'], [false, 'Off']]) + seg('flicker', 'Screen flicker', [[true, 'On'], [false, 'Off']]) +
    seg('large', 'Text size', [[false, 'Normal'], [true, 'Large']]) + seg('tips', 'Tutorial tips', [[true, 'On'], [false, 'Off']]);
  const m = openModal('SETTINGS', body, [{ label: 'Done', cls: 'primary', fn: closeModal }]);
  ['master', 'music', 'ambience', 'sfx'].forEach((k) => {
    m.querySelector(`#set-${k}`).addEventListener('input', (e) => { settings[k] = +e.target.value; Sound.unlock(); applySettings(); });
  });
  m.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k;
    const v = b.dataset.v === 'true' ? true : b.dataset.v === 'false' ? false : b.dataset.v;
    settings[k] = v;
    applySettings();
    openSettings();
  }));
}

function fmtPattern(f) { return f.replace(/#/g, '0').replace(/@/g, 'A'); }

function openRulebook(tab) {
  if (!S) return;
  const d = rulesDay();
  const t = tab || UI.rbTab || 'rules';
  UI.rbTab = t;
  const tabs = [['rules', 'Regulations'], ['seals', 'Seals & offices'], ['va', 'Vardonian papers'], ['today', 'Today']];
  let body = `<div class="rb-tabs">${tabs.map(([k, l]) => `<button class="btn small${k === t ? ' primary' : ''}" data-rb="${k}">${l}</button>`).join('')}</div>`;
  if (t === 'rules') {
    body += `<div class="rb-sec">${REGULATIONS.filter((r) => r.day <= d).map((r) => `<div class="rule${!S.endless && r.day === S.day ? ' new' : ''}"><b>${esc(r.id)} · ${esc(r.title.toUpperCase())}${!S.endless && r.day === S.day ? ' · NEW TODAY' : ''}</b>${esc(r.text)}</div>`).join('')}</div>`;
  } else if (t === 'seals') {
    if (d < 2) body += '<p style="color:var(--phos-dim)">The seal register arrives from the Ministry on day 2.</p>';
    const ctry = Object.entries(COUNTRIES).filter(([, c]) => c.minDay <= d);
    body += `<p style="color:var(--phos-dim)">Countries you may encounter today: ${ctry.length}. Issuing offices are listed from day 3, number formats from day 5 (A = letter, 0 = digit).</p>`;
    body += `<div class="reg-table-wrap"><table class="reg-table"><thead><tr><th>Country</th><th>Seal</th><th>Passport offices</th><th>Number format</th></tr></thead><tbody>${ctry.map(([k, c]) => `<tr><td>${esc(c.name)}</td><td>${d >= 2 ? `<span class="sealmini" style="color:${SEAL_COLORS[c.seal.color]}">${c.seal.glyph}</span> ${esc(c.seal.color)}` : '—'}</td><td>${d >= 3 ? esc(c.issuing.join(', ')) : '—'}</td><td style="font-variant-numeric:tabular-nums">${d >= 5 ? esc(fmtPattern(c.fmt)) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
  } else if (t === 'va') {
    const docs = [['Entry Permit', 'interior', 'Foreigners entering, and departing'], ['Exit Visa', 'interior', 'Citizens leaving (day 2+)'], ['Work Permit', 'labour', 'Foreign workers (day 4+)'], ['Maritime Licence', 'harbour', 'Commercial fishermen (day 4+)'], ['Diplomatic Pass', 'party', 'Officials (day 5+)'], ['Vaccination Certificate', 'health', 'Egypt, Tunisia, Lebanon (day 6+)'], ['Press Accreditation', 'information', 'Journalists (day 7+)'], ['Currency Declaration', 'customs', 'Cash over 1,000 USD (day 3+)'], ['Directorate endorsement', 'dss', 'Exit visas (day 10)']];
    body += `<div class="reg-table-wrap"><table class="reg-table"><thead><tr><th>Document</th><th>Seal</th><th>Required for</th></tr></thead><tbody>${docs.map(([n, s, w]) => `<tr><td>${n}</td><td><span class="sealmini" style="color:${SEAL_COLORS[VA_SEALS[s].color]}">${VA_SEALS[s].glyph}</span> ${esc(VA_SEALS[s].text)}</td><td>${w}</td></tr>`).join('')}</tbody></table></div>`;
    body += `<div class="rule"><b>NATIONAL IDENTITY CARD</b>ID numbers start with the holder’s district code.${d >= 8 ? '' : ' (Checked from day 8.)'}</div>`;
    body += `<div class="reg-table-wrap"><table class="reg-table"><thead><tr><th>Code</th><th>District</th></tr></thead><tbody>${Object.entries(DISTRICTS).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</tbody></table></div>`;
  } else {
    body += `<div class="rb-sec">
      <div class="rule"><b>TODAY</b>${esc(longDate(dayDate(S.day)))} — any document expiring before ${esc(fmtDate(dayDate(S.day)))} is invalid.</div>
      <div class="rule"><b>PHOTOGRAPHS</b>Hairstyle, facial hair, glasses and age may change. Face shape, eye colour and complexion may not.</div>
      <div class="rule"><b>LIMITS</b>Cash: ${CASH_LIMIT_USD.toLocaleString('en-GB')} USD undeclared${d >= 3 ? '' : ' (from day 3)'} · Tobacco: ${TOBACCO_LIMIT} cigarettes per adult${d >= 3 ? '' : ' (from day 3)'}</div>
      ${d >= 6 ? `<div class="rule"><b>VACCINATION</b>Required for: ${VACCINE_NATS.map((n) => COUNTRIES[n].name).join(', ')}.</div>` : ''}
      <div class="rule"><b>EVIDENCE</b>Detaining a criminal with evidence (flagged forgery, contraband found, wanted match) earns a 15-aurel bonus.</div>
      <div class="rule"><b>TIME</b>Shift ends ${fmtClock(shiftEnd())}. Overtime costs 5 aurels per 15 minutes. Passport 2 min · ID 1 · Travel papers 2 · Luggage 3 · Examine 3 · Search inside 5 · Question 3 · Security ${COSTS.security}.</div>
    </div>`;
  }
  const m = openModal('RULEBOOK · BORDER POLICE OF VARDONIA', body, [{ label: 'Close', cls: 'primary', fn: closeModal }], true);
  m.querySelectorAll('[data-rb]').forEach((b) => b.addEventListener('click', () => openRulebook(b.dataset.rb)));
}

function openBulletin() {
  if (!S || !S.bulletin.length) return;
  const m = openModal('WANTED BULLETIN', bulletinHtml(), [{ label: 'Close', cls: 'primary', fn: closeModal }]);
  paintWanted(m);
}

function openRegistry() {
  const reg = store.get(KEYS.registry, {});
  const entries = Object.entries(reg);
  const verdictText = { helped: 'Admitted, innocent', correct_deny: 'Refused, invalid papers', caught: 'Detained, guilty', turned: 'Turned away, guilty', missed: 'Admitted, guilty', wrong_deny: 'Refused, innocent', wrong_detain: 'Detained, innocent', breach: 'Admitted against regulations' };
  const body = `<p>Travellers you have processed across all your shifts: <b>${entries.length}</b> of more than 280 in the archive.</p>` +
    (entries.length ? entries.slice(-80).reverse().map(([, r]) => `<div class="slot"><div><b>${esc(r.name)}</b> <span class="meta">${esc(COUNTRIES[r.nat] ? COUNTRIES[r.nat].adj : '')} · ${esc(r.occ)}${r.story ? ' · story' : ''}</span><div class="meta">${esc(verdictText[r.verdict] || r.verdict)} — ${esc(r.truth)}</div></div></div>`).join('') : '<p style="color:var(--phos-dim)">No travellers yet. Report for duty.</p>');
  openModal('REGISTRY OF TRAVELLERS', body, [{ label: 'Close', cls: 'primary', fn: closeModal }], true);
}

function openHowTo() {
  openModal('HOW TO PLAY', `
    <p><b style="color:var(--ochre)">Your job.</b> Five travellers come to your window each shift. Inspect their papers, luggage and story, then stamp a decision.</p>
    <p><b style="color:var(--ochre)">Approve</b> travellers whose papers are valid and whose story holds. <b style="color:var(--ochre)">Deny</b> anyone with expired, missing or mistyped papers. <b style="color:var(--ochre)">Detain</b> smugglers, forgers, wanted persons and anyone carrying contraband.</p>
    <p><b style="color:var(--ochre)">Investigate.</b> Click document fields to flag them. Ask questions and compare the answers with the papers: hotel, length of stay, prior visits, occupation, travelling companions. Examine luggage and search inside anything that seems wrong.</p>
    <p><b style="color:var(--ochre)">Call security</b> to search clothing, bodies and vehicles. You get only a few calls per shift, and an innocent traveller will complain.</p>
    <p><b style="color:var(--ochre)">Time matters.</b> Every action costs minutes. Overtime is fined.</p>
    <p><b style="color:var(--ochre)">Looks lie.</b> A bearded biker may be a piano teacher. A smiling grandmother may be carrying heroin. Judge by evidence.</p>
    <p><b style="color:var(--ochre)">The Republic.</b> Some choices are not in the rulebook. Who you help, who you report and what you choose to see will decide how your story ends. There are ${Object.keys(ENDINGS).length} endings.</p>`, [{ label: 'Close', cls: 'primary', fn: closeModal }]);
}

/* ================= TUTORIAL ================= */
const TUT = [
  { text: 'This is the traveller at your window. Read their appearance and demeanour, but appearances lie: innocent people get nervous, and criminals can be perfectly calm.', target: 'portrait-panel' },
  { text: 'Start with the passport. Press INSPECT PASSPORT (or key 1).', target: 'a-passport', wait: 'passport' },
  { text: 'Check the expiry date against today’s date in the top bar. If a field looks wrong, click it to flag it in red. Flags become evidence, and you can ask the traveller to explain them.', target: 'desk-panel' },
  { text: 'Foreigners entering need an Entry Permit. Open the TRAVEL DOCUMENTS and compare the name and passport number with the passport.', target: 'a-travel', wait: 'travel' },
  { text: 'Now interview them. ASK QUESTIONS opens the list. Answers that contradict the papers are clues.', target: 'a-ask', wait: 'ask' },
  { text: 'Luggage can hide contraband. Examine items, and search inside anything that seems off. Every action costs minutes on the shift clock.', target: 'a-luggage', wait: 'luggage' },
  { text: 'The RULEBOOK (key R) lists every regulation, seal and passport office. It grows as Velkovgrad sends new orders.', target: 'btn-rules' },
  { text: 'Decide. APPROVE valid travellers. DENY bad paperwork. DETAIN criminals and forgers. CALL SECURITY to search clothing and vehicles. This couple looks fine: approve them if you agree.', target: 'controls', wait: 'decide' }
];

function startTutorial() {
  if (!settings.tips) return;
  UI.tut = 0;
  showTip();
}
function showTip() {
  document.querySelectorAll('.hl').forEach((e) => e.classList.remove('hl'));
  if (UI.tut === null || UI.tut >= TUT.length) { $('tip').hidden = true; UI.tut = null; S.tutDone = true; return; }
  const step = TUT[UI.tut];
  $('tip-text').textContent = step.text;
  $('tip').hidden = false;
  $('tip-next').textContent = UI.tut === TUT.length - 1 ? 'Got it' : 'Next';
  const el = $(step.target);
  if (el) el.classList.add('hl');
}
function tutEvent(name) {
  if (UI.tut === null || UI.tut === undefined) return;
  const step = TUT[UI.tut];
  if (step && step.wait === name) { UI.tut += 1; showTip(); }
}

/* ================= PORTRAIT LOOP ================= */
function scenePeople(c) {
  const out = [];
  if (!c) return out;
  if (c.passengers) {
    for (let i = 0; i < c.passengers; i++) out.push({ look: genLook(makeRng(hashStr(c.pid + 'pax' + i)), 'F', 20 + i * 2, 'RO', { expression: 'sad', hat: 'none', glasses: 'none' }), x: [2, 78, 92][i], dim: 0.35, dy: 4 });
  }
  if (c.spouse && c.spouse.look) out.push({ look: Object.assign({}, c.spouse.look, { expression: c.demeanour === 'upset' ? 'sad' : c.spouse.look.expression }), x: 76, dim: 0.22, dy: 3 });
  out.push({ look: c.look, x: 40, main: true });
  (c.kids || []).forEach((k, i) => out.push({ kind: 'kid', kidInfo: k, look: c.look, x: [10, 92, 2][i] }));
  return out;
}

function frame(ts) {
  requestAnimationFrame(frame);
  if (UI.screen !== 'screen-booth') return;
  if (ts - UI.lastFrame < 66) return;
  UI.lastFrame = ts;
  let off = 0;
  if (UI.walk) {
    const k = Math.min(1, (ts - UI.walk.start) / UI.walk.dur);
    off = Math.round(UI.walk.from + (UI.walk.to - UI.walk.from) * k);
    if (k >= 1 && UI.walk.to === 0) UI.walk = null;
  }
  const people = UI.cur ? scenePeople(UI.cur).map((p) => Object.assign({}, p, { x: p.x + off })) : [];
  Art.scene($('scene-canvas'), { weather: weatherToday(), t: ts, people });
}

/* ================= INPUT ================= */
function bindControls() {
  const map = { 'a-passport': 'passport', 'a-id': 'id', 'a-luggage': 'luggage', 'a-travel': 'travel', 'a-ask': 'ask', 'a-approve': 'approve', 'a-deny': 'deny', 'a-security': 'security', 'a-detain': 'detain' };
  Object.entries(map).forEach(([id, a]) => $(id).addEventListener('click', () => { Sound.play('click'); act(a); }));
  document.querySelectorAll('.pane-tab').forEach((t) => t.addEventListener('click', () => { Sound.play('click'); setPane(t.dataset.pane); }));
  $('btn-rules').addEventListener('click', () => openRulebook());
  $('btn-bulletin').addEventListener('click', openBulletin);
  $('btn-pause').addEventListener('click', openPause);
  $('btn-begin').addEventListener('click', () => { Sound.unlock(); Sound.play('stamp'); newGame(); });
  $('btn-new-back').addEventListener('click', renderMenu);
  $('tip-next').addEventListener('click', () => { UI.tut += 1; showTip(); });
  $('tip-skip').addEventListener('click', () => { UI.tut = null; showTip(); });
  $('scene-log').addEventListener('click', () => UI.sceneAdvance && UI.sceneAdvance());
  $('overlay').addEventListener('click', (e) => { if (e.target === $('overlay')) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') { if (e.key === 'Enter' && UI.screen === 'screen-new') newGame(); return; }
    if (e.key === 'Escape') { if (UI.modalOpen) closeModal(); else if (S && (UI.screen === 'screen-booth' || UI.screen === 'screen-scene')) openPause(); return; }
    if (UI.modalOpen) return;
    if (UI.screen === 'screen-scene' && (e.key === ' ' || e.key === 'Enter')) { if (document.activeElement && document.activeElement.tagName === 'BUTTON' && !UI.sceneNext) return; e.preventDefault(); UI.sceneAdvance && UI.sceneAdvance(); return; }
    if (UI.screen !== 'screen-booth') return;
    const k = e.key.toLowerCase();
    const keys = { 1: 'passport', 2: 'id', 3: 'luggage', 4: 'travel', q: 'ask', a: 'approve', d: 'deny', s: 'security', x: 'detain' };
    if (keys[k]) { e.preventDefault(); Sound.play('click'); act(keys[k]); }
    if (k === 'r') openRulebook();
    if (k === 'b') openBulletin();
  });
  document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
}

function boot() {
  applySettings();
  bindControls();
  renderMenu();
  requestAnimationFrame(titleLoop);
  requestAnimationFrame(frame);
}

boot();

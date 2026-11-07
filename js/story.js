'use strict';

const NPC = {
  vasko: { name: 'Chief Inspector Teodor Vasko', short: 'VASKO', look: { sex: 'M', age: 56, skin: 2, hair: 'short', hairColor: 'grey', facial: 'mustache', eyes: 'brown', faceShape: 'square', glasses: 'none', clothes: 'uniform', clothesColor: '#3d4a3a', hat: 'peaked', expression: 'neutral' } },
  mira: { name: 'Officer Mira Solenta', short: 'MIRA', look: { sex: 'F', age: 31, skin: 2, hair: 'bun', hairColor: 'black', facial: 'none', eyes: 'green', faceShape: 'oval', glasses: 'none', clothes: 'uniform', clothesColor: '#3d4a3a', hat: 'none', earrings: true, expression: 'neutral' } },
  bruno: { name: 'Customs Chief Bruno Kalvas', short: 'KALVAS', look: { sex: 'M', age: 49, skin: 2, hair: 'balding', hairColor: 'darkbrown', facial: 'mustache', eyes: 'brown', faceShape: 'round', glasses: 'none', clothes: 'uniform', clothesColor: '#2f3f5a', hat: 'none', expression: 'smile', mole: true } },
  doruk: { name: 'Major Irena Doruk, Directorate of State Security', short: 'DORUK', look: { sex: 'F', age: 46, skin: 1, hair: 'bob', hairColor: 'black', facial: 'none', eyes: 'grey', faceShape: 'long', glasses: 'none', clothes: 'leather', clothesColor: '#1f1f22', hat: 'none', expression: 'neutral' } },
  radio: { name: 'Radio Vardonia', short: 'RADIO', look: null },
  narrator: { name: '', short: '', look: null },
  you: { name: 'You', short: 'YOU', look: null }
};

function basePerson(over) {
  return Object.assign({
    pid: 'S', nat: 'VA', sex: 'M', first: 'Ivo', last: 'Doe', age: 40, look: null, arch: 'beach', personality: 'polite',
    crime: null, hideIdx: null, paper: false, oddity: null, occ: 'clerk', home: 'Velkovgrad', town: 'Costa Lumina',
    stayName: 'Hotel Miramar', stayTown: 'Costa Lumina', stayKind: 'hotel', dur: 7, vehicle: null, company: 'solo',
    spouse: null, kids: [], friend: null, rel: 'brother', relName: 'Petar Danev', relAddr: 'Via del Porto 12', contact: 'Vukaj',
    visits: 0, usd: 300, height: 175, birthMonth: 3, birthDay: 14, cargo: null, boat: 'Santa Lucia', abroad: 'IT', abroadCity: 'Bari', bribe: 0
  }, over);
}

function storyItem(container, name, desc, tell, probe, contraband) {
  return mkItem(container, name, desc, tell, probe, contraband);
}

const STORY_PEOPLE = {
  popescu: {
    make(state) {
      const p = basePerson({
        pid: 'S-popescu', nat: 'RO', sex: 'M', first: 'Ion', last: 'Popescu', age: 52, arch: 'beach', personality: 'polite', occ: 'engineer',
        home: 'Brașov', stayName: 'Hotel Miramar', stayTown: 'Costa Lumina', dur: 10, company: 'spouse', visits: 0,
        spouse: { first: 'Elena', sex: 'F', look: genLook(makeRng(11), 'F', 49, 'RO', { hair: 'perm', hairColor: 'brown', clothes: 'dress', clothesColor: '#7a3a4a', expression: 'smile' }) },
        look: genLook(makeRng(12), 'M', 52, 'RO', { hair: 'parted', hairColor: 'grey', facial: 'mustache', clothes: 'shirt', clothesColor: '#9a8a6a', glasses: 'square', hat: 'none' })
      });
      const c = instantiate(p, state);
      c.greet = ['Good afternoon, officer. My wife and I are going to the southern coast. We booked a room in a small hotel near the beach.', 'Twenty-six years married, and our first holiday by the sea. Elena packed sandwiches for a week.'];
      c.storyAnswers = {
        1: 'Our anniversary. Twenty-six years. I promised Elena the sea in 1961 and only now I keep the promise.',
        10: 'Nervous? Only that Elena will see the bill for the hotel.',
        12: 'No one. The sea, the sun, and my wife’s sandwiches.'
      };
      return c;
    }
  },
  stavro: {
    make(state) {
      const p = basePerson({
        pid: 'S-stavro', nat: 'VA', sex: 'M', first: 'Stavro', last: 'Barbaro', age: 67, arch: 'returning', personality: 'elderly', occ: 'fisherman',
        home: 'Porto Neri', town: 'Porto Neri', company: 'solo',
        look: genLook(makeRng(21), 'M', 67, 'VA', { hair: 'short', hairColor: 'white', facial: 'beard', clothes: 'fisher', clothesColor: '#4a6a7a', hat: 'flatcap', faceShape: 'square' })
      });
      const c = instantiate(p, state);
      c.items = [
        storyItem('Canvas kitbag', 'Fishing nets', 'Two monofilament nets, Italian-made, folded with care.', null, null),
        storyItem('Canvas kitbag', 'Box of hooks and line', 'Hundreds of hooks, sorted by size in matchboxes.', null, null),
        storyItem('Canvas kitbag', 'Letter from his brother', '“Bring the Italian nets, Stavro. The Cooperative nets tear like paper.”', null, null)
      ];
      c.greet = ['I have worked these waters for forty years. I am only bringing some fishing equipment to my brother.', 'Italian nets. The Cooperative ones are made of wishful thinking.'];
      c.storyAnswers = {
        1: 'I live here, boy. Porto Neri. I went to Bari to buy nets because ours are garbage. Don’t write that down.',
        12: 'My brother Kosta. He has a boat, the Bella Rosa. Older than both of us.',
        10: 'At my age, nervous is a luxury.'
      };
      return c;
    }
  },
  hartmann: {
    make(state) {
      const p = basePerson({
        pid: 'S-hartmann', nat: 'DE', sex: 'M', first: 'Klaus', last: 'Hartmann', age: 44, arch: 'business', personality: 'businesslike', occ: 'sales',
        home: 'Stuttgart', stayName: 'Hotel Velkov Palace', stayTown: 'Velkovgrad', dur: 3, visits: 4,
        look: genLook(makeRng(31), 'M', 44, 'DE', { hair: 'slick', hairColor: 'blond', facial: 'none', clothes: 'suit', clothesColor: '#2f3a40', glasses: 'square', expression: 'nervous' })
      });
      const c = instantiate(p, state);
      c.demeanour = 'nervous';
      c.look.expression = 'nervous';
      c.appearance += ' Sweat on his upper lip. Keeps checking his watch.';
      c.greet = ['Listen, officer, I am in a hurry. I have some important business in the capital.', 'The ferry was two hours late. My meeting with the Ministry is at four. Please.'];
      c.storyAnswers = {
        10: 'Because if I miss this meeting I lose a contract for three hundred refrigeration units and my boss loses his mind. That is why.',
        12: 'Comrade Lekaj, Ministry of Foreign Trade. Four o’clock. It is ten past two. You see my problem.'
      };
      return c;
    }
  },
  penev: {
    make(state) {
      const p = basePerson({
        pid: 'S-penev', nat: 'VA', sex: 'M', first: 'Gavril', last: 'Penev', age: 44, arch: 'trucker', personality: 'gruff', occ: 'trucker',
        home: 'Tarsa', town: 'Tarsa', cargo: 'frozen fish meal',
        vehicle: { kind: 'truck', model: 'Kamaz 5320 reefer', color: 'white with a blue star', plate: 'VA 771-07' },
        look: genLook(makeRng(41), 'M', 44, 'VA', { hair: 'short', hairColor: 'black', facial: 'stubble', clothes: 'tshirt', clothesColor: '#2d4f6b', faceShape: 'square', hat: 'cap' })
      });
      const c = instantiate(p, state);
      c.dir = 'out';
      c.purpose = 'State export';
      buildDocs(c, makeRng(42), dayDate(state.day), Math.max(2, state.day), state);
      c.docs.push({
        type: 'transit', title: 'Cooperative Transit Order', authority: 'SEA STAR STATE FISHING COOPERATIVE', seal: VA_SEALS.dss,
        fields: [
          { k: 'vehicle', label: 'Vehicle', v: 'VA 771-07' },
          { k: 'cargo', label: 'Cargo', v: 'Fish meal, frozen, 18 t' },
          { k: 'dest', label: 'Destination', v: 'Bari, Italy' },
          { k: 'order', label: 'Order', v: 'EXEMPT FROM INSPECTION by order of the Directorate' }
        ]
      });
      c.items = [
        storyItem('Lorry cab', 'Cab bunk', 'A blanket, a pin-up calendar, a portrait of Velkov taped to the dash.', null, null),
        storyItem('Reefer trailer', 'Crates of fish meal', 'Stacked crates stencilled with a blue star.', 'One crate is lighter than the rest, and the frost on it looks painted on.', 'Beneath a layer of fish meal: bricks of brown heroin, each stamped with the same blue star.', true),
        storyItem('Lorry cab', 'Thermos', 'Coffee, black, with something stronger in it.', null, null)
      ];
      c.greet = ['Sea Star. You know the truck. Transit order’s on top.', 'Don’t open the trailer, comrade, the cold gets out. Fish meal. Eighteen tonnes of it.'];
      c.storyAnswers = {
        1: 'Export. Fish meal to Bari. Every Tuesday and Friday since 1984.',
        5: 'Read the transit order. Then read it again.',
        6: 'The cannery packed it. In Tarsa. Near Santa Veronica.',
        10: 'I’m not nervous. You should be.',
        12: 'A buyer in Bari. You don’t want his name.'
      };
      c.expected = 'approve';
      c.guilty = false;
      c.storyNote = 'Sea Star trucks are exempt by Directorate order.';
      return c;
    },
    judge(dec, c, S) {
      const probed = c.items.some((i) => i.contraband && i.probed);
      if (probed) S.flags.sawHeroin = true;
      if (dec === 'approve') {
        if (probed) { S.stats.truth += 1; return { outcome: 'helped', note: 'You saw what was in the crate. You stamped it anyway.' }; }
        return { outcome: 'helped', note: 'Waved through, as ordered.' };
      }
      if (dec === 'detain') {
        S.stats.suspicion += 2; S.stats.party -= 1; S.stats.truth += 1; S.flags.detainedPenev = true;
        return { outcome: 'breach', note: 'You detained a Sea Star driver. The Directorate released him within the hour.' };
      }
      S.stats.suspicion += 1;
      return { outcome: 'breach', note: 'You refused a Sea Star truck. Someone made a phone call.' };
    }
  },
  mardare: {
    make(state) {
      const p = basePerson({
        pid: 'S-mardare', nat: 'YU', sex: 'M', first: 'Ilija', last: 'Mardešić', age: 51, arch: 'leaving', personality: 'charming', occ: 'trader',
        home: 'Split', stayName: 'Hotel Sultana', stayTown: 'Kalimor', dur: 6, visits: 9,
        vehicle: { kind: 'van', model: 'Zastava Rival van', color: 'olive green', plate: 'YU 418-22' },
        look: genLook(makeRng(51), 'M', 51, 'YU', { hair: 'slick', hairColor: 'grey', facial: 'mustache', clothes: 'suit', clothesColor: '#7a6a4a', expression: 'smile' })
      });
      const c = instantiate(p, state);
      c.items = [
        storyItem('Van', 'Crate: “Restoration materials”', 'A wooden crate packed with straw.', 'Painted panels in the straw. Inventory numbers on the back: “St. N. P.N. 14”.', 'Seven icons from the Church of St. Nikolas, Porto Neri. Reported stolen last month.', true),
        storyItem('Van', 'Invoice', 'An invoice for “gilding supplies” from a workshop in Kalimor.', null, null),
        storyItem('Suitcase', 'Clothes', 'Silk shirts and a bottle of cologne.', null, null)
      ];
      c.guilty = true; c.crime = 'stolen'; c.expected = 'detain';
      c.crimeText = 'Seven icons stolen from the Church of St. Nikolas, Porto Neri.';
      c.clues = ['Luggage: restoration crate holds church icons with inventory numbers'];
      c.greet = ['Ah, you must be the new officer. Bruno speaks highly of you. Very highly.', 'Restoration materials for a workshop in Split. Old paint, old wood. Boring things.'];
      c.storyAnswers = {
        1: 'Business. I restore antiques. Furniture, frames. Very respectable.',
        5: 'Nothing that interests you, my friend.',
        10: 'Me? I am never nervous. I have friends.',
        12: 'I met friends. Your Customs Chief, for one. Lovely man.'
      };
      return c;
    },
    judge(dec, c, S) {
      if (dec === 'approve') {
        if (S.flags.brunoDeal) return { outcome: 'missed', note: 'The icons left the country. Bruno’s envelope stayed in your pocket.' };
        return { outcome: 'missed', note: 'Stolen church icons left the country under your stamp.' };
      }
      if (dec === 'detain') {
        if (S.flags.brunoDeal) { S.flags.brunoBetrayed = true; S.stats.suspicion += 1; }
        S.stats.party += 1;
        return { outcome: 'caught', note: S.flags.brunoDeal ? 'You took Bruno’s money and detained his man anyway. He will not forget.' : 'Icons recovered for the Church of St. Nikolas.' };
      }
      return { outcome: 'turned', note: 'Turned away. The icons will find another border.' };
    }
  },
  claire: {
    make(state) {
      const p = basePerson({
        pid: 'S-claire', nat: 'GB', sex: 'F', first: 'Claire', last: 'Whitlock', age: 34, arch: 'beach', personality: 'charming', occ: 'journalist',
        home: 'London', stayName: 'Hotel Sultana', stayTown: 'Kalimor', dur: 5, visits: 0,
        look: genLook(makeRng(61), 'F', 34, 'GB', { hair: 'bob', hairColor: 'auburn', clothes: 'coat', clothesColor: '#9a8a6a', glasses: 'round', faceShape: 'oval', hat: 'none', expression: 'smile' })
      });
      const c = instantiate(p, state);
      c.items = [
        storyItem('Suitcase', 'Summer clothes', 'Linen, cotton, a swimsuit that has never touched water.', null, null),
        storyItem('Shoulder bag', 'Camera and film', 'A Nikon with a 135 mm lens. Thirty rolls of film.', 'Thirty rolls is a lot of film for five days of beaches.', 'All unexposed. Nothing on them yet.', false),
        storyItem('Shoulder bag', 'Notebook', 'Shorthand, mostly. A few names in plain letters.', 'One name is underlined twice: “M. Orlan — Kalimor”.', 'Beside it: “Santa Veronica? Sea Star? Ask about the night boats.”', false),
        storyItem('Suitcase', 'Guidebook', '“The Vardonian Riviera”, the Kalimor chapter dog-eared.', null, null)
      ];
      c.greet = ['Good afternoon. Five days in Kalimor, I’m told the old bazaar is marvellous.', 'I’m a teacher. Well. I’m on holiday from being a teacher.'];
      c.storyAnswers = {
        1: 'The Ottoman quarter. The light. A rest from the rain in London.',
        4: ['Teacher. English literature. Very dull.', 'Fine. I write things. Travel pieces. Is that a crime here?'],
        10: 'Am I? Must be the uniforms. You all look so terribly serious.',
        12: 'No one in particular. I hope to meet the sea.'
      };
      c.extraQuestions = [{ id: 'warn', text: '[Quietly] You are being watched.', once: true, answer: 'She holds your gaze for a long second. “Thank you,” she says, very softly. “I rather thought I might be.”', fx: { conscience: 1, suspicion: 1 }, flag: 'claireWarned' }];
      c.expected = 'approve';
      c.storyNote = 'Directorate order: admit her.';
      return c;
    },
    judge(dec, c, S) {
      const readNotebook = c.items.some((i) => i.name === 'Notebook' && i.examined);
      if (readNotebook) S.flags.sawNotebook = true;
      if (dec === 'approve') { S.flags.claireIn = true; return { outcome: 'helped', note: 'Admitted. The Directorate will be watching her.' }; }
      if (dec === 'detain') { S.stats.party -= 1; S.stats.suspicion += 1; return { outcome: 'wrong_detain', note: 'Detained a British citizen with valid papers. Doruk is furious: “You arrested my bait.”' }; }
      S.stats.party -= 1;
      return { outcome: 'wrong_deny', note: 'Refused entry against a Directorate order.' };
    }
  },
  raskov: {
    make(state) {
      const p = basePerson({
        pid: 'S-raskov', nat: 'VA', sex: 'M', first: 'Dimitar', last: 'Raskov', age: 61, arch: 'returning', personality: 'arrogant', occ: 'manager',
        home: 'Velkovgrad', town: 'Velkovgrad', vehicle: { kind: 'car', model: 'Mercedes 230E', color: 'black', plate: 'VA 001-14' },
        look: genLook(makeRng(71), 'M', 61, 'VA', { hair: 'slick', hairColor: 'grey', facial: 'none', clothes: 'suit', clothesColor: '#2f3a40', faceShape: 'round', glasses: 'none', expression: 'neutral' })
      });
      const c = instantiate(p, state);
      c.diplomat = true;
      c.docs[0].fields.find((f) => f.k === 'occ').v = 'Minister of Tourism';
      c.docs.push({
        type: 'diplomatic', title: 'Diplomatic Pass', authority: 'CENTRAL COMMITTEE · PEOPLE’S SOCIALIST PARTY', seal: VA_SEALS.party,
        fields: [
          { k: 'name', label: 'Name', v: 'RASKOV, Dimitar' },
          { k: 'office', label: 'Office', v: 'Minister of Tourism' },
          { k: 'until', label: 'Valid until', v: fmtDate(addDays(dayDate(state.day), 400)) }
        ]
      });
      c.items = [
        storyItem('Car boot', 'Italian suits', 'Four tailored suits from Milan, still in their bags.', null, null),
        storyItem('Car boot', 'Whisky', 'Three bottles of single malt. A gift, he says, for the Supreme Leader.', null, null),
        storyItem('Briefcase', 'Bank envelope', 'A thick envelope from a bank in Zurich.', 'Addressed to the Ministry of Tourism, but marked “PERSONAL — A.V.”', 'A statement for a numbered account: holder A. VELKOV. Balance: 41,200,000 Swiss francs. Deposits from “Sea Star Export”.', false)
      ];
      c.greet = ['Do you know who I am? Of course you do. Stamp it, Officer. I have a plane to catch, and you have a career to keep.', 'The Diplomatic Pass is on top. Don’t make me ask twice.'];
      c.storyAnswers = {
        1: 'I am the Minister of Tourism. I am returning from promoting your beaches in Milan. You’re welcome.',
        5: 'Nothing that concerns a border policeman.',
        10: 'I am not nervous. I am late. There is a difference.',
        11: 'Enough. Do I look like a man who counts his own money?',
        12: 'The Supreme Leader. Would you like to come along and explain the delay yourself?'
      };
      c.expected = 'approve';
      return c;
    },
    judge(dec, c, S) {
      const probed = c.items.some((i) => i.name === 'Bank envelope' && i.probed);
      if (probed) { S.flags.sawSwiss = true; S.stats.truth += 1; }
      if (dec === 'approve') { S.stats.party += 1; return { outcome: 'helped', note: probed ? 'You read the Zurich statement. Then you saluted.' : 'The Minister passed. He did not look at you.' }; }
      if (dec === 'detain') { S.stats.party -= 3; S.stats.suspicion += 3; S.money -= 50; return { outcome: 'wrong_detain', note: 'You detained a Minister. He was released in eleven minutes. You were fined 50 aurels.' }; }
      S.stats.party -= 2; S.stats.suspicion += 1;
      return { outcome: 'wrong_deny', note: 'You refused a Minister with a valid Diplomatic Pass. He used your phone to call Velkovgrad.' };
    }
  },
  kordic: {
    make(state) {
      const p = basePerson({
        pid: 'S-kordic', nat: 'VA', sex: 'M', first: 'Stanislav', last: 'Kordić', age: 52, arch: 'returning', personality: 'arrogant', occ: 'soldier',
        home: 'Tarsa', town: 'Tarsa',
        look: genLook(makeRng(81), 'M', 52, 'VA', { hair: 'short', hairColor: 'grey', facial: 'mustache', clothes: 'military', clothesColor: '#4f5a36', hat: 'peaked', faceShape: 'square', expression: 'angry' })
      });
      const c = instantiate(p, state);
      const idc = c.docs.find((d) => d.type === 'idcard');
      const exp = addDays(dayDate(state.day), -94);
      idc.fields.find((f) => f.k === 'expiry').v = fmtDate(exp);
      c.defects = [{ code: 'idExpired', doc: 'idcard', field: 'expiry', note: 'Identity card expired', explain: 'expired' }];
      c.demeanour = 'hostile';
      c.greet = ['Colonel Kordić, Coastal Army Command. I don’t queue, and I don’t wait. Stamp it.', 'My driver is outside. My men are waiting. Your little booth is wasting the Army’s time.'];
      c.storyAnswers = {
        9: 'Expired? An administrative trifle. I am a Colonel of the Republic. My face is my identity card.',
        10: 'Nervous? Boy, I have commanded artillery. I am irritated.',
        12: 'General Dushku. Ring him, if you want to lose your job before lunch.'
      };
      c.expected = 'deny';
      return c;
    },
    judge(dec, c, S) {
      if (dec === 'approve') { S.stats.party += 1; return { outcome: 'breach', note: 'You let the Colonel through on an expired identity card. He did not thank you.' }; }
      if (dec === 'detain') { S.stats.party -= 2; S.stats.suspicion += 1; return { outcome: 'wrong_detain', note: 'You detained an Army colonel over an expired card. Two lorries of soldiers arrived within the hour.' }; }
      S.stats.party -= 1; S.flags.kordicDenied = true;
      return { outcome: 'correct_deny', note: 'Refused. “You’ll regret this, Officer.” The regulations were on your side.' };
    }
  },
  varga: {
    make(state) {
      const p = basePerson({
        pid: 'S-varga', nat: 'YU', sex: 'M', first: 'Luka', last: 'Varić', age: 41, arch: 'beach', personality: 'polite', occ: 'mechanic',
        home: 'Split', stayName: 'Pensione Delfino', stayTown: 'Porto Neri', dur: 8, visits: 0, height: 181,
        look: Object.assign({}, STORY_PEOPLE.varga.wantedLook, { hair: 'short', facial: 'stubble', hat: 'none' })
      });
      const c = instantiate(p, state);
      c.issuedIn = 'Split';
      c.docs[0].fields.find((f) => f.k === 'issued').v = 'Split';
      c.defects = [{ code: 'wrongCity', doc: 'passport', field: 'issued', note: DEFECT_NOTES.wrongCity, explain: 'generic', forged: true }];
      c.guilty = true; c.crime = 'forged'; c.expected = 'detain';
      c.wanted = { alias: 'Lucan Varga' };
      c.crimeText = 'Lucan Varga, wanted for the murder of a customs officer in Tarsa, travelling on a forged Yugoslav passport.';
      c.clues = ['Matches the wanted bulletin: height 181, scar on left cheek, brown eyes', 'Passport issued in Split (no passport office)'];
      c.bribe = 500;
      c.greet = ['Good afternoon. A week in Porto Neri, a little fishing, a little wine.', 'Beautiful day, no? Your colleague in the other booth looks very busy.'];
      c.storyAnswers = {
        4: 'Mechanic. Boat engines. I fix what the sea breaks.',
        8: 'Never. First time. A beautiful country, I hear.',
        9: 'Split, yes. Is there no office in Split? There must be. I got it there.',
        10: 'I am a calm man. Ask anyone.'
      };
      return c;
    },
    wantedLook: { sex: 'M', age: 41, skin: 2, hair: 'long', hairColor: 'black', facial: 'beard', eyes: 'brown', faceShape: 'long', glasses: 'none', clothes: 'shirt', clothesColor: '#5d6b3a', hat: 'none', scar: true, earrings: false, mole: false, expression: 'neutral' },
    judge(dec, c, S) {
      if (dec === 'detain') { S.money += 50; S.stats.party += 1; return { outcome: 'caught', note: 'Lucan Varga in custody. A 50-aurel bounty is added to your pay.' }; }
      if (dec === 'approve') { S.flags.vargaFree = true; return { outcome: 'missed', note: 'Lucan Varga walked into Vardonia under your stamp.' }; }
      return { outcome: 'turned', note: 'Turned back. Varga will try another port.' };
    }
  },
  lund: {
    make(state) {
      const p = basePerson({
        pid: 'S-lund', nat: 'SE', sex: 'M', first: 'Henrik', last: 'Lund', age: 38, arch: 'beach', personality: 'cheerful', occ: 'journalist',
        home: 'Göteborg', stayName: 'Hotel Riviera', stayTown: 'Costa Lumina', dur: 6,
        look: genLook(makeRng(91), 'M', 38, 'SE', { hair: 'long', hairColor: 'blond', facial: 'beard', clothes: 'floral', glasses: 'round' })
      });
      const c = instantiate(p, state);
      c.items.push(storyItem('Shoulder bag', 'Press card', 'A Swedish press card: “Göteborgs Kuriren”.', null, null));
      c.defects = [{ code: 'nopress', doc: 'press', field: null, note: DEFECT_NOTES.nopress, explain: 'missing' }];
      c.expected = 'deny';
      c.greet = ['Hej! Holiday, holiday. Well. A little holiday, a little writing. Mostly holiday.', 'My editor wants a piece on socialist beach culture. Very light. Very sunny.'];
      c.storyAnswers = {
        4: 'Journalist, yes. But on holiday! I promise to write only about ice cream.',
        9: 'Press accreditation? Since when? Last year nobody asked.'
      };
      return c;
    }
  },
  lazar: {
    make(state) {
      const p = basePerson({
        pid: 'S-lazar', nat: 'VA', sex: 'M', first: 'Daniel', last: 'Lazar', age: 38, arch: 'departing', personality: 'anxious', occ: 'teacher',
        home: 'Kalimor', town: 'Kalimor', company: 'family', abroad: 'IT', abroadCity: 'Bari', dur: 14,
        spouse: { first: 'Ana', sex: 'F', look: genLook(makeRng(101), 'F', 35, 'VA', { hair: 'scarf', hat: 'scarf', clothes: 'coat', clothesColor: '#5a4a6a', expression: 'sad' }) },
        kids: [{ name: 'Petra', age: 9, sex: 'F' }, { name: 'Luka', age: 6, sex: 'M' }],
        look: genLook(makeRng(102), 'M', 38, 'VA', { hair: 'short', hairColor: 'darkbrown', facial: 'stubble', clothes: 'sweater', clothesColor: '#3f4a5a', glasses: 'round', expression: 'sad' })
      });
      const c = instantiate(p, state);
      c.docs = c.docs.filter((d) => d.type !== 'exitvisa');
      c.defects = [{ code: 'noexit', doc: 'exitvisa', field: null, note: DEFECT_NOTES.noexit, explain: 'missing' }];
      c.demeanour = 'upset';
      c.guilty = true; c.crime = 'fugitive'; c.political = true;
      c.crimeText = 'The Lazar family, attempting to emigrate without exit visas.';
      c.greet = ['Please. Please, officer, listen before you call anyone.', 'Our son Marko is fifteen. He told a joke about the Supreme Leader at school. Six weeks ago they took him to Santa Veronica. Last night a man came to our door and said: you are next. We have no exit visa. We have only this ferry.'];
      c.storyAnswers = {
        1: 'To live. That is the whole reason.',
        2: 'Bari. My wife’s cousin. And then I don’t know.',
        9: 'There is no exit visa. You know there is no exit visa. Nobody gets one for a family of four.',
        10: 'Because I am asking a stranger in a uniform to save my children’s lives.',
        12: 'Nobody. We just need to be on the other side of the water.'
      };
      c.extraQuestions = [{ id: 'son', text: 'Ask about their son.', once: true, answer: 'Ana answers, very quietly. “The letters stopped after two weeks. A neighbour who works at the Tarsa cannery says the prisoners on Santa Veronica pack crates for Sea Star at night. Fish meal, they say. Nobody packs fish meal at night.”', fx: { truth: 1 }, flag: 'heardSantaVeronica' }];
      c.expected = 'detain';
      c.storyNote = 'By regulation: citizens without an Exit Visa attempting to leave are detained.';
      return c;
    },
    judge(dec, c, S) {
      if (dec === 'approve') { S.flags.lazarFree = true; S.stats.conscience += 3; S.stats.suspicion += 2; return { outcome: 'missed', note: 'The Lazar family boarded the Bari ferry. Officially, you made a mistake.' }; }
      if (dec === 'detain') { S.stats.party += 2; S.stats.conscience -= 3; S.flags.lazarDetained = true; return { outcome: 'caught', note: 'The Lazar family was taken by the Directorate. The children did not cry. That was the worst part.' }; }
      S.stats.conscience -= 1; S.flags.lazarSentHome = true;
      return { outcome: 'turned', note: 'You sent the Lazars home. Where the man at the door said they were next.' };
    }
  },
  orlan: {
    make(state) {
      const p = basePerson({
        pid: 'S-orlan', nat: 'AT', sex: 'M', first: 'Matthias', last: 'Ortner', age: 58, arch: 'leaving', personality: 'polite', occ: 'scientist',
        home: 'Graz', stayName: 'Hotel Sultana', stayTown: 'Kalimor', dur: 9, visits: 0, height: 174,
        look: Object.assign({}, STORY_PEOPLE.orlan.wantedLook, { facial: 'none', hair: 'short', clothes: 'coat', clothesColor: '#3f4a5a', hat: 'fedora' })
      });
      const c = instantiate(p, state);
      c.issuedIn = 'Innsbruck';
      c.docs[0].fields.find((f) => f.k === 'issued').v = 'Innsbruck';
      c.defects = [{ code: 'wrongCity', doc: 'passport', field: 'issued', note: DEFECT_NOTES.wrongCity, explain: 'generic', forged: true }];
      c.items = [
        storyItem('Suitcase', 'Clothes', 'Two shirts, a cardigan, all worn thin.', null, null),
        storyItem('Suitcase', 'Notebook in oilcloth', 'A thick notebook wrapped in oilcloth.', 'Written in Vardonian, by an “Austrian”.', 'Cargo manifests from Sea Star, water samples logged off Santa Veronica, and photographs: prisoners in grey loading blue-star crates under floodlights. Enough to bring down a government.', true),
        storyItem('Coat pocket', 'Ferry ticket stub', 'Ancona, one way.', null, null)
      ];
      c.guilty = true; c.crime = 'fugitive'; c.political = true; c.expected = 'detain';
      c.wanted = { alias: 'Prof. Matej Orlan' };
      c.crimeText = 'Professor Matej Orlan, carrying evidence of the Sea Star trade.';
      c.clues = ['Matches the wanted bulletin for Prof. Orlan (height 174, blue eyes, beard shaved)', 'Passport issued in Innsbruck (no passport office)', 'Notebook written in Vardonian'];
      c.greet = state.flags.lighthouse && !state.flags.miraReported
        ? ['Good afternoon. Tell me, officer, is the weather in Graz as fine as it is here?', 'He smiles, but his hand on the counter is shaking.']
        : ['Good afternoon. Returning home to Graz. A pleasant holiday, very pleasant.', 'He speaks German with care, the way people speak a language learned from books.'];
      c.storyAnswers = {
        1: 'Going home. Graz. My university.',
        4: 'Oceanographer. I measure... water. Temperature. What is in it.',
        9: 'Innsbruck. Yes. Is that not... I was told Innsbruck was fine.',
        10: 'Because I am old, and tired, and very far from home.',
        12: 'Nobody. Nobody at all.'
      };
      c.extraQuestions = [{ id: 'notebook', text: 'Ask what the notebook is.', once: true, answer: '“The truth,” he says in perfect Vardonian. “What Sea Star carries. Who loads it. Where the money goes. If you take it from me, nobody outside will ever know. If you let me go, everybody will.”', fx: { truth: 2 }, flag: 'orlanSpoke' }];
      return c;
    },
    wantedLook: { sex: 'M', age: 58, skin: 1, hair: 'parted', hairColor: 'white', facial: 'beard', eyes: 'blue', faceShape: 'oval', glasses: 'round', clothes: 'coat', clothesColor: '#3f4a5a', hat: 'none', scar: false, earrings: false, mole: true, expression: 'neutral' },
    judge(dec, c, S) {
      if (dec === 'approve') {
        S.flags.orlanFree = true; S.stats.conscience += 3;
        S.stats.suspicion += S.flags.lighthouse && !S.flags.miraReported ? 1 : 2;
        return { outcome: 'missed', note: 'Professor Orlan boarded the Ancona ferry with his notebook.' };
      }
      if (dec === 'detain') { S.flags.orlanDetained = true; S.stats.party += 3; S.stats.conscience -= 3; S.money += 100; return { outcome: 'caught', note: 'Orlan detained. Major Doruk sent a bottle of brandy and 100 aurels.' }; }
      S.stats.conscience -= 1;
      return { outcome: 'turned', note: 'Turned back. He was arrested at the bus station an hour later.' };
    }
  },
  claireOut: {
    make(state) {
      const c = STORY_PEOPLE.claire.make(state);
      c.pid = 'S-claire-out';
      c.dir = 'out';
      c.items = [
        storyItem('Suitcase', 'Summer clothes', 'Crumpled now. Sand in the seams.', null, null),
        storyItem('Shoulder bag', 'Camera', 'The Nikon. The film counter reads zero. No film inside.', 'An empty camera, at the end of a holiday.', 'Nothing.', false),
        storyItem('Suitcase', 'Guidebook', '“The Vardonian Riviera”. The spine is stiff and new.', 'The spine is too thick for the pages.', 'Inside the spine: twelve rolls of exposed film and copied pages of Sea Star manifests.', true)
      ];
      c.docs.find((d) => d.type === 'permit').fields.find((f) => f.k === 'until').v = fmtDate(addDays(dayDate(state.day), 1));
      c.greet = ['Hello again. It seems the holiday is over.', 'She glances, once, at the woman in the leather coat sitting behind you.'];
      c.storyAnswers = {
        1: 'Home. London. Rain. I can hardly wait.',
        5: 'Only memories. And a sunburn.',
        10: 'Because there is a Directorate officer sitting behind you, and she has not blinked in five minutes.',
        12: 'My editor. I mean, my headmaster.'
      };
      c.extraQuestions = state.stats.truth >= 2 ? [{ id: 'evidence', text: 'Pass her what you know about Sea Star.', once: true, answer: 'You write three lines on the back of a stamp slip: the blue star, the Zurich account, the night crates. You slide it under her passport. She does not look down.', fx: { suspicion: 2, truth: 1 }, flag: 'gaveEvidence' }] : [];
      c.guilty = true; c.crime = 'spy'; c.expected = 'detain';
      c.crimeText = 'Twelve rolls of film and Sea Star manifests hidden in a guidebook.';
      c.clues = ['Guidebook spine too thick; empty camera at the end of a holiday', 'Directorate order: undeveloped film may not leave the country'];
      c.storyNote = 'Directorate order today: confiscate any undeveloped film.';
      return c;
    },
    judge(dec, c, S) {
      const probed = c.items.some((i) => i.contraband && i.probed);
      if (dec === 'approve') {
        S.flags.claireOut = true; S.stats.conscience += 2;
        S.stats.suspicion += probed ? 3 : 1;
        return { outcome: 'missed', note: probed ? 'You saw the film and let her go, with Doruk sitting behind you.' : '“You did not check the book,” Doruk says, and writes something down.' };
      }
      if (dec === 'detain') { S.stats.party += 2; S.stats.conscience -= 2; S.flags.claireDetained = true; return { outcome: 'caught', note: 'Claire Whitlock was expelled the next morning. The film was burned in the harbour office stove.' }; }
      S.flags.claireDenied = true;
      return { outcome: 'turned', note: 'Refused exit. Doruk’s men walked her to a car.' };
    }
  },
  penev2: {
    make(state) {
      const c = STORY_PEOPLE.penev.make(state);
      c.pid = 'S-penev2';
      c.items[1] = storyItem('Reefer trailer', 'Crates of fish meal', 'Twice as many crates as last time, stacked to the roof.', 'They are not cold at all.', 'Heroin. Not bricks this time: whole crates of it. Kalvas’s customs seal is on every one.', true);
      c.greet = ['Last run before the emergency closes the port. Kalvas says hello.', 'Big load. Same order. Don’t be a hero, comrade.'];
      return c;
    },
    judge(dec, c, S) {
      const probed = c.items.some((i) => i.contraband && i.probed);
      if (probed) S.stats.truth += 1;
      if (dec === 'approve') return { outcome: 'helped', note: 'The last Sea Star truck crossed. The port closed behind it.' };
      if (dec === 'detain') {
        S.flags.detainedPenev2 = true; S.stats.suspicion += 3; S.stats.party -= 2; S.stats.truth += 1;
        return { outcome: 'breach', note: 'You detained the last Sea Star truck in front of forty witnesses. Word spread through the port in minutes.' };
      }
      S.stats.suspicion += 1;
      return { outcome: 'breach', note: 'You refused the Sea Star truck. It went to another booth.' };
    }
  }
};

const DAY_PLAN = {
  1: { weather: 'clear', slots: ['popescu', 'stavro', { paper: true }, { crime: 'cigarettes' }, 'hartmann'], tutorial: true },
  2: { weather: 'storm', slots: [{}, 'penev', { paper: true }, { arch: 'family' }, { crime: true }] },
  3: { weather: 'clear', slots: [{}, { crime: true }, {}, 'mardare', { paper: true }], mid: { before: 2, scene: 'bruno' } },
  4: { weather: 'clear', slots: [{ crime: true }, {}, 'claire', { paper: true }, { crime: true }] },
  5: { weather: 'haze', slots: [{}, 'raskov', { crime: true }, 'kordic', {}], bulletin: true },
  6: { weather: 'clear', slots: [{ paper: true }, { crime: true }, 'varga', {}, {}], bulletin: true },
  7: { weather: 'clear', slots: [{}, 'lund', { crime: true }, 'lazar', {}] },
  8: { weather: 'haze', slots: [{ crime: true }, {}, { paper: true }, 'orlan', {}], bulletin: true },
  9: { weather: 'storm', slots: [{}, { crime: true }, 'claireOut', {}, { paper: true }], watch: true },
  10: { weather: 'dusk', slots: [{ crime: true }, { paper: true }, 'penev2', {}, { crime: true }] }
};

function L(who, text) { return { who, text }; }

const SCENES = {
  brief1: (S) => [
    L('narrator', 'Port San Aurelio. 07:52. The Bari ferry sounds its horn twice. Somewhere a radio plays the national anthem, slightly too fast.'),
    L('vasko', `So you are the new one. ${S.officer}. Badge 0417. Your predecessor was transferred. Do not ask where.`),
    L('vasko', 'The work is simple. Passport. Papers. Bags. Questions. Then you stamp: admit, refuse, or detain. Five travellers a shift. The Republic pays for every correct decision and fines you for every wrong one.'),
    L('vasko', 'Your rulebook is on the desk. Read it. The Republic changes its mind often, and it expects you to keep up.'),
    L('vasko', 'One more thing. Trucks of the Sea Star Fishing Cooperative are not your concern. You will understand.'),
    { choices: [
      { text: '“Understood, Chief.”', fx: { party: 1 }, then: [L('vasko', 'Good. You will go far. Or at least, you will stay where you are, which these days is the same thing.')] },
      { text: '“Why shouldn’t I inspect them?”', fx: { truth: 0 }, flag: 'askedSeaStar', then: [L('vasko', 'Because I said so. And someone said so to me. And someone said so to him. That is how a Republic works, Officer.')] }
    ] }
  ],
  eve1: (S) => [
    L('narrator', 'The last ferry leaves at six. The booth smells of ink and diesel. A woman in the same grey uniform leans on your counter.'),
    L('mira', 'Mira Solenta. Booth two. You did not panic once today. Most rookies cry by Wednesday.'),
    L('mira', 'A piece of advice, between colleagues. When you see a white truck with a blue star, look at the sea instead. The sea is very beautiful here.'),
    { choices: [
      { text: '“What’s in those trucks?”', fx: { truth: 1 }, then: [L('mira', 'Fish meal. Officially. Unofficially, I have a mother, a cat and a pension. Goodnight, Officer.')] },
      { text: '“I’ll keep that in mind.”', fx: {}, then: [L('mira', 'Good. See you tomorrow. Bring a coat. The radio says sunshine, which means a storm.')] }
    ] }
  ],
  brief2: (S) => [
    L('narrator', 'The mistral came in the night. The Patras ferry is six hours late. The queue is soaked, furious, and long.'),
    L('vasko', 'Two new regulations from the Ministry. Citizens leaving need an Exit Visa. And from today you check the passport seals against the register. Forgers are getting lazy. Do not you get lazy.'),
    L('radio', 'RADIO VARDONIA: Storm warnings are a capitalist exaggeration. Comrade Velkov reminds fishermen that bad weather builds character.')
  ],
  eve2: (S) => {
    const out = [];
    if (S.flags.detainedPenev) {
      out.push(L('vasko', 'You detained a Sea Star driver. Do you know who called me? Not the Cooperative. The Directorate. The man was released in forty minutes and you are docked thirty aurels.'));
      out.push(L('vasko', 'I covered for you this once. There will not be a twice.'));
    } else if (S.flags.sawHeroin) {
      out.push(L('mira', 'You opened a Sea Star crate. Don’t tell me what you saw. Don’t tell anyone. Especially not Vasko. He has children.'));
    } else {
      out.push(L('narrator', 'Rain hammers the booth roof. You eat cold beans from the tin and listen to the harbour.'));
    }
    out.push(L('narrator', 'A letter from your mother in Kalimor waits under your door. “The Petrela boy next door was taken last week. They say Santa Veronica. Nobody says it loudly. Eat properly. Love, Mama.”'));
    return out;
  },
  brief3: (S) => [
    L('vasko', 'Currency declarations from today. Anyone carrying over a thousand dollars in cash declares it, or you detain them. Cigarettes: two hundred per adult. Anything more is a business.'),
    L('vasko', 'And passports must be issued in a city with a passport office. Not every town in Italy can print one. Check the register.')
  ],
  bruno: (S) => [
    L('narrator', 'Mid-morning. A heavy man in a customs uniform squeezes into your booth without knocking. He smells of cologne and fried fish.'),
    L('bruno', 'Bruno Kalvas. Chief of Customs. You and I, we are going to be good friends. Everyone in this port is my friend.'),
    L('bruno', 'Today a man will pass. Ilija, a Yugoslav, olive van. He carries restoration materials. Old wood, old paint. A tiresome man, but a good friend of mine.'),
    L('bruno', 'He slides a thick envelope across the counter. “For your trouble. Two hundred aurels. That is two weeks of your salary, my friend.”'),
    { choices: [
      { text: 'Take the envelope.', fx: { corruption: 1 }, money: 200, flag: 'brunoDeal', then: [L('bruno', 'You see? Friends. The Republic underpays its heroes. Bruno corrects small injustices.')] },
      { text: 'Push it back. “No, thank you.”', fx: {}, flag: 'brunoRefused', then: [L('bruno', 'He smiles without his eyes. “Of course. Of course. A principled officer. How refreshing. How very rare.”')] },
      { text: 'Refuse, and report him to Vasko.', fx: { party: 1 }, flag: 'brunoReported', then: [L('vasko', 'Kalvas. Of course it was Kalvas. I will... note it.'), L('vasko', 'Listen to me. Kalvas has friends in Velkovgrad. You have made an enemy today. Be very correct from now on.')] }
    ] }
  ],
  eve3: (S) => {
    const out = [];
    if (S.flags.brunoDeal && !S.flags.brunoBetrayed) out.push(L('narrator', 'The envelope sits in your locker. Two hundred aurels. You count it twice. It does not get smaller.'));
    if (S.flags.brunoBetrayed) out.push(L('bruno', 'He catches you at the gate. “You took my money and took my friend. In this port, that is called stupidity. Sleep well.”'));
    if (S.flags.brunoReported) out.push(L('narrator', 'Someone has scratched a word into your locker door. It might be “rat”. It might be “art”. You decide it is “art”.'));
    out.push(L('radio', 'RADIO VARDONIA: Customs officers of San Aurelio thanked for incorruptibility. Incorruptibility is a socialist virtue.'));
    return out;
  },
  brief4: (S) => [
    L('vasko', 'Work Permits for foreign workers, Maritime Licences for fishermen. And a visitor for you.'),
    L('narrator', 'A woman in a black leather coat stands in the corner of the office. You did not see her come in.'),
    L('doruk', 'Major Doruk. Directorate of State Security. Today a British woman named Claire Whitlock will pass your booth. She calls herself a tourist.'),
    L('doruk', 'Let her in. We want to see who she talks to. You will remember her answers. Tonight, you will tell them to me.'),
    { choices: [
      { text: '“Yes, Comrade Major.”', fx: { party: 1 }, then: [L('doruk', 'Good. The Republic is built from people who say “yes, Comrade Major”.')] },
      { text: '“Is she dangerous?”', fx: {}, then: [L('doruk', 'Everyone is dangerous, Officer. That is why there are so few of us, and so many of you.')] }
    ] }
  ],
  eve4: (S) => {
    if (!S.flags.claireIn) return [L('doruk', 'You turned away my bait. I will remember your name, Officer. I remember everyone’s name.')];
    const base = [L('doruk', 'Well? Our British teacher. What did she carry, what did she say?')];
    const choices = [];
    if (S.flags.sawNotebook) choices.push({ text: 'Tell her about the notebook: “M. Orlan — Kalimor.”', fx: { party: 2, conscience: -1 }, flag: 'toldDoruk', then: [L('doruk', 'Orlan. Of course. The professor. Thank you, Officer. You have been very useful to the Republic today.')] });
    choices.push({ text: '“An ordinary tourist. Sunglasses and novels.”', fx: S.flags.sawNotebook ? { suspicion: 1, conscience: 1 } : {}, then: [L('doruk', 'Ordinary. Yes. Everyone is ordinary, until they are not.')] });
    choices.push({ text: '“I didn’t look closely.”', fx: { party: -1 }, then: [L('doruk', 'Then look closer next time. Laziness and disloyalty look identical from my office.')] });
    return base.concat([{ choices }]);
  },
  brief5: (S) => [
    L('vasko', 'Telex from Velkovgrad. The Minister of Tourism, Comrade Raskov, will pass through today unannounced. Officials with a Diplomatic Pass do not need an Entry Permit. Their papers must still be valid.'),
    L('vasko', 'Passport number formats are in the register now. And from today we receive the Directorate’s wanted bulletin. If a face matches, you detain. Whatever the papers say.'),
    L('radio', 'RADIO VARDONIA: Minister Raskov returns from a triumphant tourism fair in Milan, where Vardonian olives were praised by all.')
  ],
  eve5: (S) => {
    const out = [L('narrator', 'Vasko pours two glasses of rakia in the back office and pushes one toward you. Outside, the lighthouse turns.')];
    if (S.flags.kordicDenied) out.push(L('vasko', 'The Colonel phoned. Three times. I told him the regulations were written by the Party, and the Party does not make exceptions. A lie, but a useful one.'));
    out.push(L('vasko', 'When I was a boy we swam to Santa Veronica. Two hours there, three back. There were goats, and a lighthouse, and a monk who sold honey.'));
    out.push({ choices: [
      { text: '“And now?”', fx: { truth: 1 }, then: [L('vasko', 'Now boats that go too close do not come back. Now the Sea Star trawlers go there at night and come back low in the water.'), L('vasko', 'He drinks. “I did not say any of that. I am an old man with rakia. Old men say stupid things.”')] },
      { text: 'Change the subject.', fx: {}, then: [L('vasko', 'Good instinct. Keep it. It is worth more than your pension.')] }
    ] });
    return out;
  },
  brief6: (S) => [
    L('vasko', 'Cholera in Egypt, Tunisia and Lebanon. Their citizens need a vaccination certificate from the last six months.'),
    L('vasko', 'And look at today’s bulletin. Lucan Varga. He killed one of ours in Tarsa. A customs officer named Emil, with two daughters. If Varga reaches your booth, he does not leave it.')
  ],
  eve6: (S) => {
    if (S.flags.miraReported) return [L('narrator', 'Rain.')];
    return [
      L('narrator', 'Mira walks with you to the bus stop. She waits until the bus has gone without you.'),
      L('mira', 'There are people who help other people leave. We call it the Lighthouse. Teachers, doctors, a priest, two fishermen. One border officer. Me.'),
      L('mira', 'Next week someone important will reach your booth. A man who knows what Sea Star really carries. If you stop him, he dies on Santa Veronica and the truth dies with him.'),
      L('mira', 'I am not asking you to do anything. I am asking if, on that day, you will look at the sea.'),
      { choices: [
        { text: '“I’m listening.”', fx: { conscience: 1 }, flag: 'lighthouse', then: [L('mira', 'Then listen carefully. He will be Austrian. He will ask about the weather in Graz. That is all you need to know.')] },
        { text: '“Forget you said this. I will too.”', fx: {}, flag: 'lighthouseNo', then: [L('mira', 'That is fair. That is more than fair. Goodnight.')] },
        { text: 'Report Mira to the Directorate.', fx: { party: 3, conscience: -2 }, flag: 'miraReported', then: [L('narrator', 'You make the call from the harbour office. Doruk thanks you in a voice like a closing door.'), L('narrator', 'At dawn, a black car waits outside Mira’s building.')] }
      ] }
    ];
  },
  brief7: (S) => {
    const out = [];
    if (S.flags.miraReported) out.push(L('narrator', 'Booth two is staffed by a boy of twenty who whistles. Nobody says Mira’s name. Her coat is still on the hook.'));
    else if (S.flags.lighthouse) out.push(L('narrator', 'Mira passes your booth with two coffees and puts one on your counter without a word.'));
    out.push(L('vasko', 'Ministry of Information order: foreign journalists need Press Accreditation. A journalist on a tourist permit is turned away. No accreditation, no entry.'));
    return out;
  },
  eve7: (S) => {
    const out = [];
    if (S.flags.lazarFree) out.push(L('vasko', 'Booth four, this afternoon. A family. The ferry left before anyone looked twice. I did not see anything. Neither did you. Do you understand me?'));
    if (S.flags.lazarDetained) out.push(L('narrator', 'You keep seeing the girl, Petra, holding her brother’s hand while the guards searched her father.'));
    if (S.flags.lazarSentHome) out.push(L('radio', 'RADIO VARDONIA: In Kalimor, a family of traitors was arrested last night while preparing to flee. Vigilance saves the Republic.'));
    out.push(L('radio', 'RADIO VARDONIA: Comrade Velkov has not been seen in public for nine days. Radio Vardonia reminds listeners that the Supreme Leader is extremely healthy.'));
    return out;
  },
  brief8: (S) => {
    const out = [
      L('vasko', 'District codes. The letters of an identity card number must match the district. A Kalimor citizen has a KL number. A forger often forgets.'),
      L('doruk', 'Doruk’s voice on the telephone, crackling. “Today’s bulletin. Professor Matej Orlan. Enemy of the people. If he comes to you, Officer, he is mine. Do you understand? Mine.”')
    ];
    if (S.flags.lighthouse && !S.flags.miraReported) out.push(L('mira', 'A folded note under your coffee cup: “Today. Grey coat. He will ask about Graz.”'));
    if (S.flags.toldDoruk) out.push(L('narrator', 'You think of the notebook in the British woman’s bag. “M. Orlan.” You said that name to Doruk. You wonder how much you started.'));
    return out;
  },
  eve8: (S) => {
    const out = [];
    if (S.flags.orlanFree && S.flags.lighthouse && !S.flags.miraReported) out.push(L('mira', 'He reached Ancona. He is drinking terrible coffee in a police station, giving them everything. You did a brave thing. Be careful. Brave things leave fingerprints.'));
    else if (S.flags.orlanFree) out.push(L('narrator', 'You stamped a forged Austrian passport. You knew whose face it was. You go home and sit in the dark for a long time.'));
    if (S.flags.orlanDetained) out.push(L('doruk', 'The professor is very talkative now. You have friends in the Directorate, Officer. Think about whether you would like to work for us. After this week.'));
    if (!S.flags.brunoReported && !S.flags.brunoBetrayed) {
      out.push(L('bruno', 'Kalvas catches you at the gate. “Things are changing, my friend. The emergency is coming. Everyone in this port has a back door. Here is yours.”'));
      out.push(L('bruno', 'He shows you an Italian passport. Your photograph. A name that is not yours. “Six hundred aurels. A bargain.”'));
      const can = S.money >= 600;
      out.push({ choices: [
        { text: can ? 'Buy the passport (600 aurels).' : 'You cannot afford it (600 aurels).', disabled: !can, fx: { corruption: 1 }, money: -600, flag: 'forgedSelf', then: [L('bruno', '“A wise investment. Keep it in your shoe. Not the left one, everyone checks the left one.”')] },
        { text: 'Walk past him.', fx: {}, then: [L('bruno', '“The offer closes on Wednesday. Like the port.”')] }
      ] });
    }
    return out;
  },
  brief9: (S) => {
    const out = [
      L('narrator', 'The storm is back. So is Major Doruk. She has brought her own chair.'),
      L('doruk', 'Today I sit with you. A routine inspection. Do your job as if I am not here. I will not be offended by mistakes. I will only write them down.'),
      L('vasko', 'Weapons regulation: any firearm, any ammunition, any part. Detain. And a Directorate order for today only: undeveloped film may not leave the country.')
    ];
    const qs = [];
    if (S.flags.sawHeroin || S.flags.detainedPenev) qs.push({ q: 'Last week you opened a Sea Star crate. Why?', a: [
      { text: '“Procedure, Comrade Major.”', fx: { suspicion: 0 } },
      { text: '“Curiosity.”', fx: { suspicion: 1 } },
      { text: '“I didn’t open anything.”', fx: { suspicion: 2 } }] });
    if (S.flags.lazarFree) qs.push({ q: 'The Bari ferry manifest lists four passengers named Lazar. Your stamp is on the boarding slip.', a: [
      { text: '“A mistake. The queue was long.”', fx: { suspicion: 1 } },
      { text: '“They had children.”', fx: { suspicion: 2, conscience: 1 } }] });
    if (S.flags.orlanFree) qs.push({ q: 'An Austrian named Ortner crossed your booth on Monday. Austria has no record of him.', a: [
      { text: '“His papers looked correct.”', fx: { suspicion: 1 } },
      { text: 'Say nothing.', fx: { suspicion: 2 } }] });
    if (!qs.length) qs.push({ q: 'Your record is clean. Suspiciously clean. Do you like your work, Officer?', a: [
      { text: '“I serve the Republic.”', fx: { party: 1 } },
      { text: '“It pays the rent.”', fx: {} }] });
    qs.forEach((q) => {
      out.push(L('doruk', q.q));
      out.push({ choices: q.a.map((a) => ({ text: a.text, fx: a.fx, then: [L('doruk', 'She writes something in a small black notebook.')] })) });
    });
    return out;
  },
  eve9: (S) => {
    const s = S.stats.suspicion;
    const out = [];
    if (s >= 7) out.push(L('doruk', 'Your file is getting thick, Officer. Thick files get read. Goodnight.'));
    else if (s >= 4) out.push(L('doruk', 'Interesting day. You are an interesting officer. I do not mean that as a compliment.'));
    else out.push(L('doruk', 'Satisfactory. The Republic is satisfied. For now.'));
    if (S.flags.claireOut) out.push(L('radio', 'BBC WORLD SERVICE (faint, through static): ...a British journalist arriving in Bari tonight says she carries evidence of a state-run narcotics trade in Vardonia...'));
    out.push(L('radio', 'RADIO VARDONIA: Tomorrow, a temporary state of emergency. Remain calm. Remain at home. Remain grateful.'));
    return out;
  },
  brief10: (S) => {
    const out = [
      L('radio', 'RADIO VARDONIA: STATE OF EMERGENCY. Foreign provocateurs spread lies about the health of the Supreme Leader. Exit visas are valid only with Directorate endorsement.'),
      L('vasko', 'Something is happening in Velkovgrad. Tanks on Boulevard of the Revolution, my cousin says. Velkov is sick. Or dead. Or in Zurich.'),
      L('vasko', 'Today, Officer, do your job. Exactly your job. Whatever happens tonight, they will look at what we did today.')
    ];
    if (S.flags.claireOut) out.push(L('narrator', 'Someone has pinned a page torn from an Italian newspaper inside the staff toilet. A blurry photograph of a blue-star crate. The headline says VELKOV’S HEROIN.'));
    return out;
  },
  final: (S) => {
    const out = [L('narrator', 'The port is closed. Searchlights sweep the water. Somewhere in the old town, people are singing a song that has been banned since 1961.')];
    const choices = [];
    if (S.flags.lighthouse && !S.flags.miraReported) {
      out.push(L('mira', 'A fishing boat leaves Porto Neri at two. The Lighthouse has one more place. It is yours, if you want it. You have done enough here.'));
      choices.push({ text: 'Go with Mira to the boat.', ending: 'lighthouse' });
    }
    if (S.flags.forgedSelf) choices.push({ text: 'Use Bruno’s passport on the morning ferry.', ending: 'envelope_escape' });
    if (S.stats.truth >= 3) choices.push({ text: 'Take what you know to Major Doruk.', ending: 'informer' });
    choices.push({ text: 'Stay at your post.', ending: 'stay' });
    out.push({ choices: choices.map((c) => ({ text: c.text, fx: {}, ending: c.ending })) });
    return out;
  }
};

function resolveEnding(S, choice) {
  const st = S.stats;
  if (choice === 'lighthouse') return st.suspicion >= 10 ? 'pier' : 'lighthouse';
  if (choice === 'envelope_escape') return st.suspicion >= 9 ? 'pier' : 'envelope';
  if (choice === 'informer') return 'informer';
  if (st.suspicion >= 8) return 'santa_veronica';
  if (st.corruption >= 2 && S.money >= 900) return 'envelope_stay';
  if (S.flags.claireOut && (S.flags.gaveEvidence || S.flags.orlanFree || S.flags.detainedPenev2)) return 'morning_edition';
  if (st.party >= 6 && st.conscience <= 0) return 'hero';
  return 'quiet';
}

const ENDINGS = {
  lighthouse: { title: 'THE LIGHTHOUSE', text: (S) => [
    'At two in the morning a fishing boat called the Bella Rosa slips out of Porto Neri with its lights off. Mira steers. You sit on a coil of rope and watch the coast of Vardonia shrink to a line of searchlights.',
    S.flags.orlanFree ? 'In Ancona, a professor with a shaved beard meets you at the quay. He has kept a copy of every page. So, it turns out, have you.' : 'In Ancona, an Italian policeman offers you a cigarette and a blanket, in that order.',
    'In November 1989 the Velkov government falls in eleven days. You watch it on a small television in Trieste. When the crowd pulls down the statue in Velkovgrad, you realise you are crying, and that you have been for some time.',
    'You go back in 1991, to testify. Booth one in San Aurelio is a café now. They serve terrible coffee. You leave a large tip.'
  ] },
  pier: { title: 'THE PIER', text: (S) => [
    'They are waiting on the pier. Of course they are. Your file was thick enough to read in the dark.',
    'Major Doruk does not raise her voice. She never does. “You were an interesting officer,” she says, as the men take your arms. “I did warn you.”',
    'You spend twenty-two months on Santa Veronica, loading crates at night. When the government falls in 1989, a soldier opens the gate and walks away. You walk to the shore and keep walking until the water reaches your knees. It is very cold, and very beautiful.'
  ] },
  envelope: { title: 'THE BACK DOOR', text: (S) => [
    'The Italian passport works. Bruno was many things, but he was a craftsman. The morning ferry carries you to Bari with six hundred aurels of lies in your shoe and a suitcase you packed in four minutes.',
    'You open a bar in Brindisi. Customers ask about the accent. You say Yugoslav. Nobody checks.',
    'In 1990 you read that Bruno Kalvas was arrested trying to cross into Greece with forty kilos of gold teeth and a Swiss passport. You raise a glass. It would be rude not to.'
  ] },
  envelope_stay: { title: 'THE ENVELOPE', text: (S) => [
    `You stay. Of course you stay. You have ${S.money} aurels in a coffee tin and a talent for not looking.`,
    'When the government falls, the new authorities audit the port. The envelopes are easy to trace; Bruno wrote everything down. Bruno always wrote everything down.',
    'You are not sent to Santa Veronica. Santa Veronica is a museum now. You are sent to an ordinary prison, with ordinary walls, for three ordinary years. Sometimes that feels worse.'
  ] },
  informer: { title: 'HERO OF THE REPUBLIC', text: (S) => [
    'You tell Major Doruk everything: the crates, the Zurich statement, the names. She listens with her eyes closed, the way people listen to music.',
    '“Thank you,” she says. “You understand, of course, that the Directorate already knew all of it. What we did not know was who else knew. Now we do.”',
    'You are promoted. You get a flat in Velkovgrad with a balcony. In 1989 the crowds come for the Directorate building, and your name is on a list nailed to its door. You keep the balcony door locked for a very long time.'
  ] },
  santa_veronica: { title: 'SANTA VERONICA', text: (S) => [
    'They come at four in the morning, which is when they always come. Two men in leather coats and one in a uniform like yours. The uniform will not meet your eyes.',
    'Your file, Doruk tells you in the car, is the thickest she has read this year. “Congratulations,” she says. She seems to mean it.',
    'On Santa Veronica you load crates for Sea Star. Blue stars. At night. When the regime collapses in 1989 the guards simply leave, and the prisoners stand on the shore for an hour before anyone dares to swim.'
  ] },
  morning_edition: { title: 'THE MORNING EDITION', text: (S) => [
    'The story runs in London, then Rome, then everywhere. VELKOV’S HEROIN. A blurry photograph of a blue-star crate. Manifests. A Zurich account number. The source is “a border official at San Aurelio”.',
    'The Directorate looks for that official for six weeks. Then the Directorate is too busy looking for its own exits.',
    'Velkov dies in a Swiss clinic in March 1988. The government lasts another nineteen months. You keep your job through all of it. When the first free election comes, you stamp the observers in yourself, and you do not ask them a single question.'
  ] },
  hero: { title: 'A LOYAL OFFICER', text: (S) => [
    'The Republic remembers its friends. You receive a medal in Velkovgrad, a handshake from a Minister, and a transfer to the Directorate.',
    'You are very good at your new job. Better than you expected. That is the part you think about later.',
    'In 1990 a parliamentary commission reads your name aloud. Nobody in the room looks at you. Afterwards, in the corridor, an old woman you do not recognise spits on your shoes. Her name is Ana Lazar. You recognise it after all.'
  ] },
  quiet: { title: 'A QUIET OFFICER', text: (S) => [
    'You stay at your post. The emergency ends after three weeks. The trucks with the blue star stop coming, and nobody explains why.',
    'You did your job. Mostly. You stamped what you were told to stamp, and sometimes you did not, and nobody ever asked you which was which.',
    'When the government falls in 1989, you are still in booth one. The new flag goes up on a Tuesday. On Wednesday the queue is the same length. You open the first passport and say, as you always have: “Purpose of your visit?”'
  ] },
  dismissed: { title: 'DISMISSED', text: (S) => [
    'Vasko does not look at you when he takes your badge. “Too many mistakes. Too many complaints. Velkovgrad wants a name, and yours is the one on the stamps.”',
    'You are reassigned to a salt works on the southern flats, counting sacks. The work is honest, the pay is worse, and nobody asks you anything at all.',
    'Sometimes, at dusk, you hear the ferry horn from San Aurelio and you find yourself reaching for a stamp that is not there.'
  ] }
};

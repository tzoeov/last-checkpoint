'use strict';

const OCCUPATIONS = {
  teacher: { label: 'Schoolteacher', lines: ['I teach geography. Thirty children who believe the Mediterranean is a lake.', 'Primary school. After a year with eight-year-olds, a border post is a holiday.'] },
  clerk: { label: 'Bank clerk', lines: ['I count other people’s money all day. Now I spend a little of mine.', 'Savings department. Very dull. I like it that way.'] },
  nurse: { label: 'Nurse', lines: ['Night shifts in a surgical ward. I came here to sleep in the sun.', 'I am a nurse. If anyone faints in this queue, call me.'] },
  engineer: { label: 'Engineer', lines: ['Civil engineer. Bridges, mostly. I always look at your harbour cranes, sorry.', 'I design water pumps. It is less exciting than it sounds, and it does not sound exciting.'] },
  postman: { label: 'Postman', lines: ['I deliver letters. Twenty-two years, same route, same dog.', 'Postman. I know every address in my town, and every secret, ha.'] },
  hairdresser: { label: 'Hairdresser', lines: ['I own a small salon. Your hair, officer, if I may say, needs a trim.', 'Hairdresser. Everyone tells me everything. I am a better listener than a priest.'] },
  student: { label: 'Student', lines: ['I study history. Third year. My thesis is on Mediterranean trade routes.', 'Medicine, second year. My parents paid for this trip so I would stop complaining.'] },
  foreman: { label: 'Factory foreman', lines: ['I run a line at a tractor plant. Forty men, two tractors a day, on a good day.', 'Foreman at a textile mill. My ears still ring on weekends.'] },
  librarian: { label: 'Librarian', lines: ['I am a librarian. I brought eleven books for a ten-day holiday.', 'Municipal library. Quiet work. I have read every book about this coast.'] },
  dentist: { label: 'Dentist', lines: ['Dentist. Please, smile for me. Ah. You should floss.', 'I fix teeth. People are always happy to leave my office.'] },
  pharmacist: { label: 'Pharmacist', lines: ['I am a pharmacist, so yes, everything in my bag has a label.', 'Pharmacist. Thirty years behind the same counter.'] },
  driver: { label: 'Bus driver', lines: ['City buses. Route 14. I could drive it with my eyes closed, and some days I do.', 'I drive a bus. This is the first time someone else is driving me, on the ferry.'] },
  secretary: { label: 'Secretary', lines: ['Secretary at an insurance company. I type ninety words a minute.', 'I keep the diary for three directors who cannot find their own shoes.'] },
  accountant: { label: 'Accountant', lines: ['Accountant. I already calculated this trip costs too much.', 'I audit cooperatives. Do not worry, I am on holiday.'] },
  architect: { label: 'Architect', lines: ['Architect. I came to draw your Ottoman houses before somebody pours concrete on them.', 'I design housing blocks. Forgive me, they all look like yours.'] },
  electrician: { label: 'Electrician', lines: ['Electrician. I see your booth light flickers. Loose neutral wire, probably.', 'I wire factories. Big ones. Loud ones.'] },
  farmer: { label: 'Farmer', lines: ['I grow apricots. My hands will tell you, officer.', 'Farmer. Sheep and some olives. My brother watches them while I am away.'] },
  retired: { label: 'Retired', lines: ['Retired. Forty years at the railway. Now I have nothing but time and a pension.', 'I am retired, officer. My job now is to annoy my grandchildren.'] },
  mechanic: { label: 'Mechanic', lines: ['Car mechanic. If your Lada outside needs help, I am cheap.', 'I fix engines. Diesel, petrol, boats. Anything with oil in it.'] },
  cook: { label: 'Cook', lines: ['I cook in a hotel kitchen. I came to steal your fish recipes.', 'Chef. A small trattoria. My mother still says my sauce is too salty.'] },
  sales: { label: 'Sales representative', lines: ['I sell refrigeration units. Your country is hot, you need refrigeration.', 'Sales. Office furniture. Chairs, mostly. Do you need a chair?'] },
  trader: { label: 'Import trader', lines: ['I buy olive oil and sell it to people who think Italian oil is Italian.', 'Import-export. Mostly dried fruit and canned goods.'] },
  manager: { label: 'Company director', lines: ['I run a shipping agency. Twelve employees, four of them competent.', 'Director of a packaging firm. Cartons. Very important cartons.'] },
  fisherman: { label: 'Fisherman', lines: ['Fisherman. Forty years on the water. The sea pays badly but on time.', 'I fish sardines and mackerel. The rest of the year I mend nets.'] },
  trucker: { label: 'Lorry driver', lines: ['Long haul. Milano to Athens, Athens to Milano. I know every cafe on the road.', 'I drive a lorry. Two million kilometres. Never one accident. Well, one.'] },
  musician: { label: 'Musician', lines: ['I play the clarinet in a dance band. Weddings, funerals, sometimes both on the same day.', 'Session guitarist. I came for the Kalimor festival.'] },
  painter: { label: 'Painter', lines: ['I paint. Landscapes. Your light here is impossible, it changes every hour.', 'Watercolours. I sell enough to buy more paper.'] },
  photographer: { label: 'Photographer', lines: ['Wedding photographer. Yes, that is why I carry three cameras.', 'I take photographs for travel brochures. Pretty beaches, smiling waiters.'] },
  doctor: { label: 'Physician', lines: ['Cardiologist. I am attending the Velkovgrad medical congress.', 'General practitioner in a small town. Everyone there is my patient and my cousin.'] },
  scientist: { label: 'Marine biologist', lines: ['I study sea urchins. Yes, it is a real job. Yes, they pay me.', 'Oceanographer. I measure the temperature of water, mostly.'] },
  priest: { label: 'Priest', lines: ['I am a parish priest. I came to pray at the shrine of Saint Aurelius.', 'Priest. I hear confessions. Would you like to make one? I am joking. Mostly.'] },
  journalist: { label: 'Journalist', lines: ['I write for a newspaper. Travel section, mostly. Restaurants and sunsets.', 'Journalist. Features. Human stories.'] },
  welder: { label: 'Welder', lines: ['Shipyard welder. Thirty years. My eyes are bad but my seams are perfect.', 'I weld hulls. The shipyard in Tarsa hired me for six months.'] },
  steward: { label: 'Flight attendant', lines: ['Stewardess with the national airline. I have more stamps in my passport than pages.', 'I work on aeroplanes. Coffee, tea, smile. This time I am the passenger.'] },
  soldier: { label: 'Army officer', lines: ['Army. Retired now. Do not salute, I am on holiday.', 'Military engineer, reserve. I build bridges for tanks.'] },
  miner: { label: 'Miner', lines: ['Coal miner. Thirty years underground. Now I want to see the sky.', 'Miner. My lungs came to the seaside to rest.'] },
  waiter: { label: 'Waiter', lines: ['Waiter at a hotel bar. I serve tourists. Now I am one.', 'I wait tables. I know exactly how much to tip, and I tip less.'] },
  tailor: { label: 'Tailor', lines: ['Tailor. That uniform, officer, the shoulders are wrong. Who made it?', 'I make suits. Good ones. For men who never wear them.'] },
  unemployed: { label: 'Unemployed', lines: ['Between jobs, as they say. The factory closed in March.', 'Nothing at the moment. My brother says he can find me work here.'] },
  athlete: { label: 'Athlete', lines: ['Rower. National team, reserve. I row, I eat, I sleep.', 'Water polo. We have a friendly match in Velkovgrad.'] }
};

const PERSONALITIES = {
  cheerful: { label: 'Cheerful', open: ['Ha! ', 'Oh, ', 'Well! '], close: [' What a day for it!', ' Isn’t the sea lovely?', ''], irrRate: 0.5, base: 'calm', face: 'smile', angry: ['Goodness, so many questions!', 'You are very thorough, officer. Very thorough indeed.'] },
  polite: { label: 'Polite', open: ['Of course, officer. ', 'Certainly. ', 'Yes, sir. '], close: ['', ' I hope that helps.', ' Thank you for asking.'], irrRate: 0.6, base: 'calm', face: 'neutral', angry: ['Forgive me, but I have answered this already.', 'I am trying to be patient, officer.'] },
  nervous: { label: 'Nervous', open: ['I— yes. ', 'Sorry, sorry. ', 'Um. '], close: [' Is that... is that all right?', ' Sorry.', ''], irrRate: 0.4, base: 'nervous', face: 'nervous', angry: ['Please, I don’t know what you want me to say.', 'I’m sorry, I’m confused. What did I do?'] },
  arrogant: { label: 'Arrogant', open: ['Obviously, ', 'As anyone can see, ', 'Look. '], close: [' Is this really necessary?', ' Try to keep up.', ''], irrRate: 1.3, base: 'calm', face: 'neutral', angry: ['Do you know who you are talking to?', 'I will be writing to your superior.', 'This is an absolute farce.'] },
  tired: { label: 'Exhausted', open: ['*sighs* ', 'Mm. ', ''], close: [' Can I go now?', ' It has been a long night.', ''], irrRate: 1.0, base: 'calm', face: 'tired', angry: ['Officer, please. I have not slept.', 'I already told you. I’m too tired to say it differently.'] },
  gruff: { label: 'Gruff', open: ['', 'Hm. ', 'Eh. '], close: ['', '', ' That’s all.'], irrRate: 1.1, base: 'calm', face: 'neutral', angry: ['Enough.', 'Asked and answered.', 'You want me to sing it?'] },
  chatty: { label: 'Talkative', open: ['Oh, so, ', 'Well, you see, ', 'Funny you ask, '], close: [' My sister said I talk too much at borders. Do I?', ' Anyway! Where was I.', ' You have a kind face, has anyone told you?'], irrRate: 0.3, base: 'calm', face: 'smile', angry: ['Goodness, and I thought I liked talking!', 'We’ll be here until supper at this rate.'] },
  shy: { label: 'Shy', open: ['', 'Oh. ', 'Um, '], close: ['', '', ' ...sorry.'], irrRate: 0.5, base: 'uneasy', face: 'neutral', angry: ['...', 'I don’t know what else to say.'] },
  irritable: { label: 'Irritable', open: ['', 'Again? ', 'Fine. '], close: [' Satisfied?', '', ' Can we hurry this up?'], irrRate: 1.6, base: 'uneasy', face: 'angry', angry: ['Why are you asking so many questions? I have already shown you my passport.', 'This is harassment.', 'Unbelievable. Unbelievable.'] },
  charming: { label: 'Charming', open: ['Ah, officer, ', 'For you? ', 'Please, '], close: [' You must get bored, all day in this box.', ' I like your moustache. Or you should grow one.', ''], irrRate: 0.7, base: 'calm', face: 'smile', angry: ['You are making my charm work very hard.', 'Come now. We are both adults.'] },
  elderly: { label: 'Old-fashioned', open: ['Ah, young man, ', 'Eh? Ah. ', 'Well, well. '], close: [' In my day there was no booth, just a man with a stick.', '', ' My knees, officer, my knees.'], irrRate: 0.6, base: 'calm', face: 'neutral', angry: ['I have answered that, young one. My memory is better than yours.', 'You remind me of my grandson. He also never listens.'] },
  businesslike: { label: 'Businesslike', open: ['', 'Briefly: ', 'For the record, '], close: ['', ' Next question.', ''], irrRate: 0.9, base: 'calm', face: 'neutral', angry: ['Listen, officer, I am in a hurry.', 'Every minute here costs my company money.'] },
  anxious: { label: 'Worried parent', open: ['Please— ', 'Yes, yes. ', 'Sorry, the children— '], close: [' The children are so tired.', ' Please, we have been driving all night.', ''], irrRate: 0.8, base: 'uneasy', face: 'tired', angry: ['Please, we just want to reach the seaside.', 'I have a crying baby in the car, officer.'] }
};

const PERSONALITY_KEYS = Object.keys(PERSONALITIES);

const ITEM_LIB = {
  swim: [
    ['Swimsuits and towels', 'Two swimsuits, a striped towel, sand still in the folds from last year.'],
    ['Inflatable lilo', 'Deflated, rolled tight. Smells of rubber.'],
    ['Snorkel and mask', 'Scratched glass. Well used.']
  ],
  sun: [
    ['Sun lotion', 'A tall bottle of factor 4. Optimistic.'],
    ['Straw hat', 'Wide-brimmed, squashed flat by the suitcase lid.'],
    ['Sunglasses case', 'Tortoiseshell sunglasses inside. Nothing else.']
  ],
  book: [
    ['Paperback novel', 'A thriller with a pistol on the cover. Bookmark at page 41.'],
    ['Guidebook', '“The Vardonian Riviera”, 1979 edition. The hotel prices are a fantasy.'],
    ['Crossword magazines', 'Half of the puzzles completed in pencil.'],
    ['Poetry collection', 'Well-thumbed, with underlined verses about the sea.']
  ],
  camera: [
    ['Camera', 'An old rangefinder with a leather case. Three spare rolls of film.'],
    ['Instant camera', 'A plastic instant camera. Blurry pictures of a dog fill the side pocket.']
  ],
  clothes: [
    ['Summer clothes', 'Shorts, shirts, a cardigan for the evenings. Neatly folded.'],
    ['Clothes, unfolded', 'Shirts stuffed in anyhow. A single sock without a partner.'],
    ['Evening wear', 'One good dress shirt, ironed, wrapped in tissue paper.'],
    ['Wool cardigan', 'Hand-knitted, too warm for June.']
  ],
  toiletry: [
    ['Toiletry bag', 'Toothbrush, razor, a bar of soap in a tin.'],
    ['Wash bag', 'Shampoo, aspirin, plasters, hair rollers.']
  ],
  gifts: [
    ['Gift box of chocolates', 'Sealed, ribbon intact. A card reads: “For Teta Vesna”.'],
    ['Two bottles of wine', 'Labelled red wine from home. Within allowance.'],
    ['Children’s clothes, new', 'Price tags still on. Gifts for nephews.'],
    ['Coffee, 1 kg', 'Vacuum-packed ground coffee. A very welcome gift in Vardonia.'],
    ['Nylon stockings', 'Six pairs, still in packets. Gifts, apparently.']
  ],
  kids: [
    ['Toys', 'A plastic boat, a doll with one shoe, crayons melted together.'],
    ['Nappies and baby things', 'Cloth nappies, a bottle, powdered milk opened and half used.'],
    ['Comics', 'Dog-eared comics. Someone has drawn moustaches on all the heroes.'],
    ['Thermos and sandwiches', 'Warm tea. Sandwiches wrapped in newspaper.']
  ],
  fishing: [
    ['Fishing rods', 'Three rods in a canvas tube. Reels wrapped in cloth.'],
    ['Tackle box', 'Hooks, lures, lead weights, a filleting knife (9 cm).'],
    ['Waders', 'Rubber waders, patched twice.'],
    ['Net, folded', 'A small hand net. Smells exactly as you would expect.']
  ],
  business: [
    ['Briefcase', 'Contracts, price lists, a calculator, business cards.'],
    ['Product samples', 'Small labelled samples. Catalogue numbers match the price list.'],
    ['Typewriter ribbons', 'Six boxes. For the office in Velkovgrad, he says.'],
    ['Trade fair folder', 'Velkovgrad International Trade Fair, exhibitor pass, hall plan.']
  ],
  study: [
    ['Textbooks', 'Heavy textbooks with library stamps.'],
    ['Notebooks', 'Lecture notes in cramped handwriting.'],
    ['Letter of invitation', 'From Velkovgrad University, Department of Languages.']
  ],
  pilgrim: [
    ['Rosary', 'Olive-wood beads, worn smooth.'],
    ['Votive candles', 'A dozen candles wrapped in brown paper.'],
    ['Prayer book', 'Pages soft as cloth. A pressed flower inside.']
  ],
  music: [
    ['Instrument case', 'A clarinet in a velvet-lined case. Reeds in a tin.'],
    ['Sheet music', 'Folk dances arranged for brass. Coffee rings on the pages.'],
    ['Guitar', 'A battered acoustic guitar. Stickers from a dozen festivals.']
  ],
  work: [
    ['Work overalls', 'Blue overalls, steel-toe boots, welding gloves.'],
    ['Toolbox', 'Spanners, a hammer, a multimeter. Everything a tradesman needs.'],
    ['Employment contract', 'Signed by the Tarsa Shipyard personnel office.']
  ],
  cargo: [
    ['Cargo manifest', 'Lists the load. Weights look plausible.'],
    ['Trailer', 'The trailer is sealed with a customs wire. Seal number matches the manifest.'],
    ['Cab bunk', 'Blanket, radio, a calendar with a picture of a tractor.']
  ],
  food: [
    ['Homemade preserves', 'Jars of fig jam. Lids taped with care.'],
    ['Sausage, smoked', 'A whole dry sausage wrapped in a tea towel.'],
    ['Bag of oranges', 'Oranges. Truly just oranges.'],
    ['Cheese wheel', 'A small sheep’s cheese. It smells like it wants to leave.']
  ],
  med: [
    ['Pill bottles', 'Blood-pressure tablets. Prescription label in the owner’s name.'],
    ['Walking stick', 'Plain wooden stick with a rubber foot.']
  ],
  art: [
    ['Sketchbooks', 'Pencil drawings of harbours and doorways. Rather good.'],
    ['Paint box', 'Watercolour cakes, brushes, a jar.']
  ],
  press: [
    ['Notebooks, shorthand', 'Pages of shorthand. You cannot read it.'],
    ['Portable typewriter', 'An Olivetti in a carrying case.']
  ]
};

const ARCHETYPES = {
  beach: {
    dir: 'in', purpose: 'Tourism', ages: [19, 66], towns: ['Costa Lumina', 'Porto Neri', 'San Aurelio'], dur: [5, 16], vehicle: 0.4,
    occ: ['teacher', 'clerk', 'nurse', 'engineer', 'postman', 'hairdresser', 'student', 'foreman', 'librarian', 'dentist', 'pharmacist', 'driver', 'secretary', 'accountant', 'electrician', 'mechanic', 'cook', 'waiter', 'miner'],
    company: { solo: 0.35, spouse: 0.4, friend: 0.25 }, items: ['swim', 'sun', 'book', 'clothes', 'toiletry', 'camera'],
    purposeLines: ['Sun, sea and nothing to do. {dur} days of it.', 'The beaches, officer. My doctor said I need sea air.', 'Holiday. I have been saving for this since February.', 'Swimming, eating, sleeping. In that order.', 'I saw a poster of {town} in a travel agency window and I said, why not?'],
    greet: [
      'Good afternoon, officer. {companionClause} going to the southern coast. We booked a room in {stay} near the beach.',
      '{hello}! Is this the way to {town}? Everyone says the water there is like glass.',
      'Here are my papers. {dur} days in {town}, then home to {home}. My first proper holiday in years.',
      'They told me the ferry would take four hours. It took seven. But look at that sea!',
      'Holiday, officer. Just a holiday. I have a room in {stay} and a pile of books.',
      'I promised myself: one summer on the Vardonian coast before I turn {ageRound}. So here I am.',
      'We came for the beaches. My colleague swore {town} is the most beautiful bay in the Mediterranean.',
      'Passport, permit, everything. I even ironed my shirt for you, officer.'
    ]
  },
  history: {
    dir: 'in', purpose: 'Tourism (culture)', ages: [24, 74], towns: ['Kalimor', 'Monte Sibra', 'Velkovgrad'], dur: [4, 12], vehicle: 0.3,
    occ: ['teacher', 'librarian', 'architect', 'retired', 'student', 'painter', 'priest', 'doctor', 'accountant'],
    company: { solo: 0.55, spouse: 0.35, friend: 0.1 }, items: ['book', 'camera', 'clothes', 'art', 'toiletry'],
    purposeLines: ['The Ottoman quarter of Kalimor. I have read about it for twenty years.', 'Old towns, old churches, old mosques. The older the better.', 'I want to see the frescoes at Monte Sibra before they crumble.', 'History. Your country is a museum nobody visits.'],
    greet: [
      '{hello}, officer. I am here for the old town of {town}. They say the bazaar has not changed in three hundred years.',
      'Is it true the fortress at {town} is open again? I have come a very long way to stand on those walls.',
      'Forgive my accent. I learned a little Vardonian from a book. “Where is the museum?” That is all I know.',
      'I am a lover of ruins, officer. Your country has excellent ruins.',
      'I am going to {town}. The mosque of Hasan Pasha, the clock tower, the old bridge. I have a list.',
      'They say Velkovgrad was called Castelmar before. Is that allowed to say? I only want to see the old harbour walls.'
    ]
  },
  family: {
    dir: 'in', purpose: 'Family holiday', ages: [28, 48], towns: ['Costa Lumina', 'Porto Neri', 'San Aurelio'], dur: [7, 14], vehicle: 0.85,
    occ: ['teacher', 'engineer', 'clerk', 'foreman', 'mechanic', 'electrician', 'nurse', 'secretary', 'driver', 'sales'],
    company: { family: 1 }, items: ['kids', 'kids', 'swim', 'clothes', 'food', 'toiletry'],
    purposeLines: ['A family holiday. The children have talked of nothing else since Easter.', 'Two weeks of sandcastles. God help us.', 'The kids want to see dolphins. I told them there are dolphins. Please, let there be dolphins.'],
    greet: [
      'Please, we have been driving all night. The children are tired. We just want to reach the seaside.',
      '{hello}. Sorry about the noise from the back seat. {kidName}, sit down! Sorry. Papers.',
      'All five of us, officer, on one ferry, with one bucket and one spade. War has been declared.',
      'We booked {stay} in {town}. The brochure promised a children’s pool. Is there a children’s pool?',
      'Family holiday. {kidsN} children, one {spouse}, one very tired {selfRole}.',
      'Good day. Please be quick if you can, the little one gets seasick and now she gets landsick.'
    ]
  },
  relatives: {
    dir: 'in', purpose: 'Visiting relatives', ages: [22, 80], towns: ['Porto Neri', 'Kalimor', 'Tarsa', 'Monte Sibra', 'Velkovgrad'], dur: [7, 28], vehicle: 0.35,
    occ: ['retired', 'farmer', 'foreman', 'cook', 'tailor', 'driver', 'mechanic', 'teacher', 'waiter', 'miner'],
    company: { solo: 0.6, spouse: 0.4 }, items: ['gifts', 'gifts', 'clothes', 'food', 'toiletry'],
    purposeLines: ['My {rel} lives in {town}. I have not seen {relPron} in eleven years.', 'Family. My {rel} is getting old, and so am I.', 'A christening. My {rel}’s first grandson.', 'Visiting my {rel}. I bring coffee and stockings, they give me rakia and complaints.'],
    greet: [
      '{hello}, officer. I go to my {rel} {relName} in {town}. My mother was born in this country, you know.',
      'My {rel} wrote me: “bring coffee, bring stockings, bring yourself.” So, here is everything.',
      'I have not seen my {rel} since 1976. They say {town} has changed. Has it changed?',
      'Family visit. I have the address here, written by my {rel} himself, see? {relAddr}.',
      'Please, I am only visiting family. My {rel} is waiting with the car on the other side.',
      'Another summer, another visit to my {rel}. You will be stamping me every year until I die, officer.'
    ]
  },
  angler: {
    dir: 'in', purpose: 'Fishing competition', ages: [25, 70], towns: ['San Aurelio', 'Porto Neri'], dur: [3, 8], vehicle: 0.6,
    occ: ['mechanic', 'electrician', 'retired', 'foreman', 'driver', 'postman', 'clerk', 'welder'],
    company: { solo: 0.5, friend: 0.5 }, items: ['fishing', 'fishing', 'fishing', 'clothes', 'food'],
    purposeLines: ['The San Aurelio Open Fishing Cup! Third year. I came second last year by forty grams.', 'Fishing competition. Grouper category. I have a new lure, very secret.', 'I compete in the sea-bream division. My wife thinks I am crazy.'],
    greet: [
      'San Aurelio Fishing Cup, officer! Third time. This year the trophy comes home with me.',
      '{hello}! You fish? No? Pity. The grouper off your breakwater are legendary.',
      'Only rods and tackle, officer, and a lucky hat. Do not touch the hat.',
      'I am registered for the open competition. Registration number 117. Here is the letter.',
      'I came for the fishing cup. If you see a Greek with a red boat, he is a cheat. Tell everyone.'
    ]
  },
  business: {
    dir: 'in', purpose: 'Business', ages: [27, 63], towns: ['Velkovgrad', 'Tarsa', 'San Aurelio'], dur: [2, 7], vehicle: 0.3,
    occ: ['sales', 'trader', 'manager', 'engineer', 'accountant'],
    company: { solo: 0.85, friend: 0.15 }, items: ['business', 'business', 'clothes', 'toiletry'],
    purposeLines: ['The Velkovgrad International Trade Fair.', 'Negotiations with the State Olive Oil Combine.', 'Contract signing with the Tarsa shipyard. Refrigeration units.', 'Business meetings. Three days, eleven meetings, no beach.'],
    greet: [
      'Listen, officer, I am in a hurry. I have some important business in the capital.',
      '{hello}. Trade fair in {town}. My stand opens at nine tomorrow and my samples are in this bag.',
      'Good afternoon. I represent a firm in {home}. We are buying olive oil, a great deal of olive oil.',
      'My appointments start at four. Please. I have papers for everything.',
      'I am meeting the Ministry of Foreign Trade. Hard currency for your Republic, officer. Everybody wins.',
      'Business, officer. Strictly business. I will see nothing but conference rooms.'
    ]
  },
  returning: {
    dir: 'in', purpose: 'Returning home', ages: [20, 78], towns: ['San Aurelio', 'Velkovgrad', 'Kalimor', 'Porto Neri', 'Tarsa', 'Costa Lumina', 'Monte Sibra'], dur: [0, 0], vehicle: 0.3, citizen: true,
    occ: ['welder', 'teacher', 'athlete', 'musician', 'doctor', 'engineer', 'fisherman', 'driver', 'farmer', 'scientist', 'cook'],
    company: { solo: 0.7, spouse: 0.3 }, items: ['clothes', 'gifts', 'toiletry', 'food'],
    purposeLines: ['I live here, officer. {town}. I am coming home.', 'Home. After four months away, home.', 'I was abroad with a state delegation. Now I return.'],
    greet: [
      'Bonodì, comrade. Home again. The ferry food was terrible, I could kiss this concrete.',
      'I return from {abroad}. Official trip. I have everything stamped, every page.',
      'Home to {town}. My mother has made byrek, she wrote me three times to say so.',
      'Comrade officer. Long trip. Please, the stamp, and I go to my bed.',
      'I have been working abroad on a state contract. Here is my identity card, my passport, all.',
      'Back from the sports tour. We lost, all four matches. Do not ask.'
    ]
  },
  departing: {
    dir: 'out', purpose: 'Travel abroad', ages: [22, 75], towns: ['San Aurelio', 'Velkovgrad', 'Kalimor', 'Porto Neri', 'Tarsa'], dur: [7, 30], vehicle: 0.2, citizen: true, needsExitDay: 2,
    occ: ['doctor', 'athlete', 'musician', 'engineer', 'scientist', 'teacher', 'retired', 'welder'],
    company: { solo: 0.75, spouse: 0.25 }, items: ['clothes', 'toiletry', 'gifts', 'book'],
    purposeLines: ['Approved state travel to {abroad}.', 'A medical conference in {abroadCity}. The Ministry approved it.', 'Visiting my {rel} in {abroadCity}. The visa took fourteen months.', 'Our folk ensemble tours {abroad}. I play the lahuta.'],
    greet: [
      'Comrade officer. I travel to {abroadCity}. Fourteen months for this exit visa. Please do not find a mistake.',
      'Bonodì. I go to {abroad} with the state delegation. We return on the {retDate}.',
      'My {rel} lives in {abroadCity}. The Ministry finally said yes. I am shaking a little, forgive me.',
      'I leave on the afternoon ferry. A conference. I will be back, of course I will be back.',
      'Official travel, comrade. Everything is in order. My party card is in my wallet if you need it.'
    ]
  },
  leaving: {
    dir: 'out', purpose: 'Departing tourist', ages: [19, 72], towns: ['Costa Lumina', 'Kalimor', 'Porto Neri', 'Velkovgrad', 'Monte Sibra'], dur: [4, 14], vehicle: 0.35,
    occ: ['teacher', 'clerk', 'nurse', 'engineer', 'student', 'retired', 'secretary', 'architect', 'painter', 'librarian'],
    company: { solo: 0.5, spouse: 0.35, friend: 0.15 }, items: ['clothes', 'clothes', 'gifts', 'book', 'toiletry', 'camera'],
    purposeLines: ['Going home, sadly. Holiday is over.', 'Home. Work starts Monday. Do not remind me.', 'Leaving, unfortunately. I would stay if I could.'],
    greet: [
      '{hello}, officer. Going home, sunburnt and poorer. Wonderful holiday.',
      'Back to {home}. I bought too many souvenirs. Do souvenirs need papers?',
      'The holiday is finished. I spent {dur} days at {stay}. The fish soup! I will dream of it.',
      'Leaving on the afternoon ferry. Please tell your country thank you from me.',
      'Is the Bari ferry on time? I must be at work in {home} on Monday morning.'
    ]
  },
  trucker: {
    dir: 'in', purpose: 'Freight transport', ages: [26, 62], towns: ['Tarsa', 'Velkovgrad', 'San Aurelio'], dur: [1, 3], vehicle: 1, vehicleKind: 'truck',
    occ: ['trucker'], company: { solo: 0.8, friend: 0.2 }, items: ['cargo', 'cargo', 'cargo', 'food'],
    cargos: ['tinned tomatoes', 'tractor parts', 'oranges', 'textile bolts', 'refrigerators', 'paper rolls', 'ceramic tiles', 'machine tools'],
    purposeLines: ['Delivery. {cargo} for the warehouse in {town}.', 'Freight. In with {cargo}, out with olive oil.', 'I drive. I deliver. I drive back.'],
    greet: [
      '{hello}. Load of {cargo} for {town}. Manifest is here, seal is on the trailer.',
      'Officer. Thirty hours on the road. {cargo}. Please, quickly, I am falling asleep on my feet.',
      'Same as every week. {cargo} to {town}. You know my lorry, the {carColor} one.',
      'The ferry was late, the ramp was broken, and now there is you. No offence. {cargo}.',
      'Delivery for the State Trading Enterprise. {cargo}. Everything sealed.'
    ]
  },
  student: {
    dir: 'in', purpose: 'Study exchange', ages: [18, 27], towns: ['Velkovgrad', 'Kalimor'], dur: [14, 60], vehicle: 0.05,
    occ: ['student'], company: { solo: 0.8, friend: 0.2 }, items: ['study', 'study', 'clothes', 'book'],
    purposeLines: ['Summer language school at Velkovgrad University.', 'A research exchange. Ottoman archives in Kalimor.', 'I study Balkan folk music. Here is the best place.'],
    greet: [
      '{hello}! I have a scholarship for the summer school in {town}. I can say “thank you” in Vardonian. Gratsi!',
      'Hello. I am a student. My professor arranged everything. I hope he arranged everything.',
      'Language exchange, officer. I am going to learn Vardonian and teach someone {lang}.',
      'I study history. Your archives in {town} have letters nobody has read in two hundred years.'
    ]
  },
  pilgrim: {
    dir: 'in', purpose: 'Pilgrimage', ages: [35, 82], towns: ['Monte Sibra'], dur: [3, 9], vehicle: 0.2,
    occ: ['retired', 'priest', 'farmer', 'teacher', 'tailor'], company: { solo: 0.6, friend: 0.4 }, items: ['pilgrim', 'pilgrim', 'clothes', 'food', 'med'],
    purposeLines: ['To pray at the shrine of Saint Aurelius at Monte Sibra.', 'A pilgrimage. My mother made the same journey in 1938.', 'I made a promise to the saint when my husband was ill. He lived. So I keep my promise.'],
    greet: [
      'God bless you, officer. I go to the monastery of Saint Aurelius at Monte Sibra.',
      '{hello}. A pilgrimage. I hope the monastery is still open. Is it still open?',
      'I made a vow, officer. Monte Sibra, on foot from the station. My knees are not happy.',
      'Only candles and a prayer book. Saint Aurelius protects sailors, and I was a sailor’s wife forty years.'
    ]
  },
  musician: {
    dir: 'in', purpose: 'Cultural festival', ages: [19, 60], towns: ['Kalimor', 'Velkovgrad'], dur: [4, 10], vehicle: 0.3,
    occ: ['musician'], company: { solo: 0.4, friend: 0.6 }, items: ['music', 'music', 'clothes', 'toiletry'],
    purposeLines: ['The Kalimor Summer Festival. We play Saturday night.', 'A concert tour. Three towns, five concerts.', 'Folk festival. I play with the {home} Municipal Orchestra.'],
    greet: [
      '{hello}! Band coming through! Well, part of the band. The drummer missed the ferry.',
      'We are booked at the Kalimor festival. Saturday, nine o’clock, main square. Come!',
      'Only instruments, officer. And a lot of sheet music. And a little stage fright.',
      'The festival office promised the paperwork is fine. Festival offices always promise.'
    ]
  },
  conference: {
    dir: 'in', purpose: 'Scientific congress', ages: [32, 70], towns: ['Velkovgrad'], dur: [3, 6], vehicle: 0.1,
    occ: ['doctor', 'scientist', 'engineer'], company: { solo: 0.85, friend: 0.15 }, items: ['business', 'book', 'clothes', 'toiletry'],
    purposeLines: ['The Mediterranean Medical Congress in Velkovgrad. I present on Thursday.', 'Oceanography symposium. My paper is on currents.', 'A congress. Very boring. Very important.'],
    greet: [
      'Good afternoon. I am a delegate to the congress in Velkovgrad. The invitation is in the envelope.',
      '{hello}. Conference. I will be in a hotel ballroom looking at slides for five days.',
      'Congress delegate. They told me a car from the Ministry would meet me. Do you see a car?'
    ]
  },
  worker: {
    dir: 'in', purpose: 'Contract work', ages: [21, 58], towns: ['Tarsa', 'Velkovgrad', 'San Aurelio'], dur: [30, 180], vehicle: 0.15, needsWorkDay: 4,
    occ: ['welder', 'engineer', 'electrician', 'mechanic'], company: { solo: 0.9, friend: 0.1 }, items: ['work', 'work', 'clothes', 'toiletry'],
    purposeLines: ['Six-month contract at the Tarsa shipyard.', 'Technical assistance. Turbines.', 'Work. Shipyard. The pay is in hard currency, otherwise I would stay home.'],
    greet: [
      '{hello}. I start at the Tarsa shipyard on Monday. Welding, six months.',
      'Contract worker, officer. They need engineers, I need money. Simple.',
      'I come to install machines in {town}. My company sent me. My wife did not want me to go.',
      'Work permit, contract, everything. The shipyard sent a man to meet me.'
    ]
  },
  fisher: {
    dir: 'in', purpose: 'Commercial fishing', ages: [24, 76], towns: ['San Aurelio', 'Porto Neri'], dur: [1, 5], vehicle: 0, needsMaritimeDay: 4,
    occ: ['fisherman'], company: { solo: 0.6, friend: 0.4 }, items: ['fishing', 'fishing', 'food', 'clothes'],
    purposeLines: ['Landing my catch at the cooperative market.', 'Selling fish. What else does a fisherman do?', 'Bringing nets to my brother’s boat.'],
    greet: [
      'I have worked these waters for forty years. I am only bringing some fishing equipment to my brother.',
      '{hello}. Same boat, same nets, same face. You know me, eh? No? You are new.',
      'Fisherman. The {boat}, moored at pier three. I sell at the morning market.',
      'The sea was rough last night, officer. I am cold, I am wet, and I smell. Stamp me.'
    ]
  },
  journalist: {
    dir: 'in', purpose: 'Press', ages: [26, 60], towns: ['Velkovgrad', 'San Aurelio', 'Tarsa'], dur: [3, 10], vehicle: 0.2, minDay: 7,
    occ: ['journalist'], company: { solo: 0.8, friend: 0.2 }, items: ['press', 'press', 'camera', 'clothes'],
    purposeLines: ['A feature on Mediterranean tourism.', 'Reporting on the trade fair.', 'A travel piece. Beaches, food, smiling waiters.'],
    greet: [
      '{hello}. Press. I write for a paper in {home}. Nothing political, I promise. Recipes, mostly.',
      'Journalist. Travel section. Your tourism ministry invited us.',
      'I am here to write about your beaches. Do they still let journalists onto beaches?'
    ]
  }
};

const ODDITIES = [
  { id: 'biker', archetypes: ['beach', 'history', 'leaving'], look: { clothes: 'leather', facial: 'beard', hair: 'long' }, appearance: 'Battered leather jacket, long hair, thick beard. A skull ring on one finger.', item: ['Motorbike panniers', 'Spare spark plugs, oil-stained rags, a road atlas of the Balkans.', 'Smells strongly of petrol and something sweet.', 'Petrol, and a bag of liquorice sweets. Nothing else.'], q10: 'Nervous? I always look like this. People cross the street. I am a piano teacher.' },
  { id: 'insulin', item: ['Leather pouch with syringes', 'A zip pouch with six syringes and glass vials.', 'Syringes. Several of them.', 'Insulin vials with a pharmacy label and a doctor’s letter. Diabetic.'], declare: 'My insulin. I have a letter from my doctor, here.' },
  { id: 'urn', item: ['Brass urn', 'A sealed brass urn, heavy, wrapped in a shawl.', 'Sealed shut. Heavier than it looks.', 'With it, a cremation certificate. Her father, born in Porto Neri. She wants to scatter his ashes in the bay.'], q10: 'I am carrying my father. Forgive me if I am not calm.', look: { expression: 'sad' } },
  { id: 'icon', item: ['Painted icon', 'A small gilded icon of a saint, wrapped in newspaper.', 'It looks old. Very old.', 'On the back: a souvenir shop sticker from Thessaloniki and a receipt. A modern copy, artificially aged.'] },
  { id: 'falcon', item: ['Stuffed falcon', 'A taxidermied falcon in a wooden box, glass eyes staring at you.', 'Something about it is deeply unsettling.', 'A taxidermy hobbyist’s exhibition piece. A club card from the society in her pocket.'] },
  { id: 'flour', item: ['Paper bags of white powder', 'Three paper bags of fine white powder.', 'White powder, a lot of it.', 'Flour, sugar and baking powder. For his mother’s birthday cake. The bags are labelled in pencil.'], q10: 'Is it the bags? It is flour! My mother says the flour here is bad!' },
  { id: 'plaster', item: ['Sack of plaster', 'A heavy sack, half-full of white powder.', 'Unmarked white powder.', 'Plaster of Paris. She is a sculptor, here for the open-air symposium. Her invitation is in the bag.'] },
  { id: 'shipspotter', archetypes: ['beach', 'history', 'leaving'], item: ['Notebook of ship names', 'Pages of ship names, times and harbour positions, written in tiny letters.', 'He has written down the times ships enter the harbour.', 'Every entry is a ferry or a cargo ship from Lloyd’s Register. A ship-spotting club membership card is tucked in the back. No naval vessels.'], q10: 'They always stop me because of my notebook. I just like ships. Is that a crime here?' },
  { id: 'cash', cashDeclared: 2400, item: ['Envelope of banknotes', 'A thick envelope of banknotes.', 'That is a lot of cash.', 'Counted: matches the currency declaration exactly. A boat purchase agreement is folded inside.'], declare: 'I have cash, a lot. I am buying a fishing boat. I filled in the declaration.', minDay: 3 },
  { id: 'binoculars', item: ['Binoculars and maps', 'Heavy military-style binoculars. Topographic maps with pencil circles.', 'Circles drawn on maps near the coast.', 'Each circle has a bird name beside it. Bee-eater, Eleonora’s falcon. A birdwatcher’s field guide.'], q10: 'The binoculars? For birds! Your coast has the Eleonora’s falcon. It is very rare!' },
  { id: 'radio', item: ['Radio receiver', 'A shortwave receiver with an extendable antenna.', 'A powerful radio. Could receive foreign broadcasts.', 'A tourist set sold in any Western shop. Tuned to a football commentary.'] },
  { id: 'scarred', look: { scar: true, facial: 'stubble' }, appearance: 'A long scar runs across the cheek. Knuckles thick and broken.', q10: 'Officer, I was a boxer for twelve years. Now I teach children to box. My face is not my fault.' },
  { id: 'fearful', q10: 'When I was a child, police came for my father at night. I cannot stand in front of a uniform without shaking. I am sorry.', nervous: true },
  { id: 'firsttrip', q10: 'This is the first time I leave my country. Everything is strange. I keep checking my passport is still in my hand.', nervous: true },
  { id: 'sickmother', q10: 'My mother is in hospital in {town}. The telegram said come quickly. Please. I am not nervous, I am afraid.', nervous: true },
  { id: 'toilet', q10: 'Honestly? The ferry toilets were broken for six hours. Please hurry.', nervous: true },
  { id: 'trench', look: { clothes: 'coat', glasses: 'sun' }, appearance: 'Trench coat, dark glasses, collar up despite the heat. Looks like a spy in a cheap film.', q10: 'Nervous? I am wearing this coat in June. I am sweating, not nervous. My wife says it is “mysterious”.' },
  { id: 'coins', item: ['Coin album', 'An album of old coins, some Ottoman, some Venetian.', 'Old coins could be antiquities.', 'Every coin is listed with purchase receipts from a dealer in Vienna. Common types, low value.'] },
  { id: 'rakia', item: ['Plastic jerrycan', 'A five-litre jerrycan, sloshing.', 'Strong smell when opened. Could be fuel. Could be anything.', 'Homemade plum brandy. Two litres, under the limit. He offers you a taste. You decline.'] },
  { id: 'pills', item: ['Unlabelled pill tin', 'A tin of white tablets, no label.', 'Unlabelled tablets.', 'Aspirin. She buys it in bulk. She shows you the box it came in, folded flat.'] },
  { id: 'heavyjar', item: ['Large clay jar', 'A sealed clay jar, very heavy.', 'Far heavier than it should be.', 'Olive tapenade, packed to the brim. Just a very full jar.'] },
  { id: 'tattoo', look: { clothes: 'tshirt' }, appearance: 'Arms covered in navy tattoos: anchors, a mermaid, a name crossed out.', q10: 'Merchant navy, twenty years. The tattoos frighten people. The mermaid is my ex-wife.' },
  { id: 'wig', appearance: 'Her hair sits a little too perfectly. It is a wig.', q10: 'The wig? Chemotherapy. I finished in March. This holiday is my reward.' },
  { id: 'cameras', item: ['Three cameras', 'Three camera bodies, five lenses, a flash unit.', 'Professional equipment for a “tourist”.', 'Wedding photographer. The film rolls are full of a cousin’s wedding in Bari. Her business card matches.'] },
  { id: 'knife', item: ['Folding knife', 'A folding knife with a horn handle.', 'A blade.', 'A small fruit knife, blade 7 cm. Legal.'] }
];

const CRIMES = {
  cigarettes: {
    label: 'Cigarette smuggling', minDay: 1, nerv: 0.5, covers: ['beach', 'relatives', 'trucker', 'family', 'leaving'],
    hides: [
      { where: 'luggage', item: ['Stack of wool blankets', 'Wool blankets. A lot of blankets for June.', 'Packed around something rigid and rectangular.', '30 cartons of counterfeit Marlboro, wrapped inside the blankets.'] },
      { where: 'luggage', item: ['Box marked “Children’s books”', 'A taped cardboard box.', 'Too light for books, and it smells of tobacco.', 'Not a single book. 25 cartons of Kent cigarettes.'] },
      { where: 'vehicle', vtell: 'The spare tyre is missing and the boot floor sits two inches too high.', reveal: 'Under a false boot floor: 80 cartons of untaxed cigarettes.' },
      { where: 'clothing', atell: 'Coat oddly bulky for June.', reveal: 'Taped around the torso: 40 packs of cigarettes.' }
    ],
    declare: ['Just two packs, for me.', 'Some cigarettes, for personal use. A few.'],
    q10: ['Me? I am not nervous. I am hot. It is June.', 'The ferry was rough, I feel sick.'],
    backstory: ['{first} buys cigarettes cheap from a warehouse in {home} and sells them by the pack in Vardonian bars. One good trip pays two months’ rent.', '{first} was laid off in the spring. A cousin pays per carton delivered to a kiosk in {town}.']
  },
  stolen: {
    label: 'Stolen goods', minDay: 2, nerv: 0.4, covers: ['business', 'leaving', 'trucker', 'history'],
    hides: [
      { where: 'luggage', item: ['Rolled-up rug', 'A rolled rug tied with string.', 'There is a cloth label stitched on the reverse: “Inv. 4471”.', 'Inside the rug: a 17th-century embroidered banner. Inventory tag of the Kalimor Museum. Reported stolen in May.'] },
      { where: 'luggage', item: ['Shoebox of watches', 'A shoebox with watches in plastic sleeves.', 'Thirty identical watches, serial numbers filed off.', '32 wristwatches from a jeweller’s robbery in Bari. Police tags still on two.'] },
      { where: 'luggage', item: ['Church candlesticks', 'A pair of silver candlesticks wrapped in a shirt.', 'Engraved: “St. Nikolas, Porto Neri, 1802”.', 'Stolen from the Church of St. Nikolas. The priest reported it on Sunday.'] },
      { where: 'vehicle', vtell: 'The registration plate is new, but the screws are rusted.', reveal: 'The car itself is stolen: chassis number reported in Milan. Plates swapped.' }
    ],
    declare: ['Souvenirs. Only souvenirs.', 'Some antiques I bought. Cheap things.'],
    q10: ['I am not nervous. You are making me nervous.', 'I bought these things legally. Anyone would be nervous with you looking like that.'],
    backstory: ['{first} works for a fence in {home} who sends couriers with “souvenirs” that are anything but.', '{first} lost everything in a bad business and now carries whatever pays.']
  },
  forged: {
    label: 'Forged documents', minDay: 1, nerv: 0.55, covers: ['beach', 'business', 'history', 'relatives', 'leaving'], forged: true,
    hides: [
      { where: 'luggage', item: ['Envelope in a sock', 'A sealed envelope pushed deep into a rolled sock.', 'An odd place for an envelope.', 'Another passport, a different name, the same face.'] },
      { where: 'none' }
    ],
    declare: ['Nothing.', 'Nothing, officer.'],
    q10: ['It has been a long trip.', 'I’m not nervous.', 'Do I look nervous? I am just tired.'],
    explain: ['It is... the passport office made a mistake. I did not notice.', 'That is how it was issued. I don’t know these things.', 'Is something wrong? It is a real passport. Very real.'],
    backstory: ['{first}’s real name is not {last}. Wanted for fraud at home, {first} bought a new identity for 3,000 dollars.', '{first} overstayed a visa years ago and was banned from re-entry. The new passport cost a year’s savings.']
  },
  cocaine: {
    label: 'Cocaine trafficking', minDay: 2, nerv: 0.45, covers: ['beach', 'business', 'leaving', 'musician', 'history'],
    hides: [
      { where: 'luggage', item: ['Coffee tins', 'Two tins of Italian coffee.', 'The lids have been glued shut.', 'Under a thin layer of coffee: 800 g of white powder in plastic. Field test: cocaine.'] },
      { where: 'luggage', item: ['Suitcase lining', 'The suitcase lining is smooth and tight.', 'The lining has been re-stitched with different thread.', 'Sewn into the lining: flat packets of white powder. Cocaine.'] },
      { where: 'luggage', item: ['Platform shoes', 'A pair of fashionable platform shoes.', 'The heels sound hollow when tapped.', 'Hollowed heels packed with cocaine, 300 g.'] },
      { where: 'luggage', item: ['Shampoo bottles', 'Four full bottles of shampoo.', 'The contents barely move when tipped.', 'Inside: cocaine paste in condoms, suspended in gel.'] },
      { where: 'body', atell: 'Declines the glass of water. Pale, sweating, holding the stomach.', reveal: 'X-ray at the port clinic: 60 swallowed capsules. Cocaine.' }
    ],
    declare: ['Nothing to declare.', 'Some coffee, for friends.'],
    q10: ['The ferry. Seasick.', 'I am fine. I am always this colour.'],
    backstory: ['{first} owes money to the wrong people in {home}. One trip clears the debt, they said.', '{first} has done this six times. The first time you sweat. The sixth time you sweat less.']
  },
  heroin: {
    label: 'Heroin trafficking', minDay: 3, nerv: 0.35, covers: ['trucker', 'business', 'family', 'relatives'],
    hides: [
      { where: 'vehicle', vtell: 'Fresh scratches around the door-panel screws.', reveal: 'Inside both door panels: 4 kg of brown heroin.' },
      { where: 'vehicle', vtell: 'The fuel gauge reads full, but the tank sounds hollow when knocked.', reveal: 'A sealed compartment inside the fuel tank: 6 kg of heroin.' },
      { where: 'luggage', item: ['Tins of olive oil', 'Four sealed tins of olive oil.', 'The seams have been re-soldered.', 'Each tin holds a sealed bag of heroin inside the oil.'] },
      { where: 'luggage', item: ['Tins of baby formula', 'Three tins of powdered baby milk.', 'The foil seals have been re-glued.', 'Heroin, mixed into the formula. 1.2 kg.'] }
    ],
    declare: ['Nothing.', 'Only what is on the manifest.'],
    q10: ['Me? I am calm as the sea.', 'I don’t like officials. Nothing personal.'],
    backstory: ['{first} is a courier for a network moving heroin west through Vardonian ports.', '{first} was promised a farm, a car, a future. Instead: a false compartment and a phone number.']
  },
  currency: {
    label: 'Currency smuggling', minDay: 3, nerv: 0.5, covers: ['business', 'relatives', 'beach', 'leaving', 'returning', 'departing'],
    hides: [
      { where: 'luggage', item: ['Shaving kit', 'A leather shaving kit.', 'The bottom is thicker than it should be.', 'False bottom: 9,000 Deutschmarks in large notes. Undeclared.'] },
      { where: 'luggage', item: ['Hardback books', 'Three thick hardback books.', 'The pages are glued together past chapter two.', 'Hollowed out: 12,000 US dollars.'] },
      { where: 'luggage', item: ['Rolled socks', 'A dozen pairs of rolled socks.', 'The socks crackle when squeezed.', 'Each pair hides a roll of dollars. 6,400 USD.'] },
      { where: 'clothing', atell: 'Jacket lining crackles faintly when the arms move.', reveal: 'Sewn into the jacket lining: 15,000 Swiss francs.' }
    ],
    declare: ['Nothing. A little cash for the holiday.', 'Only pocket money.'],
    q10: ['Not nervous. Thinking about my business.', 'I don’t like being stared at.'],
    backstory: ['{first} moves hard currency for Vardonian officials who would rather their savings lived in Zurich.', '{first} changes money on the black market; this run would have paid for a car.'],
    cashLie: true
  },
  weapons: {
    label: 'Weapons smuggling', minDay: 4, nerv: 0.35, covers: ['trucker', 'angler', 'worker', 'business', 'fisher'],
    hides: [
      { where: 'luggage', item: ['Toolbox', 'A heavy steel toolbox.', 'The tools inside fit nothing. No spanner, no screwdriver of any use.', 'Under the tray: two pistols, Makarov, and 100 rounds.'] },
      { where: 'luggage', item: ['Fishing rod tube', 'A long rod tube.', 'It rattles with a metallic sound.', 'Instead of rods: the barrel and stock of a dismantled rifle.'] },
      { where: 'luggage', item: ['Tinned tomatoes', 'A box of tinned tomatoes.', 'One tin has no label glue marks.', 'Ammunition, 7.62 mm, packed in grease.'] },
      { where: 'vehicle', vtell: 'The rear seat sits higher than normal.', reveal: 'Under the rear seat: four Kalashnikov rifles wrapped in oilcloth.' }
    ],
    declare: ['Tools. For work.', 'Fishing equipment.'],
    q10: ['I’m not nervous. Long drive.', 'You ask a lot of questions for a man in a box.'],
    backstory: ['{first} carries guns for anyone who pays. This shipment was bound for a smuggling crew in Tarsa.', '{first} sells surplus army weapons from the {home} depots.']
  },
  fugitive: {
    label: 'Political fugitive', minDay: 4, nerv: 0.7, political: true, covers: ['leaving'], forged: true, vaNative: true,
    hides: [
      { where: 'luggage', item: ['Book of Velkov’s speeches', 'A copy of “The Sea Belongs to the People”.', 'Something is pressed inside the cover.', 'A Vardonian identity card in a different name, and a photograph of a family.'] },
      { where: 'luggage', item: ['Bundle of letters', 'Letters tied with string.', 'Written in Vardonian, though the holder’s passport is foreign.', 'Letters to a wife in Kalimor: “when I am across, I will send for you.”'] }
    ],
    declare: ['Nothing. Nothing at all.', 'Only my clothes.'],
    q10: ['I... the ferry. I don’t like boats.', 'Please. I am just tired.'],
    explain: ['It is a real passport. I have had it many years. Many.', 'I don’t know, I’m not an expert in passports.'],
    backstory: ['{first} wrote a poem about Santa Veronica and read it aloud in a Kalimor bar. Someone reported it. The Directorate came the next morning; {first} was already gone.', '{first} organised an unofficial union at the Tarsa docks. Two colleagues have already disappeared.'],
    slip: 'Madre del mar— I mean, nothing. Sorry.'
  },
  spy: {
    label: 'Foreign intelligence', minDay: 5, nerv: 0.25, covers: ['history', 'beach', 'business', 'conference', 'leaving'],
    hides: [
      { where: 'luggage', item: ['Coin purse', 'A purse of loose change.', 'One coin is slightly thicker than the others.', 'A hollow coin. Inside: microfilm of the Tarsa naval yard.'] },
      { where: 'luggage', item: ['Notebook with ship times', 'A notebook of harbour sketches.', 'The ships listed carry hull numbers, the way navies number warships.', 'Patrol boat schedules and sketches of the Tarsa submarine pen. Not a hobby.'] },
      { where: 'luggage', item: ['Camera with telephoto lens', 'An expensive camera with a long lens.', 'The film counter reads 34 of 36, on a “beach” holiday.', 'Developed at the station: the radar installation on Cape Lumina, frame after frame.'] },
      { where: 'luggage', item: ['Transistor radio', 'An ordinary pocket radio.', 'The back cover screws are polished from use.', 'A one-time pad and a crystal for a hidden frequency.'] }
    ],
    declare: ['Nothing, officer.', 'Souvenirs. Postcards.'],
    q10: ['Am I? I hadn’t noticed. Perhaps the coffee.', 'Not at all.'],
    backstory: ['{first} is not a {occ}. {first} reports to a foreign station that wants pictures of the Tarsa naval yard.', '{first} was recruited at university. This is the third trip to the Vardonian coast.']
  },
  trafficker: {
    label: 'Human trafficking', minDay: 6, nerv: 0.3, covers: ['trucker', 'business'], trafficking: true,
    hides: [
      { where: 'vehicle', vtell: 'Three passports in the glovebox, none of them his.', reveal: 'The three passengers’ passports, held by the driver. Contracts in a language they cannot read. Debt ledgers.' },
      { where: 'luggage', item: ['Folder of “contracts”', 'Employment contracts for a “hotel”.', 'The hotel address is a bar in Tarsa known to the police.', 'Debt bonds signed by the women: travel “loans” of 5,000 dollars each.'] }
    ],
    declare: ['Nothing. They are my employees.', 'Only luggage.'],
    q10: ['Busy day. I have people waiting.', 'I’m not nervous. They are nervous. First time abroad.'],
    backstory: ['{first} recruits young women with promises of hotel jobs and sells their “debts” to bar owners in Tarsa.']
  }
};

const QUESTIONS = [
  { id: 1, text: 'Why are you visiting Vardonia?', outText: 'Why are you leaving Vardonia?' },
  { id: 2, text: 'Where exactly are you staying?', outText: 'Where exactly are you going?' },
  { id: 3, text: 'How long will you remain in the country?', outText: 'How long will you be away?' },
  { id: 4, text: 'What is your occupation?' },
  { id: 5, text: 'Do you have anything to declare?' },
  { id: 6, text: 'Who packed your luggage?' },
  { id: 7, text: 'Are you travelling alone?' },
  { id: 8, text: 'Have you visited Vardonia before?', outText: 'Have you left Vardonia before?' },
  { id: 9, text: 'Can you explain this document?' },
  { id: 10, text: 'Why are you nervous?' },
  { id: 11, text: 'How much cash are you carrying?' },
  { id: 12, text: 'Who are you meeting here?', outText: 'Who are you meeting there?' }
];

const ANSWERS = {
  stay: ['{stay}, in {town}.', 'We booked {stay}. It is in {town}, near the harbour, I think.', 'At {stay}, {town}. The address is on the permit.', '{stay}. In {town}. They promised a sea view.'],
  stayRel: ['With my {rel}, {relName}. {relAddr}.', 'At my {rel}’s house. {relAddr}. Blue door.'],
  stayHome: ['My flat. {relAddr}. Where else?', 'My own home, in {town}. {relAddr}.'],
  stayOut: ['Home, to {home}.', 'Back to {home}. My own bed, finally.'],
  stayAbroad: ['{abroadCity}, {abroad}. The address is on the visa.', 'In {abroadCity}. My {rel} has a flat there.'],
  stayTruck: ['I sleep in the cab. Delivery to {town}, then back.', 'Nowhere. Unload in {town}, sleep in the lorry, ferry tomorrow.'],
  dur: ['{dur} days.', '{durWords}. Then back to work, sadly.', 'Until the {endDate}. It is on the permit.', '{dur} days. Not one more, my boss says.'],
  durHome: ['I live here, officer. Forever, probably.', 'I am home. I am not going anywhere.'],
  durOut: ['{dur} days. I return on the {endDate}.', 'Until the {endDate}. Then home.'],
  durLeaving: ['I am leaving today, officer. That is the point.', 'Zero more days, sadly. The ferry is at four.'],
  packedSelf: ['I packed it myself.', 'Me. Badly, as you can see.', 'Myself, last night, at two in the morning.'],
  packedSpouse: ['My {spouse} packed it. I wouldn’t know where my socks are.', 'My {spouse}. I only carried it.'],
  alone: ['Yes, alone.', 'Alone. It is peaceful.', 'Just me.'],
  withSpouse: ['With my {spouse}, {spouseName}. Waiting behind me.', 'No, my {spouse} is with me.'],
  withFriend: ['With my friend {friendName}. In the other queue.', 'A friend came with me. {friendName}.'],
  withFamily: ['With my {spouse} and our {kidsN} children.', 'The whole family. {kidsN} children and my {spouse}.'],
  visitsNone: ['No, this is my first time.', 'Never. First visit.', 'Never before. I have wanted to come for years.'],
  visitsSome: ['Yes, {visits} times before.', 'I have been here {visits} times. I love this coast.', 'Yes. {visits} times. It is in my passport.'],
  cash: ['About {cashStr}.', '{cashStr}, more or less.', 'Around {cashStr}. Do you want to count it?'],
  cashBig: ['{cashStr}. I declared it. The form is there.', '{cashStr}, all declared.'],
  meetNone: ['No one. Only the sea.', 'Nobody. That is the point of a holiday.', 'No one in particular.'],
  meetRel: ['My {rel}, {relName}.', 'My family. My {rel} {relName}.'],
  meetBiz: ['Mr {contact} of the State Trading Enterprise.', 'Comrade {contact}, Ministry of Foreign Trade.', 'Our partner, {contact}, at the trade fair.'],
  meetEvent: ['The festival organisers.', 'The competition committee.', 'My professor’s colleague, Dr {contact}.'],
  meetWork: ['The shipyard foreman, {contact}.', 'The personnel office sends a man named {contact}.'],
  calm: ['I am not nervous, officer.', 'Nervous? No. Just tired.', 'Am I? I don’t feel nervous.'],
  explainNone: ['Which document, officer? Show me what you mean.', 'Explain what?'],
  explainFine: ['What is wrong with it? It is a normal document.', 'Everything is correct there, I think. Isn’t it?', 'I don’t see a problem. Is there a problem?'],
  declareNone: ['Nothing, officer.', 'Nothing to declare.', 'Only my clothes and my sunburn.'],
  declareGifts: ['Some gifts for family. Coffee, chocolate, stockings.', 'Two bottles of wine for my hosts. Nothing else.']
};

const DEFECT_EXPLAIN = {
  expired: ['Expired? Oh no. Oh no, no. I was sure it was valid until next year.', 'I didn’t check. My husband handles the papers.', 'It expired? Last month? Can’t you make an exception, just this once?'],
  missing: ['I was told I didn’t need that. The travel agent said so.', 'It is coming by post. They promised it would be ready.', 'I left it at the hotel in my other bag. I swear it exists.'],
  name: ['A typing error at the office. They spelled my name wrong, it happens all the time.', 'That clerk could not spell. It is me, I promise.'],
  number: ['The clerk must have copied it wrong. Look, it is almost the same.', 'I renewed my passport last month. The permit has the old number.'],
  overstay: ['I missed the ferry on Tuesday! The storm! It wasn’t my fault.', 'I extended at the hotel. I thought the permit was extended too.'],
  vaccine: ['Vaccination? Nobody told me about vaccination.', 'I had it in May! The paper is at home.'],
  generic: ['I don’t know. That’s how they gave it to me.', 'Is that a problem? Nobody said anything before.']
};

const BULLETIN_CRIMES = ['armed robbery in Velkovgrad', 'the murder of a customs officer', 'escape from Kalimor prison', 'smuggling and bribery of officials', 'the bombing of a Party office'];

const BOAT_NAMES = ['Santa Lucia', 'Bella Rosa', 'Stella Maris', 'Anna Maria', 'Gabbiano', 'Red October', 'Tre Fratelli', 'Mira II', 'Saint Aurelius', 'Dolphin'];

const KID_NAMES = ['Ana', 'Luka', 'Marco', 'Sofia', 'Petra', 'Nico', 'Lena', 'Tomas', 'Mia', 'Emil', 'Kristo', 'Dina'];

const CONTACTS = ['Vukaj', 'Ferrante', 'Lekaj', 'Morava', 'Strati', 'Sarandi', 'Noli', 'Kastrati', 'Grava', 'Barbaro'];


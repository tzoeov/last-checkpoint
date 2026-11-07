'use strict';

const START_DATE = { y: 1987, m: 6, d: 8 };
const CAMPAIGN_DAYS = 10;
const SHIFT_START_MIN = 8 * 60;
const SHIFT_END_MIN = 13 * 60;
const CASH_LIMIT_USD = 1000;
const TOBACCO_LIMIT = 200;

const SEAL_COLORS = {
  red: '#a8322d', green: '#3f6e3a', blue: '#2f557f', violet: '#5a3d7a',
  ochre: '#9a6b22', black: '#2b2b2b', teal: '#2f6f6b', brown: '#6b4a2b'
};

const COUNTRIES = {
  VA: {
    name: 'Vardonia', adj: 'Vardonian', bloc: 'east', minDay: 1, cur: 'aurels', usdRate: 0.25,
    cities: ['San Aurelio', 'Velkovgrad', 'Costa Lumina', 'Porto Neri', 'Kalimor', 'Monte Sibra', 'Tarsa'],
    issuing: ['Velkovgrad', 'San Aurelio', 'Kalimor'],
    seal: { glyph: '★', color: 'red', text: 'R.S. VARDONIA' }, fmt: 'VP-######',
    hello: 'Bonodì', thanks: 'Gratsi', interj: ['Ajo', 'Madre del mar', 'Eh, kamarad'], lang: 'Vardonian',
    m: ['Anton', 'Kiril', 'Teodor', 'Marko', 'Nikolas', 'Ilian', 'Stavro', 'Dragan', 'Luka', 'Petar', 'Andrei', 'Emil', 'Sandro', 'Jergo', 'Vasil', 'Mateo', 'Gavril', 'Rusmir'],
    f: ['Mira', 'Ana', 'Elena', 'Irena', 'Katarina', 'Liria', 'Dafina', 'Sofia', 'Teuta', 'Marina', 'Vesna', 'Rosa', 'Nadia', 'Ilaria', 'Zana', 'Oriana'],
    s: ['Barbaro', 'Danev', 'Marenko', 'Petrela', 'Ruskaj', 'Sarandi', 'Tomasi', 'Zadrima', 'Kostandin', 'Vukaj', 'Delvina', 'Morava', 'Strati', 'Ferrante', 'Grava', 'Noli', 'Kastrati', 'Benedetto', 'Lekaj', 'Mavros']
  },
  IT: {
    name: 'Italy', adj: 'Italian', bloc: 'west', minDay: 1, cur: 'lire', usdRate: 0.00075,
    cities: ['Roma', 'Milano', 'Napoli', 'Bari', 'Palermo', 'Genova', 'Torino', 'Firenze', 'Venezia', 'Bologna'],
    issuing: ['Roma', 'Milano', 'Napoli', 'Bari', 'Palermo'],
    seal: { glyph: '✦', color: 'green', text: 'REPUBBLICA ITALIANA' }, fmt: '@@#######',
    hello: 'Buongiorno', thanks: 'Grazie', interj: ['Allora', 'Mamma mia', 'Ecco', 'Madonna'], lang: 'Italian',
    m: ['Marco', 'Giuseppe', 'Luca', 'Antonio', 'Salvatore', 'Paolo', 'Franco', 'Stefano', 'Roberto', 'Enzo', 'Davide', 'Massimo', 'Vittorio'],
    f: ['Giulia', 'Maria', 'Francesca', 'Chiara', 'Lucia', 'Anna', 'Paola', 'Rosalba', 'Teresa', 'Elisa', 'Valentina', 'Carla'],
    s: ['Rossi', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Lombardi', 'Moretti', 'Barbieri']
  },
  GR: {
    name: 'Greece', adj: 'Greek', bloc: 'west', minDay: 1, cur: 'drachmas', usdRate: 0.0073,
    cities: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Piraeus', 'Larissa', 'Volos', 'Ioannina'],
    issuing: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'],
    seal: { glyph: '✚', color: 'blue', text: 'HELLENIC REPUBLIC' }, fmt: '@-#######',
    hello: 'Kaliméra', thanks: 'Efharistó', interj: ['Éla', 'Po po po', 'Re'], lang: 'Greek',
    m: ['Giorgos', 'Dimitris', 'Nikos', 'Kostas', 'Yannis', 'Panagiotis', 'Christos', 'Vasilis', 'Stavros', 'Manolis', 'Thanasis'],
    f: ['Maria', 'Eleni', 'Katerina', 'Sofia', 'Despina', 'Anna', 'Georgia', 'Dimitra', 'Vasiliki', 'Ioanna', 'Fotini'],
    s: ['Papadopoulos', 'Georgiou', 'Nikolaidis', 'Karagiannis', 'Oikonomou', 'Pappas', 'Vlachos', 'Antoniou', 'Makris', 'Christodoulou', 'Alexiou', 'Dimou', 'Kalogeropoulos']
  },
  YU: {
    name: 'Yugoslavia', adj: 'Yugoslav', bloc: 'nonaligned', minDay: 1, cur: 'dinars', usdRate: 0.0018,
    cities: ['Belgrade', 'Zagreb', 'Split', 'Sarajevo', 'Ljubljana', 'Skopje', 'Dubrovnik', 'Rijeka', 'Titograd'],
    issuing: ['Belgrade', 'Zagreb', 'Sarajevo', 'Skopje'],
    seal: { glyph: '✶', color: 'red', text: 'S.F.R. JUGOSLAVIJA' }, fmt: 'YU######',
    hello: 'Dobar dan', thanks: 'Hvala', interj: ['Ajde', 'Bre', 'Joj'], lang: 'Serbo-Croatian',
    m: ['Dragan', 'Milan', 'Zoran', 'Goran', 'Ivan', 'Branko', 'Dušan', 'Nenad', 'Bogdan', 'Tomislav', 'Ante', 'Mirko'],
    f: ['Jelena', 'Ivana', 'Snežana', 'Vesna', 'Milica', 'Gordana', 'Branka', 'Dragana', 'Marija', 'Ljiljana'],
    s: ['Jovanović', 'Horvat', 'Kovačević', 'Petrović', 'Babić', 'Marković', 'Novak', 'Đorđević', 'Perić', 'Kovač', 'Šarić', 'Tomić']
  },
  RO: {
    name: 'Romania', adj: 'Romanian', bloc: 'east', minDay: 1, cur: 'lei', usdRate: 0.11,
    cities: ['București', 'Cluj', 'Timișoara', 'Iași', 'Constanța', 'Brașov', 'Craiova'],
    issuing: ['București', 'Cluj', 'Iași'],
    seal: { glyph: '❂', color: 'ochre', text: 'R.S. ROMÂNIA' }, fmt: '########',
    hello: 'Bună ziua', thanks: 'Mulțumesc', interj: ['Doamne', 'Hai', 'Vai'], lang: 'Romanian',
    m: ['Ion', 'Gheorghe', 'Mihai', 'Vasile', 'Constantin', 'Florin', 'Adrian', 'Dan', 'Radu', 'Ovidiu', 'Sorin'],
    f: ['Elena', 'Maria', 'Ioana', 'Ana', 'Gabriela', 'Mihaela', 'Rodica', 'Daniela', 'Cristina', 'Florentina'],
    s: ['Popescu', 'Ionescu', 'Popa', 'Dumitru', 'Stan', 'Stoica', 'Gheorghiu', 'Munteanu', 'Constantinescu', 'Marin', 'Tudor', 'Dobre']
  },
  DE: {
    name: 'West Germany', adj: 'West German', bloc: 'west', minDay: 1, cur: 'Deutschmarks', usdRate: 0.55,
    cities: ['Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Bremen', 'Düsseldorf', 'Hannover', 'Bonn'],
    issuing: ['Bonn', 'Hamburg', 'München', 'Köln', 'Frankfurt'],
    seal: { glyph: '♛', color: 'black', text: 'BUNDESREPUBLIK' }, fmt: '@#######@',
    hello: 'Guten Tag', thanks: 'Danke', interj: ['Also', 'Na ja', 'Ach'], lang: 'German',
    m: ['Klaus', 'Wolfgang', 'Michael', 'Stefan', 'Rainer', 'Matthias', 'Jens', 'Hans', 'Helmut', 'Karl', 'Dirk'],
    f: ['Monika', 'Claudia', 'Susanne', 'Andrea', 'Ursula', 'Brigitte', 'Stefanie', 'Karin', 'Renate', 'Nicole'],
    s: ['Müller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Bauer', 'Koch', 'Hartmann', 'Braun']
  },
  GB: {
    name: 'United Kingdom', adj: 'British', bloc: 'west', minDay: 1, cur: 'pounds', usdRate: 1.6,
    cities: ['London', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Bristol', 'Belfast', 'Newcastle', 'Birmingham'],
    issuing: ['London', 'Glasgow', 'Liverpool', 'Belfast'],
    seal: { glyph: '♚', color: 'violet', text: 'UNITED KINGDOM' }, fmt: '#########',
    hello: 'Good afternoon', thanks: 'Cheers', interj: ['Right', 'Well', 'Blimey'], lang: 'English',
    m: ['David', 'John', 'Paul', 'Mark', 'Ian', 'Gary', 'Nigel', 'Colin', 'Simon', 'Graham', 'Trevor'],
    f: ['Susan', 'Karen', 'Julie', 'Tracey', 'Linda', 'Helen', 'Alison', 'Deborah', 'Fiona', 'Janet'],
    s: ['Smith', 'Jones', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright', 'Hughes', 'Clarke']
  },
  FR: {
    name: 'France', adj: 'French', bloc: 'west', minDay: 1, cur: 'francs', usdRate: 0.165,
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Bordeaux', 'Lille', 'Nantes', 'Toulon'],
    issuing: ['Paris', 'Marseille', 'Lyon', 'Lille'],
    seal: { glyph: '✿', color: 'blue', text: 'RÉPUBLIQUE FRANÇAISE' }, fmt: '##@@#####',
    hello: 'Bonjour', thanks: 'Merci', interj: ['Bon', 'Alors', 'Oh là là'], lang: 'French',
    m: ['Jean', 'Philippe', 'Michel', 'Alain', 'Pierre', 'Laurent', 'Christophe', 'Thierry', 'Patrick', 'Olivier'],
    f: ['Isabelle', 'Nathalie', 'Sylvie', 'Catherine', 'Sophie', 'Véronique', 'Martine', 'Christine', 'Hélène', 'Céline'],
    s: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Lefebvre', 'Girard']
  },
  BG: {
    name: 'Bulgaria', adj: 'Bulgarian', bloc: 'east', minDay: 2, cur: 'leva', usdRate: 1.2, gendered: 'slavic',
    cities: ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven'],
    issuing: ['Sofia', 'Plovdiv', 'Varna'],
    seal: { glyph: '✠', color: 'green', text: 'N.R. BALGARIYA' }, fmt: '@#######',
    hello: 'Dobar den', thanks: 'Blagodarya', interj: ['Abe', 'Ma', 'Hayde'], lang: 'Bulgarian',
    m: ['Georgi', 'Ivan', 'Dimitar', 'Petar', 'Hristo', 'Stoyan', 'Todor', 'Nikolai', 'Krasimir', 'Plamen'],
    f: ['Maria', 'Ivanka', 'Elena', 'Yordanka', 'Tsvetana', 'Radka', 'Snezhana', 'Galina', 'Rumyana', 'Daniela'],
    s: ['Ivanov', 'Georgiev', 'Dimitrov', 'Petrov', 'Nikolov', 'Hristov', 'Stoyanov', 'Todorov', 'Kolev', 'Angelov', 'Marinov', 'Iliev']
  },
  HU: {
    name: 'Hungary', adj: 'Hungarian', bloc: 'east', minDay: 2, cur: 'forints', usdRate: 0.021,
    cities: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr'],
    issuing: ['Budapest', 'Debrecen', 'Szeged'],
    seal: { glyph: '◆', color: 'red', text: 'M.N. KÖZTÁRSASÁG' }, fmt: '@@-######',
    hello: 'Jó napot', thanks: 'Köszönöm', interj: ['Hát', 'Na', 'Jaj'], lang: 'Hungarian',
    m: ['László', 'István', 'József', 'Zoltán', 'Sándor', 'Attila', 'Gábor', 'Ferenc', 'Tibor', 'Péter'],
    f: ['Erzsébet', 'Katalin', 'Mária', 'Ildikó', 'Zsuzsanna', 'Éva', 'Judit', 'Ágnes', 'Krisztina', 'Anikó'],
    s: ['Nagy', 'Kovács', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Németh', 'Farkas', 'Balogh', 'Papp']
  },
  AT: {
    name: 'Austria', adj: 'Austrian', bloc: 'west', minDay: 2, cur: 'schillings', usdRate: 0.078,
    cities: ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach'],
    issuing: ['Wien', 'Graz', 'Linz', 'Salzburg'],
    seal: { glyph: '✚', color: 'red', text: 'REPUBLIK ÖSTERREICH' }, fmt: 'A#######',
    hello: 'Grüß Gott', thanks: 'Danke schön', interj: ['Servus', 'Na', 'Geh'], lang: 'German',
    m: ['Franz', 'Josef', 'Johann', 'Gerhard', 'Herbert', 'Walter', 'Günther', 'Manfred', 'Alois', 'Peter'],
    f: ['Maria', 'Elisabeth', 'Theresia', 'Johanna', 'Gertrude', 'Monika', 'Christine', 'Andrea', 'Sabine', 'Brigitte'],
    s: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer', 'Leitner']
  },
  TR: {
    name: 'Turkey', adj: 'Turkish', bloc: 'west', minDay: 2, cur: 'lira', usdRate: 0.0012,
    cities: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Adana', 'Mersin', 'Trabzon'],
    issuing: ['Ankara', 'İstanbul', 'İzmir', 'Adana'],
    seal: { glyph: '☾', color: 'red', text: 'TÜRKİYE CUMHURİYETİ' }, fmt: '@-######',
    hello: 'Merhaba', thanks: 'Teşekkürler', interj: ['Yani', 'Vallahi', 'Aman'], lang: 'Turkish',
    m: ['Mehmet', 'Mustafa', 'Ahmet', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Murat', 'Kemal'],
    f: ['Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Hülya', 'Sevgi', 'Gülsüm', 'Nesrin'],
    s: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Kılıç', 'Aslan']
  },
  ES: {
    name: 'Spain', adj: 'Spanish', bloc: 'west', minDay: 3, cur: 'pesetas', usdRate: 0.0079,
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Zaragoza', 'Cádiz'],
    issuing: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
    seal: { glyph: '❖', color: 'red', text: 'REINO DE ESPAÑA' }, fmt: '@@######',
    hello: 'Buenas tardes', thanks: 'Gracias', interj: ['Bueno', 'Hombre', 'Venga'], lang: 'Spanish',
    m: ['José', 'Antonio', 'Manuel', 'Francisco', 'Javier', 'Miguel', 'Carlos', 'Rafael', 'Fernando', 'Jorge'],
    f: ['Carmen', 'Dolores', 'Pilar', 'Isabel', 'Lucía', 'Rosario', 'Mercedes', 'Montserrat', 'Ana', 'Teresa'],
    s: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz', 'Navarro', 'Torres']
  },
  NL: {
    name: 'Netherlands', adj: 'Dutch', bloc: 'west', minDay: 3, cur: 'guilders', usdRate: 0.49,
    cities: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen', 'Leiden'],
    issuing: ['Den Haag', 'Amsterdam', 'Rotterdam'],
    seal: { glyph: '❀', color: 'ochre', text: 'KONINKRIJK DER NEDERLANDEN' }, fmt: 'NL#######',
    hello: 'Goedemiddag', thanks: 'Dank u', interj: ['Nou', 'Hè', 'Jeetje'], lang: 'Dutch',
    m: ['Jan', 'Pieter', 'Kees', 'Henk', 'Willem', 'Bram', 'Joost', 'Ruud', 'Marco', 'Erik'],
    f: ['Anneke', 'Marieke', 'Ingrid', 'Ellen', 'Sanne', 'Monique', 'Petra', 'Wilma', 'Els', 'Linda'],
    s: ['de Jong', 'Jansen', 'de Vries', 'van den Berg', 'Bakker', 'Visser', 'Smit', 'Meijer', 'Mulder', 'de Boer']
  },
  DD: {
    name: 'East Germany', adj: 'East German', bloc: 'east', minDay: 3, cur: 'Ostmarks', usdRate: 0.12,
    cities: ['Berlin', 'Leipzig', 'Dresden', 'Rostock', 'Karl-Marx-Stadt', 'Magdeburg', 'Halle'],
    issuing: ['Berlin', 'Leipzig', 'Dresden'],
    seal: { glyph: '☼', color: 'black', text: 'DEUTSCHE DEM. REPUBLIK' }, fmt: 'DR#######',
    hello: 'Guten Tag', thanks: 'Danke', interj: ['Na', 'Mensch', 'Tja'], lang: 'German',
    m: ['Jürgen', 'Uwe', 'Frank', 'Thomas', 'Andreas', 'Holger', 'Ralf', 'Dieter', 'Bernd', 'Lutz'],
    f: ['Petra', 'Sabine', 'Kerstin', 'Heike', 'Martina', 'Birgit', 'Ute', 'Anja', 'Silke', 'Gabi'],
    s: ['Schulze', 'Krüger', 'Lehmann', 'Wolf', 'Neumann', 'Schmidt', 'Zimmermann', 'Hoffmann', 'Richter', 'Köhler']
  },
  MT: {
    name: 'Malta', adj: 'Maltese', bloc: 'nonaligned', minDay: 3, cur: 'Maltese pounds', usdRate: 2.9,
    cities: ['Valletta', 'Sliema', 'Birkirkara', 'Mosta', 'Qormi', 'Victoria'],
    issuing: ['Valletta'],
    seal: { glyph: '✙', color: 'violet', text: 'REPUBBLIKA TA’ MALTA' }, fmt: '#######',
    hello: 'Bongu', thanks: 'Grazzi', interj: ['Mela', 'Ejja', 'Iva'], lang: 'Maltese',
    m: ['Joseph', 'Carmel', 'Anthony', 'Mario', 'Charles', 'Paul', 'Emanuel', 'Raymond', 'Saviour', 'John'],
    f: ['Maria', 'Carmen', 'Doris', 'Josephine', 'Rita', 'Marthese', 'Antoinette', 'Graziella', 'Mary', 'Connie'],
    s: ['Borg', 'Camilleri', 'Vella', 'Farrugia', 'Zammit', 'Galea', 'Micallef', 'Grech', 'Attard', 'Spiteri']
  },
  PL: {
    name: 'Poland', adj: 'Polish', bloc: 'east', minDay: 4, cur: 'złoty', usdRate: 0.004, gendered: 'polish',
    cities: ['Warszawa', 'Kraków', 'Gdańsk', 'Łódź', 'Wrocław', 'Poznań', 'Szczecin'],
    issuing: ['Warszawa', 'Kraków', 'Gdańsk'],
    seal: { glyph: '♔', color: 'red', text: 'POLSKA R.L.' }, fmt: 'PL-######',
    hello: 'Dzień dobry', thanks: 'Dziękuję', interj: ['No', 'Jezus Maria', 'Kurczę'], lang: 'Polish',
    m: ['Piotr', 'Krzysztof', 'Andrzej', 'Tomasz', 'Paweł', 'Marek', 'Jan', 'Stanisław', 'Zbigniew', 'Jerzy'],
    f: ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Krystyna', 'Elżbieta', 'Joanna'],
    s: ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak']
  },
  CS: {
    name: 'Czechoslovakia', adj: 'Czechoslovak', bloc: 'east', minDay: 4, cur: 'koruny', usdRate: 0.1, gendered: 'czech',
    cities: ['Praha', 'Brno', 'Bratislava', 'Ostrava', 'Plzeň', 'Košice', 'Olomouc'],
    issuing: ['Praha', 'Bratislava', 'Brno'],
    seal: { glyph: '◈', color: 'blue', text: 'Č.S. SOCIALISTICKÁ REP.' }, fmt: '@######@',
    hello: 'Dobrý den', thanks: 'Děkuji', interj: ['No', 'Ježiš', 'Tak'], lang: 'Czech',
    m: ['Jan', 'Petr', 'Josef', 'Pavel', 'Jiří', 'Tomáš', 'Miroslav', 'Karel', 'Václav', 'Ladislav'],
    f: ['Jana', 'Marie', 'Eva', 'Hana', 'Anna', 'Lenka', 'Věra', 'Alena', 'Ivana', 'Zdeňka'],
    s: ['Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec']
  },
  TN: {
    name: 'Tunisia', adj: 'Tunisian', bloc: 'nonaligned', minDay: 4, cur: 'dinars', usdRate: 1.2,
    cities: ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Gabès', 'Kairouan', 'Monastir'],
    issuing: ['Tunis', 'Sfax', 'Sousse'],
    seal: { glyph: '✪', color: 'red', text: 'RÉPUBLIQUE TUNISIENNE' }, fmt: 'TN######',
    hello: 'Aslema', thanks: 'Shukran', interj: ['Yalla', 'Wallah', 'Ya rabbi'], lang: 'Arabic',
    m: ['Mohamed', 'Ahmed', 'Habib', 'Slim', 'Karim', 'Moncef', 'Hedi', 'Sami', 'Riadh', 'Nabil'],
    f: ['Fatma', 'Leila', 'Samia', 'Nadia', 'Amel', 'Saida', 'Monia', 'Rym', 'Hayet', 'Najet'],
    s: ['Ben Salah', 'Jaziri', 'Hammami', 'Gharbi', 'Mejri', 'Chaabane', 'Ayari', 'Dridi', 'Ferchichi', 'Mansouri', 'Sassi']
  },
  CY: {
    name: 'Cyprus', adj: 'Cypriot', bloc: 'nonaligned', minDay: 4, cur: 'Cypriot pounds', usdRate: 2.1,
    cities: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'],
    issuing: ['Nicosia'],
    seal: { glyph: '❦', color: 'teal', text: 'REPUBLIC OF CYPRUS' }, fmt: 'K######',
    hello: 'Kalimera', thanks: 'Efharisto', interj: ['Ela', 'Re koumbare', 'Aman'], lang: 'Greek',
    m: ['Andreas', 'Christakis', 'Kyriacos', 'Panayiotis', 'Michalis', 'Loizos', 'Savvas', 'Costas', 'Marios', 'Demetris'],
    f: ['Androulla', 'Maria', 'Eleni', 'Chrystalla', 'Panayiota', 'Georgia', 'Despo', 'Antigoni', 'Stella', 'Kyriaki'],
    s: ['Georgiou', 'Ioannou', 'Constantinou', 'Christou', 'Charalambous', 'Pavlou', 'Michael', 'Demetriou', 'Kyriacou', 'Savva']
  },
  SU: {
    name: 'Soviet Union', adj: 'Soviet', bloc: 'east', minDay: 5, cur: 'roubles', usdRate: 1.6, gendered: 'slavic',
    cities: ['Moskva', 'Leningrad', 'Kiev', 'Odessa', 'Minsk', 'Tbilisi', 'Riga', 'Sevastopol'],
    issuing: ['Moskva', 'Leningrad', 'Kiev'],
    seal: { glyph: '☭', color: 'red', text: 'S.S.S.R.' }, fmt: '##-######',
    hello: 'Zdravstvuyte', thanks: 'Spasibo', interj: ['Nu', 'Bozhe moi', 'Davai'], lang: 'Russian',
    m: ['Sergei', 'Vladimir', 'Alexei', 'Dmitri', 'Nikolai', 'Yuri', 'Andrei', 'Mikhail', 'Oleg', 'Viktor'],
    f: ['Natalia', 'Olga', 'Tatiana', 'Irina', 'Svetlana', 'Elena', 'Lyudmila', 'Galina', 'Marina', 'Yulia'],
    s: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Volkov', 'Fedorov']
  },
  SE: {
    name: 'Sweden', adj: 'Swedish', bloc: 'west', minDay: 5, cur: 'kronor', usdRate: 0.16,
    cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Linköping', 'Örebro'],
    issuing: ['Stockholm', 'Göteborg', 'Malmö'],
    seal: { glyph: '♕', color: 'blue', text: 'KONUNGARIKET SVERIGE' }, fmt: '######-##',
    hello: 'God dag', thanks: 'Tack', interj: ['Ja', 'Nej men', 'Oj'], lang: 'Swedish',
    m: ['Lars', 'Anders', 'Johan', 'Per', 'Mats', 'Björn', 'Magnus', 'Göran', 'Stefan', 'Nils'],
    f: ['Anna', 'Eva', 'Karin', 'Kristina', 'Lena', 'Ingrid', 'Birgitta', 'Maria', 'Ulla', 'Sofia'],
    s: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Lindqvist']
  },
  US: {
    name: 'United States', adj: 'American', bloc: 'west', minDay: 5, cur: 'dollars', usdRate: 1,
    cities: ['New York', 'Chicago', 'Boston', 'Philadelphia', 'Cleveland', 'Houston', 'Seattle', 'Baltimore'],
    issuing: ['Washington', 'New York', 'Chicago', 'Boston', 'Philadelphia'],
    seal: { glyph: '✯', color: 'blue', text: 'UNITED STATES' }, fmt: '#########',
    hello: 'Hi there', thanks: 'Thanks a bunch', interj: ['Okay', 'Gee', 'Look'], lang: 'English',
    m: ['Robert', 'James', 'Michael', 'William', 'Richard', 'Thomas', 'Gary', 'Steven', 'Kevin', 'Dennis'],
    f: ['Linda', 'Patricia', 'Barbara', 'Susan', 'Deborah', 'Nancy', 'Karen', 'Donna', 'Cynthia', 'Sharon'],
    s: ['Miller', 'Johnson', 'Williams', 'Davis', 'Anderson', 'Thompson', 'Moore', 'Jackson', 'Harris', 'Martin', 'Clark', 'Lewis']
  },
  LB: {
    name: 'Lebanon', adj: 'Lebanese', bloc: 'nonaligned', minDay: 5, cur: 'Lebanese pounds', usdRate: 0.004,
    cities: ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Zahlé', 'Byblos'],
    issuing: ['Beirut', 'Tripoli'],
    seal: { glyph: '♣', color: 'green', text: 'RÉPUBLIQUE LIBANAISE' }, fmt: 'RL######',
    hello: 'Marhaba', thanks: 'Merci, shukran', interj: ['Yalla', 'Khalas', 'Ya albi'], lang: 'Arabic',
    m: ['Georges', 'Elie', 'Karim', 'Walid', 'Nabil', 'Rami', 'Fadi', 'Ziad', 'Samir', 'Antoine'],
    f: ['Rita', 'Nada', 'Hala', 'Mireille', 'Layla', 'Carla', 'Rima', 'Joumana', 'Maya', 'Nour'],
    s: ['Haddad', 'Khoury', 'Nassar', 'Saad', 'Aoun', 'Salameh', 'Karam', 'Abou Jaoude', 'Mansour', 'Sfeir']
  },
  EG: {
    name: 'Egypt', adj: 'Egyptian', bloc: 'nonaligned', minDay: 5, cur: 'Egyptian pounds', usdRate: 0.45,
    cities: ['Cairo', 'Alexandria', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Ismailia'],
    issuing: ['Cairo', 'Alexandria', 'Port Said'],
    seal: { glyph: '▲', color: 'ochre', text: 'ARAB REP. OF EGYPT' }, fmt: '#######@',
    hello: 'Ahlan', thanks: 'Shukran', interj: ['Yalla', 'Ya salam', 'Inshallah'], lang: 'Arabic',
    m: ['Mahmoud', 'Ahmed', 'Mostafa', 'Tarek', 'Hany', 'Sherif', 'Amr', 'Khaled', 'Wael', 'Ashraf'],
    f: ['Mona', 'Heba', 'Nadia', 'Samira', 'Dalia', 'Rania', 'Ghada', 'Yasmin', 'Amal', 'Soha'],
    s: ['Abdel Rahman', 'El-Sayed', 'Hassan', 'Mansour', 'Farouk', 'Fawzy', 'Shaker', 'Ibrahim', 'Saleh', 'Naguib']
  }
};

const DISTRICTS = {
  SA: 'San Aurelio', VG: 'Velkovgrad', CL: 'Costa Lumina', PN: 'Porto Neri', KL: 'Kalimor', MS: 'Monte Sibra', TS: 'Tarsa'
};

const VA_SEALS = {
  interior: { glyph: '⚓', color: 'red', text: 'MINISTRY OF INTERIOR' },
  labour: { glyph: '⚙', color: 'blue', text: 'MINISTRY OF LABOUR' },
  harbour: { glyph: '⚓', color: 'blue', text: 'HARBOUR AUTHORITY' },
  information: { glyph: '✎', color: 'violet', text: 'MINISTRY OF INFORMATION' },
  party: { glyph: '★', color: 'ochre', text: 'CENTRAL COMMITTEE' },
  health: { glyph: '✚', color: 'green', text: 'MINISTRY OF HEALTH' },
  customs: { glyph: '⚖', color: 'brown', text: 'STATE CUSTOMS' },
  dss: { glyph: '◉', color: 'black', text: 'DIRECTORATE OF STATE SECURITY' }
};

const STAYS = [
  { name: 'Hotel Miramar', town: 'Costa Lumina', kind: 'hotel', tier: 2 },
  { name: 'Interturist Hotel Riviera', town: 'Costa Lumina', kind: 'hotel', tier: 3 },
  { name: 'Workers’ Rest Home No. 4', town: 'Costa Lumina', kind: 'rest', tier: 1 },
  { name: 'Campsite Pineta', town: 'Costa Lumina', kind: 'camp', tier: 1 },
  { name: 'Pensione Aurora', town: 'Porto Neri', kind: 'pension', tier: 1 },
  { name: 'Pensione Delfino', town: 'Porto Neri', kind: 'pension', tier: 1 },
  { name: 'Hotel Sultana', town: 'Kalimor', kind: 'hotel', tier: 2 },
  { name: 'Pensione Bella Vista', town: 'Kalimor', kind: 'pension', tier: 1 },
  { name: 'Hotel Velkov Palace', town: 'Velkovgrad', kind: 'hotel', tier: 3 },
  { name: 'Hotel Partizan', town: 'Velkovgrad', kind: 'hotel', tier: 2 },
  { name: 'Hotel Olimpia', town: 'Tarsa', kind: 'hotel', tier: 2 },
  { name: 'Seamen’s Hostel', town: 'Tarsa', kind: 'hostel', tier: 1 },
  { name: 'Guesthouse Lazaridis', town: 'Monte Sibra', kind: 'pension', tier: 1 },
  { name: 'Monastery Pilgrim House', town: 'Monte Sibra', kind: 'pilgrim', tier: 1 },
  { name: 'Hotel Faro', town: 'San Aurelio', kind: 'hotel', tier: 2 },
  { name: 'Hotel Lungomare', town: 'San Aurelio', kind: 'hotel', tier: 2 }
];

const STREETS = ['Via Garibaldi', 'Ulica Partizana', 'Rruga e Ullinjve', 'Via del Porto', 'Boulevard of the Revolution', 'Ulica Ribara', 'Vicolo dei Pescatori', 'Street of the First of May', 'Via San Aurelio', 'Rruga Kalaja', 'Avenue Anton Velkov', 'Lungomare Rosso'];

const CARS = {
  east: ['Lada 2105', 'Zastava 101', 'Trabant 601', 'Škoda 105', 'Dacia 1300', 'Wartburg 353', 'Moskvitch 412', 'Yugo 45'],
  west: ['Fiat 127', 'Renault 5', 'Volkswagen Golf', 'Peugeot 205', 'Opel Kadett', 'Ford Escort', 'Citroën 2CV', 'Mercedes 230E', 'Volvo 240', 'Alfa Romeo Giulietta'],
  truck: ['Kamaz 5320', 'TAM 130', 'IFA W50', 'Iveco Turbostar', 'Volvo F10', 'Mercedes LP 813'],
  van: ['Zastava Rival van', 'Volkswagen Transporter', 'Ford Transit', 'Barkas B1000', 'Fiat Ducato']
};
const CAR_COLORS = ['white', 'cream', 'pale blue', 'brick red', 'olive green', 'mustard yellow', 'grey', 'dark blue', 'orange', 'beige'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const REGULATIONS = [
  { id: 'R1', day: 1, title: 'Passports', text: 'Every traveller must present a valid passport. A passport past its expiry date is invalid.' },
  { id: 'R2', day: 1, title: 'Citizens', text: 'Vardonian citizens must also present a National Identity Card. Name, date of birth and photograph must match the passport.' },
  { id: 'R3', day: 1, title: 'Entry Permits', text: 'Foreign nationals entering the Republic require an Entry Permit. Name and passport number must match the passport, and the permit must be valid on the date of entry. Foreigners departing must not have overstayed the permit.' },
  { id: 'R4', day: 1, title: 'Contraband', text: 'Narcotics, weapons, undeclared commercial goods and stolen property are seized. The carrier is DETAINED.' },
  { id: 'R4b', day: 1, title: 'Deny or detain', text: 'Expired, incomplete or mistyped papers: DENY entry. Signs of FORGERY (wrong seal, wrong issuing office, wrong number format, a photograph of someone else, identity data that differs between documents): DETAIN.' },
  { id: 'R5', day: 2, title: 'Exit Visas', text: 'Vardonian citizens leaving the Republic require an Exit Visa issued by the Ministry of Interior.' },
  { id: 'R6', day: 2, title: 'Seals', text: 'Passports must carry the correct seal of the issuing state. Vardonian permits carry ministry seals. Consult the seal register.' },
  { id: 'R7', day: 3, title: 'Currency', text: 'Cash above 1,000 USD in total value must be declared on a Currency Declaration. Undeclared excess cash is currency smuggling: DETAIN.' },
  { id: 'R8', day: 3, title: 'Tobacco', text: 'Each adult may carry up to 200 cigarettes. Larger quantities are commercial smuggling: DETAIN.' },
  { id: 'R9', day: 3, title: 'Issuing offices', text: 'Passports must be issued in an authorised issuing city of their country. Consult the register.' },
  { id: 'R10', day: 4, title: 'Work & Sea', text: 'Foreigners entering for work require a Work Permit. Commercial fishermen crossing by sea require a Maritime Licence.' },
  { id: 'R11', day: 5, title: 'Officials', text: 'Officials holding a Diplomatic Pass with the Central Committee seal are exempt from the Entry Permit. Their passport must still be valid.' },
  { id: 'R12', day: 5, title: 'Number formats', text: 'Passport numbers must follow the issuing state’s format. Consult the register.' },
  { id: 'R13', day: 5, title: 'Wanted persons', text: 'Check the daily bulletin. A traveller matching a wanted notice must be DETAINED, whatever their papers say.' },
  { id: 'R14', day: 6, title: 'Cholera', text: 'Owing to a cholera outbreak, citizens of Egypt, Tunisia and Lebanon require a Vaccination Certificate issued within the last 180 days.' },
  { id: 'R15', day: 7, title: 'Press', text: 'Foreign journalists require Press Accreditation from the Ministry of Information. A journalist on a tourist permit is DENIED.' },
  { id: 'R16', day: 8, title: 'Identity cards', text: 'The letters of a Vardonian ID number must match the holder’s registered district. Consult the district list.' },
  { id: 'R17', day: 9, title: 'Weapons', text: 'Any firearm, ammunition or firearm part found on a traveller: DETAIN. No exceptions.' },
  { id: 'R18', day: 10, title: 'Emergency', text: 'STATE OF EMERGENCY. Exit Visas are valid only with the Directorate of State Security endorsement.' }
];

const VACCINE_NATS = ['EG', 'TN', 'LB'];

const RADIO_LINES = [
  'RADIO VARDONIA: The Sea Star State Fishing Cooperative exceeds its quarterly quota by 212 percent.',
  'RADIO VARDONIA: Supreme Leader Anton Velkov inspects the new cannery at Tarsa. Workers weep with gratitude.',
  'RADIO VARDONIA: Olive harvest projections revised upward for the fourth time this year.',
  'RADIO VARDONIA: Foreign radio stations spread lies. Tune only to the people’s frequency.',
  'RADIO VARDONIA: Weather for San Aurelio: sunshine, light mistral, socialist optimism.',
  'RADIO VARDONIA: The Ministry of Tourism welcomes 40,000 friends of peace to our beaches this summer.',
  'RADIO VARDONIA: A reminder that bread queues are a Western fabrication.',
  'RADIO VARDONIA: Comrade Velkov’s new book, “The Sea Belongs to the People”, is available in all bookshops.',
  'RADIO VARDONIA: The island of Santa Veronica remains closed to visitors for scientific work.',
  'RADIO VARDONIA: Border Police of Port San Aurelio praised for vigilance. Be vigilant. Be grateful.',
  'RADIO VARDONIA: Fishermen are reminded that night fishing beyond the third buoy requires Directorate permission.',
  'RADIO VARDONIA: The national football team draws 0-0 with Albania in a match of fraternal excellence.',
  'RADIO VARDONIA: Concert tonight in Kalimor: the People’s Mandolin Orchestra performs “Ode to the Tractor”.',
  'RADIO VARDONIA: Report rumour-mongers to your block committee. Rumours are a form of theft.',
  'RADIO VARDONIA: Ferry service to Bari and Patras continues on schedule. Schedules are a socialist achievement.'
];

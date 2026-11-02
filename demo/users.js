const baseSet = ['Alakazam','Blastoise','Chansey','Charizard','Clefairy','Gyarados','Hitmonchan','Machamp','Magneton','Mewtwo','Nidoking','Ninetales','Poliwrath','Raichu','Venusaur','Zapdos','Beedrill','Dragonair','Dugtrio','Electabuzz','Electrode','Pidgeotto','Arcanine','Charmeleon','Dewgong','Dratini',"Farfetch'd",'Growlithe','Haunter','Ivysaur','Jynx','Kadabra','Kakuna','Machoke','Magikarp','Magmar','Nidorino','Poliwhirl','Porygon','Raticate'];
/** Cards of the Base Set by number (1 to 40), as TCGdex draws them. */
const makeCards = (numbers) => numbers.map((id) => ({ id: `base1-${id}`, name: baseSet[id - 1], image: `https://assets.tcgdex.net/en/base/base1/${id}/low.webp` }));
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
/** Fictional local demo profiles. These are not user accounts. */
export const demoUsers = [
 { id: 'alex', name: 'Alex', collection: 'First partners', cards: makeCards(range(1, 25)) },
 { id: 'sam', name: 'Sam', collection: 'A fresh pack of 10', cards: makeCards([10, 6, 8, 11, 3, 14, 16, 9, 12, 7]) },
 { id: 'riley', name: 'Riley', collection: 'Retro gaming consoles', cards: [['Game Boy', 'game-boy-dmg-01'], ['Game Boy Advance', 'game-boy-advance-agb-001'], ['Nintendo 64', 'nintendo-64'], ['PlayStation 2', 'playstation-2-fat'], ['Nintendo DS', 'nintendo-ds-ntr-001']].map(([name, key]) => ({ id: `hako-${key}`, name, image: `https://cdn.jsdelivr.net/npm/@johnmorrisdotca/hako-devices@0.5.0/dist/assets/${key}.svg` })) }
];

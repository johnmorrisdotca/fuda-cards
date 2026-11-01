const makeCards = entries => entries.map(([name, id]) => ({id:`base1-${id}`, name, image:`https://assets.tcgdex.net/en/base/base1/${id}/low.webp`}));
/** Fictional local demo profiles. These are not user accounts. */
export const demoUsers = [
 {id:'alex', name:'Alex', collection:'First partners', cards:makeCards([['Charizard','4'],['Blastoise','2'],['Venusaur','15'],['Clefairy','5']])},
 {id:'sam', name:'Sam', collection:'Powerhouse Pokémon', cards:makeCards([['Mewtwo','10'],['Gyarados','6'],['Machamp','8'],['Nidoking','11']])},
 {id:'riley', name:'Riley', collection:'Retro gaming consoles', cards:[['Game Boy','game-boy-dmg-01'],['Game Boy Advance','game-boy-advance-agb-001'],['Nintendo 64','nintendo-64'],['PlayStation 2','playstation-2-fat'],['Nintendo DS','nintendo-ds-ntr-001']].map(([name,key])=>({id:`hako-${key}`,name,image:`https://johnmorrisdotca.github.io/hako-devices/assets/${key}.svg`}))}
];

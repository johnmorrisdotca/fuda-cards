/** Browser-native collection viewer. Import this module to register <fuda-collection>. */
export type CollectionView = 'deck' | 'rolodex' | 'binder' | 'case' | 'jukebox' | 'random' | 'story' | 'wall' | 'tower' | 'spotlight' | 'atlas';
export interface CollectionCard { id: string; name: string; image: string; backImage?: string }
export const collectionViews: ReadonlyArray<{id: CollectionView; label: string}> = [
  {id:'deck',label:'Overlapping Deck'}, {id:'rolodex',label:'Rolodex'}, {id:'binder',label:'Binder Pages'},
  {id:'case',label:'Convention Display Case'}, {id:'jukebox',label:'Jukebox Carousel'}, {id:'random',label:'Random Draw'},
  {id:'story',label:'Vertical Story Scroll'}, {id:'wall',label:'Sliding Gallery Wall'}, {id:'tower',label:'Flip Tower'},
  {id:'spotlight',label:'Spotlight Carousel'}, {id:'atlas',label:'Infinite Card Atlas'}
];
export function parseCollection(value: unknown): CollectionCard[] {
  if (!Array.isArray(value)) throw new Error('Collection must be an array.');
  const ids = new Set<string>();
  return value.map((item: unknown, i: number) => {
    if (!item || typeof item !== 'object') throw new Error(`Card ${i+1} must be an object.`);
    const c = item as Record<string, unknown>;
    if (typeof c.name !== 'string' || !c.name.trim() || typeof c.image !== 'string' || !c.image.trim()) throw new Error(`Card ${i+1} needs a name and image URL.`);
    const id = typeof c.id === 'string' && c.id ? c.id : String(i);
    if (ids.has(id)) throw new Error(`Duplicate card id: ${id}`); ids.add(id);
    if (c.backImage !== undefined && typeof c.backImage !== 'string') throw new Error(`Card ${i+1} backImage must be a URL.`);
    return {id,name:c.name,image:c.image, ...(c.backImage ? {backImage:c.backImage as string} : {})};
  });
}

/** Choose a matching card, avoiding the current card when another match exists. */
export function randomDrawIndex(cards: CollectionCard[], current: number, filter: string, random = Math.random): number | null {
  const query = filter.trim().toLocaleLowerCase();
  const matches = cards.map((card, index) => ({card, index})).filter(({card}) => card.name.toLocaleLowerCase().includes(query));
  if (!matches.length) return null;
  const alternatives = matches.filter(({index}) => index !== current);
  const pool = alternatives.length ? alternatives : matches;
  return pool[Math.floor(random() * pool.length)].index;
}

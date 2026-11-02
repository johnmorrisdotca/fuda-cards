export {fanLayout, deckLandings, normalizeLanding} from './pile.js';
export type {DeckLanding, FanPlace} from './pile.js';
/** Browser-native collection viewer. Import this module to register <fuda-collection>. */
export type CollectionView = 'deck' | 'rolodex' | 'binder' | 'case' | 'jukebox' | 'random' | 'story' | 'wall' | 'tower' | 'spotlight' | 'atlas' | 'fan';
export interface CollectionMetadata {
  set?: string; year?: number; number?: string; edition?: string;
  condition?: string; grade?: string; quantity?: number; notes?: string;
}
/**
 * What an item is. A `card` (the default, so every collection written before this field existed is still cards) is a flat, thin card with a back: it
 * turns in 3D, can be seen from behind and lands turned over when taken off a pile. An `object` is a picture of a thing that is not a card, such as a
 * games console: it has no back and no thickness, so it never turns over, is never seen from behind or edge-on, and always lands facing up. (A real 3D
 * object would be a third kind; none can be given as an image yet.)
 */
export type CollectionKind = 'card' | 'object';
export const collectionKinds: ReadonlyArray<CollectionKind> = ['card', 'object'];
export interface CollectionCard { id: string; name: string; image: string; backImage?: string; kind?: CollectionKind; metadata?: CollectionMetadata }
/** True for an item that is a card: anything that does not say it is an object. Only a card turns, has a back and lands turned over. */
export const isCard = (card: Pick<CollectionCard, 'kind'>): boolean => card.kind !== 'object';
/** The displays, in the order the buttons show them. `jukebox` and `tower` were two more names for the deck's pile of cards (no real counterpart for cards, and the same drawing), so they are no longer offered; see `collectionViewAliases`. */
export const collectionViews: ReadonlyArray<{id: CollectionView; label: string}> = [
  {id:'deck',label:'Overlapping Deck'}, {id:'rolodex',label:'Rolodex'}, {id:'binder',label:'Binder Pages'},
  {id:'case',label:'Convention Display Case'}, {id:'random',label:'Random Draw'},
  {id:'story',label:'Vertical Story Scroll'}, {id:'wall',label:'Sliding Gallery Wall'},
  {id:'spotlight',label:'Spotlight Carousel'}, {id:'atlas',label:'Card Table'}, {id:'fan',label:'Fan of Cards'}
];
/** Display names that earlier versions accepted and that now open another display, so a page that sets them keeps working. */
export const collectionViewAliases: Readonly<Record<string, CollectionView>> = {jukebox:'deck', tower:'deck'};
export function parseCollection(value: unknown): CollectionCard[] {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'cards' in value) value = (value as {cards: unknown}).cards;
  if (!Array.isArray(value)) throw new Error('Collection must be an array or an object containing a cards array.');
  const ids = new Set<string>();
  return value.map((item: unknown, i: number) => {
    if (!item || typeof item !== 'object') throw new Error(`Card ${i+1} must be an object.`);
    const c = item as Record<string, unknown>;
    if (typeof c.name !== 'string' || !c.name.trim() || typeof c.image !== 'string' || !c.image.trim()) throw new Error(`Card ${i+1} needs a name and image URL.`);
    const id = typeof c.id === 'string' && c.id ? c.id : String(i);
    if (ids.has(id)) throw new Error(`Duplicate card id: ${id}`); ids.add(id);
    if (c.backImage !== undefined && typeof c.backImage !== 'string') throw new Error(`Card ${i+1} backImage must be a URL.`);
    if (c.kind !== undefined && !collectionKinds.includes(c.kind as CollectionKind)) throw new Error(`Card ${i+1} kind must be "card" or "object".`);
    let metadata: CollectionMetadata | undefined;
    if (c.metadata !== undefined) {
      if (!c.metadata || typeof c.metadata !== 'object' || Array.isArray(c.metadata)) throw new Error(`Card ${i+1} metadata must be an object.`);
      const m=c.metadata as Record<string, unknown>;
      for (const key of ['set','number','edition','condition','grade','notes']) if (m[key] !== undefined && typeof m[key] !== 'string') throw new Error(`Card ${i+1} metadata.${key} must be a string.`);
      for (const key of ['year','quantity']) if (m[key] !== undefined && (typeof m[key] !== 'number' || !Number.isSafeInteger(m[key]) || (m[key] as number) < (key === 'quantity' ? 1 : 0))) throw new Error(`Card ${i+1} metadata.${key} must be a valid integer.`);
      metadata={};
      for (const key of ['set','number','edition','condition','grade','notes'] as const) if (typeof m[key] === 'string') metadata[key]=m[key];
      for (const key of ['year','quantity'] as const) if (typeof m[key] === 'number') metadata[key]=m[key];
    }
    return {id,name:c.name,image:c.image, ...(c.backImage ? {backImage:c.backImage as string} : {}), ...(c.kind === 'object' ? {kind:'object' as const} : {}), ...(metadata ? {metadata} : {})};
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

/** Return the first card index of a wrapped page. */
export function movePage(index: number, length: number, pageSize: number, delta: number): number {
  if (length === 0) return 0;
  const pages = Math.ceil(length / pageSize);
  const page = Math.floor(index / pageSize);
  return (((page + delta) % pages + pages) % pages) * pageSize;
}



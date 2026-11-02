import {stackLayout} from './stack.js';
/** Browser-native collection viewer. Import this module to register <fuda-collection>. */
export type CollectionView = 'deck' | 'rolodex' | 'binder' | 'case' | 'jukebox' | 'random' | 'story' | 'wall' | 'tower' | 'spotlight' | 'atlas' | 'fan';
export interface CollectionMetadata {
  set?: string; year?: number; number?: string; edition?: string;
  condition?: string; grade?: string; quantity?: number; notes?: string;
}
export interface CollectionCard { id: string; name: string; image: string; backImage?: string; metadata?: CollectionMetadata }
export const collectionViews: ReadonlyArray<{id: CollectionView; label: string}> = [
  {id:'deck',label:'Overlapping Deck'}, {id:'rolodex',label:'Rolodex'}, {id:'binder',label:'Binder Pages'},
  {id:'case',label:'Convention Display Case'}, {id:'jukebox',label:'Jukebox Carousel'}, {id:'random',label:'Random Draw'},
  {id:'story',label:'Vertical Story Scroll'}, {id:'wall',label:'Sliding Gallery Wall'}, {id:'tower',label:'Flip Tower'},
  {id:'spotlight',label:'Spotlight Carousel'}, {id:'atlas',label:'Infinite Card Atlas'}, {id:'fan',label:'Fan of Cards'}
];
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
    return {id,name:c.name,image:c.image, ...(c.backImage ? {backImage:c.backImage as string} : {}), ...(metadata ? {metadata} : {})};
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


/** How a card flipped off the deck lands on the pile at its other side. */
export type DeckLanding = 'face-up' | 'upside-down' | 'face-down';
export const deckLandings: ReadonlyArray<{id: DeckLanding; label: string}> = [
  {id:'face-up',label:'Still facing up'}, {id:'upside-down',label:'Upside down'}, {id:'face-down',label:'Face down'}
];

/** Where the cards of a fan lie, first card on the left when open and on top when closed. `open` is the fan spread like a hand of playing cards; `closed` is the squared-up deck it starts from and closes back to. */
export interface FanPlace { angle: number; x: number; y: number; closedAngle: number; closedX: number; closedY: number }
export function fanLayout(count: number, seed = 1): FanPlace[] {
  const n = Math.max(0, Math.floor(count));
  if (!n) return [];
  const spread = Math.min(110, 11 * (n - 1)), step = n > 1 ? spread / (n - 1) : 0;
  const nudge = stackLayout(n, {messiness: 0.25, seed, depth: n});
  return Array.from({length: n}, (_, i) => {
    const under = i >= 1 ? nudge[i - 1] : undefined;
    return {
      angle: Math.round((-spread / 2 + i * step) * 100) / 100,
      x: Math.round((i - (n - 1) / 2) * 0.34 * 1000) / 1000,
      y: 0,
      closedAngle: under ? under.rotate / 3 : 0,
      closedX: under ? under.x : 0,
      closedY: under ? under.y : 0
    };
  });
}

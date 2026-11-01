/** Convert TCGdex set records into display-ready full-card images. */
export function normalizeSet(data) {
  if (!data || !Array.isArray(data.cards)) throw new Error('The card service returned an unexpected response.');
  return data.cards.filter(card => card && typeof card.id === 'string' && typeof card.name === 'string').map(card => ({
    id: card.id, name: card.name, number: String(card.localId ?? ''),
    image: typeof card.image === 'string' && /^https:\/\/assets\.tcgdex\.net\//.test(card.image) ? `${card.image}/low.webp` : null,
    largeImage: typeof card.image === 'string' && /^https:\/\/assets\.tcgdex\.net\//.test(card.image) ? `${card.image}/high.webp` : null
  }));
}
export async function fetchSet(fetcher = fetch) {
  const response = await fetcher('https://api.tcgdex.net/v2/en/sets/base1');
  if (!response.ok) throw new Error(`The card service returned HTTP ${response.status}.`);
  return normalizeSet(await response.json());
}

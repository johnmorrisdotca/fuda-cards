import { parseCollection } from "../dist/collection.js";

const prefix = "fuda-demo-collections-v2:";
export const legacyKey = "fuda-demo-collections-v1";
const keyFor = (user) => prefix + user;

function readObject(storage, key) {
  const raw = storage.getItem(key);
  if (raw === null) return {};
  const value = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Saved collection data is invalid.");
  return value;
}
export function listCollections(storage, user) {
  return readObject(storage, keyFor(user));
}
export function saveCollection(storage, user, name, cards) {
  const key = name.trim();
  if (!key) throw new Error("Enter a collection name.");
  const all = listCollections(storage, user);
  Object.defineProperty(all, key, {
    value: parseCollection(cards),
    enumerable: true,
    configurable: true,
    writable: true,
  });
  storage.setItem(keyFor(user), JSON.stringify(all));
}
export function deleteCollection(storage, user, name) {
  const all = listCollections(storage, user);
  if (!Object.hasOwn(all, name)) throw new Error("Collection not found.");
  delete all[name];
  storage.setItem(keyFor(user), JSON.stringify(all));
}
export function importLegacy(storage, user) {
  const legacy = readObject(storage, legacyKey);
  const all = listCollections(storage, user);
  let count = 0;
  for (const [name, cards] of Object.entries(legacy)) {
    if (Object.hasOwn(all, name)) continue;
    Object.defineProperty(all, name, {
      value: parseCollection(cards),
      enumerable: true,
      configurable: true,
      writable: true,
    });
    count++;
  }
  storage.setItem(keyFor(user), JSON.stringify(all));
  return count;
}

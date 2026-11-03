import assert from "node:assert/strict";
import { test } from "node:test";
import { demoUsers } from "../demo/users.js";
import { parseCollection } from "../dist/collection.js";

test("demo profiles have distinct, valid collections, and the Pokémon ones are big enough to fill a page and a pack", () => {
  assert.equal(demoUsers.length, 3);
  assert.equal(new Set(demoUsers.map((user) => user.id)).size, 3);
  const sets = demoUsers.map((user) =>
    parseCollection(user.cards)
      .map((card) => card.id)
      .sort()
      .join(","),
  );
  assert.equal(new Set(sets).size, 3);
  const [alex, sam] = demoUsers;
  assert.equal(alex.cards.length, 25, "a 5 by 5 binder page");
  assert.equal(sam.cards.length, 10, "a pack of 10");
  for (const user of [alex, sam])
    for (const card of user.cards) {
      assert.ok(card.name && !/undefined/.test(card.name), card.id);
      assert.match(card.image, /^https:\/\/assets\.tcgdex\.net\/en\/base\/base1\/\d+\/low\.webp$/);
    }
});

// @ts-check

import { Converter } from 'typedoc';

const UNSAFE_ALIAS_CHARACTERS = /[^\p{Letter}\p{Mark}\p{Number}_$-]/gu;
const aliases = new WeakMap();

/**
 * Keep Unicode identifier characters in generated documentation URLs while
 * replacing path separators and other URL/file-name punctuation.
 *
 * @param {string} name
 */
export function getUrlSafeAlias(name) {
  return name.normalize('NFC').replace(UNSAFE_ALIAS_CHARACTERS, '_');
}

/** @this {import('typedoc').Reflection} */
function getAlias() {
  let alias = aliases.get(this);
  if (!alias) {
    alias = this.getUniqueAliasInPage(getUrlSafeAlias(this.name) || `reflection-${this.id}`);
    aliases.set(this, alias);
  }
  return alias;
}

/** @param {import('typedoc').Application} app */
export function load(app) {
  app.converter.on(Converter.EVENT_RESOLVE, (_context, reflection) => {
    Object.defineProperty(reflection, 'getAlias', {
      configurable: true,
      value: getAlias,
    });
  });
}

import { insertInto } from '../lib/utils';

import raw資料 from './raw/切韻';

import type { 內部條目Common } from './common';

export type 內部切韻條目 = 內部條目Common & { 來源: '切韻'; 對應廣韻小韻號: string };

export const by原書小韻 = new Map<number, 內部切韻條目[]>();
export const by小韻 = new Map<string, 內部切韻條目[]>();

export const 字頭或體by內部條目 = new Map<內部切韻條目, string[]>();

(function 解析資料() {
  let 當前原書小韻號 = 0;
  let 當前韻目 = '';
  for (const line of raw資料.trimEnd().split('\n')) {
    if (line.startsWith('#')) {
      當前韻目 = line.slice(1);
      continue;
    }
    當前原書小韻號 += 1;
    const [音韻, 內容] = line.split(';');
    const 各音切: [string, string, string | null, string | null][] = [];
    for (const 音切 of 音韻.split('|')) {
      const 編碼 = 音切.slice(0, 3);
      const 對應廣韻小韻號 = /^\d+[a-z]?/.exec(音切.slice(3))![0];
      const [反切, 直音] = 音切.slice(3 + 對應廣韻小韻號.length).split('=');
      各音切.push([編碼, 對應廣韻小韻號, 反切 || null, 直音 || null]);
    }

    let 當前小韻字號 = 0;
    const 各條目: 內部切韻條目[] = [];
    for (const 條目str of 內容.split('|')) {
      const [, 字頭, 字頭或體, 細分號, 釋義] = /^([^+:]+?)((?:\+[^+:]+)*):([a-z]?)([^a-z+-]*)$/.exec(條目str)!;
      const 小韻號 = String(當前原書小韻號) + 細分號;
      const 細分index = 細分號 ? 細分號.charCodeAt(0) - 'a'.charCodeAt(0) : 0;
      const [音韻編碼, 對應廣韻小韻號, 反切, 直音] = 各音切[細分index];
      當前小韻字號++;

      const 條目: 內部切韻條目 = {
        來源: '切韻',
        音韻編碼,
        字頭,
        字頭說明: null,
        小韻號,
        對應廣韻小韻號,
        小韻字號: String(當前小韻字號),
        韻目: 當前韻目,
        反切,
        直音,
        釋義: 釋義 || null,
        釋義上下文: null,
      };
      各條目.push(條目);

      字頭或體by內部條目.set(條目, 字頭或體.slice(1).split('+'));
    }

    by原書小韻.set(當前原書小韻號, 各條目);
    for (const 條目 of 各條目) {
      insertInto(by小韻, 條目.小韻號, 條目);
    }
  }
})();

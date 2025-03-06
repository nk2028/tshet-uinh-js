import { insertInto } from '../lib/utils';

import { 上下文條目, 內部條目Common } from './common';
import raw資料 from './raw/廣韻';

export type 內部廣韻條目 = 內部條目Common & { 來源: '廣韻' };

export const by原書小韻 = new Map<number, 內部廣韻條目[]>();
export const by小韻 = new Map<string, 內部廣韻條目[]>();

(function 解析資料() {
  let 原書小韻號 = 0;
  let 韻目 = '';
  for (const line of raw資料.slice(0, -1).split('\n')) {
    if (line.startsWith('#')) {
      韻目 = line.slice(1);
      continue;
    }
    原書小韻號 += 1;

    const [音韻, 內容] = line.split(';');
    const 各音切: [string, string | null, string | null][] = [];
    for (const 音切 of 音韻.split('|')) {
      const 編碼 = 音切.slice(0, 3);
      const [反切, 直音] = 音切.slice(3).split('=');
      各音切.push([編碼, 反切 || null, 直音 || null]);
    }

    let 原書字號 = 0;
    let 增字號 = 0;

    const 各條目: 內部廣韻條目[] = [];
    const 各釋義參照: string[] = [];

    for (const 條目str of 內容.split('|')) {
      const [, 字頭, 字頭說明, 細分號, 釋義參照, 釋義] = /^(.+?)(?:【(.*)】)?:([a-z]?)([+-]?)([^a-z+-]*)$/.exec(條目str)!;
      const 小韻號 = String(原書小韻號) + 細分號;
      const 細分index = 細分號 ? 細分號.charCodeAt(0) - 'a'.charCodeAt(0) : 0;
      const [音韻編碼, 反切, 直音] = 各音切[細分index];
      if (字頭.startsWith('［')) {
        增字號++;
      } else {
        原書字號++;
        增字號 = 0;
      }
      const 條目: 內部廣韻條目 = {
        來源: '廣韻',
        音韻編碼,
        字頭,
        字頭說明: 字頭說明 || null,
        小韻號,
        小韻字號: `${原書字號}` + (增字號 ? `a${增字號}` : ''),
        韻目,
        反切,
        直音,
        釋義: 釋義 || null,
        釋義上下文: null,
      };
      各條目.push(條目);
      各釋義參照.push(釋義參照);
    }

    generate釋義上下文(各條目, 各釋義參照, false);
    generate釋義上下文(各條目, 各釋義參照, true);

    by原書小韻.set(原書小韻號, 各條目);
    for (const 條目 of 各條目) {
      insertInto(by小韻, 條目.小韻號, 條目);
    }
  }
})();

function generate釋義上下文(各條目: 內部廣韻條目[], 各釋義參照: string[], forDeletions: boolean) {
  const isDeletion = (條目: 內部廣韻條目) => 條目.字頭.endsWith('｝');
  if (forDeletions && !各條目.some(isDeletion)) {
    return;
  }

  const shouldInclude = forDeletions ? () => true : (i: number) => !isDeletion(各條目[i]);
  const 參照string = 各釋義參照.flatMap((x, i) => (shouldInclude(i) ? [x || ' '] : [])).join('');
  const indices = 各條目.flatMap((_x, i) => (shouldInclude(i) ? [i] : []));

  // 一個無參照條目，後可接若干「上」參照，每項亦均可前接若干「下」參照
  for (const match of 參照string.matchAll(/-* (?:-*\+)*/g)) {
    const matchString = match[0];
    const pos = match.index;
    const len = matchString.length;
    if (len === 1) {
      continue;
    }
    if (forDeletions && !各條目.slice(pos, pos + len).some(isDeletion)) {
      continue;
    }
    const 上下文: 上下文條目[] = 各條目
      .slice(pos, pos + len)
      .map(({ 字頭, 字頭說明, 小韻字號, 釋義 }) => ({ 字頭, 字頭說明, 小韻字號, 釋義 }));
    for (const idx of indices.slice(pos, pos + len)) {
      if (forDeletions && !isDeletion(各條目[idx])) {
        continue;
      }
      各條目[idx].釋義上下文 = 上下文;
    }
  }
}

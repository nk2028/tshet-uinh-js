import { insertInto } from '../lib/utils';

import { 內部條目Common } from './common';
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

    // TODO(feat) 生成釋義上下文

    by原書小韻.set(原書小韻號, 各條目);
    for (const 條目 of 各條目) {
      insertInto(by小韻, 條目.小韻號, 條目);
    }
  }
})();

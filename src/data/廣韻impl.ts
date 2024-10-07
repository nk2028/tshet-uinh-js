import { insertInto } from '../lib/utils';

import raw資料 from './raw/廣韻.txt';

export interface 內部廣韻條目 {
  字頭: string;
  音韻編碼: string | null;
  反切: string | null;
  釋義: string;
  小韻號: string;
  韻目原貌: string;
}

export const by原書小韻 = new Map<number, 內部廣韻條目[]>();
export const by小韻 = new Map<string, 內部廣韻條目[]>();

(function 解析資料() {
  let 原書小韻號 = 0;
  let 韻目原貌 = '';
  let pos = 0;
  for (;;) {
    const posLF = raw資料.indexOf('\n', pos);
    if (posLF === -1) {
      break;
    }
    const line = raw資料.slice(pos, posLF + 1);
    pos = posLF + 1;

    if (line.startsWith('#')) {
      韻目原貌 = line.slice(1, -1);
      continue;
    }
    原書小韻號 += 1;

    const [, 音韻, 內容] = /^((?:[\w$@]{3}..)+)(.*\n)$/u.exec(line)!;
    const 各地位反切: [string | null, string | null][] = [];
    for (const [, 編碼str, 反切str] of 音韻.matchAll(/(...)(..)/gu)) {
      const 編碼 = 編碼str === '@@@' ? null : 編碼str;
      const 反切 = 反切str === '@@' ? null : 反切str;
      各地位反切.push([編碼, 反切]);
    }
    for (const [, 字頭, 細分, 釋義] of 內容.matchAll(/(.)([a-z]?)(.*?)[|\n]/gu)) {
      const 小韻號 = String(原書小韻號) + 細分;
      const 細分index = (細分 || 'a').charCodeAt(0) - 'a'.charCodeAt(0);
      const [音韻編碼, 反切] = 各地位反切[細分index];
      const 條目 = { 字頭, 音韻編碼, 反切, 釋義, 小韻號, 韻目原貌 };
      insertInto(by原書小韻, 原書小韻號, 條目);
      insertInto(by小韻, 小韻號, 條目);
    }
  }
})();

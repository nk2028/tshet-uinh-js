import { decode音韻編碼 } from '../lib/壓縮表示';
import type { 資料條目Common } from '../lib/資料';
import type { 音韻地位 } from '../lib/音韻地位';

import type { 切韻條目 } from './切韻';
import type { 廣韻條目 } from './廣韻';
import type { 內部廣韻條目 } from './廣韻impl';

// TODO(docs) 完善說明
export interface 資料條目CommonFields {
  音韻地位: 音韻地位;
  /**
   * 字頭。可能含有校勘標記
   */
  字頭: string;
  字頭說明: string | null;
  /**
   * 小韻號。
   *
   * 部分小韻含多個音韻地位，會依音韻地位拆分，並有細分號（後綴 -a、-b 等），故為字串格式。
   * @see {@link 廣韻.get小韻}
   */
  小韻號: string;
  /**
   * 小韻內字頭序號。
   *
   * 部分字頭為增字，字號形如 `<原書字序號>a<增序號>`，如 `1a1`，故為字串格式。
   */
  小韻字號: string;
  /** 原書韻目，與音韻地位不一定對應 */
  韻目: string;
  /** 反切。可能含有校勘標記。若該小韻未用反切注音（如「音某字某聲」）則為 `null` */
  反切: string | null;
  直音: string | null;
  /** 釋義。僅含該單字下的釋義，該單字無釋義時為 `null`。 */
  釋義: string | null;
  /** 釋義上下文。包含與該條目相關（如釋義為「上同」之類時）的若干條目的字頭釋義。 */
  釋義上下文: 上下文條目[] | null;
}
export interface 上下文條目 {
  字頭: string;
  字頭說明: string | null;
  小韻字號: string;
  釋義: string | null;
}

// TODO(docs) 說明
export interface 資料條目Methods {
  字頭詳情(): [string | null, string | null];
  字頭原貌(): string | null;
  字頭校正(): string | null;
  反切詳情(): [string[], string[]];
  反切原貌(): string | null;
  反切校正(): string | null;
}

const 資料條目methods: 資料條目Methods = {
  字頭詳情(this: 資料條目Common): [string | null, string | null] {
    return 字頭詳情(this.字頭);
  },
  字頭原貌(this: 資料條目Common): string | null {
    return this.字頭詳情()[0];
  },
  字頭校正(this: 資料條目Common): string | null {
    return this.字頭詳情()[1];
  },
  反切詳情(this: 資料條目Common): [string[], string[]] {
    return 反切詳情(this.反切);
  },
  反切原貌(this: 資料條目Common): string | null {
    return this.反切?.replace(/［.］|〈.〉|〘.〙|（.）|｟.｠/g, '') ?? null;
  },
  反切校正(this: 資料條目Common): string | null {
    if (!this.反切) {
      return null;
    }
    const [上字, 下字] = this.反切詳情();
    return [上字, 下字].map(chs => (chs.length === 1 ? chs[0] : chs[chs.length - 1].slice(1, -1))).join('');
  },
};

export function 字頭詳情(字頭: string): [string | null, string | null] {
  if (字頭.startsWith('［')) {
    return [null, 字頭.slice(1, -1)];
  } else if (字頭.startsWith('｛')) {
    return [字頭.slice(1, -1), null];
  } else if (字頭.endsWith('〉')) {
    return 字頭.slice(0, -1).split('〈') as [string, string];
  } else {
    return [字頭, 字頭];
  }
}

export function 反切詳情(反切: string | null): [string[], string[]] {
  if (!反切) {
    return [[''], ['']];
  }
  const res: string[][] = [];
  const chs = [...反切];
  let i = 0;
  while (i < chs.length) {
    const ch = chs[i];
    switch (ch) {
      case '［':
        res.push(['', chs.slice(i, i + 3).join('')]);
        i += 3;
        break;
      case '〈':
      case '〘':
      case '（':
      case '｟':
        res[res.length - 1].push(chs.slice(i, i + 3).join(''));
        i += 3;
        break;
      default:
        res.push([ch]);
        i += 1;
    }
  }
  return res as [string[], string[]];
}

export type 內部條目Common = Omit<資料條目CommonFields, '音韻地位'> & { 音韻編碼: string };

export type 內部切韻條目 = 內部條目Common & { 來源: '切韻'; 對應廣韻小韻號: string };

type 內部條目對應<T> = T extends 內部切韻條目 ? 切韻條目 : T extends 內部廣韻條目 ? 廣韻條目 : never;

export function 條目from內部條目<T extends 內部切韻條目 | 內部廣韻條目>(內部條目: T): 內部條目對應<T> {
  const { 來源, 音韻編碼, 釋義上下文, ...rest } = 內部條目;
  return Object.assign(Object.create(資料條目methods) as 內部條目對應<T>, {
    來源,
    音韻地位: decode音韻編碼(音韻編碼),
    ...rest,
    釋義上下文: 釋義上下文 === null ? null : 釋義上下文.map(x => ({ ...x })),
  });
}

import { decode音韻編碼 } from '../lib/壓縮表示';
import type { 音韻地位 } from '../lib/音韻地位';

import type { 切韻條目 } from './切韻';
import type { 廣韻條目 } from './廣韻';
import type { 內部廣韻條目 } from './廣韻impl';

export interface 資料條目CommonFields {
  音韻地位: 音韻地位;
  /**
   * 字頭。
   *
   * 可能含有校勘標記，可用 {@link 字頭詳情}、{@link 字頭原貌}、{@link 字頭校正} 取得原貌及校正後的字頭。
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
  /** 原書韻目。注意與音韻地位不一定對應 */
  韻目: string;
  /**
   * 反切。若該小韻未用反切注音（如「音某字某聲」）則為 `null`（此時會給出{@link 直音}）。
   *
   * 可能含有校勘標記，可用 {@link 反切詳情}、{@link 反切原貌}、{@link 反切校正} 取得原貌及校正後的反切。
   *
   * 注意有極少數反切原本用字不詳，故可能含有「？」（全形問號）。
   */
  反切: string | null;
  /** 直音。僅當小韻未給{@link 反切}，以直音注音時有內容，否則為 `null` */
  直音: string | null;
  /** 釋義。僅含該單字下的釋義，該單字無釋義時為 `null` */
  釋義: string | null;
  /** 釋義上下文。包含與該條目相關（如釋義為「上同」之類時）的若干條目的字頭釋義 */
  釋義上下文: 上下文條目[] | null;
}

/**
 * 用於 {@link 資料條目Common.釋義上下文 | 釋義上下文} 的條目。僅含必要的欄位
 */
export interface 上下文條目 {
  字頭: string;
  字頭說明: string | null;
  小韻字號: string;
  釋義: string | null;
}

export interface 資料條目Methods {
  /**
   * 取得條目的字頭原貌及校正。
   *
   * 注意有極少數反切原本用字不詳，故可能含有「？」（全形問號）。
   *
   * @returns 格式為 `[原貌, 校正]`：
   * - 若字頭無校勘，則原貌與校正相同
   * - 若為應補字，則僅有校正，而原貌為 `null`
   * - 若為應刪字，則僅有原貌，而校正為 `null`
   * - 若為校勘字，則原貌與校正不同
   *
   * @example
   * ```typescript
   * > let 條目 = TshetUinh.資料.query字頭('結');
   * [ { 字頭: '結', ... }]
   * > 條目[0].字頭詳情();
   * [ '結', '結' ]
   *
   * > TshetUinh.資料.query字頭('嬹').find(({ 音韻地位 }) => 音韻地位.聲 === '平');
   * { 字頭: '［嬹］', ... }
   * > 條目.字頭詳情();
   * [ null, '嬹' ]
   *
   * > TshetUinh.資料.query字頭('𤜼');
   * [ { 字頭: '｛𤜼｝', ... }]
   * > 條目[0].字頭詳情();
   * [ '𤜼', null ]
   *
   * > TshetUinh.資料.query字頭('𤿎').find({ 小韻號 } => 小韻號 === '141');
   * { 字頭: '𤿎〈𢻹〉', ... }
   * > 條目.字頭詳情();
   * [ '𤿎', '𢻹' ]
   * ```
   */
  字頭詳情(): [string | null, string | null];
  /** 字頭原貌。@see {@link 字頭詳情} */
  字頭原貌(): string | null;
  /** 字頭校正。@see {@link 字頭詳情} */
  字頭校正(): string | null;
  /**
   * 取得條目的反切原貌及校正。
   *
   * @returns 格式為 `[上字詳情, 下字詳情]`，兩項均為列表：
   * - 首項為原貌（若為脫字則為空串）
   * - 其後各項（通常為一項，若分多步改換/訛誤，則為多項）為含校勘標記的校正字；
   *   含校勘標記是為了指明用字變動的性質（同音切替換/近音切替換/訛字），可用 `.slice(1, -1)` 取得其中的字
   *
   * 此外，若 `.反切` 非 `null`，該回傳結果的 `.flat().join('')` 會與 `.反切` 相同（反切為 `null` 時則回傳 `['', '']`）。
   *
   * @example
   * ```typescript
   * > let 條目 = TshetUinh.資料.query字頭('淺').find(({ 音韻地位 }) => 音韻地位.聲 === '上');
   * { 字頭: '淺', 反切: '士〈七〉演', ... }
   * > 條目.反切詳情();
   * [ [ '士', '〈七〉' ], [ '演' ] ]
   *
   * > 條目 = TshetUinh.資料.query字頭('豆');
   * [ { 字頭: '豆', 反切: '［徒］候', ... }]
   * > 條目[0].反切詳情();
   * [ [ '', '［徒］' ], [ '候' ] ]
   *
   * > 條目 = TshetUinh.資料.query字頭('鷕');
   * [ { 字頭: '鷕', 反切: '以沼｟小｠〈水〉', ... }]
   * > 條目[0].反切詳情();
   * [ [ '以' ], [ '沼', '｟小｠', '〈水〉' ] ]
   *
   * > 條目 = TshetUinh.資料.query字頭('䅥').find(({ 音韻地位 }) => 音韻地位.等 === '三');
   * { 字頭: '䅥', 反切: '居列（？）', ... }
   * > 條目.反切詳情();
   * [ [ '居' ], [ '列', '（？）' ] ]
   * ```
   */
  反切詳情(): [string[], string[]];
  /**
   * 反切原貌。
   * @see {@link 反切詳情}
   */
  反切原貌(): string | null;
  /**
   * 反切校正。注意有極少數反切原本用字不詳，故可能含有「？」（全形問號）。
   * @see {@link 反切詳情}
   * @example
   * ```typescript
   * > let 條目 = TshetUinh.資料.query字頭('淺').find(({ 音韻地位 }) => 音韻地位.聲 === '上');
   * { 字頭: '淺', 反切: '士〈七〉演', ... }
   * > 條目.反切校正();
   * '七演'
   *
   * > 條目 = TshetUinh.資料.query字頭('䅥').find(({ 音韻地位 }) => 音韻地位.等 === '三');
   * { 字頭: '䅥', 反切: '居列（？）', ... }
   * > 條目.反切校正();
   * '居？'
   *
   * > 條目 = TshetUinh.資料.query字頭('𤜼');
   * [ { 字頭: '𤜼', 反切: '［崇〈？〉玄〈？〉］', ... }]
   * > 條目[0].反切校正();
   * '？？'
   * ```
   */
  反切校正(): string | null;
}

export interface 資料條目Common extends 資料條目CommonFields, 資料條目Methods {}

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

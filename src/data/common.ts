import { decode音韻編碼unchecked } from '../lib/壓縮表示internal';
import type { 音韻地位 } from '../lib/音韻地位';

import type { 切韻條目 } from './切韻';
import type { 廣韻條目 } from './廣韻';
import type { 內部廣韻條目 } from './廣韻impl';

type OmitMethods<T> = Pick<T, { [K in keyof T]: T[K] extends () => void ? never : K }[keyof T]>;

/**
 * Mixin for {@link 資料條目Common} and {@link 上下文條目}.
 *
 * NOTE: Despite that 資料條目Common's API is a superset of 上下文條目's,
 * the former class is logically NOT a subtype of the latter, thus a mixin design is preferable.
 */
interface 字頭詳情Prototype {
  /**
   * 取得條目的字頭原貌及校正。
   *
   * @returns 格式為 `[原貌, ...校勘]`：
   * - 首項為原貌；若為應補字，則原貌為空串 `''`
   * - 校勘各項（通常沒有或僅一項）為含校勘符號的校正字，可用 `.slice(1, -1)` 取得當中的字；
   *   若為應刪字，則校勘部分僅含一項，為 `'｛｝'`
   *
   * @example
   * ```typescript
   * > let 條目 = TshetUinh.資料.query字頭('結');
   * [ { 字頭: '結', ... }]
   * > 條目[0].字頭詳情();
   * [ '結' ]
   *
   * > TshetUinh.資料.query字頭('嬹').find(({ 音韻地位 }) => 音韻地位.聲 === '平');
   * { 字頭: '［嬹］', ... }
   * > 條目.字頭詳情();
   * [ '', '［嬹］' ]
   *
   * > TshetUinh.資料.query字頭('𤜼');
   * [ { 字頭: '｛𤜼｝', ... }]
   * > 條目[0].字頭詳情();
   * [ '𤜼', '｛｝' ]
   *
   * > TshetUinh.資料.query字頭('𤿎').find({ 小韻號 } => 小韻號 === '141');
   * { 字頭: '𤿎〈𢻹〉', ... }
   * > 條目.字頭詳情();
   * [ '𤿎', '〈𢻹〉' ]
   * ```
   */
  字頭詳情(): string[];
  /**
   * 字頭原貌。若條目為應補字（原書底本所無），則為 `null`。
   * @see {@link 字頭詳情}
   */
  字頭原貌(): string | null;
  /**
   * 字頭校正。若條目為應刪字，則為 `null`。
   * @see {@link 字頭詳情}
   */
  字頭校正(): string | null;
}

const 字頭詳情prototype = {
  字頭詳情(this: 字頭詳情Prototype & { 字頭: string }): string[] {
    return parse字頭詳情(this.字頭);
  },
  字頭原貌(this: 字頭詳情Prototype): string | null {
    return this.字頭詳情()[0] || null;
  },
  字頭校正(this: 字頭詳情Prototype): string | null {
    const 詳情 = this.字頭詳情();
    return 詳情.length === 1 ? 詳情[0] : 詳情[詳情.length - 1].slice(1, -1) || null;
  },
} as const satisfies 字頭詳情Prototype;

/**
 * 各來源之 {@link 資料!資料條目 | 資料條目 } 所共用的屬性
 *
 * 實際查詢所得條目亦會含有 `.來源` 屬性，可利用該屬性判斷型別。
 *
 * @see {@link 切韻條目.來源}
 * @see {@link 廣韻條目.來源}
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class 資料條目Common {
  音韻地位!: 音韻地位;
  /**
   * 字頭。
   *
   * 可能含有校勘標記，可用 {@link 字頭詳情}、{@link 字頭原貌}、{@link 字頭校正} 取得原貌及校正後的字頭。
   */
  字頭!: string;
  字頭說明!: string | null;
  /**
   * 小韻號。
   *
   * 部分小韻含多個音韻地位，會依音韻地位拆分，並有細分號（後綴 -a、-b 等），故為字串格式。
   * @see {@link 廣韻.get小韻}
   */
  小韻號!: string;
  /**
   * 小韻內字頭序號。
   *
   * 部分字頭為增字，字號形如 `<原書字序號>a<增序號>`，如 `1a1`，故為字串格式。
   */
  小韻字號!: string;
  /** 原書韻目。注意與音韻地位不一定對應 */
  韻目!: string;
  /**
   * 反切。若該小韻未用反切注音（如「音某字某聲」）則為 `null`（此時會給出{@link 直音}）。
   *
   * 可能含有校勘標記，可用 {@link 反切詳情}、{@link 反切原貌}、{@link 反切校正} 取得原貌及校正後的反切。
   *
   * 注意有極少數反切原本用字不詳，故可能含有「？」（全形問號）。
   */
  反切!: string | null;
  /** 直音。僅當小韻未給{@link 反切}，以直音注音時有內容，否則為 `null` */
  直音!: string | null;
  /** 釋義。僅含該單字下的釋義，該單字無釋義時為 `null` */
  釋義!: string | null;
  /** 釋義上下文。包含與該條目相關（如釋義為「上同」之類時）的若干條目的字頭釋義 */
  釋義上下文!: 上下文條目[] | null;

  /** @ignore */
  constructor(
    raw: 資料條目CommonFields,
  ) {
    Object.assign(this, raw);
  }

  /** 原書小韻號。即 {@link 小韻號} 去掉結尾字母（細分號） */
  get 原書小韻號(): number {
    return Number(this.小韻號.replace(/[a-z]$/, ''));
  }

  /**
   * 解析小韻字號的組成部分：原書字號、增字號。
   *
   * 若為增字，則增字號非零，否則為零。
   */
  小韻字號詳情(): [number, number] {
    const parts = this.小韻字號.split('a');
    if (parts.length === 1) {
      parts.push('');
    }
    return parts.map(Number) as [number, number];
  }

  /**
   * 取得條目的反切原貌及校正。
   *
   * 注意有個別反切原本用字或訛變過程不詳，故校勘中可能含有「？」（全形問號）。
   *
   * @returns 列表（通常為兩項），一項表示一個字的原貌及校勘，亦為列表，形如 `[原貌, ...校勘]`：
   * - 首項為原貌；若原書底本中為脫字，則為空串
   * - 其後各項（通常為沒有或僅一項，若分多步改換/訛誤，則為多項）為含校勘標記的校正字；
   *   含校勘標記是為了指明用字變動的性質（同音切替換/近音切替換/訛字），可用 `.slice(1, -1)` 取得其中的字；
   *   若為衍字（罕見），則校勘部分僅一項，為 `'｛｝'`
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
  反切詳情(): string[][] {
    return this.反切 ? parse反切詳情(this.反切) : [];
  }
  /**
   * 反切原貌。
   * @see {@link 反切詳情}
   */
  反切原貌(): string | null {
    return this.反切?.replace(/［.］|〈.〉|〘.〙|（.）|｟.｠|｛|｝/g, '') ?? null;
  }
  /**
   * 反切校正。注意有個別反切原本用字不詳，故可能含有「？」（全形問號）。
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
   * [ { 字頭: '｛𤜼｝', 反切: '崇〈？〉玄〈？〉', ... }]
   * > 條目[0].反切校正();
   * '？？'
   * ```
   */
  反切校正(): string | null {
    if (!this.反切) {
      return null;
    }
    return this.反切詳情()
      .map(chs => (chs.length === 1 ? chs[0] : chs[chs.length - 1].slice(1, -1)))
      .join('');
  }

  /**
   * 將每項 {@link 釋義上下文} 均展開成完整的 {@link 資料!資料條目 | 資料條目}。
   *
   * 若無釋義上下文，則回傳的列表僅包含一項，為該條目自身。
   */
  expand釋義上下文(): 資料條目Common[] {
    function 資料條目withCloned釋義上下文(...[raw]: ConstructorParameters<typeof 資料條目Common>): 資料條目Common {
      const res = new 資料條目Common(raw);
      if (res.釋義上下文) {
        res.釋義上下文 = res.釋義上下文.map(x => new 上下文條目(x));
      }
      return res;
    }

    if (!this.釋義上下文) {
      return [資料條目withCloned釋義上下文(this)];
    }
    return this.釋義上下文.map(x => 資料條目withCloned釋義上下文({ ...this, ...x }));
  }
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface 資料條目Common extends 字頭詳情Prototype {}
Object.assign(資料條目Common.prototype, 字頭詳情prototype);

type 資料條目CommonFields = OmitMethods<Omit<資料條目Common, '原書小韻號'>>;

// XXX This is for better presentation in REPLs, and may be subject to change.
Object.defineProperty(資料條目Common, 'name', { value: '條目' });

/**
 * 用於 {@link 資料條目Common.釋義上下文 | 釋義上下文} 的條目。僅含必要的欄位。
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class 上下文條目 {
  字頭!: string;
  字頭說明!: string | null;
  小韻字號!: string;
  釋義!: string | null;

  /** @ignore */
  constructor(
    raw: Pick<
      上下文條目,
      { [K in keyof 上下文條目]: 上下文條目[K] extends () => void ? never : K }[keyof Omit<上下文條目, '主條目'>]
    >,
  ) {
    Object.assign(this, raw);
  }
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface 上下文條目 extends 字頭詳情Prototype {}
Object.assign(上下文條目.prototype, 字頭詳情prototype);

export function parse反切詳情(反切: string): string[][] {
  // NOTE 目前資料中反切無 IDS 字，故可直接用 `...` 折分單字
  return parse詳情([...反切]);
}
export function parse字頭詳情(字頭: string): string[] {
  // NOTE 目前資料中字頭有 IDS 字，但必定為單字
  return parse詳情(字頭.split(/([［］｛｝〈〉])/).filter(x => x))[0];
}

function parse詳情(chars: string[]): string[][] {
  const result: string[][] = [];
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    switch (ch) {
      case '［':
        result.push(['', chars.slice(i, i + 3).join('')]);
        i += 3;
        break;
      case '｛':
        result.push([chars[i + 1], '｛｝']);
        i += 3;
        break;
      case '〈':
      case '〘':
      case '（':
      case '｟':
        result[result.length - 1].push(chars.slice(i, i + 3).join(''));
        i += 3;
        break;
      default:
        result.push([ch]);
        i += 1;
    }
  }
  return result;
}

export type 內部上下文條目 = OmitMethods<上下文條目>;
export type 內部條目Common = Omit<資料條目CommonFields, '音韻地位' | '釋義上下文'> & {
  音韻編碼: string;
  釋義上下文: 內部上下文條目[] | null;
};

export type 內部切韻條目 = 內部條目Common & { 來源: '切韻'; 對應廣韻小韻號: string };

type 內部條目對應<T> = T extends 內部切韻條目 ? 切韻條目 : T extends 內部廣韻條目 ? 廣韻條目 : never;

export function 條目from內部條目<T extends 內部切韻條目 | 內部廣韻條目>(內部條目: T): 內部條目對應<T> {
  const { 來源, 音韻編碼, 釋義上下文, ...rest } = 內部條目;
  return new 資料條目Common({
    來源,
    音韻地位: decode音韻編碼unchecked(音韻編碼),
    ...rest,
    釋義上下文: 釋義上下文 === null ? null : 釋義上下文.map(x => new 上下文條目(x)),
  }) as 內部條目對應<T>;
}

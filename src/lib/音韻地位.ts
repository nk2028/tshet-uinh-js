import { assert } from './utils';
import { 母到清濁, 母到組, 母到音, 韻到攝 } from './拓展音韻屬性';
import { 所有, 母搭配等, 鈍音母, 陰聲韻, 韻搭配呼, 韻搭配等 } from './音韻屬性常量';

const pattern描述 = new RegExp(
  `^([${所有.母.join('')}])([${所有.呼.join('')}]?)([${所有.等.join('')}]?)`
    + `([${所有.類.join('')}]?)([${所有.韻.join('')}])([${所有.聲.join('')}])$`,
  'u',
);

// for 音韻地位.屬於
const 表達式屬性可取值 = {
  ...所有,
  音: [...'脣舌齒牙喉'] as const,
  攝: [...'通江止遇蟹臻山效果假宕梗曾流深咸'] as const,
  組: [...'幫端知精莊章見影'] as const,
};

/**
 * @see {@link 音韻地位.判斷}
 */
export type 判斷規則列表<T> = readonly (readonly [unknown, T | 判斷規則列表<T>])[];

/**
 * @see {@link 音韻地位.調整}
 */
export type 部分音韻屬性 = Partial<Pick<音韻地位, '母' | '呼' | '等' | '類' | '韻' | '聲'>>;

/**
 * 建立 `音韻地位` 時，若建立的是邊緣音韻地位，需利用該類型的參數。
 * 參數為陣列，當中列明待建立的邊緣地位種類，以表明使用者知曉其為邊緣地位並確認建立。
 *
 * **注意**：內建的邊緣地位白名單**已涵蓋內建資料中全部邊緣地位**，故使用內建資料之音韻地位時完全不需使用此參數。
 *
 * 目前支持的種類如下：
 * - `'陽韻A類'`
 * - `'端組類隔'`
 * - `'咍韻脣音'`
 * - `'匣母三等'`
 * - `'羣邪俟母非三等'`
 * - `'云母開口'` (+)
 *
 * 未標注「(+)」者，僅可當待建立地位確實為該類型邊緣地位時，才可以列入，否則無法建立音韻地位。而標注「(+)」者則在建立任意音韻地位時均可列入。
 */
export type 邊緣地位種類指定 = readonly string[];

const 已知邊緣地位 = new Set([
  // 嚴格邊緣地位
  // 陽韻A類（無）
  // 端組類隔
  '定開四脂去', // 地
  '端開二庚上', // 打
  '端開二麻上', // 打（麻韻）
  '端開四麻平', // 爹
  '端開四麻上', // 嗲
  '定開二佳上', // 箉
  '端四尤平', // 丟
  // 咍韻脣音（無）
  // 匣母三等（無）
  // 羣邪俟母非三等（無）
  // ----
  // 非嚴格邊緣地位
  // 云母開口
  '云開三C之上', // 矣
  '云開三B仙平', // 焉
]);

export const _UNCHECKED: 邊緣地位種類指定 = ['@UNCHECKED@'];

/**
 * 《切韻》音系音韻地位。
 *
 * 可使用字串 (母, 呼, 等, 類, 韻, 聲) 初始化。
 *
 * | 音韻屬性 | 中文名稱 | 英文名稱 | 可能取值 |
 * | :- | :- | :- | :- |
 * | 母<br/>組 | 聲母<br/>組 | initial<br/>group | **幫**滂並明<br/>**端**透定泥<br/>來<br/>**知**徹澄孃<br/>**精**清從心邪<br/>**莊**初崇生俟<br/>**章**昌常書船<br/>日<br/>**見**溪羣疑<br/>**影**曉匣云<br/>以<br/>（粗體字為組，未涵蓋「來日以」） |
 * | 呼 | 呼 | rounding | 開口<br/>合口 |
 * | 等 | 等 | division | 一二三四 |
 * | 類 | 類 | type | ABC |
 * | 韻<br/>攝 | 韻母<br/>攝 | rime<br/>class | 通：東冬鍾<br/>江：江<br/>止：支脂之微<br/>遇：魚虞模<br/>蟹：齊祭泰佳皆夬灰咍廢<br/>臻：真臻文殷魂痕<br/>山：元寒刪山先仙<br/>效：蕭宵肴豪<br/>果：歌<br/>假：麻<br/>宕：陽唐<br/>梗：庚耕清青<br/>曾：蒸登<br/>流：尤侯幽<br/>深：侵<br/>咸：覃談鹽添咸銜嚴凡<br/>（冒號前為攝，後為對應的韻） |
 * | 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |
 *
 * 音韻地位六要素：母、呼、等、類、韻、聲。
 *
 * 「呼」和「類」可為 `null`，其餘四個屬性不可為 `null`。
 *
 * 當聲母為脣音，或韻母為「東冬鍾江模尤侯」（開合中立的韻）之一時，「呼」須為 `null`。
 * 在其他情況下，「呼」須取 `'開'` 或 `'合'`。
 *
 * 當聲母為鈍音（脣牙喉音，不含以母），且為三等韻時，「類」須取 `'A'`、`'B'`、`'C'` 之一。
 * 在其他情況下，「類」須為 `null`。
 *
 * 依切韻韻目，用殷韻不用欣韻；亦不設諄、桓、戈韻，分別併入真、寒、歌韻。
 *
 * 不支援異體字，請自行轉換：
 *
 * * 音 唇 → 脣
 * * 母 娘 → 孃
 * * 母 荘 → 莊
 * * 母 谿 → 溪
 * * 母 群 → 羣
 * * 韻 餚 → 肴
 * * 韻 眞 → 真
 */
export class 音韻地位 {
  /**
   * 聲母
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.母;
   * '幫'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.母;
   * '羣'
   * ```
   */
  readonly 母: string;

  /**
   * 呼
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.呼;
   * null
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.呼;
   * '開'
   * ```
   */
  readonly 呼: string | null;

  /**
   * 等
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.等;
   * '三'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.等;
   * '三'
   * ```
   */
  readonly 等: string;

  /**
   * 類
   * - AB 類為前元音，在脣牙喉音有最小對立，此情形亦稱「重紐」
   * - C 類為非前元音
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.類;
   * 'C'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.類;
   * 'A'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('章開三支平');
   * > 音韻地位.類;
   * null
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫四先平');
   * > 音韻地位.類;
   * null
   * ```
   */
  readonly 類: string | null;

  /**
   * 韻（舉平以賅上去入，唯祭、泰、夬、廢例外）
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.韻;
   * '凡'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.韻;
   * '支'
   * ```
   */
  readonly 韻: string;

  /**
   * 聲調
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.聲;
   * '入'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.聲;
   * '平'
   * ```
   */
  readonly 聲: string;

  /**
   * 初始化音韻地位物件。
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 類 類：`null`, A, B, C
   * @param 韻 韻母（平賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @param 邊緣地位種類 建立邊緣地位時，列明該地位的邊緣地位種類
   * @returns 六要素所描述的音韻地位
   * @throws 待建立之音韻地位會透過{@link 驗證}檢驗音節合法性，不合法則拋出異常
   * @example
   * ```typescript
   * > new TshetUinh.音韻地位('幫', null, '三', 'C', '凡', '入');
   * 音韻地位<幫三C凡入>
   * > new TshetUinh.音韻地位('羣', '開', '三', 'A', '支', '平');
   * 音韻地位<羣開三A支平>
   * > new TshetUinh.音韻地位('章', '開', '三', null, '支', '平');
   * 音韻地位<章開三支平>
   * > new TshetUinh.音韻地位('幫', null, '四', null, '先', '平');
   * 音韻地位<幫四先平>
   * ```
   */
  constructor(母: string, 呼: string | null, 等: string, 類: string | null, 韻: string, 聲: string, 邊緣地位種類: 邊緣地位種類指定 = []) {
    音韻地位.驗證(母, 呼, 等, 類, 韻, 聲, 邊緣地位種類);
    this.母 = 母;
    this.呼 = 呼;
    this.等 = 等;
    this.類 = 類;
    this.韻 = 韻;
    this.聲 = 聲;
  }

  /**
   * 清濁（全清、次清、全濁、次濁）
   *
   * 曉母為全清，云以來日母為次濁。
   *
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.清濁;
   * '全清'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.清濁;
   * '全濁'
   * ```
   */
  get 清濁(): string {
    const { 母 } = this;
    return 母到清濁[母];
  }

  /**
   * 音（發音部位：脣、舌、齒、牙、喉）
   *
   * **注意**：
   *
   * * 不設半舌半齒音，來母歸舌音，日母歸齒音
   * * 以母不屬於影組，但屬於喉音
   *
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.音;
   * '脣'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.音;
   * '牙'
   * ```
   */
  get 音(): string {
    const { 母 } = this;
    return 母到音[母];
  }

  /**
   * 攝
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.攝;
   * '咸'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.攝;
   * '止'
   * ```
   */
  get 攝(): string {
    const { 韻 } = this;
    return 韻到攝[韻];
  }

  /**
   * 韻別（陰聲韻、陽聲韻、入聲韻）
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.韻別;
   * '入'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.韻別;
   * '陰'
   * ```
   */
  get 韻別(): string {
    const { 韻, 聲 } = this;
    return 陰聲韻.includes(韻) ? '陰' : 聲 === '入' ? '入' : '陽';
  }

  /**
   * 組
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.組;
   * '幫'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.組;
   * '見'
   * ```
   */
  get 組(): string | null {
    const { 母 } = this;
    return 母到組[母];
  }

  /**
   * 描述
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.描述;
   * '幫三C凡入'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.描述;
   * '羣開三A支平'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('章開三支平');
   * > 音韻地位.描述;
   * '章開三支平'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫四先平');
   * > 音韻地位.描述;
   * '幫四先平'
   * ```
   */
  get 描述(): string {
    const { 母, 呼, 等, 類, 韻, 聲 } = this;
    return 母 + (呼 ?? '') + 等 + (類 ?? '') + 韻 + 聲;
  }

  /**
   * 簡略描述。會省略可由「母」或由「韻」直接確定的「呼」「等」「類」。
   *
   * **注意**：此項尚未成為穩定功能，不要依賴其輸出值。
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.簡略描述;
   * '幫凡入'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.簡略描述;
   * '羣開A支平'
   * ```
   */
  get 簡略描述(): string {
    const { 母, 韻, 聲 } = this;
    let { 呼, 等, 類 } = this;
    if (類 && 母韻搭配類(母, 韻)[0] === 類) {
      類 = null;
    }
    if (呼 === '合' && 母 === '云') {
      呼 = null;
    } else if (呼 && 韻搭配呼[韻].length === 1) {
      呼 = null;
    }
    if (等 === '三' && [...'羣邪俟'].includes(母)) {
      等 = '';
    } else if (母搭配等[母].length === 1 || 韻搭配等[韻].length === 1) {
      等 = '';
    }
    return 母 + (呼 ?? '') + 等 + (類 ?? '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於{@link 屬於}函數
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.表達式;
   * '幫母 開合中立 三等 C類 凡韻 入聲'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.表達式;
   * '羣母 開口 三等 A類 支韻 平聲'
   * ```
   */
  get 表達式(): string {
    const { 母, 呼, 等, 類, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口 ` : '開合中立 ';
    const 類字段 = 類 ? `${類}類 ` : '不分類 ';
    return `${母}母 ${呼字段}${等}等 ${類字段}${韻}韻 ${聲}聲`;
  }

  /**
   * 三十六字母
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.字母;
   * '非'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('常開三清平');
   * > 音韻地位.字母;
   * '禪'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('俟開三之上');
   * > 音韻地位.字等;
   * '禪'
   * ```
   */
  get 字母(): string {
    const { 母, 等, 類 } = this;
    let index: number;
    if (等 === '三' && 類 === 'C' && (index = [...'幫滂並明'].indexOf(母)) !== -1) {
      return '非敷奉微'[index];
    } else if ((index = [...'莊初崇生俟章昌船書常'].indexOf(母)) !== -1) {
      return '照穿牀審禪'[index % 5];
    } else if (['云', '以'].includes(母)) {
      return '喻';
    }
    return 母;
  }

  /**
   * 韻圖等
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.韻圖等;
   * '四'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('常開三清平');
   * > 音韻地位.韻圖等;
   * '三'
   * > 音韻地位 = TshetUinh.音韻地位.from描述('俟開三之上');
   * > 音韻地位.韻圖等;
   * '二'
   * ```
   */
  get 韻圖等(): string {
    const { 母, 等, 類 } = this;
    if ([...'莊初崇生俟'].includes(母)) {
      return '二';
    } else if (類 === 'A' || (等 === '三' && [...'精清從心邪以'].includes(母))) {
      return '四';
    } else {
      return 等;
    }
  }

  /**
   * 調整該音韻地位的屬性，會驗證調整後地位的合法性，回傳新的物件。
   *
   * **注意**：原物件不會被修改。
   *
   * @param 調整屬性 可為以下種類之一：
   * - 物件，其屬性可為六項基本屬性中的若干項，各屬性的值為欲修改成的值。
   *
   *   不含某屬性或某屬性值為 `undefined` 則表示不修改該屬性。
   *
   * - 字串，可寫出若干項屬性，以空白分隔各項。各屬性的寫法如下：
   *   - 母、等、韻、聲：如 `'見母'`、`'三等'`、`'元韻'`、`'平聲'` 等
   *   - 呼：`'開口'`、`'合口'`、`'開合中立'`
   *   - 類：`'A類'`、`'B類'`、`'C類'`、`'不分類'`
   * @param 邊緣地位種類 若調整後為邊緣地位，列明其種類
   * @returns 新的 `音韻地位`，其中會含有指定的修改值
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C元上');
   * > 音韻地位.調整({ 聲: '平' }).描述
   * '幫三C元平'
   * > 音韻地位.調整('平聲').描述
   * '幫三C元平'
   * > 音韻地位.調整({ 母: '見', 呼: '合' }).描述
   * '見合三C元上'
   * > 音韻地位.調整('見母 合口').描述
   * '見合三C元上'
   * ```
   */
  調整(調整屬性: 部分音韻屬性 | string, 邊緣地位種類: 邊緣地位種類指定 = []): 音韻地位 {
    if (typeof 調整屬性 === 'string') {
      const 屬性object: { -readonly [k in keyof 部分音韻屬性]: 部分音韻屬性[k] } = {};
      const set = <K extends keyof 部分音韻屬性>(屬性: K, 值: 音韻地位[K]) => {
        assert(!(屬性 in 屬性object), () => `duplicated assignment of ${屬性}`);
        屬性object[屬性] = 值;
      };

      for (const token of 調整屬性.trim().split(/\s+/u)) {
        const match = /^(?<kv>開合中立|不分類)$|^(?<v>.)(?<k>[母口等類韻聲])$/u.exec(token);
        assert(match !== null, () => `unrecognized expression: ${token}`);
        const { kv, k, v } = match.groups!;
        if (kv) {
          if (kv === '開合中立') set('呼', null);
          else if (kv === '不分類') set('類', null);
        } else {
          set(k.replace('口', '呼') as keyof 部分音韻屬性, v);
        }
      }

      調整屬性 = 屬性object;
    }
    const { 母 = this.母, 呼 = this.呼, 等 = this.等, 類 = this.類, 韻 = this.韻, 聲 = this.聲 } = 調整屬性;
    return new 音韻地位(母, 呼, 等, 類, 韻, 聲, 邊緣地位種類);
  }

  /**
   * 判斷某個小韻是否屬於給定的音韻地位限定範圍。
   *
   * 本方法可使用一般形式（`.屬於('...')`）或標籤模板語法（`` .屬於`...` ``）。
   *
   * 標籤模板語法僅能用於字面值的字串，但寫出來較簡單清晰。在不嵌入參數時，兩者效果相同。建議當表達式為字面值時使用標籤模板語法。
   *
   * @param 表達式 描述音韻地位的字串
   *
   * 字串中音韻地位的描述格式：
   *
   * * 音韻地位六要素：
   *   * `……母`, `……等`, `……韻`, `……聲`
   *   * 呼：`開口`, `合口`, `開合中立`
   *   * 類：`A類`, `B類`, `C類`, `不分類`（其中 ABC 可組合書寫，如 `AC類`）
   * * 拓展音韻地位：
   *   * `……組`, `……音`, `……攝`
   *   * 清濁：`全清`, `次清`, `全濁`, `次濁`, `清音`, `濁音`
   *   * 韻別：`陰聲韻`, `陽聲韻`, `入聲韻`
   * * 其他表達式：
   *   * `仄聲`：上去入聲
   *   * `舒聲`：平上去聲
   *   * `鈍音`：幫見影組
   *   * `銳音`：鈍音以外聲母
   *
   * 支援的運算子：
   *
   * * AND 運算子：`且`, `and`, `&`, `&&`
   * * &ensp; OR 運算子：`或`, `or`, `|`, `||`
   * * NOT 運算子：`非`, `not`, `~`, `!`
   * * 括號：`(……)`, `（……）`
   *
   * 各表達式及運算子之間須以空格隔開。
   *
   * AND 運算子可省略，如 `(端精組 且 入聲) 或 (以母 且 四等 且 去聲)` 與 `端精組 入聲 或 以母 四等 去聲` 同義。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @throws 若表達式為空、不合語法、或限定條件不合法，則拋出異常。
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.屬於`章母`; // 標籤模板語法（表達式為字面值時推荐）
   * false
   * > 音韻地位.屬於('章母'); // 一般形式
   * false
   * > 音韻地位.屬於`一四等`;
   * false
   * > 音韻地位.屬於`幫組 或 陽韻`;
   * true
   * ```
   */
  屬於(表達式: string): boolean;

  /**
   * 判斷某個小韻是否屬於給定的音韻地位限定範圍（標籤模板語法）。
   *
   * 嵌入的參數可以是：
   *
   * * 函數：會被執行；若其傳回值為字串，會視作表達式，遞迴套用{@link 屬於}來判斷，否則會直接檢測其真值
   * * 字串：視作表達式，遞迴套用{@link 屬於}
   * * 其他：會檢測其真值
   *
   * **注意**：
   *
   * * 該語法僅能用於字面值模板串，不能用於如{@link 音韻地位.判斷}等
   * * `` .屬於`${...}` `` 和 `` .屬於(`${...}`) `` 不同，只有前者支持上述嵌入參數，後者的模板串會先被求值為普通字串。
   *
   * @param 表達式 描述音韻地位的模板字串列表。
   * @param 參數 要嵌入模板的參數列表。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @throws 若表達式為空、不合語法、或限定條件不合法，則拋出異常。
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三凡入');
   * > 音韻地位.屬於`一四等 或 ${音韻地位.描述 === '幫三凡入'}`;
   * true
   * ```
   */
  屬於(表達式: TemplateStringsArray, ...參數: unknown[]): boolean;

  屬於(表達式: string | readonly string[], ...參數: unknown[]): boolean {
    if (typeof 表達式 === 'string') 表達式 = [表達式];

    /** 普通字串 token 求值 */
    const { 母, 呼, 類, 聲, 清濁, 韻別 } = this;
    const evalToken = (token: string): boolean => {
      let match: RegExpExecArray | null = null;
      if ((match = /^(陰|陽|入)聲韻$/.exec(token))) return 韻別 === match[1];
      if (token === '仄聲') return 聲 !== '平';
      if (token === '舒聲') return 聲 !== '入';
      if ((match = /^(開|合)口$/.exec(token))) return 呼 === match[1];
      if (/^開合中立$/.exec(token)) return 呼 === null;
      if (/^不分類$/.exec(token)) return 類 === null;
      if ((match = /^(清|濁)音$/.exec(token))) return 清濁[1] === match[1];
      if ((match = /^[全次][清濁]$/.exec(token))) return 清濁 === match[0];
      if (token === '鈍音') return 鈍音母.includes(母);
      if (token === '銳音') return !鈍音母.includes(母);
      if ((match = /^(.+?)([母等類韻音攝組聲])$/.exec(token))) {
        const values = [...match[1]];
        const key = match[2] as keyof typeof 表達式屬性可取值;
        const possibleValues = 表達式屬性可取值[key];
        const invalidValues = values.filter(i => !possibleValues.includes(i));
        if (invalidValues.length) {
          throw new Error(`unknown ${key}: ${invalidValues.join(', ')}`);
        }
        return values.includes(this[key]!);
      }
      throw new Error(`unrecognized test condition: ${token}`);
    };

    // 詞法分析，同時給普通運算元求值（惟函數型運算元留待後面惰性求值）
    type Keyword = '(' | ')' | 'not' | 'and' | 'or' | 'end';
    type Token = Keyword | boolean | LazyParameter;
    const KEYWORDS = ['(', ')', 'not', 'and', 'or'] as const;
    const PATTERNS = [/^\($/, /^\)$/, /^([!~非]|not)$/i, /^(&+|且|and)$/i, /^(\|+|或|or)$/i] as const;
    const tokens: [Token, string][] = [];
    for (let i = 0; i < 表達式.length; i++) {
      for (const rawToken of 表達式[i].split(/(&+|\|+|[!~()])|\b(and|or|not)\b|\s+/i).filter(i => i)) {
        const match = PATTERNS.findIndex(pat => pat.test(rawToken));
        if (match !== -1) {
          tokens.push([KEYWORDS[match], rawToken]);
        } else {
          tokens.push([evalToken(rawToken), rawToken]);
        }
      }
      if (i < 參數.length) {
        const arg = LazyParameter.from(參數[i], this);
        tokens.push([arg, String(arg)]);
      }
    }
    assert(tokens.length, 'empty expression');

    // 句法分析
    // 由於是 LL(1) 文法，可用遞迴下降法
    // 基本成分：元（boolean | LazyParameter）、非、且、或、'('、')'
    // 文法：
    // - 非項：非* ( 元 | 括號項 )
    // - 且項：非項 ( 且? 非項 )*
    // - 或項：且項 ( 或 且項 )*
    // - 括號項：'(' 或項 ')'
    let cursor = 0;
    const END: [Token, string] = ['end', 'end of expression'];
    const peek = () => (cursor < tokens.length ? tokens[cursor] : END);
    const read = () => (cursor < tokens.length ? tokens[cursor++] : END);

    type Operand = boolean | LazyParameter | SExpr;
    type Operator = 'value' | 'not' | 'and' | 'or';
    type SExpr = [Operator, ...Operand[]];

    function parseOrExpr<T extends boolean = true>(required: T): T extends true ? SExpr : SExpr | null;
    function parseOrExpr(required: boolean): SExpr | null {
      const firstAndExpr = parseAndExpr(required);
      if (!firstAndExpr) {
        return null;
      }
      const orExpr: SExpr = ['or', firstAndExpr];
      for (;;) {
        // 或 且項 | END | else
        const [token] = peek();
        if (token === 'or') {
          cursor++;
          orExpr.push(parseAndExpr(true));
        } else {
          return orExpr;
        }
      }
    }

    function parseAndExpr<T extends boolean = true>(required: T): T extends true ? SExpr : SExpr | null;
    function parseAndExpr(required: boolean): SExpr | null {
      const firstNotExpr = parseNotExpr(required);
      if (!firstNotExpr) {
        return null;
      }
      const andExpr: SExpr = ['and', firstNotExpr];
      for (;;) {
        // 且? 非項 | END | else
        const [token] = peek();
        if (token === 'and') {
          cursor++;
          andExpr.push(parseNotExpr(true));
        } else {
          const notExpr = parseNotExpr(false);
          if (notExpr) {
            andExpr.push(notExpr);
          } else {
            return andExpr;
          }
        }
      }
    }

    function parseNotExpr<T extends boolean = true>(required: T): T extends true ? SExpr : SExpr | null;
    function parseNotExpr(required: boolean): SExpr | null {
      // 非*
      let seenNotOperator = false;
      let negate = false;
      for (;;) {
        const [token] = peek();
        if (token === 'not') {
          seenNotOperator = true;
          negate = !negate;
          cursor++;
        } else {
          break;
        }
      }
      let valExpr: SExpr = [negate ? 'not' : 'value'];
      // 元 | 括號項 | else
      const [token, rawToken] = peek();
      if (typeof token === 'boolean' || token instanceof LazyParameter) {
        valExpr.push(token);
        cursor++;
        return valExpr;
      } else if (token === '(') {
        cursor++;
        const parenExpr = parseOrExpr(true);
        const [rightParen, rawRightParen] = read();
        if (rightParen !== ')') {
          throw new Error(`expect ')', got: ${rawRightParen}`);
        }
        if (negate) {
          valExpr.push(parenExpr);
        } else {
          valExpr = parenExpr;
        }
        return valExpr;
      } else if (seenNotOperator || required) {
        const expected = seenNotOperator ? "operand or '('" : 'expression';
        throw new Error(`expect ${expected}, got: ${rawToken}`);
      } else {
        return null;
      }
    }

    const expr = parseOrExpr(true);
    const [token, rawToken] = read();
    if (token !== 'end') {
      throw new Error(`unexpected token: ${rawToken}`);
    }

    // 求值
    const evalExpr = (expr: SExpr): boolean => {
      const [op, ...args] = expr;
      switch (op) {
        case 'value':
          return evalOperand(args[0]);
        case 'not':
          return !evalOperand(args[0]);
        case 'and':
          return args.every(evalOperand);
        case 'or':
          return args.some(evalOperand);
      }
    };

    const evalOperand = (operand: Operand): boolean =>
      typeof operand === 'boolean' ? operand : operand instanceof LazyParameter ? operand.eval() : evalExpr(operand);

    return evalExpr(expr);
  }

  /**
   * 判斷音韻地位是否符合給定的一系列判斷條件之一，傳回第一個符合的判斷條件所對應的自訂值。
   * @param 規則 `[判斷式, 結果][]` 形式的陣列。
   *
   * 判斷式可以是：
   *
   * * &#x3000;&#x3000;函數：會被執行；若其傳回值為非空字串，會套用至{@link 音韻地位.屬於}函數判斷是否符合，若為布林值則由該值決定是否符合本條件，若為其他值則直接視作符合本條件
   * * 非空字串：描述音韻地位的表達式，會套用至{@link 音韻地位.屬於}函數
   * * &#x3000;布林值：直接決定是否符合本條件
   * * &#x3000;&#x3000;其他：均視作符合（可用於當其他條件均不滿足時，指定後備結果）
   *
   * 建議使用空字串、`null` 或 `true` 作末項判斷式以指定後備結果。
   *
   * 結果可以是任意傳回值或遞迴規則。
   * @param throws 若為 `true` 或字串，在未涵蓋所有條件時會拋出錯誤；用字串可指定錯誤情報
   * @param fallThrough 若為 `true`，在遞迴子陣列未涵蓋所有條件時會繼續嘗試母陣列的下一條件
   * @returns 自訂值，在未涵蓋所有條件且不使用 `error` 時會回傳 `null`
   * @throws `未涵蓋所有條件`（或 `error` 參數之文字），或套用至 `.屬於` 時出現的異常
   * @example
   * ```typescript
   * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
   * > 音韻地位.判斷([
   * >   ['遇果假攝 或 支脂之佳韻', ''],
   * >   ['蟹攝 或 微韻', 'i'],
   * >   ['效流攝', 'u'],
   * >   ['深咸攝', [
   * >     ['舒聲', 'm'],
   * >     ['入聲', 'p']
   * >   ]],
   * >   ['臻山攝', [
   * >     ['舒聲', 'n'],
   * >     ['入聲', 't']
   * >   ]],
   * >   ['通江宕梗曾攝', [
   * >     ['舒聲', 'ng'],
   * >     ['入聲', 'k']
   * >   ]]
   * > ], '無韻尾規則')
   * 'p'
   * ```
   */
  判斷<T, E extends boolean | string = false>(
    規則: 判斷規則列表<T>,
    throws?: E,
    fallThrough?: boolean,
  ): E extends true | string ? T : T | null;
  判斷<T>(規則: 判斷規則列表<T>, throws: boolean | string = false, fallThrough = false): T | null {
    const Exhaustion = Symbol('Exhaustion');
    function is規則列表(obj: T | 判斷規則列表<T>): obj is 判斷規則列表<T> {
      return Array.isArray(obj);
    }
    const loop = (所有規則: 判斷規則列表<T>): T | typeof Exhaustion => {
      for (const 規則 of 所有規則) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- user-provided value may violate this
        assert(Array.isArray(規則) && 規則.length === 2, '規則需符合格式');
        let 表達式 = 規則[0];
        const 結果 = 規則[1];
        if (typeof 表達式 === 'function') 表達式 = (表達式 as () => unknown)();
        if (typeof 表達式 === 'string' && 表達式 ? this.屬於(表達式) : 表達式 !== false) {
          if (!is規則列表(結果)) return 結果;
          const res = loop(結果);
          if (res === Exhaustion && fallThrough) continue;
          return res;
        }
      }
      return Exhaustion;
    };

    const res = loop(規則);
    if (res === Exhaustion) {
      if (throws === false) return null;
      else throw new Error(typeof throws === 'string' ? throws : '未涵蓋所有條件');
    }
    return res;
  }

  /**
   * 判斷當前音韻地位是否等於另一音韻地位。
   * @param other 另一音韻地位。
   * @returns 若相等，則回傳 `true`；否則回傳 `false`。
   * @example
   * ```typescript
   * > a = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > b = TshetUinh.音韻地位.from描述('羣開三A支平');
   * > a === b;
   * false
   * > a.等於(b);
   * true
   * ```
   */
  等於(other: 音韻地位): boolean {
    return this.描述 === other.描述;
  }

  /** 同 {@link 描述} */
  toString(): string {
    return this.描述;
  }

  /** @ignore 用於 Object.prototype.toString */
  readonly [Symbol.toStringTag] = '音韻地位';

  /** @ignore 僅用於 Node.js 呈現格式 */
  [Symbol.for('nodejs.util.inspect.custom')](...args: unknown[]): string {
    const stylize = (...x: unknown[]) => (args[1] as { stylize(...x: unknown[]): string }).stylize(...x);
    return `音韻地位<${stylize(this.描述, 'string')}>`;
  }

  /**
   * 驗證給定的音韻地位六要素是否合法。
   *
   * ### 基本取值
   *
   * 母必須為「幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以」之一。
   *
   * 韻必須為「東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡」之一。
   *
   * 當聲母為脣音，或韻母為「東冬鍾江虞模尤幽」（開合中立的韻）時，呼須為 `null`。
   * 在其他情況下，呼須取「開」或「合」。
   *
   * 當聲母為脣牙喉音（不含以母），且為三等韻時，類須取 `A`、`B`、`C` 之一。
   * 在其他情況下，類須為 `null`。
   *
   * ### 搭配
   *
   * 等：
   * - 章組、云以日母：限三等
   * - 羣邪俟母：一般限三等
   * - 匣母：一般限非三等
   * - 端組：限非三等，一般限一四等
   * - 精組（邪母除外）：限一三四等
   * - 知莊組（俟母除外）：限二三等
   * - 此外等當須與韻搭配
   *
   * 呼：
   * - 脣音、或開合中立韻：限 `null`（開合中立）
   * - 云母：除效流深咸四攝外，限非開口
   * - 其餘情形：呼須取「開」或「合」
   *
   * 類：
   * - 限幫見影組三等，其餘情形均須取 `null`（不分類）
   * - 前元音韻（支脂祭真仙宵麻庚清幽侵）：須取 A 或 B，其中清韻限 A 類，庚韻限 B 類
   * - 其餘韻一般須取 C
   * - 蒸韻：須取 C 或 B
   * - 陽韻：限 C 類，但有取 A 類之罕見例外
   * - 云母：限非 A 類
   *
   * 韻：
   * - 凡韻：限脣音
   * - 嚴韻、之魚殷痕韻：限非脣音
   * - 臻韻：限莊組
   * - 真殷韻開口、清韻：限非莊組
   * - 庚韻非二等：銳音限莊組
   *
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 類 類：`null`, A, B, C
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @param 邊緣地位種類 若為邊緣地位，列明其種類
   * @throws 若給定的音韻地位六要素不合法，則拋出異常
   */
  static 驗證(
    母: string,
    呼: string | null,
    等: string,
    類: string | null,
    韻: string,
    聲: string,
    邊緣地位種類: 邊緣地位種類指定 = [],
  ): void {
    const reject = (msg: string) => {
      throw new Error(`invalid 音韻地位 <${母},${呼 ?? ''},${等},${類 ?? ''},${韻},${聲}>: ` + msg);
    };

    // 驗證取值
    for (
      const [屬性, 值, nullable] of [
        ['母', 母],
        ['呼', 呼, true],
        ['等', 等],
        ['類', 類, true],
        ['韻', 韻],
        ['聲', 聲],
      ] as const
    ) {
      if (!((值 === null && !!nullable) || 所有[屬性].includes(值!))) {
        const suggestion = (
          {
            母: { 娘: '孃', 群: '羣' },
            韻: { 眞: '真', 欣: '殷' },
          } as Record<string, Record<string, string> | undefined>
        )[屬性]?.[值!];
        reject(`unrecognized ${屬性}: ${值}` + (suggestion ? ` (did you mean: ${suggestion}?)` : ''));
      }
    }

    // 驗證搭配
    // 順序：搭配規則從基本到精細

    // 聲（僅韻-聲搭配）
    聲 === '入' && 陰聲韻.includes(韻) && reject(`unexpected ${韻}韻入聲`);

    // 等、呼、類（基本）
    // 母-等
    if (!母搭配等[母].includes(等)) {
      reject(`unexpected ${母}母${等}等`);
    }
    // 等-韻
    if (!韻搭配等[韻].includes(等) && !(等 === '四' && [...'端透定泥'].includes(母) && 韻搭配等[韻].includes('三'))) {
      reject(`unexpected ${韻}韻${等}等`);
    }
    // 母-呼（基本）、呼-韻
    if ([...'幫滂並明'].includes(母)) {
      呼 && reject('unexpected 呼 for 脣音');
    } else if (韻搭配呼[韻].length === 0) {
      呼 && reject('unexpected 呼 for 開合中立韻');
    } else if (韻搭配呼[韻].length > 1) {
      呼 ?? reject('missing 呼');
    } else {
      const 應搭配呼 = 韻搭配呼[韻][0];
      if (!呼) {
        reject(`missing 呼 (should be ${應搭配呼})`);
      } else if (呼 !== 應搭配呼) {
        reject(`unexpected ${韻}韻${呼}口`);
      }
    }
    // 母-類（基本）、等-類、類-韻（基本）
    if (等 !== '三') {
      類 && reject('unexpected 類 for 非三等');
    } else if (!鈍音母.includes(母)) {
      類 && reject('unexpected 類 for 銳音聲母');
    } else {
      const [典型搭配類, 搭配類] = 母韻搭配類(母, 韻);
      if (!類) {
        const suggestion = 典型搭配類.length === 1 ? ` (should be ${典型搭配類}${典型搭配類 !== 搭配類 ? ' typically' : ''})` : '';
        reject(`missing 類${suggestion}`);
      } else if (!搭配類.includes(類)) {
        if (母 === '云' && 類 === 'A') {
          reject(`unexpected 云母A類`);
        }
        reject(`unexpected ${韻}韻${類}類`);
      }
    }

    // 母-韻
    if ([...'幫滂並明'].includes(母)) {
      [...'之魚殷痕嚴'].includes(韻) && reject(`unexpected ${韻}韻脣音`);
    } else {
      韻 === '凡' && reject(`unexpected 凡韻非脣音`);
    }
    if ([...'莊初崇生俟'].includes(母)) {
      等 === '三' && 韻 === '清' && reject(`unexpected ${韻}韻莊組`);
      呼 === '開' && ['真', '殷'].includes(韻) && reject(`unexpected ${韻}韻開口莊組`);
    } else {
      韻 === '臻' && reject(`unexpected 臻韻非莊組`);
      韻 === '庚' && 等 !== '二' && !鈍音母.includes(母) && reject(`unexpected 庚韻${等}等${母}母`);
    }

    // 邊緣搭配

    // 為已知邊緣地位，或特別指定跳過檢查
    if (邊緣地位種類 === _UNCHECKED || 已知邊緣地位.has(母 + (呼 ?? '') + 等 + (類 ?? '') + 韻 + 聲)) {
      return;
    }

    const 邊緣地位指定集 = new Set(邊緣地位種類);
    assert(邊緣地位種類.length === 邊緣地位指定集.size, 'duplicates in 邊緣地位種類');

    const marginalTests = [
      ['陽韻A類', true, 韻 === '陽' && 類 === 'A', '陽韻A類'],
      [
        '端組類隔',
        true,
        [...'端透定泥'].includes(母) && (等 === '二' || (等 === '四' && !韻搭配等[韻].includes('四'))),
        `${韻}韻${等}等${母}母`,
      ],
      ['咍韻脣音', true, 韻 === '咍' && [...'幫滂並明'].includes(母), `咍韻脣音`],
      ['匣母三等', true, 母 === '匣' && 等 === '三', `匣母三等`],
      ['羣邪俟母非三等', true, 等 !== '三' && [...'羣邪俟'].includes(母), `${母}母${等}等`],
      ['云母開口', false, 母 === '云' && 呼 === '開' && ![...'宵幽侵鹽嚴'].includes(韻), '云母開口'],
    ] as const;

    const knownKinds: string[] = marginalTests.map(([kind]) => kind);
    for (const kind of 邊緣地位種類) {
      if (!knownKinds.includes(kind)) {
        throw new Error(`unknown type of marginal 音韻地位: ${kind}`);
      }
    }

    for (const [kind, isStrict, condition, errmsg] of marginalTests) {
      if (condition && !邊緣地位指定集.has(kind)) {
        const suggestion = isStrict ? '' : ` (note: marginal 音韻地位, include '${kind}' in 邊緣地位種類 to allow)`;
        reject(`unexpected ${errmsg}${suggestion}`);
      } else if (isStrict && !condition && 邊緣地位指定集.has(kind)) {
        reject(`expect marginal 音韻地位: ${kind} (note: don't specify it in 邊緣地位種類 unless it describes this 音韻地位)`);
      }
    }
  }

  /**
   * 將音韻描述或簡略音韻描述轉換為音韻地位。
   * @param 音韻描述 音韻地位的描述
   * @param 簡略描述 為 `true` 則允許簡略描述，否則須為完整描述
   * @returns 給定的音韻描述或最簡描述對應的音韻地位
   * @example
   * ```typescript
   * > TshetUinh.音韻地位.from描述('幫三C凡入');
   * 音韻地位<幫三C凡入>
   *  > TshetUinh.音韻地位.from描述('幫凡入', true);
   * 音韻地位<幫三C凡入>
   * > TshetUinh.音韻地位.from描述('羣開三A支平');
   * 音韻地位<羣開三A支平>
   * ```
   */
  static from描述(音韻描述: string, 簡略描述 = false, 邊緣地位種類: 邊緣地位種類指定 = []): 音韻地位 {
    const match = pattern描述.exec(音韻描述);
    if (!match) {
      throw new Error(`invalid 描述: ${音韻描述}`);
    }
    const 母 = match[1];
    let 呼 = match[2] || null;
    let 等 = match[3] || null;
    let 類 = match[4] || null;
    const 韻 = match[5];
    const 聲 = match[6];

    if (簡略描述) {
      if (!呼 && ![...'幫滂並明'].includes(母)) {
        if (母 === '云' && 韻搭配呼[韻].length > 1) {
          呼 = '合';
        } else {
          const 可搭配呼 = 韻搭配呼[韻];
          if (可搭配呼.length === 1) {
            呼 = 可搭配呼[0];
          }
        }
      }

      if (!等) {
        if (母搭配等[母] === '三' || [...'羣邪俟'].includes(母)) {
          等 = '三';
        } else {
          const 可搭配等 = 韻搭配等[韻];
          if (可搭配等.length === 1) {
            const 應搭配等 = 可搭配等[0];
            if (應搭配等 === '三' && [...'端透定泥'].includes(母)) {
              等 = '四';
            } else {
              等 = 應搭配等;
            }
          }
        }
      }

      if (!類 && 等 === '三' && 鈍音母.includes(母)) {
        const [典型搭配類] = 母韻搭配類(母, 韻);
        if (典型搭配類.length === 1) {
          類 = 典型搭配類;
        }
      }
    }

    // NOTE type assertion safe because the constructor checks it
    return new 音韻地位(母, 呼, 等!, 類, 韻, 聲, 邊緣地位種類);
  }
}

/**
 * 取得給定條件下可搭配的類，分為「不含邊緣地位」與「含邊緣地位」兩種。
 * 用於 `音韻地位` 的 `.驗證`、`.from描述`、`.簡略描述`。
 */
function 母韻搭配類(母: string, 韻: string): [string, string] {
  let 搭配: [string, string] | null = null;
  for (
    const [搭配類, 搭配韻] of [
      ['C', [...'東鍾之微魚虞廢殷元文歌尤嚴凡']],
      ['AB', [...'支脂祭真仙宵麻幽侵鹽']],
      ['A', [...'清']],
      ['B', [...'庚']],
      ['BC', [...'蒸']],
      ['CA', [...'陽']],
    ] as const
  ) {
    if (搭配韻.includes(韻)) {
      搭配 = [搭配類 === 'CA' ? 'C' : 搭配類, 搭配類];
      break;
    }
  }
  if (搭配 === null) {
    throw new Error(`unknown 韻: ${韻}`);
  }
  if (母 === '云') {
    return 搭配.map(x => x.replace(/A/g, '')) as typeof 搭配;
  }
  return 搭配;
}

/**
 * 惰性求值參數，用於 `音韻地位.屬於` 標籤模板形式
 */
class LazyParameter {
  private constructor(
    private inner: unknown,
    private 地位: 音韻地位,
  ) {}

  static from(param: unknown, 地位: 音韻地位): LazyParameter | boolean {
    switch (typeof param) {
      case 'string':
        return 地位.屬於(param);
      case 'function':
        return new LazyParameter(param, 地位);
      default:
        return !!param;
    }
  }

  eval(): boolean {
    if (typeof this.inner === 'function') {
      this.inner = this.inner.call(undefined);
      if (typeof this.inner === 'string') {
        this.inner = this.地位.屬於(this.inner);
      }
    }
    return (this.inner = !!this.inner);
  }

  toString(): string {
    return String(this.inner);
  }
}

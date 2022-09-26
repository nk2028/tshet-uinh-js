import { 母到清濁, 母到組, 母到音, 韻到攝 } from './拓展音韻屬性';
import { 導入或驗證, 正則化Error, 正則化或驗證, 正則化選項 } from './正則化';
import { 可靠重紐韻, 各等韻, 呼韻搭配, 所有, 鈍音母, 陰聲韻 } from './音韻屬性常量';

// For encoder
const 編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
const 韻順序表 = '東_冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山仙先蕭宵肴豪歌_麻_陽唐庚_耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡';
const 特別編碼: Record<number, [string, string]> = {
  0: ['東', '一'],
  1: ['東', '三'],
  37: ['歌', '一'],
  38: ['歌', '三'],
  39: ['麻', '二'],
  40: ['麻', '三'],
  43: ['庚', '二'],
  44: ['庚', '三'],
};

// For 屬於
const 檢查 = {
  ...所有,
  音: [...'脣舌齒牙喉'],
  攝: [...'通江止遇蟹臻山效果假宕梗曾流深咸'],
  組: [...'幫端知精莊章見影'],
} as const;

const 次入韻 = '祭泰夬廢';
// TODO 取消
const 輕脣韻 = '東鍾微虞廢文元陽尤凡';

const pattern音韻地位 = new RegExp(
  `^([${所有.母.join('')}])([${所有.呼.join('')}]?)([${所有.等.join('')}]?)` +
    `([${所有.重紐.join('')}]?)([${所有.韻.join('')}])([${所有.聲.join('')}])$`,
  'u'
);

function assert(value: unknown, error: string): asserts value {
  if (!value) throw new Error(error);
}

type Falsy = '' | 0 | false | null | undefined;
export type 規則<T = unknown> = [unknown, T | 規則<T>][];

export type 任意音韻地位 = Pick<音韻地位, '母' | '呼' | '等' | '重紐' | '韻' | '聲'>;
export type 部分音韻屬性 = Partial<任意音韻地位>;

export type 其他分析體系 = 'v2' | 'v2ext' | 'poem' | 'v1' | 'ytenx' | 'yonh';

const 脣音分寒桓by分析體系: Record<其他分析體系, boolean> = {
  v2: true, // actually `false`, but treated as its susperset `v2ext` here
  v2ext: true,
  poem: false,
  v1: false,
  ytenx: true,
  yonh: true,
};

/**  (For internal use) Indicates bypassed verification in `音韻地位.constructor` */
export const Unchecked: 其他分析體系 = Symbol('Unchecked') as unknown as 其他分析體系;

/**
 * 《切韻》音系音韻地位。
 *
 * 可使用字串 (母, 呼, 等, 重紐, 韻, 聲) 初始化。
 *
 * | 音韻屬性 | 中文名稱 | 英文名稱 | 可能取值 |
 * | :- | :- | :- | :- |
 * | 母<br/>組 | 聲母<br/>組 | initial<br/>group | **幫**滂並明<br/>**端**透定泥<br/>來<br/>**知**徹澄孃<br/>**精**清從心邪<br/>**莊**初崇生俟<br/>**章**昌常書船<br/>日<br/>**見**溪羣疑<br/>**影**曉匣云<br/>以<br/>（粗體字為組，未涵蓋「來日以」） |
 * | 呼 | 呼 | rounding | 開口<br/>合口 |
 * | 等 | 等 | division | 一二三四 |
 * | 重紐 | 重紐 | repeated initials | 重紐A類<br/>重紐B類 |
 * | 韻<br/>攝 | 韻母<br/>攝 | rhyme<br/>class | 通：東冬鍾<br/>江：江<br/>止：支脂之微<br/>遇：魚虞模<br/>蟹：齊祭泰佳皆夬灰咍廢<br/>臻：真臻文殷魂痕<br/>山：元寒刪山先仙<br/>效：蕭宵肴豪<br/>果：歌<br/>假：麻<br/>宕：陽唐<br/>梗：庚耕清青<br/>曾：蒸登<br/>流：尤侯幽<br/>深：侵<br/>咸：覃談鹽添咸銜嚴凡<br/>（冒號前為攝，後為對應的韻） |
 * | 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |
 *
 * 音韻地位六要素：母、呼、等、重紐、韻、聲。
 *
 * 「呼」和「重紐」可為 `null`，其餘四個屬性不可為 `null`。
 *
 * 當聲母為脣音，或韻為「東冬鍾江模尤侯」（開合中立的韻）時，（除極少數例外）呼必須為 `null`。
 * 在其他情況下，呼必須取「開」或「合」。
 *
 * 當聲母為幫見影組，且韻為「支脂祭真仙宵庚清侵鹽」十韻之一時，重紐必須取 `A` 或 `B`。
 * 當聲母為幫見影組，且韻為「蒸幽麻」三韻之一時，重紐可以取 `null` 或 `A` 或 `B`。
 * 在其他情況下，（除極少數例外）重紐必須為 `null`。
 *
 * 不設《廣韻》新增之諄、桓、戈韻。依《切韻》併入真、寒、歌韻。
 *
 * 不支援異體字或韻目異文，請手動轉換：
 *
 * * 音 唇 → 脣
 * * 母 娘 → 孃
 * * 母 荘 → 莊
 * * 母 谿 → 溪
 * * 母 群 → 羣
 * * 韻 眞 → 真
 * * 韻 欣 → 殷
 * * 韻 餚 → 肴
 */
export class 音韻地位 {
  /**
   * 聲母
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.母;
   * '幫'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.母;
   * '羣'
   * ```
   */
  readonly 母: string;

  /**
   * 呼
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.呼;
   * null
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.呼;
   * '開'
   * ```
   */
  readonly 呼: string | null;

  /**
   * 等
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.等;
   * '三'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.等;
   * '三'
   * ```
   */
  readonly 等: string;

  /**
   * 重紐
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.重紐;
   * null
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.重紐;
   * 'A'
   * ```
   */
  readonly 重紐: string | null;

  /**
   * 韻（舉平以賅上去入）
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.韻;
   * '凡'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.韻;
   * '支'
   * ```
   */
  readonly 韻: string;

  /**
   * 聲調
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.聲;
   * '入'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.聲;
   * '平'
   * ```
   */
  readonly 聲: string;

  /**
   * 初始化音韻地位物件。（各項參數詳見 [[`音韻地位`]] 說明）
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 重紐 重紐：`null`, A, B
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @param 導入自 某個其他家資料 ID，表明指定的六項屬性來自該家資料；若指定此項，則構造後的六項屬性會經過變換以符合本項目之音韻分析體系
   * @returns 所描述的音韻地位
   * @example
   * ```typescript
   * > new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * 音韻地位 { '幫三凡入' }
   * > new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * 音韻地位 { '羣開三A支平' }
   * > new Qieyun.音韻地位('明', '合', '一', null, '桓', '入', 'ytenx);
   * 音韻地位 { '明一寒入' }
   * ```
   */
  constructor(母: string, 呼: string | null, 等: string, 重紐: string | null, 韻: string, 聲: string, 導入自?: 其他分析體系) {
    if (導入自 !== Unchecked) {
      if (導入自 != null && !Object.prototype.hasOwnProperty.call(脣音分寒桓by分析體系, 導入自)) {
        throw new Error(`unknown 分析體系: ${導入自}`);
      }
      ({ 母, 呼, 等, 重紐, 韻, 聲 } = 導入或驗證({ 母, 呼, 等, 重紐, 韻, 聲 }, 導入自 != null, 脣音分寒桓by分析體系[導入自]));
    }
    this.母 = 母;
    this.呼 = 呼;
    this.等 = 等;
    this.重紐 = 重紐;
    this.韻 = 韻;
    this.聲 = 聲;
  }

  /**
   * 清濁（全清、次清、全濁、次濁）
   *
   * 曉母為全清，云以來日四母為次濁。
   *
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.清濁;
   * '全清'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
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
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.音;
   * '脣'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
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
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.攝;
   * '咸'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
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
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.韻別;
   * '入'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
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
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.組;
   * '幫'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
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
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.描述;
   * '幫三凡入'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.描述;
   * '羣開三A支平'
   * ```
   */
  get 描述(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return 母 + (呼 || '') + 等 + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 最簡描述
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.最簡描述;
   * '幫凡入'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.最簡描述;
   * '羣開A支平'
   * ```
   */
  get 最簡描述(): string {
    const { 母, 韻, 聲 } = this;
    let { 呼, 等, 重紐 } = this;
    if ((呼 === '開' && 呼韻搭配.開.includes(韻)) || (呼 === '合' && 呼韻搭配.合.includes(韻))) {
      呼 = null;
    }
    if (![...各等韻.一三, ...各等韻.二三].includes(韻)) 等 = null;
    if (['清', '庚'].includes(韻) || (母 === '云' && 可靠重紐韻.includes(韻))) 重紐 = null;
    return 母 + (呼 || '') + (等 || '') + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於 [[`.屬於`]] 函數
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.表達式;
   * '幫母 開合中立 三等 不分重紐 凡韻 入聲'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.表達式;
   * '羣母 開口 三等 重紐A類 支韻 平聲'
   * ```
   */
  get 表達式(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口 ` : '開合中立 ';
    const 重紐字段 = 重紐 ? `重紐${重紐}類 ` : '不分重紐 ';
    return `${母}母 ${呼字段}${等}等 ${重紐字段}${韻}韻 ${聲}聲`;
  }

  /**
   * 音韻地位對應的編碼。音韻編碼與音韻地位之間存在一一映射關係。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.編碼;
   * 'A9D'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.編碼;
   * 'fFU'
   * ```
   */
  get 編碼(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 母編碼 = 所有.母.indexOf(母);
    const 韻編碼 = { 東三: 1, 歌三: 38, 麻三: 40, 庚三: 44 }[`${韻}${等}`] || 韻順序表.indexOf(韻);
    const 呼編碼 = 所有.呼.indexOf(呼) + 1;
    const 重紐編碼 = 所有.重紐.indexOf(重紐) + 1;
    const 其他編碼 = (呼編碼 << 4) | (重紐編碼 << 2) | 所有.聲.indexOf(聲);
    return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼];
  }

  /**
   * 調整該音韻地位的屬性，會驗證調整後地位的合法性，返回新的對象。
   *
   * 本方法可使用一般形式（`.調整({ ... })`）或字串形式（`.調整('...')`）。
   *
   * **注意**：原對象不會被修改。
   *
   * @param 調整屬性 可為以下種類之一：
   * - 物件，其屬性可為六項基本屬性中的若干項，各屬性的值為欲修改成的值。
   *
   *   不含某屬性或某屬性值為 `undefined` 則表示不修改該屬性。
   *
   * - 字串，可寫出若干項屬性，以空白分隔各項。各屬性的寫法如下：
   *
   *   - 母、等、韻、聲：如 `'見母'`、`''三等''`、`'元韻'`、`'平聲'` 等
   *   - 呼：`'開口'`、`'合口'`、`'開合中立'`
   *   - 重紐：`'重紐A類'`、`'重紐B類'`、`'不分重紐'`
   *
   * @returns 新的 `音韻地位`，其中會含有指定的修改值。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三元上');
   * > 音韻地位.調整({ 聲: '平' }).描述
   * '幫三元平'
   * > 音韻地位.調整('平聲').描述
   * '幫三元平'
   * > 音韻地位.調整({ 母: '見', 呼: '合' }).描述
   * '見合三元上'
   * > 音韻地位.調整('見母 合口').描述
   * '見合三元上'
   * > 音韻地位.調整(`${'見'}母 ${'合口'}`).描述
   * '見合三元上'
   * ```
   */
  調整(調整屬性: 部分音韻屬性 | string): 音韻地位 {
    if (typeof 調整屬性 === 'string') {
      const 屬性object: 部分音韻屬性 = {};
      const set = <T extends keyof 部分音韻屬性>(屬性: T, 值: 音韻地位[T]) => {
        assert(!(屬性 in 屬性object), `duplicated assignment of ${屬性}`);
        屬性object[屬性] = 值;
      };

      for (const token of 調整屬性.trim().split(/\s+/u)) {
        const match = /^(?:(?<kv>開合中立|不分重紐)|(?<k1>重紐)(?<v1>.)類|(?<v2>.)(?<k2>[母口等韻聲]))$/u.exec(token);
        if (match === null) {
          throw new Error(`unrecognized expression: ${token}`);
        }
        const { kv, k1, v1, k2, v2 } = match.groups;
        const k = k1 ?? k2;
        const v = v1 ?? v2;
        if (kv) {
          if (kv === '開合中立') set('呼', null);
          else if (kv === '不分重紐') set('重紐', null);
        } else {
          set(k.replace('口', '呼') as keyof 部分音韻屬性, v);
        }
      }

      調整屬性 = 屬性object;
    }

    const { 母 = this.母, 呼 = this.呼, 等 = this.等, 重紐 = this.重紐, 韻 = this.韻, 聲 = this.聲 } = 調整屬性;
    return new 音韻地位(母, 呼, 等, 重紐, 韻, 聲);
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
   *   * 重紐：`重紐A類`, `重紐B類`, `不分重紐`
   * * 拓展音韻地位：
   *   * `……組`, `……音`, `……攝`
   *   * 清濁：`全清`, `次清`, `全濁`, `次濁`, `清音`, `濁音`
   *   * 韻別：`陰聲韻`, `陽聲韻`, `入聲韻`
   * * 其他表達式：
   *   * `輕脣韻`：東鍾微虞廢文元陽尤凡韻三等（僅判斷韻與等，不判斷聲母）
   *   * `次入韻`：祭泰夬廢韻
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
   * 各表達式及運算子之間必須以空格隔開。
   *
   * AND 運算子可省略，如 `(端精組 且 入聲) 或 (以母 且 四等 且 去聲)` 與 `端精組 入聲 或 以母 四等 去聲` 同義。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @throws 若表達式為空、不合語法、或限定條件不合法，則拋出異常。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.屬於`章母`; // 標籤模板語法（表達式為字面值時推薦）
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
   * * 函數：會被執行；若其傳回值為字串，會遞迴套用至 [[`.屬於`]] 函數，否則會檢測其真值
   * * 字串：會遞迴套用至 [[`.屬於`]] 函數
   * * 其他：會檢測其真值
   *
   * **注意**：
   *
   * * 該語法僅能用於字面值模板串，不能用於如 [[`.判斷`]] 等
   * * `` .屬於`${...}` `` 和 `` .屬於(`${...}`) `` 不同，只有前者支持上述嵌入參數，後者的模板串會先被求值為普通字串。
   *
   * @param 表達式 描述音韻地位的模板字串列表。
   * @param 參數 要嵌入模板的參數列表。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @throws 若表達式為空、不合語法、或限定條件不合法，則拋出異常。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.屬於`一四等 或 ${音韻地位.描述 === '幫三凡入'}`;
   * true
   * ```
   */
  屬於(表達式: TemplateStringsArray, ...參數: unknown[]): boolean;

  屬於(表達式: string | readonly string[], ...參數: unknown[]): boolean {
    if (typeof 表達式 === 'string') 表達式 = [表達式];

    /** 普通字串 token 求值 */
    const { 母, 呼, 等, 重紐, 韻, 聲, 清濁, 韻別 } = this;
    const evalToken = (token: string): boolean => {
      let match: RegExpExecArray = null;
      const tryMatch = (pat: RegExp) => !!(match = pat.exec(token));
      if (tryMatch(/^(陰|陽|入)聲韻$/)) return 韻別 === match[1];
      if (tryMatch(/^輕脣韻$/)) return 輕脣韻.includes(韻) && 等 === '三';
      if (tryMatch(/^次入韻$/)) return 次入韻.includes(韻);
      if (tryMatch(/^仄聲$/)) return 聲 !== '平';
      if (tryMatch(/^舒聲$/)) return 聲 !== '入';
      if (tryMatch(/^(開|合)口$/)) return 呼 === match[1];
      if (tryMatch(/^開合中立$/)) return 呼 === null;
      if (tryMatch(/^重紐(A|B)類$/)) return 重紐 === match[1];
      if (tryMatch(/^不分重紐$/)) return 重紐 === null;
      if (tryMatch(/^(清|濁)音$/)) return 清濁[1] === match[1];
      if (tryMatch(/^[全次][清濁]$/)) return 清濁 === match[0];
      if (tryMatch(/^鈍音$/)) return 鈍音母.includes(母);
      if (tryMatch(/^銳音$/)) return !鈍音母.includes(母);
      if (tryMatch(/^(.+?)([母等韻音攝組聲])$/)) {
        const values = [...match[1]];
        const check = 檢查[match[2] as keyof typeof 檢查];
        const invalid = values.filter(i => !check.includes(i)).join('');
        assert(!invalid, invalid + match[2] + '不存在');
        return values.includes(this[match[2] as keyof typeof 檢查]);
      }
      throw new Error(`unrecognized test condition: ${token}`);
    };

    // 詞法分析，同時給普通運算元求值（惟函數型運算元留待後面惰性求值）
    type Keyword = '(' | ')' | 'not' | 'and' | 'or' | 'end';
    type Token = Keyword | boolean | LazyParameter;
    const KEYWORDS: Keyword[] = ['(', ')', 'not', 'and', 'or'];
    const PATTERNS: RegExp[] = [/^\($/, /^\)$/, /^([!~非]|not)$/i, /^(&+|且|and)$/i, /^(\|+|或|or)$/i];
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

    const parseOrExpr = (required: boolean): SExpr => {
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
    };

    const parseAndExpr = (required: boolean): SExpr => {
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
    };

    const parseNotExpr = (required: boolean): SExpr => {
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
    };

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
   * 判斷某個小韻是否符合給定的某個條件，傳回自訂值。
   * @param 規則 `[判斷式, 結果][]` 形式的陣列。
   *
   * 判斷式可以是：
   *
   * * &#x3000;&#x3000;函數：會被執行；若其傳回值為非空字串，會套用至 [[`.屬於`]] 函數，若為布林值則直接決定是否跳過本規則，否則規則永遠不會被跳過
   * * 非空字串：描述音韻地位的表達式，會套用至 [[`.屬於`]] 函數
   * * &#x3000;布林值：直接決定是否跳過本規則
   * * &#x3000;&#x3000;其他：規則永遠不會被跳過（可用作指定後備結果）
   *
   * 建議使用空字串、`null` 或 `true` 作判斷式以指定後備結果。
   *
   * 結果可以是任意傳回值或遞迴規則。
   * @param error 若為 `true` 或非空字串，在未涵蓋所有條件時會拋出錯誤。
   * @param fallback 若為 `true`，在遞迴子陣列未涵蓋所有條件時會繼續嘗試母陣列的條件。
   * @returns 自訂值，在未涵蓋所有條件且不使用 `error` 時會回傳 `null`。
   * @throws `未涵蓋所有條件`（或 `error` 參數）, `規則需符合格式`, `無效的表達式`, `表達式為空`, `非預期的運算子`, `非預期的閉括號`, `括號未匹配`
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
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
  判斷<T, E = undefined>(規則: 規則<T>, error?: E, fallback?: boolean): E extends Falsy ? T | null : T {
    const Exhaustion = Symbol('Exhaustion');
    const loop = (所有規則: 規則<T>): T | typeof Exhaustion => {
      for (const 規則 of 所有規則) {
        assert(Array.isArray(規則) && 規則.length === 2, '規則需符合格式');
        let 表達式 = 規則[0];
        const 結果 = 規則[1];
        if (typeof 表達式 === 'function') 表達式 = 表達式();
        if (typeof 表達式 === 'string' && 表達式 ? this.屬於(表達式) : 表達式 !== false) {
          if (!Array.isArray(結果)) return 結果;
          const res = loop(結果);
          if (res === Exhaustion && fallback) continue;
          return res;
        }
      }
      return Exhaustion;
    };

    const res = loop(規則);
    if (res === Exhaustion) {
      if (!error) return null;
      else throw new Error(typeof error === 'string' ? error : '未涵蓋所有條件');
    }
    return res;
  }

  /**
   * 判斷當前音韻地位是否等於另一音韻地位。
   * @param other 另一音韻地位。
   * @returns 若相等，則回傳 `true`；否則回傳 `false`。
   * @example
   * ```typescript
   * > a = Qieyun.音韻地位.from描述('羣開三A支平');
   * > b = Qieyun.音韻地位.from描述('羣開三A支平');
   * > a === b;
   * false
   * > a.等於(b);
   * true
   * ```
   */
  等於(other: 音韻地位): boolean {
    return this.編碼 === other.編碼;
  }

  // TODO examples
  /**
   * 取得該地位經正則化處理後的地位。
   *
   * 由於一部分例外字確實擁有非正則音（如「地」「打」等），因此需在參數指明「字頭」，或用「選項」指明例外地位是否保留。
   *
   * 正則化地位範圍及支持的正則化處理（以「視同」寫明）如下：
   *
   * - 見組、影曉來母：無限制
   *
   * - 匣母：限一二四等
   *
   * - 脣音：
   *   - 限開合中立（寒、歌韻開口視同中立）
   *   - 開合分韻的一等韻，限圓脣韻（其中咍韻視同灰韻，可在選項用 `保留咍韻脣音: true` 保留咍韻）
   *   - 非前元音三等韻，限圓脣韻（含凡韻，嚴韻視同凡韻）
   *
   * - 章組、云以日母：限三等
   *   - 齊灰咍韻平上聲，視同祭廢韻平上聲寄韻
   *
   * - 精組：限一三四等（二等視同莊組）
   *
   * - 知莊組：限二三等（一四等視同端精組）
   *
   * - 端組：限一四等（二三等視同知組，但有例外字）
   *
   * - 陽韻：限「不分重紐」（但有例外字）
   *
   * - 凡韻：限脣音（非脣音視同嚴韻）
   *
   * 未列明處理方式的非正則地位無法自動處理，其往往是由反切訛誤、字頭訛誤、切語分析不當等導致「硬切」的地位，對該類地位會拋出異常。
   *
   * 此外有若干邊緣地位，雖然不算「正則」，但會被保留，稱為「弱非正則地位」。
   * - 云母開口（宵侵鹽韻除外）
   * - 羣邪俟母非三等
   *
   * @param 字頭 用於判定是否為例外字
   * - 若其為有非正則音的字，則其對應的非正則音將得以保留（如傳入「地」字，則「定開脂去」將不會被改為「澄開脂去」）
   * - 若無法給出字頭，也可用空串 `''`；此時將僅靠地位判定，已知有字的非正則地位將均得以保留
   * @returns 二元組，兩項分別為：
   * 1. 正則地位：正則化處理後的地位，若該地位已是正則地位（含弱非正則地位），則返回自身
   * 2. 弱非正則地位提示：若地位為「弱非正則地位」，則返回說明其相關信息的串，否則返回 null
   * @throws [[`正則化Error`]] 當並非正則地位，且無法自動處理時拋出
   */
  正則地位(字頭: string): [音韻地位, string | null];
  /**
   * 取得該地位經正則化處理後的地位（進階選項版）。
   *
   * @param 選項 詳細選項，可以為：
   * - 字串，表示較粗放的正則化策略，可指定值見 [[`正則化選項.策略`]]：
   * - Object，見 [[`正則化選項`]]
   * @returns 同基礎用法版
   */
  正則地位(選項: string | 正則化選項): [音韻地位, string | null];
  正則地位(字頭或選項: string | 正則化選項): [音韻地位, string | null] {
    return 正則化或驗證(this, true, 字頭或選項);
  }

  /**
   * 驗證以確保該地位為正則地位。
   * 若為正則地位，則返回自身，否則拋出異常。
   * 參數與返回值同 [[`.正則地位`]]。
   *
   * @throws [[`正則化Error`]] 該地位並非正則地位時拋出，其中會包含原因及相應的正則地位（若有）
   */
  ensure正則地位(字頭或選項: string | 正則化選項): [音韻地位, string | null] {
    return 正則化或驗證(this, false, 字頭或選項);
  }

  /**
   * 檢查該地位是否為正則地位。
   *
   * @returns 若為正則地位，則為 `true`；若為弱非正則地位則為 `'weak'`；否則為 `false`
   */
  is正則地位(字頭或選項: string | 正則化選項): boolean | 'weak' {
    try {
      const [, warning] = this.ensure正則地位(字頭或選項);
      return warning ? 'weak' : true;
    } catch (e) {
      if (e instanceof 正則化Error) {
        return false;
      } else {
        throw e;
      }
    }
  }

  /**
   * 將音韻編碼轉換為音韻地位。
   * @param 音韻編碼 音韻地位的編碼
   * @returns 給定的音韻編碼對應的音韻地位。
   * @example
   * ```typescript
   * > Qieyun.音韻地位.from編碼('A9D');
   * 音韻地位 { '幫三凡入' }
   * > Qieyun.音韻地位.from編碼('fFU');
   * 音韻地位 { '羣開三A支平' }
   * ```
   */
  static from編碼(音韻編碼: string): 音韻地位 {
    // NOTE For the 1st code unit, only characters from 'A' through 'l' (inclusive) are valid.
    // Other characters are reserved for future extension.
    assert(音韻編碼.length === 3 && 編碼表.slice(0, 38).includes(音韻編碼[0]), `Invalid 編碼: ${JSON.stringify(音韻編碼)}`);

    const 母編碼 = 編碼表.indexOf(音韻編碼[0]);
    const 韻編碼 = 編碼表.indexOf(音韻編碼[1]);
    const 其他編碼 = 編碼表.indexOf(音韻編碼[2]);

    const 呼編碼 = (其他編碼 >> 4) & 0b11;
    const 重紐編碼 = (其他編碼 >> 2) & 0b11;
    const 聲編碼 = 其他編碼 & 0b11;

    const 母 = 所有.母[母編碼];
    const 聲 = 所有.聲[聲編碼];
    const 呼 = 呼編碼 ? 所有.呼[呼編碼 - 1] : null;
    const 重紐 = 重紐編碼 ? 所有.重紐[重紐編碼 - 1] : null;

    let 韻: string;
    let 等: string;
    if (韻編碼 in 特別編碼) {
      [韻, 等] = 特別編碼[韻編碼];
    } else {
      韻 = 韻順序表[韻編碼];
      if ([...各等韻.一].includes(韻)) 等 = '一';
      if ([...各等韻.二].includes(韻)) 等 = '二';
      if ([...各等韻.三].includes(韻)) 等 = '三';
      if ([...各等韻.四].includes(韻)) 等 = '四';
    }

    return new 音韻地位(母, 呼, 等, 重紐, 韻, 聲);
  }

  /**
   * 將音韻描述或最簡音韻描述轉換為音韻地位。
   * @param 音韻描述 音韻地位的描述或最簡描述
   * @returns 給定的音韻描述或最簡描述對應的音韻地位。
   * @example
   * ```typescript
   * > Qieyun.音韻地位.from描述('幫三凡入');
   * 音韻地位 { '幫三凡入' }
   * > Qieyun.音韻地位.from描述('羣開三A支平');
   * 音韻地位 { '羣開三A支平' }
   * ```
   */
  static from描述(音韻描述: string): 音韻地位 {
    const match = pattern音韻地位.exec(音韻描述);
    if (match === null) {
      throw new Error(`Cannot parse 描述: ${音韻描述}`);
    }

    const 母 = match[1];
    let 呼 = match[2] || null;
    let 等 = match[3] || null;
    let 重紐 = match[4] || null;
    const 韻 = match[5];
    const 聲 = match[6];

    if (呼 === null && ![...'幫滂並明'].includes(母)) {
      if (呼韻搭配.開.includes(韻)) 呼 = '開';
      else if (呼韻搭配.合.includes(韻)) 呼 = '合';
    }

    if (等 === null) {
      if ([...各等韻.一].includes(韻)) 等 = '一';
      else if ([...各等韻.二].includes(韻)) 等 = '二';
      else if ([...各等韻.三].includes(韻)) 等 = '三';
      else if ([...各等韻.四].includes(韻)) 等 = '四';
    }

    if (重紐 === null && 等 === '三' && 可靠重紐韻.includes(韻) && 鈍音母.includes(母)) {
      if (韻 === '清') 重紐 = 'A';
      else if (韻 === '庚' || 母 === '云') 重紐 = 'B';
    }

    return new 音韻地位(母, 呼, 等, 重紐, 韻, 聲);
  }
}

/**
 * 惰性求值參數，用於 `音韻地位.屬於` 標籤模板形式
 */
class LazyParameter {
  private constructor(private inner: unknown, private 地位: 音韻地位) {}

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

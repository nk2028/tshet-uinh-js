import { 母到清濁, 母到組, 母到音, 韻到攝 } from './拓展音韻屬性';
import { 前元音三等韻, 各等韻, 呼韻搭配, 所有, 鈍音母, 陰聲韻 } from './音韻屬性常量';

const pattern音韻地位 = new RegExp(
  `^([${所有.母.join('')}])([${所有.呼.join('')}]?)([${所有.等.join('')}]?)` +
    `([${所有.重紐.join('')}]?)([${所有.韻.join('')}])([${所有.聲.join('')}])$`,
  'u'
);

// For encoder
const 編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
const 韻順序表 = '東_冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌_麻_陽唐庚_耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡';
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

// For 驗證
const 已知例外地位 = new Set([
  // 嚴格邊緣地位
  // 端組二三等
  '定開三脂去', // 地
  '端開二庚上', // 打
  '端開三麻平', // 爹
  '端開三麻上', // 嗲
  ...['佳', '皆'].flatMap(韻 => ['上', '去'].map(聲 => `定開二${韻}${聲}`)), // 箉䈆
  '端開三幽平', // 丟
  // 麻三鈍音
  '明三A麻上', // 乜
  // 陽韻A類
  '並三A陽上', // 𩦠
  // 非嚴格邊緣地位
  // 云母開口
  '云開三之上', // 矣
  '云開三B仙平', // 焉
  // 蒸韻B類
  '影開三B蒸入', // 抑
  '溪開三B蒸平', // 硱
]);

function assert(value: unknown, error: string): asserts value {
  if (!value) throw new Error(error);
}

export type 任意音韻地位 = Pick<音韻地位, '母' | '呼' | '等' | '重紐' | '韻' | '聲'>;
export type 部分音韻屬性 = Partial<任意音韻地位>;

export type 判斷規則列表<T = unknown> = [unknown, T | 判斷規則列表<T>][];

/**
 * 創建[[`音韻地位`]]時，該類型選項參數用於允許額外的邊緣地位作為「例外」而創建。
 *
 * **注意**：內建的例外地位白名單**已涵蓋內建資料中全部邊緣地位**，不需用到該類型參數。
 * 請僅當**一定需要**時才使用該參數。
 *
 * 每項屬性對應一個邊緣地位種類，置為 `true` 即表示容許該類例外。
 * 種類分為「嚴格型」和「非嚴格型」。其中「云母開口」「蒸韻B類」「羣邪俟母非三等」為非嚴格型，餘皆為嚴格型。
 *
 * 「嚴格型」不僅需要在創建該類邊緣地位時將該屬性置為 `true`，而且不允許濫用，即創建無關地位時不可置 `true`。
 */
export interface 邊緣地位例外選項 {
  // 嚴格型
  端組二三等?: boolean;
  麻三鈍音?: boolean;
  陽韻A類?: boolean;
  咍韻脣音?: boolean;
  // 非嚴格型
  云母開口?: boolean;
  蒸韻B類?: boolean;
  羣邪俟母非三等?: boolean;
}

const _Unchecked = Symbol('_Unchecked') as 邊緣地位例外選項;

/**
 * 《切韻》音系音韻地位。
 *
 * 可使用字串 (母, 呼, 等, 重紐, 韻, 聲) 初始化。
 *
 * | 音韻屬性 | 中文名稱 | 英文名稱 | 可能取值 |
 * | :- | :- | :- | :- |
 * | 母<br/>組 | 聲母<br/>組 | initial<br/>group | **幫**滂並明<br/>**端**透定泥<br/>來<br/>**知**徹澄孃<br/>**精**清從心邪<br/>**莊**初崇生俟<br/>**章**昌常書船<br/>日<br/>**見**溪羣疑<br/>**影**曉匣云<br/>以<br/>（粗體字為組，「來日以」母不屬於任何組） |
 * | 呼 | 呼 | rounding | 開口<br/>合口<br/>開合中立（`null`） |
 * | 等 | 等 | division | 一二三四 |
 * | 重紐 | 重紐 | repeated initials | 重紐A類<br/>重紐B類<br/>不分重紐（`null`） |
 * | 韻<br/>攝 | 韻母<br/>攝 | rhyme<br/>class | 通：東冬鍾<br/>江：江<br/>止：支脂之微<br/>遇：魚虞模<br/>蟹：齊祭泰佳皆夬灰咍廢<br/>臻：真臻文殷魂痕<br/>山：元寒刪山先仙<br/>效：蕭宵肴豪<br/>果：歌<br/>假：麻<br/>宕：陽唐<br/>梗：庚耕清青<br/>曾：蒸登<br/>流：尤侯幽<br/>深：侵<br/>咸：覃談鹽添咸銜嚴凡<br/>（冒號前為攝，後為對應的韻） |
 * | 聲 | 聲調 | tone | 平上去入 |
 *
 * 音韻地位六要素：母、呼、等、重紐、韻、聲。
 *
 * 「呼」和「重紐」可為 `null`（分別表示「開合中立」與「不分重紐」），其餘四個屬性不可為 `null`。
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
 *
 * ## 聲韻搭配規則
 *
 * （提及「例外」的，詳見本節末尾）
 *
 * 等：
 * - 見組、影曉來母：不限（但羣母非三等屬例外）
 * - 章組、云以日母：限三等
 * - 匣母：限一二四等
 * - 精組：限一三四等（邪母非三等屬例外）
 * - 知莊組：限二三等（俟母非三等屬例外）
 * - 端組：限一四等（有例外）
 *
 * 呼：
 * - 聲母為脣音，或韻為「東冬鍾江模尤侯」（開合中立的韻）之一：限 `null`（開合中立）
 * - 云母：除效流深咸四攝外，限非開口（有例外）
 * - 其餘情形：呼必須取「開」或「合」，注意魚虞韻亦為開合相配
 *
 * 重紐：
 * - 僅前元音三等鈍音（幫見影組）適用重紐；一二四等或銳音的情況，重紐須為 `null`（不分重紐）
 * - 「支脂祭真仙宵庚清幽侵鹽」十一韻：重紐須取 `A` 或 `B`
 * - 蒸韻：重紐一般取 `null` （但有取 `B` 之例外）
 * - 麻韻：無鈍音（但有例外，此時重紐須取 `A` 或 `B`）
 * - 陽韻：限 `null`（但有個別取 `A` 之例外）
 *
 * 韻：
 * - 凡韻：限脣音
 * - 嚴韻：限非脣音
 * - 臻韻：限莊組
 * - 真殷韻：限非莊組
 *
 * 關於邊緣地位及例外：
 *
 * 「邊緣地位」指不符合上述搭配的地位。
 * 除內建的例外地位白名單（包含基礎資料中出現的邊緣地位）外，邊緣地位一般不能任意構造。
 *
 * 若確需構造邊緣地位，須在構造時傳入參數以取得許可，參數指定方式詳見[[`邊緣地位例外選項`]]。
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
   * 初始化音韻地位物件。（各項參數詳見 [`音韻地位`] 說明）
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 重紐 重紐：`null`, A, B
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @param 邊緣地位例外 若創建邊緣地位（列於內建白名單的除外），須於該參數指明其種類
   * @returns 所描述的音韻地位
   * @example
   * ```typescript
   * > new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * 音韻地位 { '幫三凡入' }
   * > new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * 音韻地位 { '羣開三A支平' }
   * ```
   */
  constructor(
    母: string,
    呼: string | null = null,
    等: string,
    重紐: string | null = null,
    韻: string,
    聲: string,
    邊緣地位例外: 邊緣地位例外選項 = {}
  ) {
    音韻地位.驗證(母, 呼, 等, 重紐, 韻, 聲, 邊緣地位例外);
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
   * 最簡描述（[[`.from描述`]] 所允許的無歧義解析所需的最少項目）
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
    if (![...各等韻.一三, ...各等韻.二三].includes(韻)) 等 = '';
    if (['清', '庚'].includes(韻) || (母 === '云' && 前元音三等韻.includes(韻))) 重紐 = null;
    return 母 + (呼 || '') + 等 + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於 [[`.屬於`]] 函數中以惟一確定該地位
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.表達式;
   * '(幫母 開合中立 三等 不分重紐 凡韻 入聲)'
   * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
   * > 音韻地位.表達式;
   * '(羣母 開口 三等 重紐A類 支韻 平聲)'
   * ```
   */
  get 表達式(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口` : '開合中立';
    const 重紐字段 = 重紐 ? `重紐${重紐}類` : '不分重紐';
    return `(${母}母 ${呼字段} ${等}等 ${重紐字段} ${韻}韻 ${聲}聲)`;
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
    const 呼編碼 = 所有.呼.indexOf(呼!) + 1;
    const 重紐編碼 = 所有.重紐.indexOf(重紐!) + 1;
    const 其他編碼 = (呼編碼 << 4) | (重紐編碼 << 2) | 所有.聲.indexOf(聲);
    return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼];
  }

  /**
   * 調整該音韻地位的屬性，會驗證調整後地位的合法性，返回新的對象。
   *
   * **注意**：原對象不會被修改。
   *
   * @param 調整屬性 對象，其屬性可為六項基本屬性中的若干項，各屬性的值為欲修改成的值。
   *
   * 不含某屬性或某屬性值為 `undefined` 則表示不修改該屬性。
   *
   * @returns 新的 `音韻地位`，其中會含有指定的修改值。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三元上');
   * > 音韻地位.調整({ 聲: '平' }).描述
   * '幫三元平'
   * > 音韻地位.調整({ 母: '見', 呼: '合' }).描述
   * '見合三元上'
   * ```
   */
  調整(調整屬性: 部分音韻屬性): 音韻地位 {
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
   * 各表達式及運算子之間以空格隔開。
   *
   * AND 運算子可省略。
   *
   * 如 `(端精組 且 入聲) 或 (以母 且 四等 且 去聲)` 與 `端精組 入聲 或 以母 四等 去聲` 同義。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @throws 若表達式為空、不合語法、或限定條件不合法，則拋出異常。
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
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
   * * 函數：會被執行；若其傳回值為字串，會遞迴套用至 [[`音韻地位.屬於`]] 函數，否則會檢測其真值
   * * 字串：會遞迴套用至 [[`音韻地位.屬於`]] 函數
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
  屬於(表達式: readonly string[], ...參數: unknown[]): boolean;

  屬於(表達式: string | readonly string[], ...參數: unknown[]): boolean {
    if (typeof 表達式 === 'string') 表達式 = [表達式];

    /** 普通字串 token 求值 */
    const { 母, 呼, 重紐, 韻, 聲, 清濁, 韻別 } = this;
    const evalToken = (token: string): boolean => {
      let match: RegExpExecArray | null = null;
      if ((match = /^(陰|陽|入)聲韻$/.exec(token))) return 韻別 === match[1];
      if (/^次入韻$/.exec(token)) return 次入韻.includes(韻) && 聲 === '去';
      if (/^仄聲$/.exec(token)) return 聲 !== '平';
      if (/^舒聲$/.exec(token)) return 聲 !== '入';
      if ((match = /^(開|合)口$/.exec(token))) return 呼 === match[1];
      if (/^開合中立$/.exec(token)) return 呼 === null;
      if ((match = /^重紐(A|B)類$/.exec(token))) return 重紐 === match[1];
      if (/^不分重紐$/.exec(token)) return 重紐 === null;
      if ((match = /^(清|濁)音$/.exec(token))) return 清濁[1] === match[1];
      if ((match = /^[全次][清濁]$/.exec(token))) return 清濁 === match[0];
      if (/^鈍音$/.exec(token)) return 鈍音母.includes(母);
      if (/^銳音$/.exec(token)) return !鈍音母.includes(母);
      if ((match = /^(.+?)([母等韻音攝組聲])$/.exec(token))) {
        const values = [...match[1]];
        const check = 檢查[match[2] as keyof typeof 檢查];
        const invalid = values.filter(i => !check.includes(i)).join('');
        assert(!invalid, invalid + match[2] + '不存在');
        return values.includes(this[match[2] as keyof typeof 檢查]!);
      }
      throw new Error(`unreconized test condition: ${token}`);
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

    function parseOrExpr(required: true): SExpr;
    function parseOrExpr(required: boolean): SExpr | null;
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

    function parseAndExpr(required: true): SExpr;
    function parseAndExpr(required: boolean): SExpr | null;
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

    function parseNotExpr(required: true): SExpr;
    function parseNotExpr(required: boolean): SExpr | null;
    function parseNotExpr(required: boolean) {
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
   * 判斷某個小韻是否符合給定的某個條件，傳回自訂值。
   * @param 規則 `[判斷式, 結果][]` 形式的陣列。
   *
   * 判斷式可以是：
   *
   * * &#x3000;&#x3000;函數：會被執行；若其傳回值為非空字串，會套用至 [[`音韻地位.屬於`]] 函數，若為布林值則直接決定是否跳過本規則，否則規則永遠不會被跳過
   * * 非空字串：描述音韻地位的表達式，會套用至 [[`音韻地位.屬於`]] 函數
   * * &#x3000;布林值：直接決定是否跳過本規則
   * * &#x3000;&#x3000;其他：規則永遠不會被跳過（可用作指定後備結果）
   *
   * 建議使用空字串、`null` 或 `true` 作末項判斷式以指定後備結果。
   *
   * 結果可以是任意傳回值或遞迴規則。
   * @param throws 指定若所有判斷條件均未滿足時是否拋出錯誤
   * - `true` 或字串: 拋出錯誤，用字串可自訂錯誤信息
   * - `false` 或不指定該參數：不拋錯誤，返回 `null`
   * @param fallback 若為 `true`，在遞迴子陣列未涵蓋所有條件時會繼續嘗試母陣列的條件。
   * @returns 自訂值，在未涵蓋所有條件且不使用 `error` 時會回傳 `null`。
   * @throws `未涵蓋所有條件`（或 `error` 參數）、`規則需符合格式`，或者套用 [[`.屬於`]] 時可能拋出的錯誤
   * @example
   * ```typescript
   * > 音韻地位 = Qieyun.音韻地位.from描述('幫三凡入');
   * > 音韻地位.判斷([
   * >   ['遇果假攝 或 支脂之佳尤韻', ''],
   * >   ['蟹攝 或 微韻', 'j'],
   * >   ['效流攝', 'w'],
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
  判斷<T>(規則: 判斷規則列表<T>, throws: string | true, fallback?: boolean): T;
  判斷<T>(規則: 判斷規則列表<T>, throws?: string | boolean, fallback?: boolean): T | null;
  判斷<T>(規則: 判斷規則列表<T>, throws?: string | boolean, fallback = false): T | null {
    const Exhaustion = Symbol('Exhaustion');
    const loop = (所有規則: 判斷規則列表<T>): T | typeof Exhaustion => {
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
      if (typeof throws === 'string') throw new Error(throws);
      else if (throws) throw new Error('未涵蓋所有條件');
      else return null;
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
      else if ([...各等韻.二].includes(韻)) 等 = '二';
      else if ([...各等韻.三].includes(韻)) 等 = '三';
      else if ([...各等韻.四].includes(韻)) 等 = '四';
    }

    return new 音韻地位(母, 呼, 等!, 重紐, 韻, 聲, _Unchecked);
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
  static from描述(音韻描述: string, 邊緣地位指定: 邊緣地位例外選項 = {}): 音韻地位 {
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

    if (重紐 === null && 等 === '三' && 前元音三等韻.includes(韻) && 鈍音母.includes(母)) {
      if (韻 === '清') 重紐 = 'A';
      else if (韻 === '庚' || 母 === '云') 重紐 = 'B';
    }

    return new 音韻地位(母, 呼, 等!, 重紐, 韻, 聲, 邊緣地位指定);
  }

  /**
   * 驗證音韻地位六要素及其搭配是否合法。
   *
   * 合法搭配詳見 [[`音韻地位`]] 說明。`邊緣地位例外` 參數詳見 [[`邊緣地位例外選項`]] 說明。
   *
   * @throws 若地位不合法，會拋出異常。
   */
  static 驗證(母: string, 呼: string | null, 等: string, 重紐: string | null, 韻: string, 聲: string, 邊緣地位例外: 邊緣地位例外選項) {
    const tipIncompatible = " (note: use nk2028's data to avoid compatibility issues)";
    const reject = (msg: string) => {
      throw new Error(`invalid 音韻地位 <${母},${呼 || ''},${等},${重紐 || ''},${韻},${聲}>: ` + msg);
    };

    // 基本取值
    for (const [屬性, 值, nullable] of [
      ['母', 母],
      ['呼', 呼, true],
      ['等', 等],
      ['重紐', 重紐, true],
      ['韻', 韻],
      ['聲', 聲],
    ] as const) {
      if (!((nullable && 值 === null) || 所有[屬性].includes(值!))) {
        if (屬性 === '韻' && [...'諄桓戈'].includes(值)) {
          reject(`unexpected ${值}韻${tipIncompatible}`);
        }
        const suggestion = (
          {
            母: { 娘: '孃', 群: '羣' },
            韻: { 眞: '真', 欣: '殷' },
          } as Record<string, Record<string, string>>
        )[屬性]?.[值!];
        reject(`unrecognized ${屬性}: ${值}` + (suggestion ? ` (did you mean: ${suggestion}?)` : ''));
      }
    }

    // 等搭配
    // 韻
    for (const [韻等, 韻s] of Object.entries(各等韻)) {
      if (韻s.includes(韻)) {
        if (韻等.includes(等)) {
          break;
        } else {
          const tip = 等 === '三' && ['齊', '灰', '咍'].includes(韻) ? tipIncompatible : '';
          reject(`unexpected ${韻}韻${等}等${tip}`);
        }
      }
    }
    // 重紐
    if (重紐 && 等 !== '三') {
      reject(`unexpected ${等}等重紐`);
    }
    // 母
    if ([...'章昌常書船云以日'].includes(母) && 等 !== '三') {
      const tip = ['齊', '灰', '咍'].includes(韻) ? tipIncompatible : '';
      reject(`unexpected ${母}母${等}等${tip}`);
    }
    for (const [母s, 等s] of [
      ['知徹澄孃莊初崇生俟', '二三'],
      ['精清從心邪', '一三四'],
      ['匣', '一二四'],
    ] as const) {
      if ([...母s].includes(母)) {
        if ([...等s].includes(等)) {
          break;
        } else {
          reject(`unexpected ${母}母${等}等`);
        }
      }
    }

    // 聲搭配
    // 陰聲韻
    if (聲 === '入' && 陰聲韻.includes(韻)) {
      reject(`unexpected ${韻}韻入聲`);
    }

    // 呼搭配
    if (['幫', '滂', '並', '明'].includes(母)) {
      呼 && reject(`unexpected 呼 for 脣音`);
    } else if (呼韻搭配.中立.includes(韻)) {
      呼 && reject(`unexpected 呼 for 開合中立韻`);
    } else if (呼韻搭配.開合.includes(韻)) {
      呼 || reject(`missing 呼`);
    } else {
      for (const 韻呼 of ['開', '合'] as const) {
        if (呼韻搭配[韻呼].includes(韻)) {
          if (呼 === 韻呼) {
            break;
          } else if (呼) {
            reject(`unexpected ${韻}韻${呼}口`);
          } else {
            reject(`missing 呼 (should be ${韻呼})`);
          }
        }
      }
    }

    // 重紐搭配
    if (等 === '三') {
      if (鈍音母.includes(母)) {
        if (['庚', '清'].includes(韻)) {
          const expected = 韻 === '庚' ? 'B' : 'A';
          重紐 || reject(`missing 重紐 (should be ${expected})`);
          const tip = 韻 === '清' && 重紐 === 'B' ? tipIncompatible : '';
          重紐 !== expected && reject(`unexpected ${韻}韻${重紐}類${tip}`);
        } else if (前元音三等韻.includes(韻)) {
          重紐 || reject(`missing 重紐`);
        } else if (['蒸', '陽'].includes(韻)) {
          重紐 && 重紐 !== (韻 === '陽' ? 'A' : 'B') && reject(`unexpected ${韻}韻${重紐}類`);
        } else {
          重紐 && reject(`unexpected 重紐 for ${韻}韻`);
        }
        母 === '云' && 重紐 === 'A' && reject('unexpected 云母A類');
      } else {
        重紐 && reject(`unexpected 重紐 for ${母}母`);
      }
    }

    // 母韻搭配
    // 臻韻
    if (['莊', '初', '崇', '生', '俟'].includes(母)) {
      呼 === '開' && ['真', '殷'].includes(韻) && reject(`unexpected 莊組${韻}韻${tipIncompatible}`);
    } else {
      韻 === '臻' && reject(`unexpected ${母}母臻韻`);
    }
    if (['幫', '滂', '並', '明'].includes(母)) {
      ['之', '魚', '殷', '痕', '嚴'].includes(韻) && reject(`unexpected 脣音${韻}韻`);
    } else {
      韻 === '凡' && reject(`unexpected ${母}母凡韻${tipIncompatible}`);
    }

    // 邊緣搭配

    // 已知邊緣地位（或特別指定跳過檢查），跳過搭配驗證
    if (邊緣地位例外 === _Unchecked || 已知例外地位.has(母 + (呼 ?? '') + 等 + (重紐 ?? '') + 韻 + 聲)) {
      return;
    }

    // 嚴格邊緣地位
    for (const [kind, condition, errorDescription] of [
      ['端組二三等', ['端', '透', '定', '泥'].includes(母) && ['二', '三'].includes(等), `${母}母${等}等`],
      ['麻三鈍音', 韻 === '麻' && 等 === '三' && 鈍音母.includes(母), `麻韻三等${母}母`],
      ['陽韻A類', 韻 === '陽' && 重紐 === 'A', `陽韻A類`],
      ['咍韻脣音', 韻 === '咍' && ['幫', '滂', '並', '明'].includes(母), '咍韻脣音'],
    ] as const) {
      if (condition !== !!邊緣地位例外[kind]) {
        reject(
          邊緣地位例外[kind]
            ? `expected marginal 音韻地位: ${kind} (note: set 邊緣地位指定.${kind} only when it really is)`
            : 'unexpected ' + errorDescription
        );
      }
    }

    // 非嚴格邊緣地位
    for (const [kind, condition, errorDescription] of [
      ['云母開口', 母 === '云' && 呼 === '開' && !['宵', '幽', '侵', '鹽', '嚴'].includes(韻), '云母開口'],
      ['蒸韻B類', 韻 === '蒸' && 重紐 === 'B', '蒸韻B類'],
      ['羣邪俟母非三等', 等 !== '三' && ['羣', '邪', '俟'].includes(母), `${母}母$${等}等`],
    ] as const) {
      if (!邊緣地位例外[kind] && condition) {
        reject(`unexpected ${errorDescription} (note: set 邊緣地位指定.${kind} to allow)`);
      }
    }
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

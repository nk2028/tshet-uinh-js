import { 母到清濁, 母到音, 組到母, 韻到攝 } from './拓展音韻屬性';
import 特殊反切 from './特殊反切';
import { m字頭2音韻編碼解釋, m音韻編碼2反切, m音韻編碼2字頭解釋 } from './解析資料';

// For encoder

const 編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
const 所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以';
const 所有呼 = '開合';
const 所有等 = '一二三四';
const 所有重紐 = 'AB';
const 所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡';
const 所有聲 = '平上去入';
const 重紐母 = '幫滂並明見溪羣疑影曉';
const 重紐韻 = '支脂祭眞仙宵清侵鹽';

function assert(b: boolean, s: string) {
  if (!b) {
    throw new Error(s);
  }
}

/**
 * 由字頭查出相應的音韻地位和解釋。
 * @param 字頭 待查找的漢字
 * @returns 陣列。陣列的每一項包含音韻地位和解釋。
 *
 * 若字頭不存在，則回傳空陣列。
 * @example
 * ```typescript
 * > Qieyun.query字頭('結');
 * [ { 音韻地位: 音韻地位 { '見開四先入' }, 解釋: '締也古屑切十五' } ]
 * > Qieyun.query字頭('冷');
 * [
 *   { 音韻地位: 音韻地位 { '來開四青平' }, 解釋: '冷凙吳人云冰凌又力頂切' },
 *   { 音韻地位: 音韻地位 { '來開二庚上' }, 解釋: '寒也魯打切又魯頂切一' },
 *   { 音韻地位: 音韻地位 { '來開四青上' }, 解釋: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切' },
 * ]
 * ```
 */
export function query字頭(字頭: string): Array<{音韻地位: 音韻地位, 解釋: string}> {
  const res = m字頭2音韻編碼解釋.get(字頭);
  return res == null ? [] : res.map(({ 音韻編碼, 解釋 }) => {
    return { 音韻地位: 音韻地位.from編碼(音韻編碼), 解釋 };
  });
}

/**
 * 所有至少對應一個字頭的音韻地位。
 * @returns 生成器，所有至少對應一個字頭的音韻地位。
 */
export function* iter音韻地位(): IterableIterator<音韻地位> {
  for (const 音韻編碼 of m音韻編碼2字頭解釋.keys()) {
    yield 音韻地位.from編碼(音韻編碼);
  }
}

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
 * | 韻<br/>攝 | 韻母<br/>攝 | rhyme<br/>class | 通：東冬鍾<br/>江：江<br/>止：支脂之微<br/>遇：魚虞模<br/>蟹：齊祭泰佳皆夬灰咍廢<br/>臻：眞臻文欣元魂痕<br/>山：寒刪山先仙<br/>效：蕭宵肴豪<br/>果：歌<br/>假：麻<br/>宕：陽唐<br/>梗：庚耕清青<br/>曾：蒸登<br/>流：尤侯幽<br/>深：侵<br/>咸：覃談鹽添咸銜嚴凡<br/>（冒號前為攝，後為對應的韻） |
 * | 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |
 *
 * 音韻地位六要素：母、呼、等、重紐、韻、聲。
 *
 * **注意**：元韻置於臻攝而非山攝。
 *
 * 不設諄、桓、戈韻。分別併入眞、寒、歌韻。
 *
 * 不支援異體字，請手動轉換：
 *
 * * 母 娘 -> 孃
 * * 母 荘 -> 莊
 * * 母 谿 -> 溪
 * * 母 群 -> 羣
 * * 韻 餚 -> 肴
 * * 韻 真 -> 眞
 */
export class 音韻地位 {
  /**
   * 聲母
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.母;
   * '幫'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.母;
   * '羣'
   * ```
   */
  母: string;

  /**
   * 呼
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.呼;
   * null
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.呼;
   * '開'
   * ```
   */
  呼: string;

  /**
   * 等
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.等;
   * '三'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.等;
   * '三'
   * ```
   */
  等: string;

  /**
   * 重紐
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.重紐;
   * null
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.重紐;
   * 'A'
   * ```
   */
  重紐: string;

  /**
   * 韻母（舉平以賅上去入）
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.韻;
   * '凡'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.韻;
   * '支'
   * ```
   */
  韻: string;

  /**
   * 聲調
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.聲;
   * '入'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.聲;
   * '平'
   * ```
   */
  聲: string;

  /**
   * 初始化音韻地位物件。
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 重紐 重紐：`null`, A, B
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @returns 字串所描述的音韻地位。
   * @example
   * ```typescript
   * > new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * 音韻地位 { '幫三凡入' }
   * > new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * 音韻地位 { '羣開三A支平' }
   * ```
   */
  constructor(母: string, 呼: string, 等: string, 重紐: string, 韻: string, 聲: string) {
    音韻地位.驗證(母, 呼, 等, 重紐, 韻, 聲);
    this.母 = 母;
    this.呼 = 呼;
    this.等 = 等;
    this.重紐 = 重紐;
    this.韻 = 韻;
    this.聲 = 聲;
  }

  /**
   * 清濁（全清、次清、全濁、次濁）
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.清濁;
   * '全清'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
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
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.音;
   * '脣'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
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
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.攝;
   * '咸'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.攝;
   * '止'
   * ```
   */
  get 攝(): string {
    const { 韻 } = this;
    return 韻到攝[韻];
  }

  /**
   * 描述
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.描述;
   * '幫三凡入'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.描述;
   * '羣開三A支平'
   * ```
   */
  get 描述(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return 母 + (呼 || '') + 等 + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於 `屬於` 函數
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.表達式;
   * '幫母 三等 凡韻 入聲'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.描述;
   * '羣母 開口 三等 重紐A類 支韻 平聲'
   * ```
   */
  get 表達式(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口 ` : '';
    const 重紐字段 = 重紐 ? `重紐${重紐}類 ` : '';
    return `${母}母 ${呼字段}${等}等 ${重紐字段}${韻}韻 ${聲}聲`;
  }

  /**
   * 音韻地位對應的編碼。音韻編碼與音韻地位之間存在一一映射關係。
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.編碼;
   * 'A5T'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.編碼;
   * 'fEQ'
   * ```
   */
  get 編碼(): string {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return 音韻地位.to編碼(母, 呼, 等, 重紐, 韻, 聲);
  }

  /**
   * 音韻地位的代表字。
   *
   * 若音韻地位有音無字，則代表字為 `null`。
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.代表字;
   * '法'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.代表字;
   * '祇'
   * ```
   */
  get 代表字(): string {
    const { 編碼 } = this;
    const res = m音韻編碼2字頭解釋.get(編碼);
    return res == null ? null : res[0].字頭; // 取音韻編碼對應的第一個字作為代表字
  }

  /**
   * 音韻地位對應的字頭和解釋。
   *
   * 若音韻地位有音無字，則值為空陣列。
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('影', '開', '二', null, '銜', '去');
   * > 音韻地位.條目;
   * [ { 字頭: '𪒠', 解釋: '叫呼仿佛𪒠然自得音黯去聲一' } ]
   * ```
   */
  get 條目(): Array<{字頭: string, 解釋: string}> {
    const { 編碼 } = this;
    const res = m音韻編碼2字頭解釋.get(編碼);
    return res == null ? [] : res;
  }

  /**
   * 取得音韻地位對應的反切。
   *
   * 注意在《廣韻》中存在重出的小韻，因此在查詢反切時需要附加字頭訊息。
   * @paras 字頭 屬於音韻地位的一個字頭
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('端', '開', '一', null, '東', '平');
   * > 音韻地位.反切('東');
   * '德紅'
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.反切('法');
   * '方乏'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.反切('祇');
   * '巨支'
   * > 音韻地位.反切(); // 若不提供字頭，則使用該音韻地位的預設反切
   * '巨支'
   * > Qieyun.query字頭('拯')[0].音韻地位.反切(); // 拯小韻無反切
   * null
   * > 音韻地位 = new Qieyun.音韻地位('知', '開', '二', null, '庚', '上');
   * > 音韻地位.反切(); // 該音韻地位的預設反切為「張梗」
   * '張梗'
   * > 音韻地位.反切('打'); // 該音韻地位「打」字的反切為「德冷」
   * '德冷'
   * ```
   */
  反切(字頭: string): string {
    const { 編碼 } = this;

    // 處理特殊反切
    let res = 特殊反切[`${編碼}${字頭}`];
    if (res != null) {
      return res;
    }

    res = m音韻編碼2反切.get(編碼);
    return res == null ? null : res;
  }

  /**
   * 判斷某個小韻是否屬於給定的音韻地位。
   * @param s 描述音韻地位的字串
   *
   * 字串中音韻地位的描述格式：
   *
   * * 音韻地位六要素：`...母`, `...等`, `...韻`, `...聲`, `開口`, `合口`, `重紐A類`, `重紐B類`
   * * 拓展音韻地位：`...組`, `...音`, `...攝`, `全清`, `次清`, `全濁`, `次濁`
   *
   * 字串首先以「或」字分隔，再以空格分隔。不支援括號。
   *
   * 如「(端精組 且 入聲) 或 (以母 且 四等 且 去聲)」可以表示為 `端精組 入聲 或 以母 四等 去聲`。
   *
   * 特別需要注意「呼」為 `null` 的情況。對於此函式，若「呼」為 `null` 時，「微虞灰廢文元魂寒歌陽凡」
   * 十一韻視為合口，否則視為開口。
   * @returns 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @example
   * ```typescript
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.屬於('章母');
   * false
   * > 音韻地位.屬於('一四等');
   * false
   * > 音韻地位.屬於('幫組 或 陽韻');
   * true
   * ```
   */
  屬於(s: string): boolean {
    const { 母, 呼, 等, 重紐, 韻, 聲, 清濁, 音, 攝 } = this;

    const 脣音合口韻 = '微虞灰廢文元魂寒歌陽凡';
    const is開口 = 呼 == null ? ![...脣音合口韻].includes(韻) : 呼 === '開';

    function equal組(i: string) {
      const vs = 組到母[i];
      if (vs == null) return false; // No such 組
      return vs.some((v: string) => 母 === v);
    }

    function equal聲(i: string) {
      if (['平', '上', '去', '入'].includes(i)) return i === 聲;
      if (i === '仄') return 聲 !== '平';
      if (i === '舒') return 聲 !== '入';
      return false; // No such 聲
    }

    return s.split(' 或 ').some((xs: string) => xs.split(' ').every((ys: string) => {
      if (ys.endsWith('母')) return [...ys].slice(0, -1).includes(母);
      if (ys.endsWith('等')) return [...ys].slice(0, -1).includes(等);
      if (ys.endsWith('韻')) return [...ys].slice(0, -1).includes(韻);
      if (ys.endsWith('聲')) return [...ys].slice(0, -1).some((i) => equal聲(i));

      if (ys.endsWith('組')) return [...ys].slice(0, -1).some((i) => equal組(i));
      if (ys.endsWith('音')) return [...ys].slice(0, -1).includes(音);
      if (ys.endsWith('攝')) return [...ys].slice(0, -1).includes(攝);

      if (ys === '開口') return is開口;
      if (ys === '合口') return !is開口;
      if (ys === '重紐A類') return 重紐 === 'A';
      if (ys === '重紐B類') return 重紐 === 'B';
      if (ys === '全清') return 清濁 === '全清';
      if (ys === '次清') return 清濁 === '次清';
      if (ys === '全濁') return 清濁 === '全濁';
      if (ys === '次濁') return 清濁 === '次濁';

      throw new Error(`No such 運算符: ${ys}`);
    }));
  }

  /**
   * 判斷當前音韻地位是否等於另一音韻地位。
   * @param other 另一音韻地位。
   * @returns 若相等，則回傳 `true`；否則回傳 `false`。
   * @example
   * ```typescript
   * > a = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > b = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
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
   * 驗證給定的音韻地位六要素是否合法。
   *
   * 母必須為「幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日
   * 見溪羣疑影曉匣云以」三十八聲類之一。
   *
   * 韻必須為「東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕
   * 寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡」五十八韻之一。
   *
   * 注意：不設諄、桓、戈韻。分別併入眞、寒、歌韻。
   *
   * 當聲母為脣音，或韻母為模韻時，呼必須為 `null`。在其他情況下，呼必須取「開」或「合」。
   *
   * 當聲母為脣牙喉音，且韻母為「支脂祭眞仙宵清侵鹽」九韻之一時，重紐必須取 `A` 或 `B`。
   * 在其他情況下，重紐必須取 `null`。
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 重紐 重紐：`null`, A, B
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @throws {Error} 若給定的音韻地位六要素不合法，則拋出異常。
   */
  static 驗證(母: string, 呼: string, 等: string, 重紐: string, 韻: string, 聲: string): void {
    assert(母.length === 1 && [...所有母].includes(母), `Unexpected 母: ${JSON.stringify(母)}`);
    assert(等.length === 1 && [...所有等].includes(等), `Unexpected 等: ${JSON.stringify(等)}`);
    assert(韻.length === 1 && [...所有韻].includes(韻), `Unexpected 韻: ${JSON.stringify(韻)}`);
    assert(聲.length === 1 && [...所有聲].includes(聲), `Unexpected 聲: ${JSON.stringify(聲)}`);

    if ([...'幫滂並明'].includes(母) || 韻 === '模') {
      assert(呼 == null, '呼 should be null');
    } else {
      assert(呼.length === 1 && [...所有呼].includes(呼), `Unexpected 呼: ${JSON.stringify(呼)}`);
    }

    if ([...重紐母].includes(母) && [...重紐韻].includes(韻)) {
      assert(重紐.length === 1 && [...所有重紐].includes(重紐), `Unexpected 重紐: ${JSON.stringify(重紐)}`);
    } else {
      assert(重紐 == null, '重紐 should be null');
    }
  }

  /**
   * 將音韻地位六要素轉換為音韻編碼。
   *
   * 此函式會首先驗證給定的音韻地位六要素是否合法，故無需重複呼叫 `驗證` 函式。
   * @param 母 聲母：幫, 滂, 並, 明, …
   * @param 呼 呼：`null`, 開, 合
   * @param 等 等：一, 二, 三, 四
   * @param 重紐 重紐：`null`, A, B
   * @param 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
   * @param 聲 聲調：平, 上, 去, 入
   * @returns 給定的音韻地位對應的編碼。
   * @throws {Error} 若給定的音韻地位六要素不合法，則拋出異常。
   * @example
   * ```typescript
   * > Qieyun.音韻地位.to編碼('幫', null, '三', null, '凡', '入');
   * 'A5T'
   * > Qieyun.音韻地位.to編碼('羣', '開', '三', 'A', '支', '平');
   * 'fEQ'
   * ```
   */
  static to編碼(母: string, 呼: string, 等: string, 重紐: string, 韻: string, 聲: string): string {
    音韻地位.驗證(母, 呼, 等, 重紐, 韻, 聲);
    const 母編碼 = 所有母.indexOf(母);
    const 韻編碼 = 所有韻.indexOf(韻);
    const 其他編碼 = (+(呼 === '合') << 5) + (所有等.indexOf(等) << 3) + (+(重紐 === 'B') << 2) + (所有聲.indexOf(聲));
    return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼];
  }

  /**
   * 將音韻編碼轉換為音韻地位六要素。
   * @param 音韻編碼 表示音韻地位的編碼
   * @returns 給定的音韻編碼對應的音韻地位。
   * @example
   * ```typescript
   * > Qieyun.音韻地位.from編碼('A5T');
   * 音韻地位 { '幫三凡入' }
   * > Qieyun.音韻地位.from編碼('fEQ');
   * 音韻地位 { '羣開三A支平' }
   * ```
   */
  static from編碼(音韻編碼: string): 音韻地位 {
    const 母編碼 = 編碼表.indexOf(音韻編碼[0]);
    const 韻編碼 = 編碼表.indexOf(音韻編碼[1]);
    const 其他編碼 = 編碼表.indexOf(音韻編碼[2]);

    const 呼編碼 = 其他編碼 >> 5;
    const 等編碼 = (其他編碼 >> 3) & 0b11;
    const 重紐編碼 = (其他編碼 >> 2) & 0b1;
    const 聲編碼 = 其他編碼 & 0b11;

    const 母 = 所有母[母編碼];
    const 韻 = 所有韻[韻編碼];
    const 等 = 所有等[等編碼];
    const 聲 = 所有聲[聲編碼];

    let 呼 = 所有呼[呼編碼];
    let 重紐 = 所有重紐[重紐編碼];

    if ([...'幫滂並明'].includes(母) || 韻 === '模') {
      呼 = null;
    }

    if (![...重紐母].includes(母) || ![...重紐韻].includes(韻)) {
      重紐 = null;
    }

    return new 音韻地位(母, 呼, 等, 重紐, 韻, 聲);
  }
}

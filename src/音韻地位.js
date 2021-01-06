import { encode, decode } from './音韻編碼';
import { m字頭2音韻編碼解釋, m音韻編碼2字頭解釋, m音韻編碼2反切 } from './資料';
import { 母到清濁, 母到音, 韻到攝, 組到母 } from './拓展音韻屬性';

/**
 * 由字頭查出相應的音韻地位和解釋。
 * @param {string} 字頭 待查找的漢字
 * @returns {Array<{音韻地位: 音韻地位, 解釋: string}>} 陣列。陣列的每一項包含音韻地位和解釋。
 *
 * 若字頭不存在，則回傳空陣列。
 * @example
 * > Qieyun.query字頭('結');
 * [ { 音韻地位: 音韻地位 { '見開四先入' }, 解釋: '締也古屑切十五' } ]
 * > Qieyun.query字頭('冷');
 * [
 *   { 音韻地位: 音韻地位 { '來開四青平' }, 解釋: '冷凙吳人云冰凌又力頂切' },
 *   { 音韻地位: 音韻地位 { '來開二庚上' }, 解釋: '寒也魯打切又魯頂切一' },
 *   { 音韻地位: 音韻地位 { '來開四青上' }, 解釋: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切' },
 * ]
 */
export function query字頭(字頭) {
  const res = m字頭2音韻編碼解釋.get(字頭);
  return res == null ? [] : res.map(({ 音韻編碼, 解釋 }) => {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = decode(音韻編碼);
    return { 音韻地位: new 音韻地位(母, 呼, 等, 重紐, 韻, 聲), 解釋 };
  });
}

/**
 * 所有至少對應一個字頭的音韻地位。
 * @returns {IterableIterator<音韻地位>} 生成器，所有至少對應一個字頭的音韻地位。
 */
export function* iter音韻地位() {
  for (const 音韻編碼 of m音韻編碼2字頭解釋.keys()) {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = decode(音韻編碼);
    yield new 音韻地位(母, 呼, 等, 重紐, 韻, 聲);
  }
}

/**
 * 《切韻》音系音韻地位。
 *
 * 可使用字串 \(母, 呼, 等, 重紐, 韻, 聲\) 初始化。
 * @param {string} 母 聲母：幫, 滂, 並, 明, …
 * @param {string} 呼 呼：`null`, 開, 合
 * @param {string} 等 等：一, 二, 三, 四
 * @param {string} 重紐 重紐：`null`, A, B
 * @param {string} 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
 * @param {string} 聲 聲調：平, 上, 去, 入
 * @returns {音韻地位} 字串所描述的音韻地位。
 * @example
 * > new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
 * 音韻地位 { '幫三凡入' }
 * > new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
 * 音韻地位 { '羣開三A支平' }
 */
export class 音韻地位 {
  constructor(母, 呼, 等, 重紐, 韻, 聲) {
    /**
     * 聲母
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.母;
     * '幫'
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.母;
     * '羣'
     */
    this.母 = 母;

    /**
     * 呼
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.呼;
     * null
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.呼;
     * '開'
     */
    this.呼 = 呼;

    /**
     * 等
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.等;
     * '三'
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.等;
     * '三'
     */
    this.等 = 等;

    /**
     * 重紐
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.重紐;
     * null
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.重紐;
     * 'A'
     */
    this.重紐 = 重紐;

    /**
     * 韻母（舉平以賅上去入）
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.韻;
     * '凡'
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.韻;
     * '支'
     */
    this.韻 = 韻;

    /**
     * 聲調
     * @member {string}
     * @example
     * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
     * > 音韻地位.聲;
     * '入'
     * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
     * > 音韻地位.聲;
     * '平'
     */
    this.聲 = 聲;
  }

  /**
   * 清濁（全清、次清、全濁、次濁）
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.清濁;
   * '全清'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.清濁;
   * '全濁'
   */
  get 清濁() {
    const { 母 } = this;
    return 母到清濁[母];
  }

  /**
   * 音（發音部位：脣、舌、齒、牙、喉）
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.音;
   * '脣'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.音;
   * '牙'
   */
  get 音() {
    const { 母 } = this;
    return 母到音[母];
  }

  /**
   * 攝
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.攝;
   * '咸'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.攝;
   * '止'
   */
  get 攝() {
    const { 韻 } = this;
    return 韻到攝[韻];
  }

  /**
   * 描述
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.描述;
   * '幫三凡入'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.描述;
   * '羣開三A支平'
   */
  get 描述() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return 母 + (呼 || '') + 等 + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於 `屬於` 函數
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.表達式;
   * '幫母 三等 凡韻 入聲'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.描述;
   * '羣母 開口 三等 重紐A類 支韻 平聲'
   */
  get 表達式() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口 ` : '';
    const 重紐字段 = 重紐 ? `重紐${重紐}類 ` : '';
    return `${母}母 ${呼字段}${等}等 ${重紐字段}${韻}韻 ${聲}聲`;
  }

  /**
   * 音韻地位對應的編碼。音韻編碼與音韻地位之間存在一一映射關係。
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.編碼;
   * 'A5T'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.編碼;
   * 'fEQ'
   */
  get 編碼() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return encode(母, 呼, 等, 重紐, 韻, 聲);
  }

  /**
   * 音韻地位的代表字。
   *
   * 若音韻地位有音無字，則代表字為 `null`。
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.代表字;
   * '法'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.代表字;
   * '祇'
   */
  get 代表字() {
    const { 編碼 } = this;
    const res = m音韻編碼2字頭解釋.get(編碼);
    return res == null ? null : res[0].字頭; // 取音韻編碼對應的第一個字作為代表字
  }

  /**
   * 音韻地位對應的字頭和解釋。
   *
   * 若音韻地位有音無字，則值為空陣列。
   * @member {Array<{字頭: string, 解釋: string}>}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('影', '開', '二', null, '銜', '去');
   * > 音韻地位.條目;
   * [ { 字頭: '𪒠', 解釋: '叫呼仿佛𪒠然自得音黯去聲一' } ]
   */
  get 條目() {
    const { 編碼 } = this;
    const res = m音韻編碼2字頭解釋.get(編碼);
    return res == null ? [] : res;
  }

  /**
   * 取得音韻地位對應的反切。
   *
   * 注意在《廣韻》中存在重出的小韻，因此一個音韻地位可能對應多個反切。
   * 此時函式只回傳第一個反切。
   *
   * 「拯」等小韻無反切，回傳 `null`。
   * @member {string}
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('端', '開', '一', null, '東', '平');
   * > 音韻地位.反切;
   * '德紅'
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.反切;
   * '方乏'
   * > 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > 音韻地位.反切;
   * '巨支'
   * > Qieyun.query字頭('拯')[0].音韻地位.反切; // 拯小韻無反切
   * null
   */
  get 反切() {
    const { 編碼 } = this;
    const res = m音韻編碼2反切.get(編碼);
    return res == null ? null : res;
  }

  /**
   * 判斷某個小韻是否屬於給定的音韻地位。
   * @param {string} s 描述音韻地位的字串
   *
   * 字串中音韻地位的描述格式：
   * 
   * * 音韻地位六要素：`...母`, `...等`, `...韻`, `...聲`, `開口`, `合口`, `重紐A類`, `重紐B類`
   * * 拓展音韻地位：`...組`, `...音`, `...攝`, `全清`, `次清`, `全濁`, `次濁`
   *
   * 字串首先以「或」字分隔，再以空格分隔。不支援括號。
   *
   * 如「(端精組 且 入聲) 或 (以母 且 四等 且 去聲)」可以表示為 `端精組 入聲 或 以母 四等 去聲`。
   * @returns {boolean} 若描述音韻地位的字串符合該音韻地位，回傳 `true`；否則回傳 `false`。
   * @example
   * > 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入');
   * > 音韻地位.屬於('章母');
   * false
   * > 音韻地位.屬於('一四等');
   * false
   * > 音韻地位.屬於('幫組 或 陽韻');
   * true
   */
  屬於(s) {
    const { 母, 呼, 等, 重紐, 韻, 聲, 清濁, 音, 攝 } = this;

    function equal組(i) {
      const vs = 組到母[i];
      if (vs == null) return false; // No such 組
      return vs.some((v) => 母 === v);
    }

    function equal聲(i) {
      if (['平', '上', '去', '入'].includes(i)) return i === 聲;
      if (i === '仄') return 聲 !== '平';
      if (i === '舒') return 聲 !== '入';
      return false; // No such 聲
    }

    return s.split(' 或 ').some((xs) => xs.split(' ').every((ys) => {
      if (ys.endsWith('母')) return [...ys].slice(0, -1).includes(母);
      if (ys.endsWith('等')) return [...ys].slice(0, -1).includes(等);
      if (ys.endsWith('韻')) return [...ys].slice(0, -1).includes(韻);
      if (ys.endsWith('聲')) return [...ys].slice(0, -1).some((i) => equal聲(i));

      if (ys.endsWith('組')) return [...ys].slice(0, -1).some((i) => equal組(i));
      if (ys.endsWith('音')) return [...ys].slice(0, -1).includes(音);
      if (ys.endsWith('攝')) return [...ys].slice(0, -1).includes(攝);

      if (ys === '開口') return 呼 === '開';
      if (ys === '合口') return 呼 === '合';
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
   * @param {音韻地位} other 另一音韻地位。
   * @returns {boolean} 若相等，則回傳 `true`；否則回傳 `false`。
   * @example
   * > a = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > b = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平');
   * > a === b;
   * false
   * > a.等於(b);
   * true
   */
  等於(other) {
    return this.編碼 === other.編碼;
  }
}

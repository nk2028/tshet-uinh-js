import { encode, decode } from './音韻編碼';
import { m字頭2音韻編碼解釋, m音韻編碼2字頭解釋, m音韻編碼2反切 } from './資料';
import { 韻到攝, 組到母 } from './拓展音韻屬性';

export function query字頭(字頭) {
  const res = m字頭2音韻編碼解釋.get(字頭);
  return res == null ? [] : res.map(({ 音韻編碼, 解釋 }) => {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = decode(音韻編碼);
    return { 音韻地位: new 音韻地位(母, 呼, 等, 重紐, 韻, 聲), 解釋 };
  });
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
 * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
 */
export class 音韻地位 {
  constructor(母, 呼, 等, 重紐, 韻, 聲) {
    /**
     * 聲母
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.母;
     * '見'
     */
    this.母 = 母;

    /**
     * 呼
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.呼;
     * '合'
     */
    this.呼 = 呼;

    /**
     * 等
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.等;
     * '一'
     */
    this.等 = 等;

    /**
     * 重紐
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.重紐;
     * null
     */
    this.重紐 = 重紐;

    /**
     * 韻母（舉平以賅上去入）
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.韻;
     * '戈'
     */
    this.韻 = 韻;

    /**
     * 聲調
     * @member {string}
     * @example
     * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
     * > 音韻地位.聲;
     * '平'
     */
    this.聲 = 聲;
  }

  /**
   * 攝
   * @member {string}
   * @example
   * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
   * > 音韻地位.攝;
   * '果'
   */
  get 攝() {
    const { 韻 } = this;
    return 韻到攝[韻];
  }

  /**
   * 描述
   * @member {string}
   * @example
   * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
   * > 音韻地位.描述;
   * '見合一戈平'
   */
  get 描述() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return 母 + (呼 || '') + 等 + (重紐 || '') + 韻 + 聲;
  }

  /**
   * 表達式，可用於 `屬於` 函數
   * @member {string}
   * @example
   * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
   * > 音韻地位.表達式;
   * '見母 合口 一等 戈韻 平聲'
   * > 音韻地位 = Qieyun.get音韻地位(94);
   * > 音韻地位.表達式;
   * '曉母 合口 三等 重紐A類 支韻 平聲'
   */
  get 表達式() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    const 呼字段 = 呼 ? `${呼}口 ` : '';
    const 重紐字段 = 重紐 ? `重紐${重紐}類 ` : '';
    return `${母}母 ${呼字段}${等}等 ${重紐字段}${韻}韻 ${聲}聲`;
  }

  get 編碼() {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = this;
    return encode(母, 呼, 等, 重紐, 韻, 聲);
  }

  get 條目() {
    const { 編碼 } = this;
    const res = m音韻編碼2字頭解釋.get(編碼);
    return res == null ? [] : res;
  }

  get 反切() {
    const { 編碼 } = this;
    const res = m音韻編碼2反切.get(編碼);
    return res == null ? null : res;
  }

  /**
   * 判斷某個小韻是否屬於給定的音韻地位。
   * @param {string} s 描述音韻地位的字串
   *
   * 字串中音韻地位的描述格式：`...母`, `...組`, `...等`, `...韻`, `...攝`, `...聲`, `開口`, `合口`, `重紐A類`, `重紐B類`。
   *
   * 字串首先以「或」字分隔，再以空格分隔。不支援括號。
   *
   * 如「(端精組 且 入聲) 或 (以母 且 四等 且 去聲)」可以表示為 `端精組 入聲 或 以母 四等 去聲`。
   *
   * @returns {boolean} 若描述音韻地位的字串符合該音韻地位，返回 `true`；否則返回 `false`。
   * @example
   * > let 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '戈', '平');
   * > 音韻地位.屬於('章母');
   * false
   * > 音韻地位.屬於('清韻');
   * false
   * > 音韻地位.屬於('見影組 或 日母');
   * true
   */
  屬於(s) {
    const { 母, 呼, 等, 重紐, 韻, 聲, 攝 } = this;

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
      if (ys.endsWith('韻')) return [...ys].slice(0, -1).includes(韻);
      if (ys.endsWith('攝')) return [...ys].slice(0, -1).includes(攝);

      if (ys.endsWith('組')) return [...ys].slice(0, -1).some((i) => equal組(i));
      if (ys.endsWith('等')) return [...ys].slice(0, -1).includes(等);
      if (ys.endsWith('聲')) return [...ys].slice(0, -1).some((i) => equal聲(i));

      if (ys === '開口') return 呼 === '開';
      if (ys === '合口') return 呼 === '合';
      if (ys === '重紐A類') return 重紐 === 'A';
      if (ys === '重紐B類') return 重紐 === 'B';

      throw new Error(`No such 運算符: ${ys}`);
    }));
  }
}

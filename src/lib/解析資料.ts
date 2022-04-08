import 資料 from '../data/資料';

import { 音韻地位 } from './音韻地位';

const m字頭2音韻編碼反切解釋 = new Map<string, { 編碼: string; 反切: string | null; 解釋: string }[]>();
const m音韻編碼2字頭反切解釋 = new Map<string, { 字頭: string; 反切: string | null; 解釋: string }[]>();

(function 解析資料() {
  const patternOuter = /([\w$]{3})([^\w$]+)/gu;
  let matchOuter: RegExpExecArray;
  while ((matchOuter = patternOuter.exec(資料)) != null) {
    const [, 編碼, 條目] = matchOuter;

    const patternInner = /([^|])([^|]{2})([^|]*)/gu;
    let matchInner: RegExpExecArray;
    while ((matchInner = patternInner.exec(條目)) != null) {
      const [, 字頭, 反切_, 解釋] = matchInner;
      // '@@' is a placeholder in the original data to indicate that there is no 反切
      const 反切 = 反切_ === '@@' ? null : 反切_;

      if (!m字頭2音韻編碼反切解釋.has(字頭)) {
        m字頭2音韻編碼反切解釋.set(字頭, []); // set default value
      }
      m字頭2音韻編碼反切解釋.get(字頭).push({ 編碼, 反切, 解釋 });

      if (!m音韻編碼2字頭反切解釋.has(編碼)) {
        m音韻編碼2字頭反切解釋.set(編碼, []); // set default value
      }
      m音韻編碼2字頭反切解釋.get(編碼).push({ 字頭, 反切, 解釋 });
    }
  }
})();

/**
 * 所有至少對應一個字頭的音韻地位。
 * @returns 生成器，所有至少對應一個字頭的音韻地位。
 */
export function* iter音韻地位(): IterableIterator<音韻地位> {
  for (const 音韻編碼 of m音韻編碼2字頭反切解釋.keys()) {
    yield 音韻地位.from編碼(音韻編碼);
  }
}

/**
 * 由字頭查出相應的音韻地位、反切、解釋。
 * @param 字頭 待查找的漢字
 * @returns 陣列。陣列的每一項包含音韻地位和解釋。
 *
 * 若字頭不存在，則回傳空陣列。
 * @example
 * ```typescript
 * > Qieyun.defaultData.query字頭('結');
 * [ { 音韻地位: 音韻地位 { '見開四先入' }, '反切': '古屑', 解釋: '締也古屑切十五' } ]
 * > Qieyun.defaultData.query字頭('冷');
 * [
 *   { 音韻地位: 音韻地位 { '來開四青平' }, '反切': '郎丁', 解釋: '冷凙吳人云冰凌又力頂切' },
 *   { 音韻地位: 音韻地位 { '來開二庚上' }, '反切': '魯打', 解釋: '寒也魯打切又魯頂切一' },
 *   { 音韻地位: 音韻地位 { '來開四青上' }, '反切': '力鼎', 解釋: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切' },
 * ]
 * ```
 */
export function query字頭(字頭: string): { 音韻地位: 音韻地位; 反切: string | null; 解釋: string }[] {
  return m字頭2音韻編碼反切解釋.get(字頭)?.map(({ 編碼, 反切, 解釋 }) => ({ 音韻地位: 音韻地位.from編碼(編碼), 反切, 解釋 })) ?? [];
}

/**
 * 音韻地位對應的字頭、反切、解釋。
 *
 * 若音韻地位有音無字，則值為空陣列。
 * @example
 * ```typescript
 * > 地位 = Qieyun.音韻地位.from描述('影開二銜去');
 * > Qieyun.defaultData.query音韻地位(地位);
 * [ { 字頭: '𪒠', '反切': null, 解釋: '叫呼仿佛𪒠然自得音黯去聲一' } ]
 * ```
 */
export function query音韻地位(地位: 音韻地位): { 字頭: string; 反切: string | null; 解釋: string }[] {
  return m音韻編碼2字頭反切解釋.get(地位.編碼) ?? [];
}

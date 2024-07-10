import 資料 from '../data/資料';

import { 音韻地位 } from './音韻地位';

type 檢索內部結果 = { 字頭: string; 編碼: string; 反切: string | null; 釋義: string; 韻目原貌: string };
export type 檢索結果 = { 字頭: string; 音韻地位: 音韻地位; 反切: string | null; 釋義: string; 韻目原貌: string };

const m字頭檢索 = new Map<string, 檢索內部結果[]>();
const m音韻編碼檢索 = new Map<string, 檢索內部結果[]>();

function insertInto<K, V>(map: Map<K, V[]>, key: K, value: V) {
  if (!map.has(key)) {
    map.set(key, [value]);
  } else {
    map.get(key).push(value);
  }
}

(function 解析資料() {
  const patternOuter = /([\w$]{3})(..)(.)(.*?\n)/gu;
  for (const [, 編碼, maybe反切, 韻目原貌, 各條目] of 資料.matchAll(patternOuter)) {
    // '@@' is a placeholder in the original data to indicate that there is no 反切
    const 反切 = maybe反切 === '@@' ? null : maybe反切;

    const patternInner = /(.)((?:\+.)*)(.*?)[|\n]/gu;
    for (const [, 字頭, 字頭又作, 釋義] of 各條目.matchAll(patternInner)) {
      const record = { 字頭, 編碼, 韻目原貌, 反切, 釋義 };

      insertInto(m字頭檢索, 字頭, record);
      for (const [, 別體] of 字頭又作.matchAll(/\+(.)/g)) {
        insertInto(m字頭檢索, 別體, record);
      }

      insertInto(m音韻編碼檢索, 編碼, record);
    }
  }
})();

function 結果from內部結果(內部結果: 檢索內部結果): 檢索結果 {
  const { 字頭, 編碼, ...rest } = 內部結果;
  return { 字頭, 音韻地位: 音韻地位.from編碼(編碼), ...rest };
}

/**
 * 所有至少對應一個字頭的音韻地位。
 * @returns 迭代器，所有至少對應一個字頭的音韻地位。
 */
export function* iter音韻地位(): IterableIterator<音韻地位> {
  for (const 音韻編碼 of m音韻編碼檢索.keys()) {
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
 * > Qieyun.資料.query字頭('結');
 * [ { 字頭: '結', 音韻地位: 音韻地位 { '見開四先入' }, 韻目原貌: '屑', 反切: '古屑', 釋義: '締也古屑切十五' } ]
 * > Qieyun.資料.query字頭('冷');
 * [
 *   { 字頭: '冷', 音韻地位: 音韻地位 { '來開四青平' }, 韻目原貌: '青', 反切: '郎丁', 釋義: '冷凙吳人云冰凌又力頂切' },
 *   { 字頭: '冷', 音韻地位: 音韻地位 { '來開二庚上' }, 韻目原貌: '梗', 反切: '魯打', 釋義: '寒也魯打切又魯頂切一' },
 *   { 字頭: '冷', 音韻地位: 音韻地位 { '來開四青上' }, 韻目原貌: '迥', 反切: '力鼎', 釋義: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切' },
 * ]
 * ```
 */
export function query字頭(字頭: string): 檢索結果[] {
  return m字頭檢索.get(字頭)?.map(結果from內部結果) ?? [];
}

/**
 * 音韻地位對應的字頭、反切、解釋。
 *
 * 若音韻地位有音無字，則值為空陣列。
 * @example
 * ```typescript
 * > 地位 = Qieyun.音韻地位.from描述('影開二銜去');
 * > Qieyun.資料.query音韻地位(地位);
 * [ { 字頭: '𪒠', 音韻地位: 音韻地位 { ''影開二銜去' }, 韻部原貌: '鑑', 反切: null, 解釋: '叫呼仿佛𪒠然自得音黯去聲一' } ]
 * ```
 */
export function query音韻地位(地位: 音韻地位): 檢索結果[] {
  return m音韻編碼檢索.get(地位.編碼)?.map(結果from內部結果) ?? [];
}

import type { 廣韻來源 } from '../data/廣韻';
import * as 廣韻impl from '../data/廣韻impl';

import { insertInto, prependValuesInto } from './utils';
import { decode音韻編碼, encode音韻編碼 } from './壓縮表示';
import { 音韻地位 } from './音韻地位';

export * as 廣韻 from '../data/廣韻';
export type { 廣韻來源 } from '../data/廣韻';

type 內部檢索結果 = Readonly<{ 字頭: string; 編碼: string; 反切: string | null; 釋義: string; 來源: 來源類型 | null }>;

export interface 檢索結果 {
  字頭: string;
  音韻地位: 音韻地位;
  /** 反切，若未用反切注音（如「音某字某聲」）則為 `null` */
  反切: string | null;
  釋義: string;
  來源: 來源類型 | null;
}
export type 來源類型 = 廣韻來源 | 王三來源;
export interface 王三來源 {
  文獻: '王三';
  小韻號: string;
  韻目: string;
}

const m字頭檢索 = new Map<string, 內部檢索結果[]>();
const m音韻編碼檢索 = new Map<string, 內部檢索結果[]>();

(function 廣韻索引() {
  for (const 原書小韻 of 廣韻impl.by原書小韻.values()) {
    for (const 廣韻條目 of 原書小韻) {
      if (廣韻條目.音韻編碼 === null) {
        continue;
      }
      const { 字頭, 音韻編碼: 編碼, 小韻號, 韻目原貌, ...rest } = 廣韻條目;
      const 條目 = { 字頭, 編碼, ...rest, 來源: { 文獻: '廣韻' as const, 小韻號, 韻目: 韻目原貌 } };
      insertInto(m字頭檢索, 字頭, 條目);
      insertInto(m音韻編碼檢索, 編碼, 條目);
    }
  }
})();

(function 早期廣韻外字() {
  const by字頭 = new Map<string, 內部檢索結果[]>();
  for (const [字頭, 描述, 反切, 釋義, 小韻號, 韻目] of [
    ['忘', '明三C陽平', '武方', '遺又武放不記曰忘', '797', '陽'],
    ['韻', '云合三B真去', '爲捃', '為捃反音和一', '2420', '震'],
  ] as const) {
    const 編碼 = encode音韻編碼(音韻地位.from描述(描述));
    const record = { 字頭, 編碼, 反切, 釋義, 來源: { 文獻: '王三' as const, 小韻號, 韻目 } };
    insertInto(by字頭, 字頭, record);
    insertInto(m音韻編碼檢索, 編碼, record);
  }

  for (const [字頭, 各條目] of by字頭.entries()) {
    prependValuesInto(m字頭檢索, 字頭, 各條目);
  }
})();

function 結果from內部結果(內部結果: 內部檢索結果): 檢索結果 {
  const { 字頭, 編碼, 來源, ...rest } = 內部結果;
  return {
    字頭,
    音韻地位: decode音韻編碼(編碼),
    ...rest,
    來源: 來源 ? { ...來源 } : null,
  };
}

/**
 * 遍歷內置資料中全部有字之音韻地位。
 * @returns 迭代器，所有至少對應一個字頭的音韻地位
 */
export function* iter音韻地位(): IterableIterator<音韻地位> {
  for (const 音韻編碼 of m音韻編碼檢索.keys()) {
    yield decode音韻編碼(音韻編碼);
  }
}

/**
 * 由字頭查出相應的音韻地位、反切、解釋。
 * @param 字頭 待查找的漢字
 * @returns 陣列，每一項包含音韻地位和解釋
 *
 * 若查不到該字，則回傳空陣列。
 * @example
 * ```typescript
 * > TshetUinh.資料.query字頭('結');
 * [ {
 *   字頭: '結',
 *   音韻地位: 音韻地位<見開四先入>,
 *   反切: '古屑',
 *   釋義: '締也古屑切十五',
 *   來源: { 文獻: '廣韻', 小韻號: '3469', 韻目: '屑' },
 * } ]
 * > TshetUinh.資料.query字頭('冷');
 * [
 *   {
 *     字頭: '冷',
 *     音韻地位: 音韻地位<來開四青平>,
 *     反切: '郎丁',
 *     釋義: '冷凙吳人云冰凌又力頂切',
 *     來源: { 文獻: '廣韻', 小韻號: '939', 韻目: '青' },
 *   },
 *   {
 *     字頭: '冷',
 *     音韻地位: 音韻地位<來開二庚上>,
 *     反切: '魯打',
 *     釋義: '寒也魯打切又魯頂切一',
 *     來源: { 文獻: '廣韻', 小韻號: '1872', 韻目: '梗' },
 *   },
 *   {
 *     字頭: '冷',
 *     音韻地位: 音韻地位<來開四青上>,
 *     反切: '力鼎',
 *     釋義: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切',
 *     來源: { 文獻: '廣韻', 小韻號: '1915', 韻目: '迥' },
 *   },
 * ]
 * ```
 */
export function query字頭(字頭: string): 檢索結果[] {
  return m字頭檢索.get(字頭)?.map(結果from內部結果) ?? [];
}

/**
 * 查詢音韻地位對應的字頭、反切、解釋。
 *
 * @param 地位 待查詢的音韻地位
 *
 * @returns 陣列，每一項包含音韻地位和解釋
 *
 * 若音韻地位有音無字，則值為空陣列。
 * @example
 * ```typescript
 * > 地位 = TshetUinh.音韻地位.from描述('影開二銜去');
 * > TshetUinh.資料.query音韻地位(地位);
 * [ {
 *   字頭: '𪒠',
 *   音韻地位: 音韻地位<影開二銜去>,
 *   反切: null,
 *   解釋: '叫呼仿佛𪒠然自得音黯去聲一',
 *   來源: { 文獻: '廣韻', 小韻號: '3177', 韻目: '鑑' },
 * } ]
 * ```
 */
export function query音韻地位(地位: 音韻地位): 檢索結果[] {
  return m音韻編碼檢索.get(encode音韻編碼(地位))?.map(結果from內部結果) ?? [];
}

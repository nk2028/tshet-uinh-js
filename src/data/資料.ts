import { insertInto, insertValuesInto, prependValuesInto } from '../lib/utils';
import { encode音韻編碼 } from '../lib/壓縮表示';
import { decode音韻編碼unchecked } from '../lib/壓縮表示internal';
import { 音韻地位 } from '../lib/音韻地位';

import { parse字頭詳情, 內部切韻條目, 條目from內部條目 } from './common';
import { 切韻條目 } from './切韻';
import { 廣韻條目 } from './廣韻';
import * as 廣韻impl from './廣韻impl';
import { 內部廣韻條目 } from './廣韻impl';

export * as 切韻 from './切韻';
export * as 廣韻 from './廣韻';

export type { 上下文條目, 資料條目Common } from './common';

export type 資料條目 = 切韻條目 | 廣韻條目;

type 內部條目 = 內部切韻條目 | 內部廣韻條目;

const m字頭檢索 = new Map<string, 內部條目[]>();
const m音韻編碼檢索 = new Map<string, 內部條目[]>();

(function 建立廣韻索引() {
  const by原貌 = new Map<string, 內部條目[]>();
  for (const 原書小韻 of 廣韻impl.by原書小韻.values()) {
    for (const 條目 of 原書小韻) {
      insertInto(m音韻編碼檢索, 條目.音韻編碼, 條目);
      const 各校勘 = parse字頭詳情(條目.字頭).reverse();
      const 字頭原貌 = 各校勘.pop();
      for (const 校勘 of 各校勘) {
        const 字 = 校勘.slice(1, -1);
        if (字) {
          insertInto(m字頭檢索, 字, 條目);
        }
      }
      if (字頭原貌) {
        insertInto(by原貌, 字頭原貌, 條目);
      }
    }
  }
  for (const [字頭原貌, 各條目] of by原貌.entries()) {
    insertValuesInto(m字頭檢索, 字頭原貌, 各條目);
  }
})();

// NOTE
// 此為臨時補充字音（以及作為將來《切韻》資料功能支持的測試）。
// 等到切韻資料準備好後，會換成完整資料。
// 小韻號、對應廣韻小韻號亦均為暫定編號，完整資料中會修正。
(function 字音補充() {
  const by字頭 = new Map<string, 內部條目[]>();
  for (
    const [描述, 字頭, 小韻號, 小韻字號, 對應廣韻小韻號, 韻目, 反切, 釋義] of [
      ['明三C陽平', '忘', '774', '4', '822', '陽', '武方', '又武放反'],
      ['云合三B真去', '韻', '2275', '1', '32419', '震', '永賮', '永賮反一'],
    ] as const
  ) {
    const 音韻編碼 = encode音韻編碼(音韻地位.from描述(描述));
    const record: 內部切韻條目 = {
      來源: '切韻',
      音韻編碼,
      字頭,
      字頭說明: null,
      小韻號,
      小韻字號,
      對應廣韻小韻號,
      韻目,
      反切,
      直音: null,
      釋義,
      釋義上下文: null,
    };
    insertInto(by字頭, 字頭, record);
    insertInto(m音韻編碼檢索, 音韻編碼, record);
  }

  for (const [字頭, 各條目] of by字頭.entries()) {
    prependValuesInto(m字頭檢索, 字頭, 各條目);
  }
})();

/**
 * 遍歷內置資料中全部有字之音韻地位。
 * @returns 迭代器，所有至少對應一個字頭的音韻地位
 */
export function* iter音韻地位(): IterableIterator<音韻地位> {
  for (const 音韻編碼 of m音韻編碼檢索.keys()) {
    // NOTE 音韻地位s in the builtin data are guaranteed to be valid
    yield decode音韻編碼unchecked(音韻編碼);
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
 *   來源: '廣韻',
 *   音韻地位: 音韻地位<見開四先入>,
 *   字頭: '結',
 *   字頭說明: null,
 *   小韻號: '3469',
 *   小韻字號: '1',
 *   韻目: '屑',
 *   反切: '古屑',
 *   直音: null,
 *   釋義: '締也古屑切十五',
 *   釋義上下文: null
 * } ]
 * > TshetUinh.資料.query字頭('冷');
 * [
 *   {
 *     來源: '廣韻',
 *     音韻地位: 音韻地位<來開四青平>,
 *     字頭: '冷',
 *     字頭說明: null,
 *     小韻號: '939',
 *     小韻字號: '66',
 *     韻目: '青',
 *     反切: '郎丁',
 *     直音: null,
 *     釋義: '冷凙吳人云冰凌又力頂切',
 *     釋義上下文: null
 *   },
 *   {
 *     來源: '廣韻',
 *     音韻地位: 音韻地位<來開二庚上>,
 *     字頭: '冷',
 *     字頭說明: null,
 *     小韻號: '1872',
 *     小韻字號: '1',
 *     韻目: '梗',
 *     反切: '魯打',
 *     直音: null,
 *     釋義: '寒也魯打切又魯頂切一',
 *     釋義上下文: null
 *   },
 *   {
 *     來源: '廣韻',
 *     音韻地位: 音韻地位<來開四青上>,
 *     字頭: '冷',
 *     字頭說明: null,
 *     小韻號: '1915',
 *     小韻字號: '3',
 *     韻目: '迥',
 *     反切: '力鼎',
 *     直音: null,
 *     釋義: '寒也又姓前趙錄有徐州刺史冷道字安義又盧打切',
 *     釋義上下文: null
 *   }
 * ]
 * ```
 */
export function query字頭(字頭: string): 資料條目[] {
  return m字頭檢索.get(字頭)?.map(條目from內部條目) ?? [];
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
 *   '來源': '廣韻',
 *   '音韻地位': 音韻地位<影開二銜去>,
 *   '字頭': '𪒠',
 *   '字頭說明': null,
 *   '小韻號': '3177',
 *   '小韻字號': '1',
 *   '韻目': '鑑',
 *   '反切': null,
 *   '直音': '黯去聲',
 *   '釋義': '叫呼仿佛𪒠然自得音黯去聲一',
 *   '釋義上下文': null
 * } ]
 * ```
 */
export function query音韻地位(地位: 音韻地位): 資料條目[] {
  return m音韻編碼檢索.get(encode音韻編碼(地位))?.map(條目from內部條目) ?? [];
}

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

/**
 * @see {@linkcode 資料條目Common}
 */
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

/**
 * 由字頭查出相應的條目，包含音韻地位、反切、釋義等信息。
 *
 * 查詢結果預設除了所查字頭的條目外，還會一並含有其所在上下文的條目（如「上同」「俗」「古文」等多個字頭共用釋義時）。若不想包含上下文，可在 `選項` 引數中指定 `上下文: false`（此時上下文情報需透過條目的 {@linkcode 資料條目Common.釋義上下文 | 釋義上下文} 屬性取得）。
 *
 * @param 字頭 要查的字
 * @param 選項 查詢選項
 * @returns 查到的所有條目。若查不到條目，則回傳空陣列。
 *
 * @example 基本用法
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
 *
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
 *
 * @example 上下文選項
 * ```typescript
 * > TshetUinh.資料.query字頭('菱'); // `上下文` 預設為 `true`
 * [
 *   {
 *     音韻地位: 音韻地位<來開三蒸平>,
 *     字頭: '蔆',
 *     字頭說明: null,
 *     小韻號: '949',
 *     小韻字號: '7',
 *     韻目: '蒸',
 *     反切: '力膺',
 *     直音: null,
 *     釋義: '芰也',
 *     釋義上下文: [ ... ],
 *     來源: '廣韻'
 *   },
 *   {
 *     音韻地位: 音韻地位<來開三蒸平>,
 *     字頭: '菱',
 *     小韻號: '949',
 *     小韻字號: '8',
 *     釋義: null,
 *     釋義上下文: [ ... ],
 *     ... // other properties same as above
 *   },
 *   {
 *     音韻地位: 音韻地位<來開三蒸平>,
 *     字頭: '䔖',
 *     小韻號: '949',
 *     小韻字號: '9',
 *     釋義: '並同',
 *     釋義上下文: [ ... ],
 *     ... // other properties same as above
 *   }
 * ]
 *
 * > TshetUinh.資料.query字頭('菱', { 上下文: false });
 * [ {
 *   音韻地位: 音韻地位<來開三蒸平>,
 *   字頭: '菱',
 *   字頭說明: null,
 *   小韻號: '949',
 *   小韻字號: '8',
 *   韻目: '蒸',
 *   反切: '力膺',
 *   直音: null,
 *   釋義: null,
 *   釋義上下文: [
 *     { '字頭': '蔆', '字頭說明': null, '小韻字號': '7', '釋義': '芰也' },
 *     { '字頭': '菱', '字頭說明': null, '小韻字號': '8', '釋義': null },
 *     { '字頭': '䔖', '字頭說明': null, '小韻字號': '9', '釋義': '並同' }
 *   ],
 *   來源: '廣韻'
 * } ]
 * ```
 */
export function query字頭(字頭: string, 選項?: Query字頭Options): 資料條目[];
/**
 * 由字頭查出相應的條目，並可透過傳入 `異體字頭` 以查出更多可能相關的條目。
 *
 * 由 `異體字頭` 查出的額外結果，總是排在由 `字頭` 查出的結果之後。
 *
 * @param 字頭 要查的字
 * @param 異體字頭 陣列，每項為一個要查的異體字頭
 * @param 選項 查詢選項
 * @returns 查到的所有條目。若查不到條目，則回傳空陣列。
 *
 * @example
 * ```typescript
 * > TshetUinh.資料.query字頭('餘', ['余'])
 * [
 *   {
 *     音韻地位: 音韻地位<以開三魚平>,
 *     字頭: '餘',
 *     字頭說明: null,
 *     小韻號: '231',
 *     小韻字號: '5',
 *     韻目: '魚',
 *     反切: '以諸',
 *     直音: null,
 *     釋義: '殘也賸也皆也饒也又姓晉有餘頠又漢複姓三氏晉卿韓宣子之後有名餘子者奔於齊號韓餘氏又傳餘氏本自傅說說既爲相其後有留於傅巖者因號傅餘氏秦亂自清河入吳漢興還本郡餘不還者曰傅氏今吳郡有之風俗通云吳公子夫摡奔楚其子在國以夫餘爲氏今百濟王夫餘氏也',
 *     釋義上下文: null,
 *     來源: '廣韻'
 *   },
 *   {
 *     音韻地位: 音韻地位<以開三魚平>,
 *     字頭: '余',
 *     字頭說明: null,
 *     小韻號: '231',
 *     小韻字號: '1',
 *     韻目: '魚',
 *     反切: '以諸',
 *     直音: null,
 *     釋義: '我也又姓風俗通云秦由余之後何氏姓苑云今新安人以諸切三十',
 *     釋義上下文: null,
 *     來源: '廣韻'
 *   },
 *   {
 *     音韻地位: 音韻地位<常開三麻平>,
 *     字頭: '余',
 *     字頭說明: null,
 *     小韻號: '789',
 *     小韻字號: '2',
 *     韻目: '麻',
 *     反切: '視遮',
 *     直音: null,
 *     釋義: '姓也見姓苑出南昌郡',
 *     釋義上下文: null,
 *     來源: '廣韻'
 *   }
 * ]
 * ```
 */
export function query字頭(字頭: string, 異體字頭: string[], 選項?: Query字頭Options): 資料條目[];

export function query字頭(字頭: string, ...args: unknown[]): 資料條目[] {
  let 異體字頭: string[] = [];
  let 選項: Required<Query字頭Options> = { 上下文: true };
  while (args.length && args.at(-1) === undefined) {
    args.pop();
  }
  if (args.length === 1) {
    if (Array.isArray(args[0])) {
      異體字頭 = args[0] as string[];
    } else {
      選項 = { ...選項, ...args[0] as Query字頭Options };
    }
  } else if (args.length > 1) {
    if (args[0] != null) {
      異體字頭 = args[0] as string[];
    }
    if (args[1]) {
      選項 = { ...選項, ...args[1] as Query字頭Options };
    }
  }

  function lookupInternalIndex(字頭: string): 資料條目[] {
    return m字頭檢索.get(字頭)?.map(條目from內部條目) ?? [];
  }

  function keyFor條目(條目: 資料條目): string {
    return `${條目.來源}/${條目.小韻號}/${條目.小韻字號}`;
  }
  function compare條目Order(條目1: 資料條目, 條目2: 資料條目): number {
    if (條目1.來源 !== 條目2.來源) {
      return 條目1.來源 < 條目2.來源 ? -1 : 1;
    }
    const 原書小韻號1 = 條目1.原書小韻號;
    const 原書小韻號2 = 條目2.原書小韻號;
    if (原書小韻號1 !== 原書小韻號2) {
      return 原書小韻號1 - 原書小韻號2;
    }
    const [原書字號1, 增字號1] = 條目1.小韻字號詳情;
    const [原書字號2, 增字號2] = 條目2.小韻字號詳情;
    return 原書字號1 !== 原書字號2 ? 原書字號1 - 原書字號2 : 增字號1 - 增字號2;
  }

  function* flattenExpanded條目(各條目: Iterable<資料條目>): IterableIterator<資料條目> {
    for (const 條目 of 各條目) {
      yield* 條目.expand釋義上下文();
    }
  }

  function filterAndCollectUnique(
    各條目: Iterable<資料條目>,
    filter: (key: string, 條目: 資料條目) => boolean = () => true,
  ): [資料條目[], Map<string, 資料條目>] {
    const map = new Map<string, 資料條目>();
    for (const 條目 of flattenExpanded條目(各條目)) {
      const key = keyFor條目(條目);
      if (!map.has(key) && filter(key, 條目)) {
        map.set(key, 條目);
      }
    }
    const sorted = [...map.values()].sort(compare條目Order);
    return [sorted, map];
  }

  const lookupPrimary = lookupInternalIndex(字頭);
  let resultPrimary: 資料條目[];
  let primaryKeys: Set<string> | Map<string, unknown>;
  if (選項.上下文) {
    [resultPrimary, primaryKeys] = filterAndCollectUnique(flattenExpanded條目(lookupPrimary));
  } else {
    // NOTE m字頭檢索 is already sorted
    resultPrimary = lookupPrimary;
    primaryKeys = new Set(resultPrimary.map(keyFor條目));
  }

  let lookupVariants: Iterable<資料條目> = 異體字頭.flatMap(lookupInternalIndex);
  if (選項.上下文) {
    lookupVariants = flattenExpanded條目(lookupVariants);
  }
  const [resultVariants] = filterAndCollectUnique(lookupVariants, key => !primaryKeys.has(key));
  return [...resultPrimary, ...resultVariants];
}

/**
 * 用於 {@linkcode query字頭} 的選項
 */
export interface Query字頭Options {
  /**
   * 結果中是否要包含上下文的條目，預設為 `true`
   */
  上下文?: boolean;
}

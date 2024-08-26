import { decode音韻編碼 } from '../lib/壓縮表示';
import { 音韻地位 } from '../lib/音韻地位';

import * as impl from './廣韻impl';

export interface 廣韻條目 {
  字頭: string;
  /** 音韻地位。若條目為訛字並導致該小韻音韻地位無效，則為 `null` */
  音韻地位: 音韻地位 | null;
  /** 反切。若未用反切注音（如「音某字某聲」）則為 `null` */
  反切: string | null;
  釋義: string;
  來源: 廣韻來源;
}
export interface 廣韻來源 {
  文獻: '廣韻';
  /**
   * 小韻號，由 1 至 3874。
   *
   * 部分小韻含多個音韻地位，會依音韻地位拆分，並有細分號（後綴 -a、-b 等），故為字串格式。
   * @see {@link get小韻}
   */
  小韻號: string;
  /** 原書韻目，與音韻地位不一定對應 */
  韻目: string;
}

/** 按原書順序遍歷全部廣韻條目。 */
export function* iter條目(): IterableIterator<廣韻條目> {
  for (const 原書小韻 of iter原書小韻()) {
    yield* 原書小韻;
  }
}

/**
 * 遍歷全部小韻號。
 *
 * 細分小韻（見 {@link get小韻}）拆分為不同小韻，有各自的小韻號。
 */
export function iter小韻號(): IterableIterator<string> {
  return impl.by小韻.keys();
}

/**
 * 依小韻號獲取條目。
 *
 * 部分小韻含多個音韻地位，會依音韻地位拆分，並有細分號（後綴 -a、-b 等），故為字串格式。
 *
 * @returns 該小韻所有條目。若小韻號不存在，回傳 `undefined`。
 * @example
 * ```typescript
 * > Qieyun.資料.廣韻.get小韻('3708b');
 * [
 *   {
 *     字頭: '抑',
 *     音韻地位: 音韻地位<影開三B蒸入>,
 *     反切: '於力',
 *     釋義: '按也說文作𢑏从反印',
 *     來源: { 文獻: '廣韻', '小韻號': '3708b', 韻目: '職' },
 *   },
 *   {
 *     字頭: '𡊁',
 *     音韻地位: 音韻地位<影開三B蒸入>,
 *     反切: '於力',
 *     釋義: '地名',
 *     來源: { 文獻: '廣韻', 小韻號: '3708b', 韻目: '職' },
 *   },
 * ]
 * ```
 */
export function get小韻(小韻號: string): 廣韻條目[] | undefined {
  return impl.by小韻.get(小韻號)?.map(條目from內部條目);
}

/**
 * 遍歷全部小韻（細分小韻均拆分）。即對資料中全部小韻執行 {@link get小韻}。
 */
export function* iter小韻(): IterableIterator<廣韻條目[]> {
  for (const 小韻號 of iter小韻號()) {
    yield get小韻(小韻號)!;
  }
}

/** 原書小韻總數。細分小韻（含多個音韻地位的小韻）不拆分，計為一個小韻。 */
export const 原書小韻總數 = impl.by原書小韻.size;

/**
 * 依原書小韻號獲取條目。
 *
 * 細分小韻（含多個音韻地位的小韻）不拆分，視為同一小韻。
 *
 * @param 原書小韻號 數字，應在 1 至 {@link 原書小韻總數}（含）之間。
 * @returns 該原書小韻所有條目
 */
export function get原書小韻(原書小韻號: number): 廣韻條目[] | undefined {
  return impl.by原書小韻.get(原書小韻號)?.map(條目from內部條目);
}

/**
 * 遍歷全部原書小韻（細分小韻不拆分）。即對資料中全部原書小韻執行 {@link get原書小韻}。
 */
export function* iter原書小韻(): IterableIterator<廣韻條目[]> {
  for (let i = 1; i <= 原書小韻總數; i++) {
    yield get原書小韻(i)!;
  }
}

function 條目from內部條目(內部條目: impl.內部廣韻條目): 廣韻條目 {
  const { 字頭, 字頭又作, 音韻編碼, 小韻號, 韻目原貌, ...rest } = 內部條目;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- explicitly ignore this property
  字頭又作;
  return {
    字頭,
    音韻地位: 音韻編碼 === null ? null : decode音韻編碼(音韻編碼),
    ...rest,
    來源: { 文獻: '廣韻' as const, 小韻號, 韻目: 韻目原貌 },
  };
}

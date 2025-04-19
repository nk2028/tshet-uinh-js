import { decode音韻編碼raw, 編碼表, 韻序表 } from './壓縮表示internal';
import { _UNCHECKED, 音韻地位 } from './音韻地位';
import { 所有 } from './音韻屬性常量';

/**
 * 將音韻地位編碼為壓縮格式串。音韻編碼與音韻地位之間存在一一映射關係。
 * @param 地位 待編碼的音韻地位
 * @returns 音韻地位對應的編碼
 * @example
 * ```typescript
 * > 音韻地位 = TshetUinh.音韻地位.from描述('幫三C凡入');
 * > TshetUinh.壓縮表示.encode音韻編碼(音韻地位);
 * 'A9P'
 * > 音韻地位 = TshetUinh.音韻地位.from描述('羣開三A支平');
 * > TshetUinh.壓縮表示.encode音韻編碼(音韻地位);
 * 'fFU'
 * ```
 */
export function encode音韻編碼(地位: 音韻地位): string {
  const { 母, 呼, 等, 類, 韻, 聲 } = 地位;
  const 母序 = 所有.母.indexOf(母);
  const 韻序 = 韻序表.indexOf(韻) + +([...'東歌麻庚'].includes(韻) && !['一', '二'].includes(等));

  // NOTE the value `-1` is expected when the argument is `null`
  const 呼序 = 所有.呼.indexOf(呼!) + 1;
  const 類序 = 所有.類.indexOf(類!) + 1;

  const 呼類聲序 = (呼序 << 4) | (類序 << 2) | 所有.聲.indexOf(聲);

  return 編碼表[母序] + 編碼表[韻序] + 編碼表[呼類聲序];
}

/**
 * 將音韻編碼解碼回音韻地位。
 * @param 編碼 音韻地位的編碼
 * @returns 給定的音韻編碼對應的音韻地位
 * @example
 * ```typescript
 * > TshetUinh.壓縮表示.decode音韻編碼('A9P');
 * 音韻地位<幫三C凡入>
 * > TshetUinh.壓縮表示.decode音韻編碼('fFU');
 * 音韻地位<羣開三A支平>
 * ```
 */
export function decode音韻編碼(編碼: string): 音韻地位 {
  const { 母, 呼, 等, 類, 韻, 聲 } = decode音韻編碼raw(編碼);
  return new 音韻地位(母, 呼, 等, 類, 韻, 聲, _UNCHECKED);
}

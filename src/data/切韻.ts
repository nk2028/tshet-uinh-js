import type { 資料條目Common } from './common';

/**
 * @see {@link 資料條目Common}
 */
export interface 切韻條目 extends 資料條目Common {
  /** 指示來源，可用其值為 `"切韻"` 判斷該條目類型為 {@link 切韻條目} */
  來源: '切韻';
  對應廣韻小韻號: string;
}

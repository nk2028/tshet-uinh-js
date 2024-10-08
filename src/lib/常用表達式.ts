/**
 * 預定義的常用表達式，可用於 `音韻地位.屬於`。
 *
 * @example
 * ```typescript
 * > const { 分開合韻, 合口韻 } = TshetUinh.表達式;
 * > const 地位 = TshetUinh.音韻地位.from描述('羣合三C文平');
 * > 地位.屬於`${分開合韻} 非 ${開合中立韻}`
 * true
 * ```
 *
 * @module 表達式
 */

import { 呼韻搭配, 等韻搭配 } from './音韻屬性常量';

/** 一等韻 */
export const 一等韻 = 等韻搭配.一.join('') + '韻';
/** 二等韻 */
export const 二等韻 = 等韻搭配.二.join('') + '韻';
/** 三等韻（注意：拼端組時為四等） */
export const 三等韻 = 等韻搭配.三.join('') + '韻';
/** 四等韻 */
export const 四等韻 = 等韻搭配.四.join('') + '韻';
/** 一三等韻 */
export const 一三等韻 = 等韻搭配.一三.join('') + '韻';
/** 二三等韻（注意：拼端組時為二四等） */
export const 二三等韻 = 等韻搭配.二三.join('') + '韻';

/**
 * 韻內分開合口的韻
 */
export const 分開合韻 = 呼韻搭配.開合.join('') + '韻';
/**
 * 僅為開口的韻（含之、魚韻及效、深、咸攝諸韻）
 */
export const 開口韻 = 呼韻搭配.開.join('') + '韻';
/**
 * 僅為合口的韻
 */
export const 合口韻 = 呼韻搭配.合.join('') + '韻';
/**
 * 開合中立韻（東冬鍾江模尤侯）
 */
export const 開合中立韻 = 呼韻搭配.中立.join('') + '韻';

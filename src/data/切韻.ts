import type { 資料條目Common } from '../lib/資料';

export interface 切韻條目 extends 資料條目Common {
  來源: '切韻';
  對應廣韻小韻號: string;
}

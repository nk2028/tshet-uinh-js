import 適配分析體系 from './分析體系';
import * as 表達式 from './常用表達式';
import { 音韻地位 } from './音韻地位';

export type 選項列表 = [string, unknown][];
export type 推導選項 = { [x: string]: unknown };
export type 原始推導函數<T> = {
  (): 選項列表;
  (地位: 音韻地位, 字頭: string | null, 選項: 推導選項): T;
};

/**
 * 推導函數，由 [[`建立`]] 產生。
 *
 * @param 地位 欲推導的地位，**必須為 v2ext 體系的地位**，若地位來自其他資料，可用 [[`適配分析體系`]] 預處理。
 * @param 字頭 推導時可提供字頭作為輔助資訊
 * @param 選項 推導選項，未指定的 field 會以預設值填充
 */
export type 推導函數<T> = {
  (地位: 音韻地位, 字頭?: string | null, 選項?: 推導選項): T;
  isLegacy: boolean;
  /** 該推導方案支持的選項，格式詳見 qieyun-autoderiver 及 qieyun-examples 說明 */
  parameters: 選項列表;
  /** 該推導方案預設選項 */
  defaultOptions: 推導選項;
};

const 適配poem = 適配分析體系('poem');

/**
 * 將原始推導方案函數包裝成易於使用的函數，並分析其所提供推導選項等。
 *
 * @param rawFunction 推導方案原始函數。
 * @returns 包裝後的函數，並含有選項等信息。
 */
export function 建立<T>(rawFunction: 原始推導函數<T>): 推導函數<T> {
  let rawParameters: 選項列表;
  try {
    rawParameters = rawFunction();
    if (!Array.isArray(rawParameters)) {
      rawParameters = [];
    }
  } catch {
    rawParameters = [];
  }
  const [parameters, defaultOptions, isLegacy] = processParameters(rawParameters);
  const rt = (地位, 字頭?, 選項?) => {
    if (!地位) {
      throw new Error(`expect 音韻地位`);
    }
    字頭 = 字頭 ?? null;
    選項 = { ...defaultOptions, ...選項 };
    地位 = 適配分析體系.v2extStrict(地位);
    if (isLegacy) {
      地位 = 適配poem(地位);
      地位.屬於`脣音 或 ${表達式.開合中立韻}` && (地位 = 地位.調整({ 呼: null }));
      地位.屬於`${表達式.重紐母} (${表達式.重紐韻} 或 清韻)` || (地位 = 地位.調整({ 重紐: null }));
    }
    return rawFunction(地位, 字頭, 選項);
  };
  rt.isLegacy = isLegacy;
  rt.parameters = parameters;
  rt.defaultOptions = defaultOptions;
  return rt;
}

function processParameters(parameters: 選項列表): [選項列表, 推導選項, boolean] {
  let isLegacy = false;
  const params = [];
  const opts = {};
  for (const parameter of parameters) {
    if (!Array.isArray(parameter)) {
      continue;
    }
    const k = String(parameter[0]);
    const v = parameter[1];
    if (k === '$legacy') {
      isLegacy = !!v;
      continue;
    } else if (v === undefined || v === null) {
      continue;
    }
    if (!Array.isArray(v)) {
      opts[k] = v;
      params.push([k, v]);
    } else if (v.length > 1) {
      if (v.slice(1).includes(v[0])) {
        opts[k] = v[0];
      } else if (typeof v[0] === 'number' && Number.isInteger(v[0]) && v[0] >= 1 && v[0] < v.length) {
        opts[k] = v[v[0]];
      } else {
        opts[k] = v[1];
      }
      params.push([k, [opts[k], ...v.slice(1)]]);
    }
  }
  return [params, opts, isLegacy];
}

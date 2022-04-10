import 適配分析體系 from './分析體系';
import { 表達式 } from './聲韻搭配';
import { 音韻地位 } from './音韻地位';

export type 選項列表 = [string, unknown][];
export type 推導選項 = { [x: string]: unknown };
export type 原始推導函數<T> = {
  (): 選項列表;
  (地位: 音韻地位, 字頭: string | null, 選項: 推導選項): T;
};
export type 推導函數<T> = {
  (地位: 音韻地位, 字頭?: string | null, 選項?: 推導選項): T;
  isLegacy: boolean;
  parameters: 選項列表;
  defaultOptions: 推導選項;
};

const 適配poem = 適配分析體系('poem');

export function 建立<T>(rawFunction: 原始推導函數<T>): 推導函數<T> {
  let rawParameters: 選項列表;
  try {
    rawParameters = rawFunction();
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
    if (['boolean', 'number', 'string'].includes(typeof v)) {
      opts[k] = v;
      params.push([k, v]);
    } else if (Array.isArray(v) && v.length > 1) {
      const idxRaw = Number(v[0]);
      const idx = Math.min(v.length - 1, Math.max(1, Number.isInteger(idxRaw) ? idxRaw : 1));
      opts[k] = v[idx];
      params.push([idx, ...v.slice(1)]);
    }
  }
  return [params, opts, isLegacy];
}

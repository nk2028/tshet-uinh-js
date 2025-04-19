import { assert } from './utils';
import { 音韻地位 } from './音韻地位';
import { 所有, 等韻搭配 } from './音韻屬性常量';

export const 編碼表 = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'] as const;
export const 韻序表 = [
  ...'東＊冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌＊麻＊陽唐庚＊耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡',
] as const;

export type 音韻地位Raw = Pick<音韻地位, '母' | '呼' | '等' | '類' | '韻' | '聲'>;

export function decode音韻編碼raw(編碼: string): 音韻地位Raw {
  assert(編碼.length === 3, () => `Invalid 編碼: ${JSON.stringify(編碼)}`);

  const [母序, 韻序, 呼類聲序] = [...編碼].map(ch => {
    const index = 編碼表.indexOf(ch);
    assert(index !== -1, () => `Invalid character in 編碼: ${JSON.stringify(ch)}`);
    return index;
  });
  assert(母序 < 所有.母.length, () => `Invalid 母序號: ${母序}`);
  const 母 = 所有.母[母序];

  assert(韻序 < 韻序表.length, () => `Invalid 韻序號: ${韻序}`);
  let 韻 = 韻序表[韻序];
  if (韻 === '＊') {
    韻 = 韻序表[韻序 - 1];
  }
  let 等: string;
  for (const [韻等, 各韻] of Object.entries(等韻搭配)) {
    if (各韻.includes(韻)) {
      等 = 韻等[+(韻序表[韻序] === '＊')];
      if (等 === '三' && [...'端透定泥'].includes(母)) {
        等 = '四';
      }
      break;
    }
  }

  const 呼序 = 呼類聲序 >> 4;
  assert(呼序 <= 所有.呼.length, () => `Invalid 呼序號: ${呼序}`);
  const 呼 = 呼序 ? 所有.呼[呼序 - 1] : null;

  const 類序 = (呼類聲序 >> 2) & 0b11;
  assert(類序 <= 所有.類.length, () => `Invalid 類序號: ${類序}`);
  const 類 = 類序 ? 所有.類[類序 - 1] : null;

  const 聲序 = 呼類聲序 & 0b11;
  const 聲 = 所有.聲[聲序];

  // NOTE type assertion safe because the constructor will check it
  return { 母, 呼, 等: 等!, 類, 韻, 聲 };
}

export function decode音韻編碼unchecked(編碼: string): 音韻地位 {
  return Object.assign(Object.create(音韻地位.prototype) as 音韻地位, decode音韻編碼raw(編碼));
}

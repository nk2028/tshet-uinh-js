import { assert } from './utils';
import { _UNCHECKED, 音韻地位 } from './音韻地位';
import { 所有, 等韻搭配 } from './音韻屬性常量';

const 編碼表 = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_'] as const;
const 韻序表 = [
  ...'東＊冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌＊麻＊陽唐庚＊耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡',
] as const;

/**
 * 將音韻地位編碼為壓縮格式串。音韻編碼與音韻地位之間存在一一映射關係。
 * @param 地位 待編碼的音韻地位
 * @returns 音韻地位對應的編碼
 * @example
 * ```typescript
 * > 音韻地位 = Qieyun.音韻地位.from描述('幫三C凡入');
 * > Qieyun.壓縮表示.encode音韻編碼(音韻地位);
 * 'A9P'
 * > 音韻地位 = Qieyun.音韻地位.from描述('羣開三A支平');
 * > Qieyun.壓縮表示.encode音韻編碼(音韻地位);
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
 * > Qieyun.壓縮表示.decode音韻編碼('A9P');
 * 音韻地位<幫三C凡入>
 * > Qieyun.壓縮表示.decode音韻編碼('fFU');
 * 音韻地位<羣開三A支平>
 * ```
 */
export function decode音韻編碼(編碼: string): 音韻地位 {
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

  // NOTE type assertion safe because the constructor checks it
  return new 音韻地位(母, 呼, 等!, 類, 韻, 聲, _UNCHECKED);
}

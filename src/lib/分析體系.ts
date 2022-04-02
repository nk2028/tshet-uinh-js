import { 音韻地位 } from './音韻地位';

// TODO 暫未參數化
export function 分析體系(preset: string): (x: 音韻地位) => 音韻地位 {
  switch (preset) {
    case 'none':
      return x => x;
    case 'v2':
      return 適配v2;
    // TODO pliaj
  }
  throw new Error(`unknown preset: ${preset}`);
}

function 適配v2(地位: 音韻地位): 音韻地位 {
  //const is = (...x: Parameters<音韻地位['屬於']>) => 地位.屬於(...x);

  // TODO 中立韻、脣音呼

  // 灰咍嚴凡
  // FIXME bug?
  const draft = 地位.判斷([
    ['咍韻 脣音', { 韻: '灰' }],
    ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
    ['嚴韻 脣音', { 韻: '凡', 呼: null }],
  ]);
  draft ?? (地位 = 地位.調整(draft));

  // TODO
  return 地位;
}

分析體系.none = 分析體系('none');
分析體系.v2 = 分析體系('v2');

export default 分析體系;

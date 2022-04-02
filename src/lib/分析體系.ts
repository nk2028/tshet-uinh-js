import { 音韻地位 } from './音韻地位';

const 端知組對應 = {};
for (const pair of ['端知', '透徹', '定澄', '泥孃']) {
  const [t, tr] = [...pair];
  端知組對應[t] = tr;
  端知組對應[tr] = t;
}
const 精章組日母到莊組孃母 = {};
for (const triplet of ['精莊章', '清初昌', '從崇常', '心生書', '邪俟船', '日孃日']) {
  const [s, sr, sj] = [...triplet];
  精章組日母到莊組孃母[s] = sr;
  精章組日母到莊組孃母[sj] = sr;
}

function 適配v2(地位: 音韻地位): 音韻地位 {
  const is = (...x: Parameters<音韻地位['屬於']>) => 地位.屬於(...x);

  // 呼

  // TODO 中立韻、脣音呼

  // 灰咍嚴凡
  let draft: Parameters<音韻地位['調整']>[0] = 地位.判斷([
    ['咍韻 脣音', { 韻: '灰' }],
    ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
    ['嚴韻 脣音', { 韻: '凡', 呼: null }],
  ]);
  draft && (地位 = 地位.調整(draft));

  // 重紐

  // TODO 重紐八韻

  // 清韻
  is`清韻 重紐B類` && (地位 = 地位.調整({ 韻: '庚', 重紐: null }));

  // 類隔

  // 端知
  if (地位.描述 !== '定開三脂去' && is`端組 二三等 非 (庚韻 二等 或 麻韻 三等) 或 知組 一四等`) {
    地位 = 地位.調整({ 母: 端知組對應[地位.母] });
  }

  // 蟹三平上
  if (is`(章組 或 日以云母) 齊灰咍韻 平上聲`) {
    draft = is`齊韻` ? { 韻: '祭' } : { 韻: '廢', 呼: is`灰韻` ? '合' : '開' };
    draft.等 = '三';
    地位 = 地位.調整(draft);
  }

  // 精章二等
  if (is`(精章組 或 日母) 二等`) {
    地位 = 地位.調整({ 母: 精章組日母到莊組孃母[地位.母] });
  }

  // 齒音及云母其他類隔
  if (is`莊組 一四等 或 (章組 或 日以云母) 非 三等`) {
    throw new Error(`rejected ${地位.描述}: 非法類隔`);
  }

  return 地位;
}

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

分析體系.none = 分析體系('none');
分析體系.v2 = 分析體系('v2');

export default 分析體系;

import { 音韻地位 } from './音韻地位';
import { 必為合口的韻, 必為開口的韻, 重紐母, 重紐韻, 開合中立的韻 } from './音韻屬性搭配';

const 端知組對應 = {};
for (const pair of ['端知', '透徹', '定澄', '泥孃']) {
  const [t, tr] = [...pair];
  端知組對應[t] = tr;
  端知組對應[tr] = t;
}
const 齒音二等到莊組孃母 = {};
for (const triplet of ['精莊章', '清初昌', '從崇常', '心生書', '邪俟船', '日孃日']) {
  const [s, sr, sj] = [...triplet];
  齒音二等到莊組孃母[s] = sr;
  齒音二等到莊組孃母[sj] = sr;
}

function 適配v2(strict = false): (地位: 音韻地位) => 音韻地位 {
  return function (地位: 音韻地位) {
    const is = (...x: Parameters<音韻地位['屬於']>) => 地位.屬於(...x);
    const 調整 = (x: Parameters<音韻地位['調整']>[0], msg: string | (() => string)) => {
      const res = 地位.調整(x);
      if (strict) throw new Error(`${typeof msg === 'function' ? msg() : msg} (note: try ${res.描述})`);
      return (地位 = res);
    };

    // 呼
    if (必為開口的韻.includes(地位.韻)) {
      if (!is`開口 或 (脣音 開合中立)`) throw new Error('呼 should be 開');
    } else if (必為合口的韻.includes(地位.韻)) {
      if (!is`合口 或 (脣音 開合中立)`) throw new Error('呼 should be 合');
    }
    if ([...'幫滂並明'].includes(地位.母) || 開合中立的韻.includes(地位.韻)) {
      地位.呼 && 調整({ 呼: null }, 'unexpected 呼');
    }

    // 灰咍嚴凡
    let draft: Parameters<音韻地位['調整']>[0] = 地位.判斷([
      ['咍韻 脣音', { 韻: '灰' }],
      ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
      ['嚴韻 脣音', { 韻: '凡', 呼: null }],
    ]);
    draft && 調整(draft, () => `unexpected ${地位.韻}韻 with ${地位.母}母`);

    // 重紐
    if (重紐韻.includes(地位.韻)) {
      // 重紐八韻
      if (!重紐母.includes(地位.母)) {
        地位.重紐 && 調整({ 重紐: null }, 'unexpected 重紐');
      }
    } else if (is`清韻`) {
      // 清韻
      is`重紐A類` && 調整({ 重紐: null }, 'unexpected 重紐');
      is`重紐B類` && 調整({ 韻: '庚', 重紐: null }, 'unexpected 清韻B類');
    } else if (is`陽蒸幽韻`) {
      // 陽A、蒸B、幽B（幽A > 幽）
      if (is`幽韻 A類`) {
        調整({ 重紐: null }, `幽韻 does not need A類`);
      } else if (!is`不分重紐` && 地位.重紐 === (is`陽韻` ? 'B' : 'A')) {
        throw new Error(`unexpected ${地位.韻}韻${地位.重紐}類`);
      }
    } else {
      !is`不分重紐` && 調整({ 重紐: null }, 'unexpected 重紐');
    }

    // 類隔
    if (地位.描述 !== '定開三脂去' && is`端組 二三等 非 (庚韻 二等 或 麻韻 三等) 或 知組 一四等`) {
      // 端知
      調整({ 母: 端知組對應[地位.母] }, 'unexpected 端知類隔');
    } else if (is`(章組 或 日以云母) 齊灰咍韻 平上聲`) {
      // 蟹三平上
      draft = is`齊韻` ? { 韻: '祭' } : { 韻: '廢', 呼: is`灰韻` ? '合' : '開' };
      draft.等 = '三';
      調整(draft, 'unexpected 齒音類隔');
    } else if (is`(精章組 或 日母) 二等`) {
      // 精章日二等
      調整({ 母: 齒音二等到莊組孃母[地位.母] }, 'unexpected 齒音類隔');
    } else if (is`莊組 一四等 或 (章組 或 日以云母) 非 三等`) {
      // 齒音及云母其他類隔
      throw new Error(`rejected ${地位.描述}: 非法類隔`);
    }

    return 地位;
  };
}

// TODO 暫未參數化
export function 分析體系(config?: string): (x: 音韻地位) => 音韻地位 {
  switch (config) {
    case undefined:
    case 'v2':
      return 適配v2();
    case 'v2Strict':
      return 適配v2(true);
    case 'raw':
      return x => x;
    // TODO pliaj
  }
  throw new Error(`unknown preset: ${config}`);
}

分析體系.raw = 分析體系('raw');
分析體系.v2 = 分析體系('v2');
分析體系.v2Strict = 分析體系('v2Strict');

export default 分析體系;

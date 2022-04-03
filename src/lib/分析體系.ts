import { 必為合口的韻, 必為開口的韻, 重紐母, 重紐韻, 開合中立的韻 } from './聲韻搭配';
import { 音韻地位 } from './音韻地位';

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

// TODO 暫未參數化
export function 適配分析體系(分析體系 = 'v2'): (地位: 音韻地位) => 音韻地位 {
  if (分析體系 === 'raw') {
    return x => x;
  }

  let base: string;
  let strict = false;
  switch (分析體系) {
    case 'v1':
      base = 'v1';
      break;
    case 'v2Strict':
      base = 'v2';
      strict = true;
      break;
    case 'v2Nonstrict':
      base = 'v2';
      break;
    case 'v2':
      base = 'v2';
      break;
    // TODO pliaj
    default:
      throw new Error(`unknown 分析體系: ${分析體系}`);
  }

  const 選項 = {
    重紐_清韻: base === 'v1',
    重紐_陽蒸幽韻: base === 'v2',
    類隔_端知: base === 'v2' ? '庚二麻三' : false,
    類隔_章云以日蟹攝平上: base === 'v2' ? '三等' : '一四等',
    類隔_二等視為莊組: base === 'v2' ? '精章日' : '精組',
    類隔_允許其他: base === 'v1' || 分析體系 === 'v2Nonstrict',
    類隔_匣三: base === 'v2',
    類隔_云非三: base === 'v2' ? 'reject' : false,
  };

  return function (地位) {
    const is = (...x: Parameters<音韻地位['屬於']>) => 地位.屬於(...x);

    const errors: string[] = [];
    const 調整 = (x: Parameters<音韻地位['調整']>[0], msg: string | (() => string)) => {
      const res = 地位.調整(x);
      if (strict) {
        errors.push(typeof msg === 'function' ? msg() : msg);
      }
      return (地位 = res);
    };

    // 呼

    // 指定開合韻
    if (必為開口的韻.includes(地位.韻)) {
      if (!is`開口 或 (脣音 開合中立)`) throw new Error('呼 should be 開');
    } else if (必為合口的韻.includes(地位.韻)) {
      if (!is`合口 或 (脣音 開合中立)`) throw new Error('呼 should be 合');
    }

    // 脣音、中立韻
    if ([...'幫滂並明'].includes(地位.母) || 開合中立的韻.includes(地位.韻)) {
      地位.呼 && 調整({ 呼: null }, 'unexpected 呼');
    }

    // 灰咍嚴凡
    const draft: Parameters<音韻地位['調整']>[0] = 地位.判斷([
      ['咍韻 脣音', { 韻: '灰' }],
      ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
      ['嚴韻 脣音', { 韻: '凡', 呼: null }],
    ]);
    draft && 調整(draft, () => `unexpected ${地位.韻}韻 with ${地位.母}母`);

    // 重紐
    if (is`清韻`) {
      // 清韻（全聲母）
      if (!地位.重紐) {
        選項.重紐_清韻 && 重紐母.includes(地位.母) && 調整({ 重紐: 'A' }, '清韻 needs 重紐');
      } else if (is`重紐A類`) {
        !選項.重紐_清韻 && 調整({ 重紐: null }, '清韻 does not need A類');
      } else if (is`重紐B類`) {
        !選項.重紐_清韻 && 調整({ 韻: '庚', 重紐: null }, '清韻B類 should be 庚韻三等');
      }
    } else if (重紐母.includes(地位.母)) {
      // 重紐八韻（鈍音）不需處理
      if (地位.重紐 && is`陽蒸幽韻`) {
        // 陽蒸幽韻（鈍音）
        if (is`陽蒸韻` && 地位.重紐 !== (is`蒸韻` ? 'B' : 'A')) {
          throw new Error(`unexpected ${地位.韻}韻${地位.重紐}類`);
        }
        !選項.重紐_陽蒸幽韻 && 調整({ 重紐: null }, '重紐 should be null');
        is`幽韻 重紐A類` && 調整({ 重紐: null }, '幽韻 does not need A類');
      } else if (地位.重紐 && !重紐韻.includes(地位.韻)) {
        // 其他韻（鈍音）
        throw new Error('重紐 should be null');
      }
    } else {
      if (重紐韻.includes(地位.韻)) {
        // 重紐八韻（銳音）
        地位.重紐 && 調整({ 重紐: null }, 'unexpected 重紐');
      } else if (地位.重紐) {
        // 其他（銳音）
        throw new Error('重紐 should be null');
      }
    }

    // 類隔

    if (地位.描述 !== '定開三脂去' && is`端組 二三等 或 知組 一四等`) {
      // 端知
      if (!(選項.類隔_端知 === '庚二麻三' && is`庚韻 二等 或 麻韻 三等`)) {
        調整({ 母: 端知組對應[地位.母] }, '端知類隔');
      }
    } else if (is`(章組 或 日以云母) 祭廢齊灰咍韻 平上聲`) {
      // 蟹三平上
      let draft;
      if (選項.類隔_章云以日蟹攝平上 === '三等' && is`一四等`) {
        draft = is`齊韻` ? { 韻: '祭' } : { 韻: '廢', 呼: is`灰韻` ? '合' : '開' };
        draft.等 = '三';
      } else if (選項.類隔_章云以日蟹攝平上 === '一四等' && is`三等`) {
        draft = is`祭韻` ? { 韻: '齊' } : is`開口` ? { 韻: '咍', 呼: null } : { 韻: '灰', 呼: null };
      }
      draft && 調整(draft, '齒音類隔');
    } else if (is`二等 ${選項.類隔_二等視為莊組 === '精章日' ? '精章組 或 日母' : '精組'}`) {
      // 精章日二等
      調整({ 母: 齒音二等到莊組孃母[地位.母] }, '齒音類隔');
    }

    if (is`匣母 三等`) {
      !選項.類隔_匣三 && 調整({ 母: '云', 重紐: null }, 'unexpected 匣母三等');
    } else if (is`云母 非 三等`) {
      if (選項.類隔_云非三 === 'reject') {
        throw new Error('unexpected 云母非三等');
      } else if (!選項.類隔_云非三) {
        調整({ 母: '匣' }, 'unexpected 云母非三等');
      }
    } else if (!選項.類隔_允許其他 && is`莊組 一四等 或 (章組 或 日以母) 非 三等`) {
      // 齒音及云母其他類隔
      throw new Error(`rejected ${地位.描述}: unable to normalize 類隔`);
    }

    if (errors.length) {
      throw new Error(`${errors.join('; ')} (try ${地位.描述} instead)`);
    }
    return 地位;
  };
}

適配分析體系.raw = 適配分析體系('raw');
適配分析體系.v2 = 適配分析體系('v2');
適配分析體系.v2Strict = 適配分析體系('v2Strict');
適配分析體系.v2Nonstrict = 適配分析體系('v2Nonstrict');
適配分析體系.v1 = 適配分析體系('v1');

export default 適配分析體系;

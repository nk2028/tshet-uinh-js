import type { 任意音韻地位, 部分音韻屬性, 音韻地位 } from './音韻地位';
import { 各等韻, 呼韻搭配, 所有, 鈍音母, 陰聲韻 } from './音韻屬性常量';

const 脣音母 = [...'幫滂並明'];
const 鈍音除云母 = 鈍音母.filter(x => x !== '云');
const 重紐八韻 = [...'支脂祭真仙宵侵鹽'];

/**
 * 將其他家音韻地位（六要素）轉換為 ext 體系之地位，或驗證地位是否符合 ext 體系（符合則表示可用其建立 `音韻地位` 對象）。
 *
 * 支持的其他體系：
 * - v2/v2ext（Qieyun.js v0.13）
 * - poem 字音表
 *   - v1（Qieyun.js v0.12）
 * - 韻典
 * - 有女全字表
 *   - 古韻表
 *
 * 導入時的處理，僅需兼容以上體系內的標準地位，除此之外的體系不會完整支持。
 */
export function 導入或驗證(某體系音韻地位: 任意音韻地位, is導入: boolean, 原體系脣音分寒桓歌戈?: boolean): 任意音韻地位 {
  if (!is導入) {
    if (原體系脣音分寒桓歌戈 !== undefined) {
      throw new Error('unexpected argument 原地位脣音分寒桓歌戈 when is導入 = false');
    }
    原體系脣音分寒桓歌戈 = true; // ext 不分韻，但支持用「呼」為「開」來區分
  } else if (原體系脣音分寒桓歌戈 == null) {
    throw new Error('require argument 原地位脣音分寒桓歌戈 when is導入 = true');
  }
  const 原地位 = {
    母: 某體系音韻地位.母 ?? null,
    呼: 某體系音韻地位.呼 || null,
    等: 某體系音韻地位.等 ?? null,
    重紐: 某體系音韻地位.重紐 || null,
    韻: 某體系音韻地位.韻 ?? null,
    聲: 某體系音韻地位.聲 ?? null,
  };
  let 地位 = 原地位;

  const errors: string[] = [];
  let unmodified = true;
  const 調整 = (x: 部分音韻屬性, msg: string) => {
    if (!is導入) errors.push(msg);
    unmodified = false;
    return (地位 = { ...地位, ...x });
  };
  const reject = (msg: string) => {
    const 原地位str =
      '{ ' + (['母', '呼', '等', '重紐', '韻', '聲'] as const).map(k => `${k}${JSON.stringify(原地位[k])}`).join(', ') + ' }';
    throw new Error(`Invalid 音韻屬性 ${原地位str}: ${msg}`);
  };

  // 別家地位用字
  // NOTE 僅列出支持的若干家體系的標準用字，不任意添加其他異體、異名
  {
    const 韻別名: Record<string, string> = { 眞: '真', 欣: '殷' };
    if (Object.prototype.hasOwnProperty.call(韻別名, 地位.韻)) {
      調整({ 韻: 韻別名[地位.韻] }, 'variant character');
    }
    const 母別名: Record<string, string> = { 娘: '孃', 群: '羣' };
    if (Object.prototype.hasOwnProperty.call(母別名, 地位.母)) {
      調整({ 母: 母別名[地位.母] }, 'variant character');
    }
  }

  // 基本屬性
  for (const 屬性 of ['母', '等', '韻', '聲'] as const) {
    if (!所有[屬性].includes(地位[屬性])) {
      if (屬性 === '韻' && ['諄', '桓', '戈'].includes(地位.韻)) {
        continue;
      }
      reject(`no such ${屬性}`);
    }
  }
  for (const 屬性 of ['呼', '重紐'] as const) {
    if (!(地位[屬性] === null || 所有[屬性].includes(地位[屬性]))) {
      reject(`no such ${屬性}`);
    }
  }
  // 諄桓戈韻
  if (['諄', '桓', '戈'].includes(地位.韻)) {
    if (!(地位.呼 === '合' || (地位.呼 === '開' && 地位.韻 === '戈' && 地位.等 === '三'))) {
      // NOTE 支持的體系中，使用「諄」「桓」「戈」韻的，「呼」均不為 `null`，故不需考慮脣音
      reject(`unexpected 呼 for ${地位.韻}韻`);
    }
    if (地位.韻 === '諄') {
      if (地位.重紐 === 'B') {
        reject(`unexpected 諄韻B類`);
      }
      const 重紐 = 地位.重紐 ?? (鈍音母.includes(地位.母) ? 'A' : null);
      調整({ 韻: '真', 重紐 }, `諄 should be 真${重紐 ?? ''}`);
    } else {
      const 韻 = 地位.韻 === '桓' ? '寒' : '歌';
      調整({ 韻 }, `${地位.韻} should be ${韻}`);
    }
  }

  // 等搭配
  for (const 韻等 of ['一三', '二三'] as const) {
    if (各等韻[韻等].includes(地位.韻) && !韻等.includes(地位.等)) {
      reject('unexpected or ambiguous 等');
    }
  }
  for (const 韻等 of 所有.等 as Iterable<keyof typeof 各等韻>) {
    if (各等韻[韻等].includes(地位.韻) && 地位.等 !== 韻等) {
      調整({ 等: 韻等 }, `unexpected ${地位.韻}韻${地位.等}等`);
    }
  }
  // 重紐限三等
  if (地位.重紐 && 地位.等 !== '三') {
    reject('unexpected 重紐');
  }

  // 必要呼、重紐
  if (!地位.呼 && !脣音母.includes(地位.母) && 呼韻搭配.開合.includes(地位.韻)) {
    reject('need 呼');
  }
  if (!地位.重紐 && 鈍音除云母.includes(地位.母) && 重紐八韻.includes(地位.韻)) {
    reject('need 重紐');
  }

  // 陰聲韻限平上去
  if (地位.聲 === '入' && 陰聲韻.includes(地位.韻)) {
    reject(`unexpected 入聲 for ${地位.韻}韻`);
  }

  // 類隔
  // 云母A類
  if (地位.母 === '云' && 地位.重紐 === 'A') {
    調整({ 母: '匣' }, `云母 should be 匣母 for A類`);
  }

  // 呼搭配
  if (脣音母.includes(地位.母)) {
    if (地位.韻 === '清' && 地位.呼 === '合' && 地位.重紐 !== 'B') {
      調整({ 呼: null, 重紐: 'B' }, '合口 should be B類 for 清韻脣音');
    } else if (地位.呼 && !(原體系脣音分寒桓歌戈 && 地位.呼 === '開' && ['寒', '歌'].includes(地位.韻))) {
      調整({ 呼: null }, '呼 should be null for 脣音');
    }
  } else if (['虞', '幽'].includes(地位.韻) && 地位.呼 === null) {
    const 呼 = 地位.韻 === '虞' ? '合' : '開';
    調整({ 呼 }, `呼 should be ${呼} for ${地位.韻}韻`);
  } else if (呼韻搭配.中立.includes(地位.韻)) {
    if (地位.呼) {
      調整({ 呼: null }, `呼 should be null for ${地位.韻}韻`);
    }
  } else {
    for (const 呼 of ['開', '合'] as const) {
      if (呼韻搭配[呼].includes(地位.韻) && 地位.呼 !== 呼) {
        reject(`呼 should be ${呼} for ${地位.韻}韻`);
      }
    }
  }

  // 重紐搭配
  if (地位.等 === '三') {
    if (鈍音母.includes(地位.母)) {
      // 鈍音
      if (['庚', '清'].includes(地位.韻)) {
        if (!地位.重紐) {
          const 重紐 = 地位.韻 === '庚' ? 'B' : 'A';
          調整({ 重紐 }, `重紐 should be ${重紐} for ${地位.韻}韻`);
        } else if (地位.重紐 === 'A' && 地位.韻 === '庚') {
          reject('unexpected 庚韻A類');
        }
      } else if (['蒸', '幽', '麻', '陽'].includes(地位.韻)) {
        if (地位.韻 === '陽' && 地位.重紐 === 'B') {
          reject('unexpected 陽韻B類');
        }
      } else if (地位.重紐 && !重紐八韻.includes(地位.韻)) {
        reject(`unexpected 重紐 for ${地位.韻}韻`);
      }
    } else if (地位.重紐) {
      // 銳音
      if (地位.韻 === '清' || 重紐八韻.includes(地位.韻)) {
        調整({ 重紐: null }, '重紐 should be null for 銳音');
      } else {
        reject('unexpected 重紐');
      }
    }
  }

  if (errors.length) {
    const { 母, 呼, 等, 重紐, 韻, 聲 } = 地位;
    reject(`${errors.join('; ')} (try ${母}${呼 || ''}${等}${重紐 || ''}${韻}${聲} instead)`);
  }
  return unmodified ? 某體系音韻地位 : 地位;
}

// 正則化

const 端知精莊對應: Record<string, string> = {};
for (const [t, tr] of ['端知', '透徹', '定澄', '泥孃', '精莊', '清初', '從崇', '心生', '邪俟']) {
  端知精莊對應[t] = tr;
  端知精莊對應[tr] = t;
}

export class 正則化Error extends Error {
  constructor(public 正則地位: 音韻地位 | null, ...args: Parameters<ErrorConstructor>) {
    super(...args);
    this.name = '正則化Error';
  }
}

function make例外data(entries: [string, string][]): { 字: Map<string, Set<string>>; 地位: Set<string> } {
  const by字: Map<string, Set<string>> = new Map();
  const by地位: Set<string> = new Set();
  for (const [chs, 地位cond] of entries) {
    by地位.add(地位cond);
    for (const ch of chs) {
      if (ch === '/') {
        continue;
      }
      if (!by字.has(ch)) {
        by字.set(ch, new Set());
      }
      by字.get(ch).add(地位cond);
    }
  }
  return { 字: by字, 地位: by地位 };
}

function has地位(conds: Iterable<string>, 地位: 音韻地位) {
  for (const cond of conds) {
    if (cond.startsWith('=') ? 地位.描述 === cond.slice(1) : 地位.屬於(cond)) {
      return true;
    }
  }
  return false;
}

const 所有例外 = {
  端組: make例外data([
    ['打/咑', '=端開二庚上'],
    ['地坔埅埊墬嶳灺𠏂𡍑𡏇𡑸𡒰𡒴𡒿𡓬𤅴𨹛𨻐𪒉墬/哋/𢓧', '=定開三脂去'],
    ['爹/嗲/𪦕', '端母 開口 三等 麻韻 平上聲'],
    ['箉䈆簤', '定母 開口 佳皆韻 平上聲'],
    ['丟丢厾銩铥', '=端開三幽平'],
  ]),
  陽A: make例外data([['𩦠𫠌', '=並三A陽上']]),
};

const 所有策略 = {
  一律正則化: false,
  保守正則化: true,
};

export interface 正則化選項 {
  字頭?: string;
  策略?: string;
  is端組例外字?: boolean | null;
  is陽A例外字?: boolean | null;
  保留咍韻脣音?: boolean;
}

function is正則化例外(name: '端組' | '陽A', 選項: 正則化選項, 地位: 音韻地位): boolean | null {
  const 直接指定 = 選項[`is${name}例外字`];
  if (直接指定 != null) {
    return !!直接指定;
  }
  const { 字頭 } = 選項;
  if (字頭 === '') {
    return has地位(所有例外[name].地位, 地位);
  } else if (typeof 字頭 === 'string') {
    return has地位(所有例外[name].字.get(字頭) ?? [], 地位);
  } else if (字頭 !== undefined) {
    throw new Error(`invalid 字頭: expected string, got ${字頭}`);
  }
  const { 策略 } = 選項;
  if (策略 == null) {
    return null;
  } else if (Object.prototype.hasOwnProperty.call(所有策略, 策略)) {
    return 所有策略[策略 as keyof typeof 所有策略];
  } else {
    throw new Error(`invalid 策略: ${策略}`);
  }
}

export function 正則化或驗證(地位: 音韻地位, is正則化: boolean, 字頭或選項: string | null | 正則化選項): [音韻地位, string | null] {
  if (typeof 字頭或選項 === 'string') {
    if (字頭或選項 !== '' && Object.prototype.hasOwnProperty.call(所有策略, 字頭或選項)) {
      字頭或選項 = { 策略: 字頭或選項 };
    } else {
      字頭或選項 = { 字頭: 字頭或選項 };
    }
  } else if (typeof 字頭或選項 !== 'object') {
    throw new Error(`expected string or object, got ${字頭或選項}`);
  }
  const 選項 = {
    保留咍韻脣音: !!字頭或選項.保留咍韻脣音,
    is端組例外字: is正則化例外('端組', 字頭或選項, 地位),
    is陽A例外字: is正則化例外('陽A', 字頭或選項, 地位),
  };

  const 原地位 = 地位;
  const is = (...xs: Parameters<音韻地位['屬於']>) => 地位.屬於(...xs);

  const errors: string[] = [];
  let unmodified = true;
  const 調整 = (x: 部分音韻屬性, msg: string) => {
    if (!is正則化) errors.push(msg);
    unmodified = false;
    return (地位 = 地位.調整(x));
  };
  const reject = (msg: string) => {
    throw new 正則化Error(null, `cannot normalize 音韻地位 ${原地位.描述}: ${msg}`);
  };

  // 類隔
  if (is`匣母 三等`) {
    // XXX 云母合法組合視作云母
    reject(`unexpected 匣母三等`);
  } else if (is`端組 二三等`) {
    if (選項.is端組例外字 === null) {
      reject(`端組二三等 is marginal, need more info (e.g. 字頭) to determine whether it is an exception`);
    } else if (!選項.is端組例外字) {
      調整({ 母: 端知精莊對應[地位.母] }, `端組類隔`);
    }
  } else if (is`知莊組 一四等`) {
    調整({ 母: 端知精莊對應[地位.母] }, `知莊組類隔`);
  } else if (is`精組 二等`) {
    調整({ 母: 端知精莊對應[地位.母] }, '精組類隔');
  } else if (is`(章組 或 云以日母) 非 三等`) {
    if (is`齊灰咍韻 平上聲`) {
      調整({ 等: '三', 韻: 地位.韻 === '齊' ? '祭' : '廢' }, '章組云以日母蟹攝類隔');
    } else {
      reject(`cannot normalize ${地位.母}母${地位.等}等 automatically`);
    }
  }
  // 臻韻
  if (is`莊組 開口 真殷韻`) {
    調整({ 韻: '臻' }, `${地位.韻}韻 should be 臻韻 for 莊組開口`);
  } else if (is`臻韻 非 莊組`) {
    reject(`unexpected ${地位.母}母臻韻`);
  }

  // 呼
  // 寒歌韻脣音開口
  if (地位.呼 && 脣音母.includes(地位.母)) {
    調整({ 呼: null }, '呼 should be null for 脣音');
  }
  {
    // 灰咍嚴凡、無法與脣音搭配的韻
    const draft = 地位.判斷<部分音韻屬性 | 'reject'>([
      ['脣音 之魚殷痕韻', 'reject'],
      [選項.保留咍韻脣音 ? false : '咍韻 脣音', { 韻: '灰' }],
      ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
      ['嚴韻 脣音', { 韻: '凡' }],
    ]);
    if (draft === 'reject') {
      reject(`unexpected 脣音${地位.韻}韻`);
    } else if (draft) {
      調整(draft, `unexpected ${地位.母}母${地位.韻}韻`);
    }
  }

  // 重紐：清
  if (地位.韻 === '清' && 地位.重紐 === 'B') {
    調整({ 韻: '庚' }, `清 should be 庚 for B類`);
  }
  // 重紐：陽
  if (地位.韻 === '陽' && 地位.重紐 && !選項.is陽A例外字) {
    reject('unexpected 陽韻A類');
  }

  if (errors.length) {
    throw new 正則化Error(地位, `非正則地位 ${原地位.描述}: ${errors.join('; ')} (try ${地位.描述} instead)`);
  }
  // 容許的邊緣組合（弱非正則地位）
  const warnings: string[] = [];
  // 云母開口
  if (is`云母 開口 非 宵幽侵鹽韻`) {
    warnings.push('云母開口 is marginal');
  } else if (is`羣邪俟母 非 三等`) {
    warnings.push(`${地位.母}母非三等 is marginal`);
  }
  return [unmodified ? 原地位 : 地位, warnings.length ? `弱非正則地位 ${地位.描述}: ` + warnings.join('; ') : null];
}

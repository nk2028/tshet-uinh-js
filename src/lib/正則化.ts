import type { 任意音韻地位, 部分音韻屬性 } from './音韻地位';
import { 各等韻, 呼韻限制, 所有, 鈍音母 } from './音韻屬性常量';

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
  const 調整 = (x: 部分音韻屬性, msg: string | (() => string)) => {
    if (!is導入) errors.push(typeof msg === 'function' ? msg() : msg);
    unmodified = false;
    return (地位 = { ...地位, ...x });
  };
  const reject = (msg: string) => {
    throw new Error(`Invalid 音韻屬性 ${JSON.stringify(原地位)}: ${msg}`);
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
  if (!地位.呼 && !脣音母.includes(地位.母) && 呼韻限制.開合.includes(地位.韻)) {
    reject('need 呼');
  }
  if (!地位.重紐 && 鈍音除云母.includes(地位.母) && 重紐八韻.includes(地位.韻)) {
    reject('need 重紐');
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
      調整({ 呼: null }, '呼 should be null 脣音');
    }
  } else if (['虞', '幽'].includes(地位.韻) && 地位.呼 === null) {
    const 呼 = 地位.韻 === '虞' ? '合' : '開';
    調整({ 呼 }, `呼 should be ${呼} for ${地位.韻}韻`);
  } else if (呼韻限制.中立.includes(地位.韻)) {
    if (地位.呼) {
      調整({ 呼: null }, `呼 should be null for ${地位.韻}韻`);
    }
  } else {
    for (const 呼 of ['開', '合'] as const) {
      if (呼韻限制[呼].includes(地位.韻) && 地位.呼 !== 呼) {
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

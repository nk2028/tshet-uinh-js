import { 必為合口的韻, 必為開口的韻, 重紐母, 重紐韻, 開合中立的韻, 開合皆有的韻 } from './聲韻搭配';
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

/**
 * 將任意來源的地位正則化為 v2ext 體系。
 *
 * 該體系包含所有（已支持的）其他體系需要的對立，且標準化，故其他適配均以 v2ext 作為中介體系。
 */
function 適配v2ext(地位: 音韻地位, 嚴格 = false, 原地位脣音寒歌默認開合?: '開' | '合'): 音韻地位 {
  const 原描述 = 地位.描述;

  const is = (...xs: Parameters<音韻地位['屬於']>) => 地位.屬於(...xs);
  const reject = (msg: string) => {
    throw new Error(`rejected ${原描述}: ${msg}`);
  };
  const errors = [];
  const 調整 = (x: Parameters<音韻地位['調整']>[0], msg: string | (() => string)) => {
    if (嚴格) errors.push(typeof msg === 'function' ? msg() : msg);
    return (地位 = 地位.調整(x));
  };

  // 呼：指定開合的韻
  if (必為開口的韻.includes(地位.韻)) {
    if (!is`開口 或 (脣音 開合中立)`) reject('呼 should be 開');
  } else if (必為合口的韻.includes(地位.韻)) {
    if (!is`合口 或 (脣音 開合中立)`) reject('呼 should be 合');
  }

  // 呼：脣音、中立韻
  if (地位.呼 && is`幫組 寒歌韻`) {
    if (!原地位脣音寒歌默認開合) {
      reject('呼 is ambiguous for 脣音寒歌韻, set 原地位脣音寒歌默認開合 to "開" or "合" to normalize it');
    } else if (原地位脣音寒歌默認開合 === '開' && is`合口`) {
      reject(`unexpected 合口 for 脣音${地位.韻}韻`);
    } else if (!(原地位脣音寒歌默認開合 === '合' && is`開口`)) {
      調整({ 呼: null }, 'unexpected 呼');
    }
  } else if (開合中立的韻.includes(地位.韻) || is`幫組`) {
    地位.呼 && 調整({ 呼: null }, 'unexpected 呼');
  }

  // 呼：灰咍嚴凡（不限制）

  // 類隔：云母A類（v2ext 惟一限制的組合）
  // 置於重紐之前是因為可能影響其判定
  if (is`云母 重紐A類`) {
    調整({ 母: '匣' }, 'unexpected 云母A類');
  }

  // 重紐
  if (重紐母.includes(地位.母)) {
    // 鈍音
    // 重紐八韻：不需處理
    if (is`清幽韻`) {
      is`重紐A類` && 調整({ 重紐: null }, `${地位.韻}韻 does not need A類`);
    } else if (is`陽蒸韻`) {
      if (地位.重紐 && !is`陽韻 脣音 重紐A類 或 蒸韻 重紐B類`) {
        reject(`unexpected ${地位.韻}韻${地位.重紐}類`);
      }
    } else if (地位.重紐 && !重紐韻.includes(地位.韻)) {
      reject('unexpected 重紐');
    }
  } else if (重紐韻.includes(地位.韻) || is`清韻`) {
    // 銳音重紐韻（含清韻）
    地位.重紐 && 調整({ 重紐: null }, 'unexpected 重紐');
  } else if (地位.重紐) {
    // 銳音其他
    reject('unexpected 重紐');
  }

  if (errors.length) {
    reject(`${errors.join('; ')} (try ${地位.描述} instead)`);
  }

  return 地位;
}

// 僅內部使用，暫不打算開放給用戶調節
type 分析體系參數 = {
  呼_中立韻: false | 'requirePoem' | 'requireYtenx';
  呼_脣音: false | '寒歌開' | 'require切韻' | 'require廣韻';
  呼_輕脣均合口: boolean;
  呼_灰咍嚴凡對立: boolean;
  重紐_非重紐母: false | 'require';
  重紐_清韻: boolean | 'require';
  重紐_陽蒸幽韻: boolean;
  類隔_端知: boolean | '個別';
  類隔_章云以日蟹攝平上: true | '三等' | '一四等';
  類隔_精章日二等: boolean | '章組日母';
  類隔_匣三: boolean | '云A';
  類隔_云非三: 'reject' | boolean;
  類隔_其他: 'reject' | true;
};

const PRESETS: { [體系: string]: 分析體系參數 } = {
  v2: {
    呼_中立韻: false,
    呼_脣音: false,
    呼_輕脣均合口: false,
    呼_灰咍嚴凡對立: false,
    重紐_非重紐母: false,
    重紐_清韻: false,
    重紐_陽蒸幽韻: true,
    類隔_端知: '個別',
    類隔_章云以日蟹攝平上: '三等',
    類隔_精章日二等: false,
    類隔_匣三: true,
    類隔_云非三: 'reject',
    類隔_其他: 'reject',
  },
  v2ext: {
    呼_中立韻: false,
    呼_脣音: '寒歌開',
    呼_輕脣均合口: false,
    呼_灰咍嚴凡對立: true,
    重紐_非重紐母: false,
    重紐_清韻: true,
    重紐_陽蒸幽韻: true,
    類隔_端知: true,
    類隔_章云以日蟹攝平上: true,
    類隔_精章日二等: true,
    類隔_匣三: true,
    類隔_云非三: true,
    類隔_其他: true,
  },
  poem: {
    呼_中立韻: 'requirePoem',
    呼_脣音: 'require切韻',
    呼_輕脣均合口: true,
    呼_灰咍嚴凡對立: false,
    重紐_非重紐母: 'require',
    重紐_清韻: 'require',
    重紐_陽蒸幽韻: false,
    類隔_端知: false,
    類隔_章云以日蟹攝平上: '一四等',
    類隔_精章日二等: '章組日母',
    類隔_匣三: '云A',
    類隔_云非三: false,
    類隔_其他: true,
  },
  ytenx: {
    呼_中立韻: 'requireYtenx',
    呼_脣音: 'require廣韻',
    呼_輕脣均合口: false,
    呼_灰咍嚴凡對立: true,
    重紐_非重紐母: false,
    重紐_清韻: false,
    重紐_陽蒸幽韻: false,
    類隔_端知: true,
    類隔_章云以日蟹攝平上: '一四等',
    類隔_精章日二等: true,
    類隔_匣三: false,
    類隔_云非三: true,
    類隔_其他: true,
  },
};

PRESETS.v2lenient = Object.assign({}, PRESETS.v2, {
  類隔_云非三: true,
  類隔_其他: true,
});

function isRequire(option: null | boolean | string): boolean | string {
  return typeof option === 'string' && option.startsWith('require');
}

/**
 * 用於 [[`適配分析體系`]] 指定選項。
 */
export type 適配分析體系選項 = {
  /**
   * 執行驗證而非轉換：若地位不是指定體系的正則形式，則直接拋異常。
   */
  嚴格?: boolean;
  /**
   * 指明適配前的原地位所屬體系，其寒歌韻脣音是依《廣韻》分韻而分開合。
   *
   * 例如「明開寒入」地位，在韻典是「䔾」（《廣韻》在寒韻），在 poem《廣韻字音表》是「末」，需要區分。
   *
   * 可選值如下：
   * - `null`：不處理帶開合的脣音寒歌韻，若原地位寒歌韻脣音有開合則拋異常
   * - `'開'`：原地位脣音寒歌韻均為「開」，若遇到「合」會拋異常。
   * - `'合'`：原地位脣音寒歌韻默認為「合」少數為「開」。
   */
  原地位脣音寒歌默認開合?: null | '開' | '合';
};

/**
 * 由 [[`適配分析體系`]] 創建。用於將給定的音韻地位，依創建該函數時指定的適配體系來正則化。
 *
 * @throws 對於邊緣地位，若符合以下條件之一：
 *
 * - 創建該函數時指定了 `嚴格` 選項，且地位並非該體系的正則形式
 * - 對該體系而言過於不合法而不確定如何處理
 * - 沒有統一處理方式，僅能依具體的字修正其地位
 *
 * 則會拋出異常。
 */
export type 適配函數 = (地位: 音韻地位) => 音韻地位;

/**
 * 創建一個音韻地位分析體系的正則化函數，用於將其他體系的音韻地位正則化至指定體系的形式（如舌齒音是否標記重紐、是否認可端知類隔等）。
 *
 * 注意該功能僅用於轉換音韻地位的格式，不用於處理各家資料對個別小韻、個別字的審音差異。
 *
 * 目前支持的體系（及衍生體系）有：
 * * `v2`（推荐）：Qieyun.js (0.13 起）預設體系，預設資料等均基於該體系
 *   * `v2ext`：基於 `v2` 但亦可無歧義表示本表所列（除 `raw` 外）全部體系中存在的各種必要對立，這些體系轉換到 v2ext 無信息損失，故可作為跨體系使用 Qieyun.js 時的通用中介體系
 *   * `v2lenient`：同 `v2`，但允許齒音、云以母跨等搭配（詳見下述體系對比）
 * * `poem`：poem《廣韻字音表》所用體系
 * * `ytenx`：韻典網所用體系
 *   * `kyonh`（暫緩支持）：早期韻典網所用體系
 * * `raw`：特殊「體系」，指不對音韻地位格式作限制，可用於表達韻書、韻圖資料的粗分析結果等
 *
 * 其中，`v2`、`v2ext`、`v2Lenient`、`raw` 四種已經預先創建好，可用 `適配分析體系.v2`、`適配分析體系.v2ext` 等方法直接取得。
 *
 * 體系間的主要區別（衍生體系與所基於體系相同時省略不列）：
 * * 呼：
 *   * 所有體系（不含 raw 下同）均不允許僅為開/合的韻的 `呼` 與韻不搭配
 *   * v2 對脣音及開合中立的韻均不標開合，`呼` 為 `null`
 *     * v2ext 額外允許脣音寒、歌韻的 `呼` 可以為 `開`，用於表示依《廣韻》分韻歸於開口的小韻
 *   * v2 亦會將咍、嚴韻脣音正則化為灰、凡韻，並將凡韻非脣音正則化為嚴韻
 *   * ytenx、poem 則對所有地位均標上「開」或「合」，兩者不同在於：
 *     * ytenx 在寒、歌韻區分脣音開合口
 *     * 冬韻 ytenx 標為「開」poem 標為「合」
 *     * 所有輕脣韻（包括開合中立韻）脣音 poem 均標為「合」
 * * 重紐：
 *   * v2、ytenx 僅對分重紐的聲母標 AB 類
 *   * v2(ext) 允許幽、蒸韻 B 類及脣音陽韻 A 類
 *   * kyonh、poem 對重紐八韻所有聲母均標 AB 類
 *     * poem 額外給清韻標 AB 類
 * * 類隔：
 *   * 端知：
 *     * 所有體系均允許「地」
 *     * v2 額外認可「爹」「打」，其餘視為混切
 *     * poem 除「地」外均視為混切
 *     * ytenx 認可跨等搭配
 *   * 章組云以日母蟹攝平上：
 *     * v2 視為（寄於齊灰咍韻的）祭廢韻平上聲
 *     * ytenx、poem 等均視為跨等搭配
 *     * v2ext 兩種均允許
 *   * 云匣母
 *     * v2 認可匣母三等，不認可云母非三等
 *     * ytenx 認可云母非三等，而匣母三等視為混切之云母
 *     * poem 兩者均視為混切，但允許以「云母A類」對立
 *     * v2ext 則均允許，惟「云母A類」會被正則化為「匣母A類」
 *   * 齒音跨等搭配：
 *     * v2 對精章組、日母二等視為混切之莊組、孃母，不允許其他跨等搭配
 *       * v2Lenient 同 v2 但允許其他跨等搭配
 *       * v2 不允許其他是因為該類小韻幾乎均為誤切或訛字，僅可個別考證處理，無法自動正則化；v2Lenient 則將其保持原樣
 *     * poem 認可章組以日母非三等，視精組二等為混切之莊組
 *     * v2ext、ytenx 允許任意搭配
 *
 * @param 分析體系 指定體系的名稱。若名稱後帶 `Strict`，則相當於將 `選項.嚴格` 設定為 `true`
 * @param 選項
 *
 * @example
 * ```typescript
 * > const { 音韻地位, 適配分析體系 } = Qieyun;
 * > const v2 = 適配分析體系.v2; // 或用 適配分析體系("v2");
 * > v2(音韻地位.from描述('幫開B清入')).描述
 * '幫三庚入'
 * > v2(音韻地位.from描述('並開咍上')).描述
 * '並一灰上'
 * > const v2extStrict = 適配分析體系("v2", { 嚴格: true });
 * > v2extStrict(音韻地位.from描述('幫B清入'))
 * '幫三B清入'
 * ```
 */
export function 適配分析體系(分析體系 = 'v2', 選項?: 適配分析體系選項): 適配函數 {
  if (分析體系 === 'raw') {
    if (選項 !== undefined) {
      throw new Error('體系 "raw" does not support 選項');
    }
    return x => x;
  }
  const { 原地位脣音寒歌默認開合 = null } = 選項 ?? {};
  let { 嚴格 = false } = 選項 ?? {};
  if (分析體系.endsWith('Strict') && PRESETS[分析體系.slice(0, -6)]) {
    分析體系 = 分析體系.slice(0, -6);
    嚴格 = true;
  }

  if (分析體系 === 'v2ext') {
    return 地位 => 適配v2ext(地位, 嚴格, 原地位脣音寒歌默認開合);
  }

  const 參數 = PRESETS[分析體系];
  if (!參數) {
    throw new Error(`unknown 分析體系: ${分析體系}`);
  }

  return function (地位) {
    const 原地位 = 地位;
    const 原描述 = 地位.描述;
    // 先將「呼」「重紐」（及一處類隔）依 v2ext 正則化，以方便處理其他類隔
    地位 = 適配v2ext(地位, false, 原地位脣音寒歌默認開合);
    const v2ext描述 = 地位.描述;

    const is = (...xs: Parameters<音韻地位['屬於']>) => 地位.屬於(...xs);
    const reject = (msg: string) => {
      throw new Error(`rejected ${原描述}${v2ext描述 === 原描述 ? '' : ` (original: ${v2ext描述})`}: ${msg}`);
    };
    const errors = [];
    const 調整 = (x: Parameters<音韻地位['調整']>[0], msg: string | (() => string)) => {
      if (嚴格) errors.push(typeof msg === 'function' ? msg() : msg);
      return (地位 = 地位.調整(x));
    };

    // 類隔

    if (地位.描述 !== '定開三脂去' && is`端組 二三等 或 知組 一四等`) {
      // 端知
      if (!參數.類隔_端知 || (參數.類隔_端知 === '個別' && !is`庚韻 二等 或 麻韻 三等 或 佳韻`)) {
        調整({ 母: 端知組對應[地位.母] }, '端知類隔');
      }
    } else if (is`(章組 或 云以日母) 祭廢齊灰咍韻 平上聲`) {
      // 蟹三平上
      let draft;
      if (參數.類隔_章云以日蟹攝平上 === '三等' && is`一四等`) {
        draft = is`齊韻` ? { 韻: '祭' } : { 韻: '廢', 呼: is`灰韻` ? '合' : '開' };
        draft.等 = '三';
      } else if (參數.類隔_章云以日蟹攝平上 === '一四等' && is`三等`) {
        draft = is`祭韻` ? { 韻: '齊', 等: '四' } : is`開口` ? { 韻: '咍', 等: '一' } : { 韻: '灰', 等: '一' };
      }
      draft && 調整(draft, '齒音類隔');
    } else if (is`二等 (精章組 或 日母)`) {
      // 精章日二等
      if (!參數.類隔_精章日二等 || (參數.類隔_精章日二等 === '章組日母' && is`精組`)) {
        調整({ 母: 齒音二等到莊組孃母[地位.母] }, '齒音類隔');
      }
    } else if (參數.類隔_匣三 !== true && is`匣母 三等`) {
      調整({ 母: '云', 重紐: 參數.類隔_匣三 === '云A' ? 'A' : null }, 'unexpected 匣母三等');
    }
    // 這裡前後分離，因為前面蟹攝調整可能會改變云母所在等
    if (is`云母 非 三等`) {
      if (參數.類隔_云非三 === 'reject') {
        reject('unexpected 云母非三等');
      } else if (!參數.類隔_云非三) {
        調整({ 母: '匣' }, 'unexpected 云母非三等');
      }
    } else if (參數.類隔_其他 === 'reject' && is`莊組 一四等 或 (章組 或 日以母) 非 三等`) {
      // 齒音及云母其他類隔
      reject(`cannot normalize ${地位.母}母${地位.等}等 automatically`);
    }

    // 呼

    // 灰咍嚴凡
    if (!參數.呼_灰咍嚴凡對立) {
      const draft: Parameters<音韻地位['調整']>[0] = 地位.判斷([
        ['咍韻 脣音', { 韻: '灰' }],
        ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
        ['嚴韻 脣音', { 韻: '凡', 呼: null }],
      ]);
      draft && 調整(draft, () => `unexpected ${地位.韻}韻 with ${地位.母}母`);
    }

    // 中立韻
    if (isRequire(參數.呼_中立韻) && 開合中立的韻.includes(地位.韻)) {
      let 呼;
      if (isRequire(參數.呼_脣音) || !is`脣音`) {
        if (參數.呼_中立韻 === 'requirePoem') {
          呼 = is`冬虞韻` ? '合' : '開';
        } else if (參數.呼_中立韻 === 'requireYtenx') {
          呼 = is`虞韻` ? '合' : '開';
        }
      }
      if (呼 && 參數.呼_輕脣均合口 && is`脣音 輕脣韻`) {
        呼 = '合';
      }
      呼 && 調整({ 呼 }, `呼 should be ${呼}`);
    }

    // 脣音（非中立韻
    if (isRequire(參數.呼_脣音) && !地位.呼 && is`脣音`) {
      // `!地位.呼` 用於排除中立韻（已處理過了）以及 v2ext 下已經是寒歌開的地位
      let 呼;
      if (必為開口的韻.includes(地位.韻)) {
        呼 = '開';
      } else if (必為合口的韻.includes(地位.韻)) {
        呼 = '合';
      } else if (開合皆有的韻.includes(地位.韻)) {
        if (is`三等`) {
          呼 = is`輕脣韻` ? '合' : '開';
        } else if (is`二四等`) {
          呼 = '開';
        } else {
          呼 = 參數.呼_脣音 === 'require廣韻' && is`寒歌韻` ? '合' : '開';
        }
      }
      呼 && 調整({ 呼 }, `呼 should be ${呼}`);
    } else if (!參數.呼_脣音 && is`脣音`) {
      地位.呼 && 調整({ 呼: null }, 'unexpected 呼');
    }

    // 重紐

    if (is`清韻`) {
      if (!地位.重紐) {
        if (參數.重紐_清韻 === 'require' && (參數.重紐_非重紐母 === 'require' || 重紐母.includes(地位.母))) {
          調整({ 重紐: is`知莊組 或 云母` ? 'B' : 'A' }, '清韻 needs 重紐');
        }
      } else {
        // B類
        !參數.重紐_清韻 && 調整({ 韻: '庚', 重紐: null }, '清韻B類 should be 庚韻三等');
      }
    } else if (is`陽蒸幽韻`) {
      !參數.重紐_陽蒸幽韻 && 調整({ 重紐: null }, '重紐 should be null');
    } else if (參數.重紐_非重紐母 === 'require' && !地位.重紐 && 重紐韻.includes(地位.韻)) {
      const 重紐 = is`知莊組 或 云母` ? 'B' : 'A';
      調整({ 重紐 }, `重紐 should be ${重紐}`);
    }

    if (嚴格 && !地位.等於(原地位)) {
      if (errors.length) {
        reject(`${errors.join('; ')} (try ${地位.描述} instead)`);
      } else {
        reject(`try ${地位.描述} instead`);
      }
    }
    return 地位;
  };
}

適配分析體系.raw = 適配分析體系('raw');

適配分析體系.v2 = 適配分析體系('v2');
適配分析體系.v2Strict = 適配分析體系('v2Strict');
適配分析體系.v2lenient = 適配分析體系('v2lenient');

適配分析體系.v2ext = 適配分析體系('v2ext');
適配分析體系.v2extFromYtenx = 適配分析體系('v2ext', { 原地位脣音寒歌默認開合: '合' });
適配分析體系.v2extFromPoem = 適配分析體系('v2ext', { 原地位脣音寒歌默認開合: '開' });

export default 適配分析體系;

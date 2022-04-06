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

// 暫時僅內部使用
type 分析體系參數 = {
  重紐_清韻: boolean | 'require';
  重紐_陽蒸幽韻: boolean;
  類隔_端知: boolean | '庚二麻三';
  類隔_章云以日蟹攝平上: null | '三等' | '一四等';
  類隔_精章日二等: boolean | '章組日母';
  類隔_匣三: boolean;
  類隔_云非三: 'reject' | boolean;
  類隔_其他: 'reject' | true;
};

const PRESETS: { [體系: string]: 分析體系參數 } = {
  v2: {
    重紐_清韻: false,
    重紐_陽蒸幽韻: true,
    類隔_端知: '庚二麻三',
    類隔_章云以日蟹攝平上: '三等',
    類隔_精章日二等: false,
    類隔_匣三: true,
    類隔_云非三: 'reject',
    類隔_其他: 'reject',
  },
  v2ext: {
    重紐_清韻: true,
    重紐_陽蒸幽韻: true,
    類隔_端知: true,
    類隔_章云以日蟹攝平上: null,
    類隔_精章日二等: true,
    類隔_匣三: true,
    類隔_云非三: true,
    類隔_其他: true,
  },
  v1: {
    重紐_清韻: 'require',
    重紐_陽蒸幽韻: false,
    類隔_端知: false,
    類隔_章云以日蟹攝平上: '一四等',
    類隔_精章日二等: '章組日母',
    類隔_匣三: false,
    類隔_云非三: false,
    類隔_其他: true,
  },
};

PRESETS.v2lenient = Object.assign({}, PRESETS.v2, {
  類隔_云非三: true,
  類隔_其他: true,
});

export type 分析體系選項 = {
  嚴格?: boolean;
  原地位脣音寒歌默認開合?: null | '開' | '合';
};

/**
 * 創建一個音韻地位分析體系的正則化函數，用於將其他體系的音韻地位正則化至指定體系的形式（如舌齒音是否標記重紐、是否認可端知類隔等）。
 *
 * 注意該功能僅用於轉換音韻地位的格式，不用於處理各家資料對個別小韻、個別字的審音差異。
 *
 * 目前支持的體系（及衍生體系）有：
 * * `v2`：Qieyun.js (0.13 起）預設體系，預設資料等均基於該體系
 *   * `v2ext`：基於 `v2` 但亦可無歧義表示下方所列（除 `raw` 外）諸體系中存在的各種對立，可以視作除 `raw` 外所有體系的 base class
 *   * `v2lenient`：同 `v2`，但允許齒音、云以母跨等搭配（詳見下述體系對比）
 * * `poem`：poem《廣韻字音表》所用體系
 *   * `v1`：舊版 Qieyun.js（0.12）所用體系，基於 `poem` 但移除了脣音與開合中立韻的開合，以及舌齒音重紐
 * * `ytenx`：韻典網所用體系
 *   * `kyonh`（暫緩支持）：早期韻典網所用體系
 * * `raw`：特殊「體系」，指不對音韻地位格式作限制，可用於表達韻書、韻圖資料的粗分析結果等
 *
 * 其中，`v2`、`v2ext`、`v2Lenient`、`raw` 四種已經預先創建好，可用 `適配分析體系.v2`、`適配分析體系.v2ext` 等方法直接取得。
 *
 * 體系間的主要區別：
 * * 呼：
 *   * 所有體系（不含 `raw` 下同）均不允許僅為開/合的韻的 `呼` 與韻不搭配
 *   * v2、v1 對脣音及開合中立的韻均不標開合，`呼` 為 `null`
 *     * v2ext 額外允許脣音寒、歌韻的 `呼` 可以為 `開`，用於表示依《廣韻》分韻歸於開口的小韻
 *   * v2、v1 亦會將咍、嚴韻脣音正則化為灰、凡韻，並將凡韻非脣音正則化為嚴韻
 *   * ytenx、poem 則對所有地位均標上「開」或「合」，兩者不同在於：
 *     * ytenx 在寒、歌韻區分脣音開合口
 *     * 冬韻 ytenx 標為「開」poem 標為「合」
 *     * 所有輕脣韻（包括開合中立韻）脣音 poem 均標為「合」
 * * 重紐：
 *   * v2、v1、ytenx 僅對分重紐的聲母標 AB 類
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
 *     * v1、ytenx 認可云母非三等，而匣母三等視為混切之云母
 *     * poem 兩者均視為混切，但允許以「云母A類」對立
 *     * v2ext 則均允許，惟「云母A類」會被正則化為「匣母A類」
 *   * 齒音跨等搭配：
 *     * v2 對精章組、日母二等視為混切之莊組、孃母，不允許其他跨等搭配
 *       * v2Lenient 同 v2 但允許其他跨等搭配
 *       * v2 不允許其他是因為該類小韻幾乎均為誤切或訛字，僅可個別考證處理，無法自動正則化；v2Lenient 則將其保持原樣
 *     * v2 額外視章組、日母二等為混切之莊組、孃母
 *     * v2ext、ytenx 允許任意搭配
 *
 * @param 分析體系 指定體系的名稱
 * 若名稱後帶 `Strict`，則相當於將 `選項.嚴格` 設定為 `true`
 * @param 選項
 * @returns 函數，用於將給定的音韻地位參數，依所適配體系來正則化
 *
 * 注意：該正則化函數對「過於不合法而不確定如何處理」或「沒有統一處理方式，僅能依具體的字修正其地位」的邊緣地位，會拋出異常。
 *
 * @example
 * ```typescript
 * > const { 音韻地位, 適配分析體系 } = Qieyun;
 * > const v2 = 適配分析體系.v2; // 或用 適配分析體系("v2")
 * > v2(音韻地位.from描述('幫開B清入')).描述;
 * '幫三清入'
 * > v2(音韻地位.from描述('並開開上')).描述;
 * '並一灰上'
 * ```
 */
export function 適配分析體系(分析體系 = 'v2', 選項?: 分析體系選項): (地位: 音韻地位) => 音韻地位 {
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
      if (!參數.類隔_端知 || (參數.類隔_端知 === '庚二麻三' && !is`庚韻 二等 或 麻韻 三等`)) {
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
    } else if (is`匣母 三等`) {
      !參數.類隔_匣三 && 調整({ 母: '云', 重紐: null }, 'unexpected 匣母三等');
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
    const draft: Parameters<音韻地位['調整']>[0] = 地位.判斷([
      ['咍韻 脣音', { 韻: '灰' }],
      ['凡韻 非 脣音', { 韻: '嚴', 呼: '開' }],
      ['嚴韻 脣音', { 韻: '凡', 呼: null }],
    ]);
    draft && 調整(draft, () => `unexpected ${地位.韻}韻 with ${地位.母}母`);

    // 中立韻（v2、v1 暫不需要）

    // 脣音
    if (is`脣音`) {
      地位.呼 && 調整({ 呼: null }, 'unexpected 呼');
    }

    // 重紐

    if (is`清韻`) {
      if (!地位.重紐) {
        參數.重紐_清韻 === 'require' && 重紐母.includes(地位.母) && 調整({ 重紐: 'A' }, '清韻 needs 重紐');
      } else {
        // B類
        !參數.重紐_清韻 && 調整({ 韻: '庚', 重紐: null }, '清韻B類 should be 庚韻三等');
      }
    } else if (is`陽蒸幽韻`) {
      !參數.重紐_陽蒸幽韻 && 調整({ 重紐: null }, '重紐 should be null');
    }
    // 重紐八韻非鈍音（v2、v1 暫不需要）

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

適配分析體系.v1 = 適配分析體系('v1');

export default 適配分析體系;

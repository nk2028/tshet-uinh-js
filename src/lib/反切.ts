import { defaultLogger } from './StringLogger';
import { 音韻地位 } from './音韻地位';
import { 呼韻搭配, 等母搭配, 等韻搭配, 鈍音母 } from './音韻屬性常量';

const 重紐韻 = [...'支脂祭真仙宵清侵鹽'];

const generate呼 = (母: string, 組: string | null, 韻: string, 上字呼: string | null, 下字呼: string | null, 下字組: string | null) => {
  let 呼;
  if (組 === '幫' || 呼韻搭配.中立.includes(韻)) {
    呼 = null;
  } else if (呼韻搭配.開.includes(韻)) {
    呼 = '開';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為開口，故被切字為開口`);
  } else if (呼韻搭配.合.includes(韻)) {
    呼 = '合';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為合口，故被切字為合口`);
  } else if (母 === '云') {
    呼 = '合';
    defaultLogger.log('被切字為云母，云母為合口，故被切字為合口');
  } else {
    if (上字呼 === '開' && 下字呼 === '開') {
      呼 = '開';
      defaultLogger.log('反切上下字均為開口，故被切字為開口');
    } else if (下字呼 === '合') {
      呼 = '合';
      defaultLogger.log('反切下字為合口，故被切字為合口');
    } else if (上字呼 === '合' && 下字組 === '幫') {
      呼 = '合';
      defaultLogger.log('反切上字為合口，下字為幫組，故被切字為合口');
    } else {
      呼 = '開合';
      defaultLogger.log('無法確定被切字的呼，可能為開口或合口');
    }
  }
  return 呼 === '開合' ? [...呼] : [呼];
};

const generate等 = (母: string, 韻: string, 上字等: string, 下字等: string) => {
  let 等;
  if (等韻搭配.一.includes(韻)) {
    等 = '一';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為一等，故被切字為一等`);
  } else if (等韻搭配.二.includes(韻)) {
    等 = '二';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為二等，故被切字為二等`);
  } else if (等韻搭配.三.includes(韻)) {
    等 = '三';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為三等，故被切字為三等`);
  } else if (等韻搭配.四.includes(韻)) {
    等 = '四';
    defaultLogger.log(`被切字為${韻}韻，${韻}韻為四等，故被切字為四等`);
  } else if (下字等 === '三') {
    等 = '三';
    defaultLogger.log('反切下字為三等，故被切字為三等');
  } else if (上字等 !== '三' && 下字等 !== '三') {
    defaultLogger.log('反切上下字均非三等，故被切字非三等');
    if (等韻搭配.一三.includes(韻)) {
      等 = '一';
      defaultLogger.log(`被切字為${韻}韻，${韻}韻為一等或三等，而被切字非三等，故被切字為一等`);
    } else if (等韻搭配.二三.includes(韻)) {
      等 = '二';
      defaultLogger.log(`被切字為${韻}韻，${韻}韻為二等或三等，而被切字非三等，故被切字為二等`);
    } else {
      throw Error('Unreachable');
    }
  } else {
    if (等韻搭配.一三.includes(韻)) {
      defaultLogger.log(`被切字為${韻}韻，${韻}韻為一等或三等，故被切字為一等或三等`);
      if (等母搭配.二三.includes(母) || 等母搭配.三.includes(母)) {
        等 = '三';
        defaultLogger.log(`被切字為${母}母，${母}母不可能為一等，故被切字為三等`);
      } else if (等母搭配.一二四.includes(母)) {
        等 = '一';
        defaultLogger.log(`被切字為${母}母，${母}母不可能為三等，故被切字為一等`);
      } else {
        等 = '一三';
        defaultLogger.log('無法確定被切字的等，可能為一等或三等');
      }
    } else if (等韻搭配.二三.includes(韻)) {
      defaultLogger.log(`被切字為${韻}韻，${韻}韻為二等或三等，故被切字為二等或三等`);
      if (等母搭配.一三四.includes(母) || 等母搭配.三.includes(母)) {
        等 = '三';
        defaultLogger.log(`被切字為${母}母，${母}母不可能為二等，故被切字為三等`);
      } else if (等母搭配.一二四.includes(母)) {
        等 = '二';
        defaultLogger.log(`被切字為${母}母，${母}母不可能為三等，故被切字為二等`);
      } else {
        等 = '二三';
        defaultLogger.log('無法確定被切字的等，可能為二等或三等');
      }
    } else {
      throw Error('Unreachable');
    }
  }
  return 等 === '一三' || 等 === '二三' ? [...等] : [等];
};

// 類需特殊處理，故寫法與上述兩函式不同
const rawGenerate類 = (
  下字音韻地位: 音韻地位,
  母: string,
  組: string | null,
  韻: string,
  上字類: string | null,
  呼: string | null,
  等: string,
): { 類: string | null; 解釋: string | null } => {
  if (等 !== '三' || !鈍音母.includes(母)) {
    return { 類: null, 解釋: null };
  } else if (韻 === '幽') {
    if (組 === '幫') {
      return { 類: 'B', 解釋: '被切字為幽韻，且為幫組，故被切字為 B 類' }; // 幫組、「惆」、「烋」爲 B 類
    } else {
      return { 類: 'A', 解釋: '被切字為幽韻，且非幫組，故被切字為 A 類' };
    }
  } else if (韻 === '蒸') {
    if (組 === '幫' || 呼 === '合') {
      return { 類: 'B', 解釋: '被切字為蒸韻，且為幫組或合口，故被切字為 B 類' }; // 幫組、合口、「抑」爲 B 類
    } else {
      return { 類: 'C', 解釋: '被切字為蒸韻，且非幫組或合口，故被切字為 C 類' };
    }
  } else if (韻 === '庚') {
    return { 類: 'B', 解釋: '被切字為庚韻，故被切字為 B 類' };
  } else if (!重紐韻.includes(韻)) {
    return { 類: 'C', 解釋: '被切字非重紐韻，故被切字為 C 類' }; // TODO: confirm this
  } else if (母 === '云') {
    return { 類: 'B', 解釋: '被切字為云母，故被切字為 B 類' };
  } else {
    if (上字類 === 'A') {
      return { 類: 'A', 解釋: '反切上字為 A 類，故被切字為 A 類' };
    } else if (上字類 === 'B') {
      return { 類: 'B', 解釋: '反切上字為 B 類，故被切字為 B 類' };
    } else if (下字音韻地位.屬於('A類 或 以母 或 精組')) {
      return { 類: 'A', 解釋: '反切下字為 A 類、以母或精組，故被切字為 A 類' };
    } else if (下字音韻地位.屬於('B類 或 云母')) {
      return { 類: 'B', 解釋: '反切下字為 B 類或云母，故被切字為 B 類' };
    } else {
      return { 類: 'AB', 解釋: '無法確定被切字的類，可能為 A 類或 B 類' };
    }
  }
};

export const 執行反切 = (上字音韻地位: 音韻地位, 下字音韻地位: 音韻地位): 音韻地位[] => {
  const { 母, 組, 呼: 上字呼, 等: 上字等, 類: 上字類 } = 上字音韻地位;
  defaultLogger.log(`反切上字為${母}母，故被切字為${母}母`);

  const { 韻, 聲, 呼: 下字呼, 組: 下字組, 等: 下字等 } = 下字音韻地位;
  defaultLogger.log(`反切下字為${韻}韻${聲}聲，故被切字為${韻}韻${聲}聲`);

  const 所有呼 = generate呼(母, 組, 韻, 上字呼, 下字呼, 下字組);
  const 所有等 = generate等(母, 韻, 上字等, 下字等);

  // 在特定呼、特定等的條件下處理類
  const res: 音韻地位[] = [];

  const 條件_解釋: { 條件: string; 解釋: string | null }[] = [];
  const 忽略: string[] = [];

  for (const 呼 of 所有呼) {
    for (const 等 of 所有等) {
      const 條件 =
        所有呼.length > 1 || 所有等.length > 1
          ? `當呼為${呼}口、等為${等}等時，`
          : 所有呼.length > 1
            ? `當呼為${呼}口時，`
            : 所有等.length > 1
              ? `當等為${等}等時，`
              : '';
      const { 類, 解釋 } = rawGenerate類(下字音韻地位, 母, 組, 韻, 上字類, 呼, 等);
      條件_解釋.push({ 條件, 解釋 });
      for (const 類_ of 類 === 'AB' ? ['A', 'B'] : [類]) {
        try {
          res.push(new 音韻地位(母, 呼, 等, 類_, 韻, 聲));
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          忽略.push(`忽略無效的音韻地位「${母}${呼 ?? ''}${等}${類 ?? ''}${韻}${聲}」，原因：${msg}`);
        }
      }
    }
  }

  if (條件_解釋.length > 0) {
    // 如果所有解釋均相同，則只需輸出一次解釋，無需輸出條件
    if (條件_解釋.every(({ 解釋 }) => 解釋 === 條件_解釋[0].解釋)) {
      const { 解釋 } = 條件_解釋[0];
      if (解釋 !== null) {
        defaultLogger.log(解釋);
      }
    }
    // 如果解釋不全相同，則對每個條件，都輸出對應的解釋
    else {
      for (const { 條件, 解釋 } of 條件_解釋) {
        if (解釋 !== null) {
          defaultLogger.log(`${條件}${解釋}`);
        }
      }
    }
  }

  for (const msg of 忽略) {
    defaultLogger.log(msg);
  }

  return res;
};

import { defaultLogger } from './StringLogger';
import { 音韻地位 } from './音韻地位';
import { 呼韻搭配, 等母搭配, 等韻搭配, 鈍音母 } from './音韻屬性常量';

const 重紐韻 = '支脂祭真仙宵清侵鹽';

export const 執行反切 = (上字音韻地位: 音韻地位, 下字音韻地位: 音韻地位): 音韻地位[] => {
  const { 母, 組, 呼: 上字呼, 等: 上字等, 類: 上字類 } = 上字音韻地位;
  defaultLogger.log(`反切上字為${母}母，故被切字為${母}母`);

  const { 韻, 聲, 呼: 下字呼, 組: 下字組, 等: 下字等 } = 下字音韻地位;
  defaultLogger.log(`反切下字為${韻}韻${聲}聲，故被切字為${韻}韻${聲}聲`);

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

  let 類;
  if (等 !== '三' || !鈍音母.includes(母)) {
    類 = null;
  } else if (韻 === '幽') {
    if (組 === '幫') {
      類 = 'B'; // 幫組、「惆」、「烋」爲 B 類
      defaultLogger.log('被切字為幽韻，且為幫組，故被切字為 B 類');
    } else {
      類 = 'A';
      defaultLogger.log('被切字為幽韻，且非幫組，故被切字為 A 類');
    }
  } else if (韻 === '蒸') {
    if (組 === '幫' || 呼 === '合') {
      類 = 'B'; // 幫組、合口、「抑」爲 B 類
      defaultLogger.log('被切字為蒸韻，且為幫組或合口，故被切字為 B 類');
    } else {
      類 = 'C';
      defaultLogger.log('被切字為蒸韻，且非幫組或合口，故被切字為 C 類');
    }
  } else if (韻 === '庚') {
    類 = 'B';
    defaultLogger.log('被切字為庚韻，故被切字為 B 類');
  } else if (!重紐韻.includes(韻)) {
    類 = 'C';
    defaultLogger.log('被切字非重紐韻，故被切字為 C 類'); // TODO: confirm this
  } else if (母 === '云') {
    類 = 'B';
    defaultLogger.log('被切字為云母，故被切字為 B 類');
  } else {
    if (上字類 === 'A') {
      類 = 'A';
      defaultLogger.log('反切上字為 A 類，故被切字為 A 類');
    } else if (上字類 === 'B') {
      類 = 'B';
      defaultLogger.log('反切上字為 B 類，故被切字為 B 類');
    } else if (下字音韻地位.屬於('A類 或 以母 或 精組')) {
      類 = 'A';
      defaultLogger.log('反切下字為 A 類、以母或精組，故被切字為 A 類');
    } else if (下字音韻地位.屬於('B類 或 云母')) {
      類 = 'B';
      defaultLogger.log('反切下字為 B 類或云母，故被切字為 B 類');
    } else {
      類 = 'AB';
      defaultLogger.log('無法確定被切字的類，可能為 A 類或 B 類');
    }
  }

  const res = [];
  for (const 呼_ of 呼 === '開合' ? ['開', '合'] : [呼]) {
    for (const 類_ of 類 === 'AB' ? ['A', 'B'] : [類]) {
      for (const 等_ of 等 === '一三' ? ['一', '三'] : 等 === '二三' ? ['二', '三'] : [等]) {
        try {
          res.push(new 音韻地位(母, 呼_, 等_, 類_, 韻, 聲));
        } catch (e) {
          void e;
          // throw e;
          // return null;
          void 0;
        }
      }
    }
  }
  return res;
};

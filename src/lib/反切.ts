import { 音韻地位 } from './音韻地位';
import { 呼韻搭配, 等母搭配, 等韻搭配, 鈍音母 } from './音韻屬性常量';

const 重紐韻 = '支脂祭真仙宵清侵鹽';

export const 執行反切 = (上字音韻地位: 音韻地位, 下字音韻地位: 音韻地位): 音韻地位[] => {
  const { 母, 組, 呼: 上字呼, 等: 上字等, 類: 上字類 } = 上字音韻地位;
  const { 韻, 聲, 呼: 下字呼, 組: 下字組, 等: 下字等 } = 下字音韻地位;

  let 呼;
  if (組 === '幫') {
    呼 = null;
  } else if (呼韻搭配.中立.includes(韻)) {
    呼 = null;
  } else if (呼韻搭配.開.includes(韻)) {
    呼 = '開';
  } else if (呼韻搭配.合.includes(韻)) {
    呼 = '合';
  } else if (母 === '云') {
    呼 = '合';
  } else {
    if (上字呼 === '開' && 下字呼 === '開') {
      呼 = '開';
    } else if (下字呼 === '合') {
      呼 = '合';
    } else if (上字呼 === '合' && 下字組 === '幫') {
      呼 = '合'; // 上字為合口，下字為幫組
    } else {
      呼 = '開合'; // 無法確定，可能為開口或合口
    }
  }

  let 等;
  if (等韻搭配.一.includes(韻)) {
    等 = '一';
  } else if (等韻搭配.二.includes(韻)) {
    等 = '二';
  } else if (等韻搭配.三.includes(韻)) {
    等 = '三';
  } else if (等韻搭配.四.includes(韻)) {
    等 = '四';
  } else if (下字等 === '三') {
    等 = '三'; // 下字為三等，故被切字為三等
  } else if (上字等 !== '三' && 下字等 !== '三') {
    if (等韻搭配.一三.includes(韻)) {
      等 = '一';
    } else if (等韻搭配.二三.includes(韻)) {
      等 = '二'; // 二三等韻
    } else {
      throw Error('Unreachable');
    }
  } else {
    if (等韻搭配.一三.includes(韻)) {
      if (等母搭配.二三.includes(母) || 等母搭配.三.includes(母)) {
        等 = '三'; // 不可能為一等
      } else if (等母搭配.一二四.includes(母)) {
        等 = '一'; // 不可能為三等
      } else {
        等 = '一'; // 實際為一、三，此處僅選取第一個
      }
    } else if (等韻搭配.二三.includes(韻)) {
      if (等母搭配.一三四.includes(母) || 等母搭配.三.includes(母)) {
        等 = '三'; // 不可能為二等
      } else if (等母搭配.一二四.includes(母)) {
        等 = '二'; // 不可能為二等
      } else {
        等 = '二'; // 實際為二、三，此處僅選取第一個
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
    } else {
      類 = 'A';
    }
  } else if (韻 === '蒸') {
    if (組 === '幫' || 呼 === '合') {
      類 = 'B'; // 幫組、合口、「抑」爲 B 類
    } else {
      類 = 'C';
    }
  } else if (韻 === '庚') {
    類 = 'B';
  } else if (!重紐韻.includes(韻)) {
    類 = 'C';
  } else if (母 === '云') {
    類 = 'B';
  } else {
    if (上字類 === 'A') {
      類 = 'A';
    } else if (上字類 === 'B') {
      類 = 'B';
    } else if (下字音韻地位.屬於('A類 或 以母 或 精組')) {
      類 = 'A'; // 下字為重紐A類、以母或精組，被切字為重紐A類
    } else if (下字音韻地位.屬於('B類 或 云母')) {
      類 = 'B'; // 下字為重紐B類或云母，被切字為重紐B類
    } else {
      類 = 'AB'; // 可能為 A 類或 B 類
    }
  }

  const res = [];
  for (const 呼_ of 呼 === '開合' ? [...呼] : [呼]) {
    for (const 類_ of 類 === 'AB' ? [...類] : [類]) {
      try {
        res.push(new 音韻地位(母, 呼_, 等, 類_, 韻, 聲));
      } catch (e) {
        void e;
        // throw e;
        // return null;
        void 0;
      }
    }
  }
  return res;
};

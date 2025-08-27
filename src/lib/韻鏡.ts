import { cache } from 'decorator-cache-getter';

import { defaultLogger } from './StringLogger';
import { 音韻地位 } from './音韻地位';
import { 等韻搭配, 鈍音母 } from './音韻屬性常量';

const 轉呼 = [null, null, null, ...'開合開合開開合開合開合開合開合開合開合開合開開開合開合開合開合開合開開開開合開合'] as const;
const 母2idx = [...'幫滂並明端透定泥知徹澄孃見溪羣疑精清從心邪章昌船書常莊初崇生俟影曉匣云以來日'] as const;
const 母idx2右位 = [
  1, 2, 3, 4, 5, 6, 7, 8, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22, 23,
] as const;
const 轉名稱列表 = [
  '內轉第一',
  '內轉第二',
  '外轉第三',
  '內轉第四',
  '內轉第五',
  '內轉第六',
  '內轉第七',
  '內轉第八',
  '內轉第九',
  '內轉第十',
  '內轉第十一',
  '內轉第十二',
  '內轉第十三',
  '外轉第十四',
  '外轉第十五',
  '外轉第十六',
  '外轉第十七',
  '外轉第十八',
  '外轉第十九',
  '外轉第二十',
  '外轉第二十一',
  '外轉第二十二',
  '外轉第二十三',
  '外轉第二十四',
  '外轉第二十五',
  '外轉第二十六',
  '內轉第二十七',
  '內轉第二十八',
  '內轉第二十九',
  '外轉第三十',
  '內轉第三十一',
  '內轉第三十二',
  '外轉第三十三',
  '外轉第三十四',
  '外轉第三十五',
  '外轉第三十六',
  '內轉第三十七',
  '內轉第三十八',
  '外轉第三十九',
  '外轉第四十',
  '外轉第四十一',
  '外轉第四十二',
  '外轉第四十三',
] as const;
const 母位置名稱 = [
  null,
  '脣音第一位',
  '脣音第二位',
  '脣音第三位',
  '脣音第四位',
  '舌音第一位',
  '舌音第二位',
  '舌音第三位',
  '舌音第四位',
  '牙音第一位',
  '牙音第二位',
  '牙音第三位',
  '牙音第四位',
  '齒音第一位',
  '齒音第二位',
  '齒音第三位',
  '齒音第四位',
  '齒音第五位',
  '喉音第一位',
  '喉音第二位',
  '喉音第三位',
  '喉音第四位',
  '舌齒音第一位',
  '舌齒音第二位',
] as const;

export class 韻鏡位置 {
  轉號: number;
  上位: number;
  右位: number;

  constructor(轉號: number, 上位: number, 右位: number) {
    if (轉號 < 1 || 轉號 > 43) {
      throw new Error('轉號必須在 1 到 43 之間');
    }
    if (上位 < 1 || 上位 > 16) {
      throw new Error('上位必須在 1 到 16 之間');
    }
    if (右位 < 1 || 右位 > 23) {
      throw new Error('右位必須在 1 到 23 之間');
    }
    this.轉號 = 轉號;
    this.上位 = 上位;
    this.右位 = 右位;
  }

  @cache
  get 轉名稱() {
    return `${轉名稱列表[this.轉號 - 1]}圖`;
  }

  @cache
  get 坐標() {
    const { 轉號, 上位, 右位 } = this;
    return `(${轉號},${上位},${右位})`;
  }

  @cache
  get 韻鏡等() {
    const { 上位 } = this;
    const 韻鏡等 = ((上位 - 1) % 4) + 1;
    return 韻鏡等;
  }

  @cache
  get 韻() {
    const { 轉號, 上位, 右位 } = this;
    return 轉號上位右位2韻(轉號, 上位, 右位);
  }

  @cache
  get 切韻等() {
    const { 轉號, 上位, 右位, 韻鏡等, 韻 } = this;

    if (轉號 === 6 && 上位 === 12 && 右位 === 7) {
      defaultLogger.log(`韻鏡地位 ${this.坐標}（即「地」字）為特殊情況，對應切韻四等`);
      return '四'; // 「地」字為真四等
    }
    if (轉號 === 29 && 上位 === 4 && 右位 === 5) {
      defaultLogger.log(`韻鏡地位 ${this.坐標}（即「爹」字）為特殊情況，對應切韻四等`);
      return '四'; // 「爹」字為真四等
    }
    if (韻鏡等 === 4 && !等韻搭配.四.includes(韻)) {
      defaultLogger.log(`韻鏡四等本應對應切韻四等，但${韻}韻非四等韻，故為假四等真三等，實際為切韻三等`);
      return '三'; // 假四等真三等
    }
    if (韻鏡等 === 2 && ![...等韻搭配.二, ...等韻搭配.二三].includes(韻)) {
      if (12 < 右位 && 右位 <= 17) {
        defaultLogger.log(`韻鏡二等本應對應切韻二等，但${韻}韻非二等韻，故為假二等真三等，實際為切韻三等`);
        return '三'; // 限定為齒音，假二等真三等
      }
      throw new Error('假二等真三等必須為齒音');
    }
    if (轉號 === 33 && ((右位 === 16 && 韻鏡等 === 2) || (右位 === 14 && (上位 === 10 || 上位 === 14)))) {
      defaultLogger.log(`韻鏡二等本應對應切韻二等，但「生」、「省」、「索」、「㵾」、「柵」為特殊情況，屬於莊三化二，故實際為切韻三等`);
      return '三'; // 「生」、「省」、「索」、「㵾」、「柵」莊三化二
    }

    const 韻鏡等漢字 = [...'一二三四'][韻鏡等 - 1];
    const shouldAdd一般情況Str = 韻鏡等 === 2 || 韻鏡等 === 4;
    defaultLogger.log(`韻鏡${韻鏡等漢字}等對應切韻${韻鏡等漢字}等${shouldAdd一般情況Str ? '（一般情況）' : ''}`);
    return 韻鏡等漢字;
  }

  @cache
  get 母() {
    const { 右位, 韻鏡等, 切韻等 } = this;

    // 幫非組
    if (右位 <= 4) {
      const 母 = [...'幫滂並明'][右位 - 1];
      defaultLogger.log(`${母位置名稱[右位]}，對應${母}母`);
      return 母;
    }

    // 端知組
    if (右位 <= 8) {
      // TODO: is 切韻等 correct? can handle 蛭,17,4,15?
      if (切韻等 === '一' || 切韻等 === '四') {
        const 母 = [...'端透定泥'][右位 - 4 - 1];
        defaultLogger.log(`${母位置名稱[右位]}，且為切韻一四等，對應${母}母`);
        return 母;
      }

      const 母 = [...'知徹澄孃'][右位 - 4 - 1];
      defaultLogger.log(`${母位置名稱[右位]}，且為切韻二三等，對應${母}母`);
      return 母;
    }

    // 見組
    if (右位 <= 12) {
      const 母 = [...'見溪羣疑'][右位 - 8 - 1];
      defaultLogger.log(`${母位置名稱[右位]}，對應${母}母`);
      return 母;
    }

    // 齒音
    if (右位 <= 17) {
      if (韻鏡等 === 1 || 韻鏡等 === 4) {
        const 母 = [...'精清從心邪'][右位 - 12 - 1];
        defaultLogger.log(`${母位置名稱[右位]}，且為韻鏡一四等，對應${母}母`);
        return 母;
      }
      if (韻鏡等 === 3) {
        const 母 = [...'章昌船書常'][右位 - 12 - 1]; // TODO: 常船位置
        defaultLogger.log(`${母位置名稱[右位]}，且為韻鏡三等，對應${母}母`);
        return 母;
      }
      if (韻鏡等 === 2) {
        const 母 = [...'莊初崇生俟'][右位 - 12 - 1];
        defaultLogger.log(`${母位置名稱[右位]}，且為韻鏡二等，對應${母}母`);
        return 母;
      }
      throw new Error('invalid 韻鏡等');
    }

    // 喉音
    if (右位 <= 20) {
      const 母 = [...'影曉匣'][右位 - 17 - 1];
      defaultLogger.log(`${母位置名稱[右位]}，對應${母}母`);
      return 母;
    }

    // 喻母
    if (右位 === 21) {
      if (韻鏡等 === 3) {
        defaultLogger.log(`${母位置名稱[右位]}，且為韻鏡三等，對應云母`);
        return '云';
      }
      defaultLogger.log(`${母位置名稱[右位]}，且非韻鏡三等，對應以母`);
      return '以';
    }

    // 舌齒音
    if (右位 <= 23) {
      const 母 = [...'來日'][右位 - 21 - 1];
      defaultLogger.log(`${母位置名稱[右位]}，對應${母}母`);
      return 母;
    }

    throw new Error('invalid 右位');
  }

  @cache
  get 呼() {
    const { 轉號, 轉名稱, 韻, 母 } = this;
    if ([...'幫滂並明'].includes(母) || [...'模侯尤'].includes(韻)) {
      return null;
    }
    const 呼 = 轉呼[轉號 - 1];
    if (呼 !== null) {
      defaultLogger.log(`${轉名稱}對應的呼為${呼}口`);
    }
    return 呼;
  }

  @cache
  get 聲() {
    const { 轉號, 上位 } = this;
    const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
    if ([9, 10, 13, 14].includes(轉號) && raw聲 == '入') {
      defaultLogger.log(`此位置處於入聲位，但第 ${轉號} 轉入聲標註「去聲寄此」，故實際為去聲`);
      return '去'; // 標註「去聲寄此」
    }
    defaultLogger.log(`此位置處於${raw聲}聲位，故為${raw聲}聲`);
    return raw聲;
  }

  @cache
  get 類() {
    const { 韻鏡等, 切韻等, 韻, 母 } = this;
    if (切韻等 !== '三' || !鈍音母.includes(母)) {
      return null;
    }
    if (韻 === '幽') {
      const { 轉號, 上位, 右位 } = this;
      if ([...'幫滂並明'].includes(母) || (轉號 === 37 && 上位 === 4 && 右位 === 10)) {
        defaultLogger.log(`幽韻幫組及「惆」字對應 B 類。注意「飍」、「烋」為 A、B 類對立，「烋」為 B 類，但此處無法區分二者`);
        return 'B'; // 幫組、「惆」為 B 類。注意「飍」、「烋」為 A、B 類對立，「烋」為 B 類，但此處無法區分二者
      }
      defaultLogger.log(`幽韻非幫組且非「惆」字對應 A 類`);
      return 'A';
    }
    if (韻 === '蒸') {
      const { 呼 } = this;
      if ([...'幫滂並明'].includes(母) || 呼 === '合') {
        defaultLogger.log(`蒸韻幫組或合口對應 B 類。注意「憶」、「抑」為 B、C 類對立，「抑」為 B 類，但此處無法區分二者`);
        return 'B'; // 幫組、合口為 B 類。注意「憶」、「抑」為 B、C 類對立，「抑」為 B 類，但此處無法區分二者
      }
      defaultLogger.log(`蒸韻非幫組且非合口對應 C 類`);
      return 'C';
    }
    if (![...'支脂祭真仙宵清侵鹽庚幽'].includes(韻)) {
      defaultLogger.log(`${韻}韻對應 C 類`);
      return 'C';
    }
    if (韻鏡等 === 4) {
      defaultLogger.log(`韻鏡四等對應 A 類（一般情況）`);
      return 'A';
    }
    if (韻鏡等 === 3) {
      defaultLogger.log(`韻鏡三等對應 B 類（一般情況）`);
      return 'B';
    }
    throw new Error('error');
  }

  @cache
  get 描述() {
    const { 上位, 右位, 轉名稱, 韻鏡等 } = this;
    const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
    const 韻鏡等漢字 = [...'一二三四'][韻鏡等 - 1];
    return `${轉名稱}·${母位置名稱[右位]}·${raw聲}聲位·韻鏡${韻鏡等漢字}等`;
  }

  to音韻地位() {
    const { 母, 呼, 切韻等, 類, 韻, 聲 } = this;
    const 當前音韻地位 = new 音韻地位(母, 呼, 切韻等, 類, 韻, 聲);
    return 當前音韻地位;
  }

  等於(other: 韻鏡位置) {
    return this.轉號 === other.轉號 && this.上位 === other.上位 && this.右位 === other.右位;
  }
}

// 右位: 為區分尤/幽韻
const 轉號上位右位2韻 = (轉號: number, 上位: number, 右位: number) => {
  const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
  const 韻鏡等 = ((上位 - 1) % 4) + 1;
  const is齒音 = 12 < 右位 && 右位 <= 17;
  const 轉名稱 = `${轉名稱列表[轉號 - 1]}圖`;

  switch (轉號) {
    case 1:
      defaultLogger.log('此位置屬於東韻');
      return '東';
    case 2:
      if (韻鏡等 === 1) {
        if (raw聲 === '上') {
          defaultLogger.log(`${轉名稱}、上聲、韻鏡一等未標註對應韻，實際為冬韻，與其餘三聲相同`);
          return '冬';
        }
        defaultLogger.log('此位置屬於冬韻');
        return '冬';
      }
      defaultLogger.log('此位置屬於鍾韻');
      return '鍾';
    case 3:
      defaultLogger.log('此位置屬於江韻');
      return '江';
    case 4:
    case 5:
      defaultLogger.log('此位置屬於支韻');
      return '支';
    case 6:
    case 7:
      defaultLogger.log('此位置屬於脂韻');
      return '脂';
    case 8:
      defaultLogger.log('此位置屬於之韻');
      return '之';
    case 9:
    case 10:
      if (raw聲 === '入') {
        defaultLogger.log('此位置屬於廢韻');
        return '廢';
      }
      defaultLogger.log('此位置屬於微韻');
      return '微';
    case 11:
      defaultLogger.log('此位置屬於魚韻');
      return '魚';
    case 12:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於模韻');
        return '模';
      }
      defaultLogger.log('此位置屬於虞韻');
      return '虞';
    case 13:
      if (raw聲 === '入') {
        defaultLogger.log('此位置屬於夬韻');
        return '夬';
      }
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於咍韻');
        return '咍';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於皆韻');
        return '皆';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於齊韻');
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          defaultLogger.log('此位置屬於祭韻');
          return '祭';
        }
        defaultLogger.log(`${轉名稱}、平上聲、韻鏡三等未標註對應韻，實際為咍韻`);
        return '咍'; // 咍韻三等平上聲均為特殊字，而咍韻三等去聲恰好無字，該處所排入字全為祭韻字。祭韻字佔用去聲位
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 14:
      if (raw聲 === '入') {
        defaultLogger.log('此位置屬於夬韻');
        return '夬';
      }
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於灰韻');
        return '灰';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於皆韻');
        return '皆';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於齊韻');
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          defaultLogger.log('此位置屬於祭韻');
          return '祭';
        }
        throw new Error(`invalid combination 轉 14 韻鏡三等${raw聲}聲`); // 祭韻字佔用去聲位
      }
      throw new Error('error');
    case 15:
    case 16:
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於佳韻');
        return '佳';
      }
      if (raw聲 === '去') {
        if (韻鏡等 === 1) {
          defaultLogger.log('此位置屬於泰韻');
          return '泰';
        }
        if (韻鏡等 === 4) {
          defaultLogger.log('此位置屬於祭韻');
          return '祭';
        }
      }
      throw new Error('error');
    case 17:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於痕韻');
        return '痕';
      }
      if (韻鏡等 === 3 || 韻鏡等 === 4) {
        defaultLogger.log('此位置屬於真韻');
        return '真';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於臻韻');
        return '臻';
      }
      throw new Error('error');
    case 18:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於魂韻');
        return '魂';
      }
      defaultLogger.log('此位置屬於真韻');
      return '真';
    case 19:
      defaultLogger.log('此位置屬於殷韻');
      return '殷';
    case 20:
      defaultLogger.log('此位置屬於文韻');
      return '文';
    case 21:
    case 22:
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於元韻');
        return '元';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於仙韻');
        return '仙';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '入') {
          defaultLogger.log(`此位置標註為山韻，但${轉名稱}、入聲、韻鏡二等刪、山韻排反，實際為刪韻`);
          return '刪';
        }
        defaultLogger.log('此位置屬於山韻');
        return '山';
      }
      throw new Error('error');
    case 23:
    case 24:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於寒韻');
        return '寒';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於仙韻');
        return '仙';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於先韻');
        return '先';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '入') {
          defaultLogger.log(`此位置標註為刪韻，但${轉名稱}、入聲、韻鏡二等刪、山韻排反，實際為山韻`);
          return '山';
        }
        defaultLogger.log('此位置屬於刪韻');
        return '刪'; // TODO: 處理仙韻 (see tests)
      }
      throw new Error('error');
    case 25:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於豪韻');
        return '豪';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於肴韻');
        return '肴';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於宵韻');
        return '宵';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於蕭韻');
        return '蕭';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 26:
      defaultLogger.log('此位置屬於宵韻');
      return '宵';
    case 27:
    case 28:
      defaultLogger.log('此位置屬於歌韻');
      return '歌';
    case 29:
    case 30:
      defaultLogger.log('此位置屬於麻韻');
      return '麻';
    case 31:
    case 32:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於唐韻');
        return '唐';
      }
      defaultLogger.log('此位置屬於陽韻');
      return '陽';
    case 33:
    case 34:
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        defaultLogger.log('此位置屬於庚韻');
        return '庚';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於清韻');
        return '清';
      }
      throw new Error('error');
    case 35:
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於耕韻');
        return '耕';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於清韻');
        return '清';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於青韻');
        return '青';
      }
      throw new Error('error');
    case 36:
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於耕韻');
        return '耕';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於青韻');
        return '青';
      }
      throw new Error('error');
    case 37:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於侯韻');
        return '侯';
      }
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        defaultLogger.log('此位置屬於尤韻');
        return '尤';
      }
      if (韻鏡等 === 4) {
        if (is齒音 || 右位 === 21) {
          defaultLogger.log(`此位置標註為幽韻，但${轉名稱}、韻鏡四等位有尤、幽二韻混排，其中齒音與以母為尤韻`);
          return '尤'; // 尤、幽韻在韻鏡四等混排，齒音與以母為尤韻
        }
        defaultLogger.log(`此位置標註為幽韻，但${轉名稱}、韻鏡四等位有尤、幽二韻混排，其中非齒音且非以母為幽韻`);
        return '幽';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 38:
      defaultLogger.log('此位置屬於侵韻');
      return '侵';
    case 39:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於覃韻');
        return '覃';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於咸韻');
        return '咸';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於鹽韻');
        return '鹽';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於添韻');
        return '添';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 40:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於談韻');
        return '談';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log('此位置屬於銜韻');
        return '銜';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log('此位置屬於嚴韻');
        return '嚴';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log('此位置屬於鹽韻');
        return '鹽';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 41:
      defaultLogger.log('此位置屬於凡韻');
      return '凡';
    case 42:
    case 43:
      if (韻鏡等 === 1) {
        defaultLogger.log('此位置屬於登韻');
        return '登';
      }
      defaultLogger.log('此位置屬於蒸韻');
      return '蒸';
    default:
      throw new Error('error');
  }
};

export const 音韻地位2韻鏡位置 = (當前音韻地位: 音韻地位) => {
  const { 母, 呼, 等, 類, 韻, 聲 } = 當前音韻地位;

  // calculate 韻鏡等
  const needAddOne = 類 === 'A' || ([...'精清從心邪以'].includes(母) && 等 === '三') || 韻 === '幽'; // 重紐四等、假四等真三等、幽韻為四等位
  const needMinusOne = [...'莊初崇生俟'].includes(母) && 等 === '三'; // 假二等真三等
  const 韻鏡等 = [...'一二三四'].indexOf(等) + 1 + (needAddOne ? 1 : needMinusOne ? -1 : 0);

  // calculate 轉號
  const 轉號 = _母類呼韻聲2轉號(母, 呼, 類, 韻, 聲, 韻鏡等);

  // calculate 上位
  const need寄入 = [...'廢夬'].includes(韻); // 標註「去聲寄此」
  const 上位 = (need寄入 ? 3 : [...'平上去入'].indexOf(聲)) * 4 + 韻鏡等;

  // calculate 右位
  const 右位 = 母idx2右位[母2idx.indexOf(母)]; // TODO: 常船位置

  return new 韻鏡位置(轉號, 上位, 右位);
};

const _母類呼韻聲2轉號 = (母: string, 呼: string | null, 類: string | null, 韻: string, 聲: string, 韻鏡等: number) => {
  if (呼 === null) {
    // TODO: cannot use 開口?
    const shouldUse合口 =
      [...'微廢夬元寒歌'].includes(韻) ||
      ([...'佳皆'].includes(韻) && 聲 === '去') ||
      (韻 === '刪' && 聲 !== '入') ||
      (韻 === '山' && 聲 === '入') ||
      (韻 === '仙' && 聲 === '去' && 類 === 'B');
    呼 = shouldUse合口 ? '合' : '開';
  }

  switch (韻) {
    case '東':
      return 1;
    case '冬':
    case '鍾':
      return 2;
    case '江':
      return 3;
    case '支':
      if (呼 === '開') {
        return 4;
      }
      return 5;
    case '脂':
      if (呼 === '開') {
        return 6;
      }
      return 7;
    case '之':
      return 8;
    case '微':
      if (呼 === '開') {
        return 9;
      }
      return 10;
    case '廢':
      if (呼 === '開') {
        return 9;
      }
      return 10;
    case '魚':
      return 11;
    case '虞':
    case '模':
      return 12;
    case '齊':
    case '夬':
    case '皆':
      if (呼 === '開') {
        return 13;
      }
      return 14;
    case '咍':
      return 13;
    case '灰':
      return 14;
    case '祭':
      if (韻鏡等 === 3) {
        if (呼 === '開') {
          return 13;
        }
        return 14;
      } else if (韻鏡等 === 4) {
        if (呼 === '開') {
          return 15;
        }
        return 16;
      }
      throw new Error(`韻鏡等 ${韻鏡等} invalid for 祭韻`);
    case '佳':
    case '泰':
      if (呼 === '開') {
        return 15;
      }
      return 16;
    case '痕':
    case '臻':
      return 17;
    case '魂':
      return 18;
    case '真':
      if (呼 === '開') {
        return 17;
      }
      return 18;
    case '殷':
      return 19;
    case '文':
      return 20;
    case '元':
      if (呼 === '開') {
        return 21;
      }
      return 22;
    case '山':
      if (聲 === '入') {
        if (呼 === '開') {
          return 23;
        }
        return 24;
      }
      if (呼 === '開') {
        return 21;
      }
      return 22;
    case '刪':
      if (聲 === '入') {
        if (呼 === '開') {
          return 21;
        }
        return 22;
      }
      if (呼 === '開') {
        return 23;
      }
      return 24;
    case '仙':
      if (韻鏡等 === 3) {
        if (呼 === '開') {
          return 23;
        }
        return 24;
      } else if (韻鏡等 === 2 || 韻鏡等 === 4) {
        if (呼 === '開') {
          return 21;
        }
        return 22;
      }
      throw new Error('error');
    case '寒':
    case '先':
      if (呼 === '開') {
        return 23;
      }
      return 24;
    case '蕭':
    case '肴':
    case '豪':
      return 25;
    case '宵':
      if (類 === 'A' || [...'精清從心邪以'].includes(母)) {
        return 26;
      }
      return 25;
    case '歌':
      if (呼 === '開') {
        return 27;
      }
      return 28;
    case '麻':
      if (呼 === '開') {
        return 29;
      }
      return 30;
    case '陽':
    case '唐':
      if (呼 === '開') {
        return 31;
      }
      return 32;
    case '庚':
      if (呼 === '開') {
        return 33;
      }
      return 34;
    case '清':
      if (韻鏡等 === 3) {
        if (呼 === '開') {
          return 35;
        }
        throw new Error('error: no 合口');
      } else if (韻鏡等 === 4) {
        if (呼 === '開') {
          return 33;
        }
        return 34;
      }
      throw new Error('error');
    case '耕':
    case '青':
      if (呼 === '開') {
        return 35;
      }
      return 36;
    case '尤':
    case '侯':
    case '幽':
      return 37;
    case '侵':
      return 38;
    case '鹽':
      if (韻鏡等 === 3) {
        return 39;
      } else if (韻鏡等 === 4) {
        return 40;
      }
      throw new Error(`韻鏡等 ${韻鏡等} invalid for 鹽韻`);
    case '覃':
    case '咸':
    case '添':
      return 39;
    case '談':
    case '銜':
      return 40;
    case '嚴':
      if (韻鏡等 === 3) {
        return 40;
      }
      throw new Error(`韻鏡等 ${韻鏡等} invalid for 嚴韻`);
    case '凡':
      return 41;
    case '登':
    case '蒸':
      if (呼 === '開') {
        return 42;
      }
      return 43;
    default:
      throw new Error('error');
  }
};

import { cache } from 'decorator-cache-getter';

import { defaultLogger } from './StringLogger';
import { 音韻地位 } from './音韻地位';
import { 等韻搭配, 鈍音母 } from './音韻屬性常量';

const 轉呼 = [null, null, null, ...'開合開合開開合開合開合開合開合開合開合開合開開開合開合開合開合開合開開開開合開合'] as const;
const 母2idx = [...'幫滂並明端透定泥知徹澄孃見溪羣疑精清從心邪章昌船書常莊初崇生俟影曉匣云以來日'] as const;
const 母idx2右位 = [
  1, 2, 3, 4, 5, 6, 7, 8, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22, 23,
] as const;
const 重紐韻 = [...'支脂祭真仙宵清侵鹽庚幽'] as const;

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

  // /** @ignore 僅用於 Node.js 呈現格式 */
  // [(Symbol.for('nodejs.util.inspect.custom'))](...args) {
  //   const { 轉號, 上位, 右位 } = this;
  //   const stylize = (...x) => args[1].stylize(...x);
  //   return `韻鏡位置<${stylize(`(${轉號},${上位},${右位})`, 'string')}>`;
  // }

  @cache
  get 描述() {
    const { 轉號, 上位, 右位 } = this;
    return `(${轉號},${上位},${右位})`;
  }

  @cache
  get 韻鏡等() {
    const { 上位 } = this;
    const 韻鏡等 = ((上位 - 1) % 4) + 1;
    const 韻鏡等漢字 = [...'一二三四'][韻鏡等 - 1];
    defaultLogger.log(`上位為 ${上位}，對應韻鏡${韻鏡等漢字}等`);
    return 韻鏡等;
  }

  @cache
  get 韻鏡等漢字() {
    const { 韻鏡等 } = this;
    return [...'一二三四'][韻鏡等 - 1];
  }

  @cache
  get 韻() {
    const { 轉號, 上位, 右位 } = this;
    return _轉號上位右位2韻(轉號, 上位, 右位);
  }

  @cache
  get 切韻等() {
    const { 轉號, 上位, 右位, 韻鏡等, 韻 } = this;
    if (轉號 === 6 && 上位 === 12 && 右位 === 7) {
      defaultLogger.log(`韻鏡地位 ${this.描述}（即「地」字）為特殊情況，對應切韻四等`);
      return '四'; // 「地」字為真四等
    }
    if (轉號 === 29 && 上位 === 4 && 右位 === 5) {
      defaultLogger.log(`韻鏡地位 ${this.描述}（即「爹」字）為特殊情況，對應切韻四等`);
      return '四'; // 「爹」字為真四等
    }
    if (韻鏡等 === 4 && !等韻搭配.四.includes(韻)) {
      defaultLogger.log(`韻鏡四等對應切韻四等，但韻${韻}非四等韻，故為假四等真三等，實際為切韻三等`);
      return '三'; // 假四等真三等
    }
    if (韻鏡等 === 2 && ![...等韻搭配.二, ...等韻搭配.二三].includes(韻)) {
      if (12 < 右位 && 右位 <= 17) {
        defaultLogger.log(`韻鏡二等對應切韻二等，但韻${韻}非二等韻，故為假二等真三等，實際為切韻三等`);
        return '三'; // 限定為齒音，假二等真三等
      }
      throw new Error('假二等真三等必須為齒音');
    }
    if (轉號 === 33 && ((右位 === 16 && 韻鏡等 === 2) || (右位 === 14 && (上位 === 10 || 上位 === 14)))) {
      defaultLogger.log(`韻鏡二等對應切韻二等，但「生」、「省」、「索」、「㵾」、「柵」為特殊情況，屬於莊三化二，故實際為切韻三等`);
      return '三'; // 「生」、「省」、「索」、「㵾」、「柵」莊三化二
    }
    const { 韻鏡等漢字 } = this;
    defaultLogger.log(`韻鏡${韻鏡等漢字}等對應切韻${韻鏡等漢字}等（一般情況）`);
    return 韻鏡等漢字;
  }

  @cache
  get 母() {
    const { 右位, 韻鏡等, 切韻等 } = this;

    // 幫非組
    if (右位 <= 4) {
      const 母 = [...'幫滂並明'][右位 - 1];
      defaultLogger.log(`右位為 ${右位}，對應${母}母`);
      return 母;
    }

    // 端知組
    if (右位 <= 8) {
      // TODO: is 切韻等 correct? can handle 蛭,17,4,15?
      if (切韻等 === '一' || 切韻等 === '四') {
        const 母 = [...'端透定泥'][右位 - 4 - 1];
        defaultLogger.log(`右位為 ${右位}，且為切韻一四等，對應${母}母`);
        return 母;
      }

      const 母 = [...'知徹澄孃'][右位 - 4 - 1];
      defaultLogger.log(`右位為 ${右位}，且為切韻二三等，對應${母}母`);
      return 母;
    }

    // 見組
    if (右位 <= 12) {
      const 母 = [...'見溪羣疑'][右位 - 8 - 1];
      defaultLogger.log(`右位為 ${右位}，對應${母}母`);
      return 母;
    }

    // 齒音
    if (右位 <= 17) {
      if (韻鏡等 === 1 || 韻鏡等 === 4) {
        const 母 = [...'精清從心邪'][右位 - 12 - 1];
        defaultLogger.log(`右位為 ${右位}，且為韻鏡一四等，對應${母}母`);
        return 母;
      }
      if (韻鏡等 === 3) {
        const 母 = [...'章昌船書常'][右位 - 12 - 1]; // TODO: 常船位置
        defaultLogger.log(`右位為 ${右位}，且為韻鏡三等，對應${母}母`);
        return 母;
      }
      if (韻鏡等 === 2) {
        const 母 = [...'莊初崇生俟'][右位 - 12 - 1];
        defaultLogger.log(`右位為 ${右位}，且為韻鏡二等，對應${母}母`);
        return 母;
      }
      throw new Error('invalid 韻鏡等');
    }

    // 喉音
    if (右位 <= 20) {
      const 母 = [...'影曉匣'][右位 - 17 - 1];
      defaultLogger.log(`右位為 ${右位}，對應${母}母`);
      return 母;
    }

    // 喻母
    if (右位 === 21) {
      if (韻鏡等 === 3) {
        defaultLogger.log(`右位為 ${右位}，且為韻鏡三等，對應云母`);
        return '云';
      }
      defaultLogger.log(`右位為 ${右位}，且非韻鏡三等，對應以母`);
      return '以';
    }

    // 舌齒音
    if (右位 <= 23) {
      const 母 = [...'來日'][右位 - 21 - 1];
      defaultLogger.log(`右位為 ${右位}，對應${母}母`);
      return 母;
    }

    throw new Error('invalid 右位');
  }

  @cache
  get 呼() {
    const { 轉號, 韻, 母 } = this;
    if ([...'幫滂並明'].includes(母)) {
      defaultLogger.log(`${母}母無需指定呼`);
      return null;
    }
    if ([...'模侯尤'].includes(韻)) {
      defaultLogger.log(`韻${韻}無需指定呼`);
      return null;
    }
    const 呼 = 轉呼[轉號 - 1];
    defaultLogger.log(`第 ${轉號} 轉對應的呼為${呼}`);
    return 呼;
  }

  @cache
  get 聲() {
    const { 轉號, 上位 } = this;
    const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
    if ([9, 10, 13, 14].includes(轉號) && raw聲 == '入') {
      defaultLogger.log(`上位為 ${上位}，對應入聲，但第 ${轉號} 轉入聲標註「去聲寄此」，故實際為去聲`);
      return '去'; // 標註「去聲寄此」
    }
    defaultLogger.log(`上位為 ${上位}，對應${raw聲}聲`);
    return raw聲;
  }

  @cache
  get 類() {
    const { 韻鏡等, 切韻等, 韻, 母 } = this;
    if (切韻等 !== '三') {
      defaultLogger.log(`非切韻三等，無需指定類`);
      return null;
    }
    if (!鈍音母.includes(母)) {
      defaultLogger.log(`非鈍音母，無需指定類`);
      return null;
    }
    if (韻 === '幽') {
      const { 轉號, 上位, 右位 } = this;
      if ([...'幫滂並明'].includes(母) || (轉號 === 37 && 上位 === 4 && 右位 === 10)) {
        return 'B'; // 幫組、「惆」為 B 類。注意「飍」、「烋」為 A、B 類對立，「烋」為 B 類，但此處無法區分二者
      }
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
    if (!重紐韻.includes(韻)) {
      defaultLogger.log(`${韻}韻非重紐韻，對應 C 類`);
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

  to音韻地位() {
    const { 母, 呼, 切韻等, 類, 韻, 聲 } = this;
    const 當前音韻地位 = new 音韻地位(母, 呼, 切韻等, 類, 韻, 聲);
    defaultLogger.log(`故韻鏡位置 ${this.描述} 對應的切韻音系音韻地位為${當前音韻地位.描述}`);
    return 當前音韻地位;
  }

  等於(other: 韻鏡位置) {
    return this.轉號 === other.轉號 && this.上位 === other.上位 && this.右位 === other.右位;
  }
}

// 右位: 為區分尤/幽韻
const _轉號上位右位2韻 = (轉號: number, 上位: number, 右位: number) => {
  const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
  const 韻鏡等 = ((上位 - 1) % 4) + 1;
  const is齒音 = 12 < 右位 && 右位 <= 17;

  switch (轉號) {
    case 1:
      defaultLogger.log(`第 ${轉號} 轉對應東韻`);
      return '東';
    case 2:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應冬韻`);
        return '冬';
      }
      defaultLogger.log(`第 ${轉號} 轉、非韻鏡一等對應鍾韻`);
      return '鍾';
    case 3:
      defaultLogger.log(`第 ${轉號} 轉對應江韻`);
      return '江';
    case 4:
    case 5:
      defaultLogger.log(`第 ${轉號} 轉對應支韻`);
      return '支';
    case 6:
    case 7:
      defaultLogger.log(`第 ${轉號} 轉對應脂韻`);
      return '脂';
    case 8:
      defaultLogger.log(`第 ${轉號} 轉對應之韻`);
      return '之';
    case 9:
    case 10:
      if (raw聲 === '入') {
        defaultLogger.log(`第 ${轉號} 轉、入聲位（實際為去聲）對應廢韻`);
        return '廢';
      }
      defaultLogger.log(`第 ${轉號} 轉、非入聲位對應微韻`);
      return '微';
    case 11:
      defaultLogger.log(`第 ${轉號} 轉對應魚韻`);
      return '魚';
    case 12:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應模韻`);
        return '模';
      }
      defaultLogger.log(`第 ${轉號} 轉、非韻鏡一等對應虞韻`);
      return '虞';
    case 13:
      if (raw聲 === '入') {
        defaultLogger.log(`第 ${轉號} 轉、入聲位（實際為去聲）對應夬韻`);
        return '夬';
      }
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡一等對應咍韻`);
        return '咍';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡二等對應皆韻`);
        return '皆';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡四等對應齊韻`);
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          return '祭';
        }
        return '咍'; // 咍韻三等平上聲均為特殊字，而咍韻三等去聲恰好無字，該處所排入字全為祭韻字。祭韻字佔用去聲位
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 14:
      if (raw聲 === '入') {
        defaultLogger.log(`第 ${轉號} 轉、入聲位（實際為去聲）對應夬韻`);
        return '夬';
      }
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡一等對應灰韻`);
        return '灰';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡二等對應皆韻`);
        return '皆';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、非入聲位、韻鏡四等對應齊韻`);
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          return '祭';
        }
        throw new Error(`invalid combination 轉 14 韻鏡三等${raw聲}聲`); // 祭韻字佔用去聲位
      }
      throw new Error('error');
    case 15:
    case 16:
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應佳韻`);
        return '佳';
      }
      if (raw聲 === '去') {
        if (韻鏡等 === 1) {
          return '泰';
        }
        if (韻鏡等 === 4) {
          return '祭';
        }
      }
      throw new Error('error');
    case 17:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應痕韻`);
        return '痕';
      }
      if (韻鏡等 === 3 || 韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三四等對應真韻`);
        return '真';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應臻韻`);
        return '臻';
      }
      throw new Error('error');
    case 18:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應魂韻`);
        return '魂';
      }
      defaultLogger.log(`第 ${轉號} 轉、非韻鏡一等對應真韻`);
      return '真';
    case 19:
      defaultLogger.log(`第 ${轉號} 轉對應殷韻`);
      return '殷';
    case 20:
      defaultLogger.log(`第 ${轉號} 轉對應文韻`);
      return '文';
    case 21:
    case 22:
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應元韻`);
        return '元';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應仙韻`);
        return '仙';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '入') {
          return '刪';
        }
        return '山';
      }
      throw new Error('error');
    case 23:
    case 24:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應寒韻`);
        return '寒';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應仙韻`);
        return '仙';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應先韻`);
        return '先';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '入') {
          return '山';
        }
        return '刪';
      }
      throw new Error('error');
    case 25:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應豪韻`);
        return '豪';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應肴韻`);
        return '肴';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應宵韻`);
        return '宵';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應蕭韻`);
        return '蕭';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 26:
      defaultLogger.log(`第 ${轉號} 轉對應宵韻`);
      return '宵';
    case 27:
    case 28:
      defaultLogger.log(`第 ${轉號} 轉對應歌韻`);
      return '歌';
    case 29:
    case 30:
      defaultLogger.log(`第 ${轉號} 轉對應麻韻`);
      return '麻';
    case 31:
    case 32:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應唐韻`);
        return '唐';
      }
      defaultLogger.log(`第 ${轉號} 轉、非韻鏡一等對應陽韻`);
      return '陽';
    case 33:
    case 34:
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二三等對應庚韻`);
        return '庚';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應清韻`);
        return '清';
      }
      throw new Error('error');
    case 35:
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應耕韻`);
        return '耕';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應清韻`);
        return '清';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應青韻`);
        return '青';
      }
      throw new Error('error');
    case 36:
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應耕韻`);
        return '耕';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應青韻`);
        return '青';
      }
      throw new Error('error');
    case 37:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應侯韻`);
        return '侯';
      }
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二三等對應尤韻`);
        return '尤';
      }
      if (韻鏡等 === 4) {
        if (is齒音 || 右位 === 21) {
          return '尤'; // 尤、幽韻在韻鏡四等混排，齒音與以母為尤韻
        }
        return '幽';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 38:
      defaultLogger.log(`第 ${轉號} 轉對應侵韻`);
      return '侵';
    case 39:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應覃韻`);
        return '覃';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應咸韻`);
        return '咸';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應鹽韻`);
        return '鹽';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應添韻`);
        return '添';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 40:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應談韻`);
        return '談';
      }
      if (韻鏡等 === 2) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡二等對應銜韻`);
        return '銜';
      }
      if (韻鏡等 === 3) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡三等對應嚴韻`);
        return '嚴';
      }
      if (韻鏡等 === 4) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡四等對應鹽韻`);
        return '鹽';
      }
      throw new Error(`invalid 韻鏡等 ${韻鏡等}`);
    case 41:
      defaultLogger.log(`第 ${轉號} 轉對應凡韻`);
      return '凡';
    case 42:
    case 43:
      if (韻鏡等 === 1) {
        defaultLogger.log(`第 ${轉號} 轉、韻鏡一等對應登韻`);
        return '登';
      }
      defaultLogger.log(`第 ${轉號} 轉、非韻鏡一等對應蒸韻`);
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

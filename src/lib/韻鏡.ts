import { 音韻地位 } from './音韻地位';

const 轉呼 = [null, null, null, ...'開合開合開開合開合開合開合開合開合開合開合開開開合開合開合開合開合開開開開合開合'];

const 鈍音母 = [...'幫滂並明見溪羣疑影曉匣云'];
const 重紐韻 = [...'支脂祭真仙宵清侵鹽庚幽'];

const 四等韻 = [...'齊先蕭青添'];
const 二三等韻 = [...'麻庚'];
const 二等韻 = [...'江佳皆夬刪山肴耕咸銜'];

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

  get 描述() {
    const { 轉號, 上位, 右位 } = this;
    return `韻鏡位置(${轉號}, ${上位}, ${右位})`;
  }

  get 韻鏡等() {
    const { 上位 } = this;
    return ((上位 - 1) % 4) + 1;
  }

  get 呼() {
    const { 母, 韻, 轉號 } = this;
    const needErase呼 = [...'幫滂並明'].includes(母) || [...'模侯尤'].includes(韻);
    return needErase呼 ? null : 轉呼[轉號 - 1];
  }

  get 母() {
    const { 右位, 韻鏡等, 等: 切韻等 } = this;

    if (右位 <= 0) {
      throw new Error('error');
    }

    // 幫非組
    if (右位 <= 4) {
      return [...'幫滂並明'][右位 - 1];
    }

    // 端知組
    if (右位 <= 8) {
      // TODO: is 切韻等 correct? can handle 蛭,17,4,15?
      if (切韻等 === '一' || 切韻等 === '四') {
        return [...'端透定泥'][右位 - 4 - 1];
      }
      return [...'知徹澄孃'][右位 - 4 - 1];
    }

    // 見組
    if (右位 <= 12) {
      return [...'見溪羣疑'][右位 - 8 - 1];
    }

    // 齒音
    if (右位 <= 17) {
      if (韻鏡等 === 1 || 韻鏡等 === 4) {
        return [...'精清從心邪'][右位 - 12 - 1];
      }
      if (韻鏡等 === 3) {
        return [...'章昌船書常'][右位 - 12 - 1]; // TODO: 常船位置
      }
      if (韻鏡等 === 2) {
        return [...'莊初崇生俟'][右位 - 12 - 1];
      }
      throw new Error('error');
    }

    // 喉音
    if (右位 <= 20) {
      return [...'影曉匣'][右位 - 17 - 1];
    }

    // 喻母
    if (右位 === 21) {
      if (韻鏡等 === 3) {
        return '云';
      }
      return '以';
    }

    // 舌齒音
    if (右位 <= 23) {
      return [...'來日'][右位 - 21 - 1];
    }

    throw new Error('error');
  }

  get 類() {
    const { 母, 韻鏡等, 等: 切韻等, 韻 } = this;
    if (鈍音母.includes(母) && 切韻等 === '三') {
      if (韻 === '幽') {
        if ([...'幫滂並明'].includes(母)) {
          return 'B'; // 幫組爲 B 類
        }
        return 'A';
      }
      if (韻 === '蒸') {
        const { 呼 } = this;
        if ([...'幫滂並明'].includes(母) || 呼 === '合') {
          return 'B'; // 幫組、合口爲 B 類
        }
        return 'C';
      }
      if (!重紐韻.includes(韻)) {
        return 'C';
      }
      if (韻鏡等 === 4) {
        return 'A';
      }
      if (韻鏡等 === 3) {
        return 'B';
      }
      throw new Error('error');
    }
    return null;
  }

  get 等() {
    const { 轉號, 上位, 右位, 韻, 韻鏡等 } = this;
    if (!四等韻.includes(this.韻) && 韻鏡等 === 4) {
      if (
        (轉號 === 6 && 右位 === 7 && 上位 === 12) || // 「地」字為真四等
        (轉號 === 29 && 右位 === 5 && 上位 === 4) // 「爹」字為真四等
      ) {
        return '四';
      }
      return '三';
    }
    if (![...二等韻, ...二三等韻].includes(韻) && 韻鏡等 === 2) {
      if (12 < 右位 && 右位 <= 17) {
        return '三'; // 齒音
      }
      throw new Error('error');
    }
    if (轉號 === 33 && ((右位 === 16 && 韻鏡等 === 2) || (右位 === 14 && (上位 === 10 || 上位 === 14)))) {
      return '三';
    }
    return [...'一二三四'][韻鏡等 - 1]; // 「生」、「省」、「索」、「㵾」、「柵」莊三化二
  }

  get 韻() {
    const { 轉號, 上位, 右位 } = this;
    return 轉號上位右位2韻(轉號, 上位, 右位);
  }

  get 聲() {
    const { 轉號, 上位 } = this;
    const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
    if ([9, 10, 13, 14].includes(轉號) && raw聲 == '入') {
      return '去'; // 次入韻
    }
    return raw聲;
  }

  to音韻地位() {
    const { 母, 呼, 等, 類, 韻, 聲 } = this;
    return new 音韻地位(母, 呼, 等, 類, 韻, 聲);
  }
}

export const 音韻地位2韻鏡位置 = (當前音韻地位: 音韻地位) => {
  const { 母, 呼, 等, 類, 韻, 聲 } = 當前音韻地位;
  const 轉號 = 母類呼等韻聲2轉號(母, 呼, 等, 類, 韻, 聲);
  const 上位 = 母類等韻聲2上位(母, 類, 等, 韻, 聲);
  const 右位 = 母2右位(母);
  return new 韻鏡位置(轉號, 上位, 右位);
};

// 右位: 爲區分尤/幽韻
const 轉號上位右位2韻 = (轉號: number, 上位: number, 右位: number) => {
  const raw聲 = [...'平上去入'][Math.floor((上位 - 1) / 4)];
  const 韻鏡等 = ((上位 - 1) % 4) + 1;
  const is齒音 = 12 < 右位 && 右位 <= 17;

  switch (轉號) {
    case 1:
      return '東';
    case 2:
      if (韻鏡等 === 1) {
        return '冬';
      }
      return '鍾';
    case 3:
      return '江';
    case 4:
    case 5:
      return '支';
    case 6:
    case 7:
      return '脂';
    case 8:
      return '之';
    case 9:
    case 10:
      if (raw聲 === '入') {
        return '廢';
      }
      return '微';
    case 11:
      return '魚';
    case 12:
      if (韻鏡等 === 1) {
        return '模';
      }
      return '虞';
    case 13:
      if (raw聲 === '入') {
        return '夬';
      }
      if (韻鏡等 === 1) {
        return '咍';
      }
      if (韻鏡等 === 2) {
        return '皆';
      }
      if (韻鏡等 === 4) {
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          return '祭';
        }
        return '咍';
      }
      throw new Error('error');
    case 14:
      if (raw聲 === '入') {
        return '夬';
      }
      if (韻鏡等 === 1) {
        return '灰';
      }
      if (韻鏡等 === 2) {
        return '皆';
      }
      if (韻鏡等 === 4) {
        return '齊';
      }
      if (韻鏡等 === 3) {
        if (raw聲 === '去') {
          return '祭';
        }
        throw new Error('error');
      }
      throw new Error('error');
    case 15:
    case 16:
      if (韻鏡等 === 2) {
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
        return '痕';
      }
      if (韻鏡等 === 3 || 韻鏡等 === 4) {
        return '真';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '平' || raw聲 === '入') {
          return '臻';
        }
        return '真';
      }
      throw new Error('error');
    case 18:
      if (韻鏡等 === 1) {
        return '魂';
      }
      return '真';
    case 19:
      return '殷';
    case 20:
      return '文';
    case 21:
    case 22:
      if (韻鏡等 === 3) {
        return '元';
      }
      if (韻鏡等 === 4) {
        return '仙';
      }
      if (韻鏡等 === 2) {
        if (raw聲 === '入') {
          return '刪';
        }
        if (raw聲 === '平' && 轉號 == 22 && (右位 === 13 || 右位 === 16)) {
          return '仙'; // 「恮」、「栓」
        }
        return '山';
      }
      throw new Error('error');
    case 23:
    case 24:
      if (韻鏡等 === 1) {
        return '寒';
      }
      if (韻鏡等 === 3) {
        return '仙';
      }
      if (韻鏡等 === 4) {
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
        return '豪';
      }
      if (韻鏡等 === 2) {
        return '肴';
      }
      if (韻鏡等 === 3) {
        return '宵';
      }
      if (韻鏡等 === 4) {
        return '蕭';
      }
      throw new Error('error');
    case 26:
      return '宵';
    case 27:
    case 28:
      return '歌';
    case 29:
    case 30:
      return '麻';
    case 31:
    case 32:
      if (韻鏡等 === 1) {
        return '唐';
      }
      return '陽';
    case 33:
    case 34:
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        return '庚';
      }
      if (韻鏡等 === 4) {
        return '清';
      }
      throw new Error('error');
    case 35:
      if (韻鏡等 === 2) {
        return '耕';
      }
      if (韻鏡等 === 3) {
        return '清';
      }
      if (韻鏡等 === 4) {
        return '青';
      }
      throw new Error('error');
    case 36:
      if (韻鏡等 === 2) {
        return '耕';
      }
      if (韻鏡等 === 4) {
        return '青';
      }
      throw new Error('error');
    case 37:
      if (韻鏡等 === 1) {
        return '侯';
      }
      if (韻鏡等 === 2 || 韻鏡等 === 3) {
        return '尤';
      }
      if (韻鏡等 === 4) {
        if (is齒音 || 右位 === 21) {
          return '尤'; // 尤、幽韻在韻鏡四等混排，齒音與以母爲尤韻
        }
        return '幽';
      }
      throw new Error('error');
    case 38:
      return '侵';
    case 39:
      if (韻鏡等 === 1) {
        return '覃';
      }
      if (韻鏡等 === 2) {
        return '咸';
      }
      if (韻鏡等 === 3) {
        return '鹽';
      }
      if (韻鏡等 === 4) {
        return '添';
      }
      throw new Error('error');
    case 40:
      if (韻鏡等 === 1) {
        return '談';
      }
      if (韻鏡等 === 2) {
        return '銜';
      }
      if (韻鏡等 === 3) {
        return '嚴';
      }
      if (韻鏡等 === 4) {
        return '鹽';
      }
      throw new Error('error');
    case 41:
      return '凡';
    case 42:
    case 43:
      if (韻鏡等 === 1) {
        return '登';
      }
      return '蒸';
    default:
      throw new Error('error');
  }
};

const 等2韻鏡等 = (母: string, 類: string | null, 等: string, 韻: string) => {
  const needAddOne = 類 === 'A' || ([...'精清從心邪以'].includes(母) && 等 === '三') || 韻 === '幽'; // 幽韻為四等位
  const needMinusOne = [...'莊初崇生俟'].includes(母) && 等 === '三';
  const 韻鏡等 = ['一', '二', '三', '四'].indexOf(等) + 1 + (needAddOne ? 1 : needMinusOne ? -1 : 0);
  return 韻鏡等;
};

const 母類等韻聲2上位 = (母: string, 類: string | null, 等: string, 韻: string, 聲: string) => {
  const 韻鏡等 = 等2韻鏡等(母, 類, 等, 韻);
  const 上位 = ['平', '上', '去', '入'].indexOf(聲) * 4 + 韻鏡等;
  const 寄入聲上位 = 3 * 4 + 韻鏡等;
  const need寄入 = [...'廢夬'].includes(韻);
  return need寄入 ? 寄入聲上位 : 上位;
};

const 母類呼等韻聲2轉號 = (母: string, 呼: string | null, 等: string, 類: string | null, 韻: string, 聲: string) => {
  const 韻鏡等 = 等2韻鏡等(母, 類, 等, 韻);
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
      throw new Error('error');
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
      throw new Error('error');
    case '覃':
    case '咸':
    case '添':
      return 39;
    case '談':
    case '銜':
    case '嚴':
      return 40;
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

const 母2右位 = (母: string) => {
  // TODO: 常船位置
  const pos = '幫滂並明端透定泥知徹澄孃見溪羣疑精清從心邪章昌船書常莊初崇生俟影曉匣云以來日'.indexOf(母);
  return [
    1, 2, 3, 4, 5, 6, 7, 8, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22,
    23,
  ][pos];
};

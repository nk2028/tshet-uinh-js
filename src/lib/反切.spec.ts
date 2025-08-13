import { readFileSync } from 'node:fs';

import test from 'ava';

import { defaultLogger } from './StringLogger';
import { 執行反切 } from './反切';
import { 音韻地位 } from './音韻地位';

test('可以正常執行反切', t => {
  let rightCountHasEqual = 0;
  let rightCountExactEqual = 0;
  let totalCount = 0;

  const data = readFileSync('prepare/王三反切音韻地位表.csv', { encoding: 'utf8' })
    .trimEnd()
    .split('\n')
    .slice(1)
    .map(line => line.split(','));

  for (const [
    小韻號,
    ,
    ,
    ,
    頁號,
    ,
    ,
    ,
    ,
    ,
    首字校後,
    上字校後,
    下字校後,
    被切字聲母,
    被切字呼,
    被切字等,
    被切字類,
    被切字韻,
    被切字聲調,
    上字聲母,
    上字呼,
    上字等,
    上字類,
    上字韻,
    上字聲調,
    下字聲母,
    下字呼,
    下字等,
    下字類,
    下字韻,
    下字聲調,
    被切字切語相關地位不一致,
    ,
    ,
    ,
    音節合法性強合法則留空,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    備註,
  ] of data) {
    void 小韻號;
    void 頁號;
    void 備註;

    if (!首字校後 || !上字校後 || !下字校後) continue;
    if (!被切字聲母 || !上字聲母 || !下字聲母) continue;
    if (音節合法性強合法則留空 === '強非法') continue;
    if (被切字切語相關地位不一致) continue;

    const 被切字音韻地位 = new 音韻地位(被切字聲母, 被切字呼 || null, 被切字等, 被切字類 || null, 被切字韻, 被切字聲調);
    const 上字音韻地位 = new 音韻地位(上字聲母, 上字呼 || null, 上字等, 上字類 || null, 上字韻, 上字聲調);
    const 下字音韻地位 = new 音韻地位(下字聲母, 下字呼 || null, 下字等, 下字類 || null, 下字韻, 下字聲調);

    const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

    totalCount += 1;

    const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
    if (hasEqual) rightCountHasEqual += 1;

    if (!hasEqual) {
      console.log(
        `反切 ${首字校後}，${上字校後}${下字校後}反 結果 ${預測音韻地位們.map(p => p.描述).join('、')} 與被切字音韻地位 ${被切字音韻地位.描述} 不匹配`,
      );
    }

    const exactEqual = 預測音韻地位們.length === 1 && 預測音韻地位們[0].等於(被切字音韻地位);
    if (exactEqual) rightCountExactEqual += 1;
  }

  const accuracy = rightCountHasEqual / totalCount;
  console.log(`反切的準確率（多個結果中至少有一個正確）為 ${accuracy * 100}%`);
  t.true(accuracy > 0.993, `反切的準確率（多個結果中至少有一個正確）必須大於 99.3%，實際為 ${accuracy * 100}%`);

  const accuracyExactEqual = rightCountExactEqual / totalCount;
  console.log(`反切的準確率（只給出一個結果且正確）為 ${accuracyExactEqual * 100}%`);
  t.true(accuracyExactEqual > 0.852, `反切的準確率（只給出一個結果且正確）必須大於 85.2%，實際為 ${accuracyExactEqual * 100}%`);
});

test('可以為反切結果給出解釋', t => {
  const data = ['東', '德', '紅', '端一東平', '端開一登入', '匣一東平'];
  const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] = data;

  const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
  const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
  const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

  defaultLogger.enable = true;
  const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);
  const 解釋 = defaultLogger.popAll();
  defaultLogger.enable = false;

  const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
  t.true(hasEqual, '可以正常反切');

  // console.log(解釋);
  t.true(
    解釋[0] === '反切上字為端母，故被切字為端母' && 解釋[1] === '反切下字為東韻平聲，故被切字為東韻平聲',
    '可以正常為反切結果給出解釋',
  );
});

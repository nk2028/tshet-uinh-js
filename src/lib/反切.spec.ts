import test from 'ava';

import { 執行反切 } from './反切';
import { 音韻地位 } from './音韻地位';

test('可以正常執行反切', t => {
  const data = [
    ['東', '德', '紅', '端一東平', '端開一登入', '匣一東平'],
    ['同', '徒', '紅', '定一東平', '定一模平', '匣一東平'],
  ];

  let rightCount = 0;
  let wrongCount = 0;

  for (const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] of data) {
    const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
    const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
    const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

    const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

    const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
    if (hasEqual) {
      rightCount += 1;
    } else {
      wrongCount += 1;
    }
  }

  const accuracy = rightCount / (rightCount + wrongCount);
  t.true(accuracy > 0.99, '反切的準確率必須大於 99%');
});

import test from 'ava';

import { defaultLogger } from './StringLogger';
import { 執行反切 } from './反切';
import { 音韻地位 } from './音韻地位';

test('可以正常執行反切', t => {
  const data = [
    ['東', '德', '紅', '端一東平', '端開一登入', '匣一東平'],
    ['同', '徒', '紅', '定一東平', '定一模平', '匣一東平'],
  ]; // TODO: populate with full data
  // const data = readFileSync('fanqie_test/ys2.csv', { encoding: 'utf8' })
  //   .trimEnd()
  //   .split('\n')
  //   .map(line => line.split(','));

  let rightCountHasEqual = 0;
  let rightCountExactEqual = 0;

  for (const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] of data) {
    const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
    const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
    const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

    const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

    const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
    if (hasEqual) rightCountHasEqual += 1;

    const exactEqual = 預測音韻地位們.length === 1 && 預測音韻地位們[0].等於(被切字音韻地位);
    if (exactEqual) rightCountExactEqual += 1;
  }

  const accuracy = rightCountHasEqual / data.length;
  // console.log(`反切的準確率（多個結果中至少有一個正確）: ${accuracy}`);
  t.true(accuracy > 0.991, '反切的準確率（多個結果中至少有一個正確）必須大於 99.1%');

  const accuracyExactEqual = rightCountExactEqual / data.length;
  // console.log(`反切的準確率（只給出一個結果且正確）: ${accuracyExactEqual}`);
  t.true(accuracyExactEqual > 0.858, '反切的準確率（只給出一個結果且正確）必須大於 85.8%');
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

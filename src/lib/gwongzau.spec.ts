import test from 'ava';

import { defaultLogger } from './StringLogger';
import { 推導廣州音 } from './gwongzau';
import { 執行反切 } from './反切';
import { 音韻地位 } from './音韻地位';

test('可以為反切結果給出解釋', t => {
  const data = ['東', '德', '紅', '端一東平', '端開一登入', '匣一東平'];
  const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] = data;

  const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
  const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
  const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

  defaultLogger.enable = true;

  const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

  const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
  t.true(hasEqual, '可以正常反切');

  const 預測音韻地位 = 預測音韻地位們[0];
  const 推導結果 = 推導廣州音(預測音韻地位);

  const 解釋 = defaultLogger.popAll();
  defaultLogger.enable = false;

  console.log(解釋);
  console.log(推導結果);
});

test('可以為反切結果給出解釋2', t => {
  const data = ['渴', '苦', '割', '溪開一寒入', '溪一模上', '見開一寒入'];
  const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] = data;

  const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
  const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
  const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

  defaultLogger.enable = true;

  const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

  const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
  t.true(hasEqual, '可以正常反切');

  const 預測音韻地位 = 預測音韻地位們[0];
  const 推導結果 = 推導廣州音(預測音韻地位);

  const 解釋 = defaultLogger.popAll();
  defaultLogger.enable = false;

  console.log(解釋);
  console.log(推導結果);
});

test('可以為反切結果給出解釋3', t => {
  const data = ['邑', '英', '及', '影開三B侵入', '影開三B庚平', '羣開三B侵入'];
  const [, , , 被切字音韻描述, 上字音韻描述, 下字音韻描述] = data;

  const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
  const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
  const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

  defaultLogger.enable = true;

  const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

  const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
  t.true(hasEqual, '可以正常反切');

  const 預測音韻地位 = 預測音韻地位們[0];
  const 推導結果 = 推導廣州音(預測音韻地位);

  const 解釋 = defaultLogger.popAll();
  defaultLogger.enable = false;

  console.log(解釋);
  console.log(推導結果);
});

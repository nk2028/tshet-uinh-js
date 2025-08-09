import { readFileSync } from 'node:fs';

import test from 'ava';

import { get小韻 } from '../data/廣韻';

import { defaultLogger } from './StringLogger';
import { 推導廣州音 } from './gwongzau';
import { 執行反切 } from './反切';
import { query字頭 } from './資料';
import { 音韻地位 } from './音韻地位';
import { 音韻地位2韻鏡位置, 韻鏡位置 } from './韻鏡';

test('可以為反切結果給出解釋', t => {
  const data = [
    ['東', '德', '紅', '端一東平', '端開一登入', '匣一東平'],
    ['渴', '苦', '割', '溪開一寒入', '溪一模上', '見開一寒入'],
    ['邑', '英', '及', '影開三B侵入', '影開三B庚平', '羣開三B侵入'],
  ];

  const 韻鏡位置2字頭Map = new Map<string, string>();

  const 韻鏡位置2字頭 = (當前韻鏡位置: 韻鏡位置): string | undefined => {
    const { 轉號, 上位, 右位 } = 當前韻鏡位置;
    const key = `${轉號}-${上位}-${右位}`;
    return 韻鏡位置2字頭Map.get(key);
  };

  for (const line of readFileSync('prepare/韻鏡（古逸叢書本）.csv', { encoding: 'utf8' }).trimEnd().split('\n')) {
    const [字頭, 轉號, 上位, 右位] = line.split(',');
    const key = `${轉號}-${上位}-${右位}`;
    韻鏡位置2字頭Map.set(key, 字頭);
  }

  data.forEach(([, 上字, 下字, 被切字音韻描述, 上字音韻描述, 下字音韻描述]) => {
    const 被切字音韻地位 = 音韻地位.from描述(被切字音韻描述);
    const 上字音韻地位 = 音韻地位.from描述(上字音韻描述);
    const 下字音韻地位 = 音韻地位.from描述(下字音韻描述);

    defaultLogger.enable = true;

    const 上字資料 = query字頭(上字).find(({ 音韻地位 }) => 音韻地位.等於(上字音韻地位))!;
    const 下字資料 = query字頭(下字).find(({ 音韻地位 }) => 音韻地位.等於(下字音韻地位))!;

    const 上字小韻所有字 = get小韻(上字資料.來源!.小韻號)!.map(({ 字頭 }) => 字頭);
    const 下字小韻所有字 = get小韻(下字資料.來源!.小韻號)!.map(({ 字頭 }) => 字頭);

    const 上字韻鏡位置 = 音韻地位2韻鏡位置(上字音韻地位);
    const 下字韻鏡位置 = 音韻地位2韻鏡位置(下字音韻地位);

    const 上字韻鏡位置字頭 = 韻鏡位置2字頭(上字韻鏡位置)!;
    const 下字韻鏡位置字頭 = 韻鏡位置2字頭(下字韻鏡位置)!;

    t.true(上字小韻所有字.includes(上字韻鏡位置字頭), `上字韻鏡位置 ${上字韻鏡位置.描述} 對應的字頭 ${上字韻鏡位置字頭} 在小韻中`);
    t.true(下字小韻所有字.includes(下字韻鏡位置字頭), `下字韻鏡位置 ${下字韻鏡位置.描述} 對應的字頭 ${下字韻鏡位置字頭} 在小韻中`);

    defaultLogger.log('# 確定上字的音韻地位\n');
    const 上字對應小韻首字 = 上字 !== 上字小韻所有字[0] ? `《廣韻》「${上字}」屬於${上字小韻所有字[0]}小韻，` : '';
    const 上字小韻首字對應韻鏡位置字頭 = 上字小韻所有字[0] !== 上字韻鏡位置字頭 ? `該小韻包含「${上字韻鏡位置字頭}」字，` : '';
    const 上字對應 = 上字 !== 上字韻鏡位置字頭 ? `${上字對應小韻首字}${上字小韻首字對應韻鏡位置字頭}` : '';
    defaultLogger.log(`${上字對應}在《韻鏡》中查得「${上字韻鏡位置字頭}」字位於韻鏡位置 ${上字韻鏡位置.描述}`);
    上字韻鏡位置.to音韻地位();

    defaultLogger.log('\n# 確定下字的音韻地位\n');
    const 下字對應小韻首字 = 下字 !== 下字小韻所有字[0] ? `《廣韻》「${下字}」屬於${下字小韻所有字[0]}小韻，` : '';
    const 下字小韻首字對應韻鏡位置字頭 = 下字小韻所有字[0] !== 下字韻鏡位置字頭 ? `該小韻包含「${下字韻鏡位置字頭}」字，` : '';
    const 下字對應 = 下字 !== 下字韻鏡位置字頭 ? `${下字對應小韻首字}${下字小韻首字對應韻鏡位置字頭}` : '';
    defaultLogger.log(`${下字對應}在《韻鏡》中查得「${下字韻鏡位置字頭}」字位於韻鏡位置 ${下字韻鏡位置.描述}`);
    下字韻鏡位置.to音韻地位();

    defaultLogger.log('\n# 根據上下字音韻地位得出被切字音韻地位\n');
    const 預測音韻地位們 = 執行反切(上字音韻地位, 下字音韻地位);

    const hasEqual = 預測音韻地位們.some(預測音韻地位 => 預測音韻地位.等於(被切字音韻地位));
    t.true(hasEqual, '可以正常反切');

    const 預測音韻地位 = 預測音韻地位們[0];
    defaultLogger.log('\n# 根據被切字音韻地位推導廣州音\n');
    const 推導結果 = 推導廣州音(預測音韻地位);
    void 推導結果;

    const 解釋 = defaultLogger.popAll();
    defaultLogger.enable = false;

    console.log(解釋.join('\n') + '\n==============================\n');
  });
});

import test from 'ava';

import { query字頭, 音韻地位 } from './音韻地位';

test('查「東」字的反切', (t) => {
  const 字頭 = '東';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].音韻地位.反切(字頭), '德紅');
});

test('查「拯」字的反切，「拯」字無反切，值為 null', (t) => {
  const 字頭 = '拯';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].音韻地位.反切(字頭), null);
});

test('查詢有音無字的音韻地位的反切', (t) => {
  const 當前音韻地位 = new 音韻地位('從', '合', '三', null, '歌', '平');
  t.is(當前音韻地位.反切(null), null);
});

test('查特殊反切', (t) => {
  const 當前音韻地位 = new 音韻地位('精', '合', '三', null, '支', '平');
  t.is(當前音韻地位.反切(null), '姊規');
  t.is(當前音韻地位.反切('劑'), '遵爲');
});

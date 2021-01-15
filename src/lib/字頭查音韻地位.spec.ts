import test from 'ava';

import { query字頭 } from './音韻地位';

test('查詢「之」字', (t) => {
  const res = query字頭('之');
  t.is(res.length, 1);
  t.is(res[0].音韻地位.描述, '章開三之平');
  t.is(res[0].解釋, '適也往也閒也亦姓出姓苑止而切四');
});

test('查詢「過」字。「過」字有兩讀', (t) => {
  const res = query字頭('過');
  t.is(res.length, 2);
});

test('查詢不存在的字，沒有讀音', (t) => {
  const res = query字頭('!');
  t.is(res.length, 0);
});

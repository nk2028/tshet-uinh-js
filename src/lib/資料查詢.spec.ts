import test from 'ava';

import { query字頭, query音韻地位 } from './解析資料';
import { 音韻地位 } from './音韻地位';

test('查「東」字的反切', t => {
  const 字頭 = '東';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, '德紅');
});

test('查「拯」字的反切，「拯」字無反切，值為 null', t => {
  const 字頭 = '拯';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, null);
});

test('查同地位不同反切', t => {
  const 地位 = 音韻地位.from描述('見開四添去');
  const 條目 = query音韻地位(地位);
  t.is(條目.find(({ 字頭 }) => 字頭 === '趝')!.反切, '紀念');
  t.is(條目.find(({ 字頭 }) => 字頭 === '兼')!.反切, '古念');
});

test('查音韻地位「見合一歌平」，含「戈」、「過」等字', t => {
  const 當前音韻地位 = 音韻地位.from描述('見合一歌平'); // 注意：戈韻不獨立，屬歌韻
  t.true(query音韻地位(當前音韻地位).length > 0);
});

test('查音韻地位「從合三歌平」，有音無字', t => {
  const 當前音韻地位 = 音韻地位.from描述('從合三歌平');
  t.is(query音韻地位(當前音韻地位).length, 0);
});

test('查詢「之」字', t => {
  const res = query字頭('之');
  t.is(res.length, 1);
  t.is(res[0].音韻地位.描述, '章開三之平');
  t.is(res[0].解釋, '適也往也閒也亦姓出姓苑止而切四');
});

test('查詢「過」字。「過」字有兩讀', t => {
  const res = query字頭('過');
  t.is(res.length, 2);
});

test('查詢不存在的字，沒有讀音', t => {
  const res = query字頭('!');
  t.is(res.length, 0);
});

test('查詢韻部原貌', t => {
  t.is(query字頭('劒')?.[0].韻部原貌, '梵');
  t.is(query字頭('茝').find(({ 音韻地位 }) => 音韻地位.屬於('廢韻'))?.韻部原貌, '海');
});

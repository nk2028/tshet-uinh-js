import { readFileSync } from 'fs';

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
  t.is(res[0].釋義, '適也往也閒也亦姓出姓苑止而切四');
});

test('查詢「過」字。「過」字有兩讀', t => {
  const res = query字頭('過');
  t.is(res.length, 2);
});

test('查詢不存在的字，沒有讀音', t => {
  const res = query字頭('!');
  t.is(res.length, 0);
});

test('查詢韻目原貌', t => {
  t.is(query字頭('劒')[0]?.韻目原貌, '梵');
  t.is(query字頭('茝').find(({ 音韻地位 }) => 音韻地位.屬於('廢韻'))?.韻目原貌, '海');
});

test('根據原資料檔查詢所有字頭', t => {
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).split('\n').slice(1, -1)) {
    const [, , 韻目原貌1, 地位描述1, 原反切1, 字頭1, 字頭又作1, 原釋義1, 釋義補充1] = line.split(',');
    if (!地位描述1) {
      continue;
    }
    const 反切1 = 原反切1 || null;
    const 釋義1 = 原釋義1 + (釋義補充1 && `（${釋義補充1}）`);
    const 音韻地位1 = 音韻地位.from描述(地位描述1);

    const query = (查詢字頭: string) =>
      query字頭(查詢字頭).some(({ 字頭: 字頭2, 音韻地位: 音韻地位2, 韻目原貌: 韻目原貌2, 反切: 反切2, 釋義: 釋義2 }) => {
        return 字頭1 === 字頭2 && 音韻地位1.等於(音韻地位2) && 韻目原貌1 == 韻目原貌2 && 反切1 === 反切2 && 釋義1 === 釋義2;
      });

    t.true(query(字頭1), line);
    for (const 別體 of [...字頭又作1]) {
      t.true(query(別體));
    }
  }
});

import { readFileSync } from 'node:fs';

import test from 'ava';

import { 字頭詳情 } from '../data/common';

import { query字頭, query音韻地位, 資料條目 } from './資料';
import { 音韻地位 } from './音韻地位';

test('查「東」字的反切', t => {
  const 字頭 = '東';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, '德紅');
});

test('查「拯」字的音切，「拯」字有直音，無反切', t => {
  const 字頭 = '拯';
  const res = query字頭(字頭);
  t.is(res.length, 1);
  t.is(res[0].反切, null);
  t.is(res[0].直音, '蒸上聲');
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

// TODO(tests) 查詢含校勘（應補、應刪、校）的字

test('查詢資料不包含的字，沒有讀音', t => {
  const res = query字頭('韓'); // 《廣韻》字頭作「𩏑」，同時釋義注「亦作韓」
  t.is(res.length, 0);
});

test('查詢來源文獻信息', t => {
  t.like(
    query字頭('茝').find(({ 音韻地位 }) => 音韻地位.屬於('廢韻')),
    { 來源: '廣韻', 小韻號: '1454', 小韻字號: '1', 韻目: '海' },
  );
  t.like(
    query字頭('韻').find(({ 音韻地位 }) => 音韻地位.屬於('B類')),
    { 來源: '切韻', 韻目: '震' },
  );
  t.like(
    query字頭('忘').find(({ 音韻地位 }) => 音韻地位.屬於('去聲')),
    { 來源: '廣韻', 小韻號: '2914', 小韻字號: '4', 韻目: '漾' },
  );
  t.like(
    query字頭('忘').find(({ 音韻地位 }) => 音韻地位.屬於('平聲')),
    { 來源: '切韻', 韻目: '陽' },
  );
});

test('根據原資料檔查詢所有字頭', t => {
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).trimEnd().split('\n').slice(1)) {
    const [小韻號1, 小韻字號1, 韻目1, 地位描述, 反切1, 直音1, 字頭1, 字頭說明1, 釋義1] = line.split(',');
    const 音韻地位1 = 音韻地位.from描述(地位描述);

    function isEqual({ 來源, 小韻號, 小韻字號, 韻目, 音韻地位, 反切, 直音, 字頭, 字頭說明, 釋義 }: 資料條目) {
      return (
        來源 === '廣韻' &&
        小韻號 === 小韻號1 &&
        小韻字號 === 小韻字號1 &&
        韻目 === 韻目1 &&
        音韻地位.等於(音韻地位1) &&
        反切 === (反切1 || null) &&
        直音 === (直音1 || null) &&
        字頭 === 字頭1 &&
        字頭說明 === (字頭說明1 || null) &&
        釋義 === (釋義1 || null)
      );
    }

    const [字頭原貌, 字頭校正] = 字頭詳情(字頭1);

    if (字頭校正) {
      t.true(query字頭(字頭校正).some(isEqual), line);
    }
    if (字頭原貌 && 字頭原貌 !== 字頭校正) {
      t.true(query字頭(字頭原貌).some(isEqual), line);
    }
  }
});

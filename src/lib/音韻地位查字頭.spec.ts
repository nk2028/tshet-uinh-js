import test from 'ava';

import { 音韻地位 } from './音韻地位';

test('查音韻地位「見合一歌平」，含「戈」、「過」等字', (t) => {
  const 當前音韻地位 = 音韻地位.from描述('見合一歌平'); // 注意：戈韻不獨立，屬歌韻
  t.true(當前音韻地位.條目.length > 0);
});

test('查音韻地位「從合三歌平」，有音無字', (t) => {
  const 當前音韻地位 = 音韻地位.from描述('從合三歌平');
  t.true(當前音韻地位.條目.length === 0);
});

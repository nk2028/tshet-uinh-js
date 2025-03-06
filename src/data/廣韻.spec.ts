import { readFileSync } from 'node:fs';
import * as util from 'node:util';

import test from 'ava';

import * as 廣韻 from './廣韻';

test('檢索廣韻小韻', t => {
  const 小韻3708a = 廣韻.get小韻('3708a')!;
  const 小韻3708b = 廣韻.get小韻('3708b')!;
  t.is(小韻3708a.length, 15);
  t.is(小韻3708a[0].字頭, '憶');
  t.is(小韻3708b.length, 2);
  t.is(小韻3708b[0].字頭, '抑');

  const collect字頭 = (結果: 廣韻.廣韻條目[]) => 結果.map(x => x.字頭);

  const 原書小韻3708 = 廣韻.get原書小韻(3708)!;
  t.is(原書小韻3708.length, 17);
  t.deepEqual([...collect字頭(小韻3708a), ...collect字頭(小韻3708b)].sort(), collect字頭(原書小韻3708).sort());
});

test('原書小韻總數', t => {
  t.is(廣韻.原書小韻總數, 3874);
});

test('釋義上下文', t => {
  const 原書小韻 = 廣韻.get原書小韻(949)!;
  t.is(原書小韻[7].字頭, '菱');

  const 上下文 = 原書小韻[7].釋義上下文;
  t.not(上下文, null);
  t.is(上下文!.length, 3);
  t.deepEqual(
    上下文!.map(x => x.字頭),
    ['蔆', '菱', '䔖'],
  );

  t.deepEqual(原書小韻[6].釋義上下文, 上下文);
  t.deepEqual(原書小韻[8].釋義上下文, 上下文);
});

test('釋義上下文（若有）長度至少為 2', t => {
  for (const 條目 of 廣韻.iter條目()) {
    if (條目.釋義上下文) {
      t.true(條目.釋義上下文.length >= 2, util.inspect(條目));
    }
  }
});

test('對照 iter原書小韻 與 iter條目', t => {
  const it1 = 廣韻.iter原書小韻();
  const it2 = 廣韻.iter條目();

  for (const 原書小韻 of it1) {
    for (const 條目1 of 原書小韻) {
      const next = it2.next();
      t.falsy(next.done);
      const 條目2 = (next as IteratorYieldResult<廣韻.廣韻條目>).value;

      t.deepEqual(條目1, 條目2);
    }
  }
});

test('對照原資料檔與 iter條目', t => {
  const 條目iter = 廣韻.iter條目();
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).trimEnd().split('\n').slice(1)) {
    const [小韻號, 小韻字號, 韻目, 地位描述, 反切, 直音, 字頭, 字頭說明, 釋義] = line.split(',');

    const next = 條目iter.next();
    t.falsy(next.done);
    const 條目 = (next as IteratorYieldResult<廣韻.廣韻條目>).value;
    t.is(條目.小韻號, 小韻號);
    t.is(條目.小韻字號, 小韻字號);
    t.is(條目.韻目, 韻目);
    t.is(條目.音韻地位.描述, 地位描述);
    t.is(條目.反切, 反切 || null);
    t.is(條目.直音, 直音 || null);
    t.is(條目.字頭, 字頭);
    t.is(條目.字頭說明, 字頭說明 || null);
    t.is(條目.釋義, 釋義 || null);
  }
});

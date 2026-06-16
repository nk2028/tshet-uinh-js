import test from 'ava';

import * as 切韻 from './切韻';

test('檢索切韻小韻', t => {
  const res = 切韻.get原書小韻(1)!;
  t.deepEqual(res.map(x => x.字頭), ['東', '涷']);
});

test('切韻細分小韻', t => {
  const resA = 切韻.get小韻('1520a')!;
  const resB = 切韻.get小韻('1520b')!;
  t.deepEqual(resA.map(x => x.字頭), ['鷕']);
  t.deepEqual(resB.map(x => x.字頭), ['溔', '舀']);

  const res = 切韻.get原書小韻(1520)!;
  t.deepEqual([...resA, ...resB], res);
});

test('原書小韻總數', t => {
  t.is(切韻.原書小韻總數, 3365);
});

test('對照 iter原書小韻 與 iter條目', t => {
  const it1 = 切韻.iter原書小韻();
  const it2 = 切韻.iter條目();

  for (const 原書小韻 of it1) {
    for (const 條目1 of 原書小韻) {
      const next = it2.next();
      t.falsy(next.done);
      const 條目2 = (next as IteratorYieldResult<切韻.切韻條目>).value;

      t.deepEqual(條目1, 條目2);
    }
  }
});

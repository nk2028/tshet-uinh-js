import test from 'ava';

import { decode音韻編碼, encode音韻編碼 } from './壓縮表示';
import { iter音韻地位 } from './解析資料';
import { 音韻地位 } from './音韻地位';

test('測試音韻編碼', t => {
  t.is(encode音韻編碼(音韻地位.from描述('幫三C凡入')), 'A9P');
  t.is(encode音韻編碼(音韻地位.from描述('羣開三A支平')), 'fFU');

  t.is(decode音韻編碼('A9P').描述, '幫三C凡入');
  t.is(decode音韻編碼('fFU').描述, '羣開三A支平');
});

test('測試資料內全部音韻地位與編碼雙向轉換', t => {
  for (const 當前音韻地位 of iter音韻地位()) {
    const encoded = encode音韻編碼(當前音韻地位);
    const decoded = decode音韻編碼(encoded);
    t.true(decoded.等於(當前音韻地位), `${當前音韻地位.描述} -> ${encoded} -> ${decoded.描述}`);
  }
});

test('測試不合法編碼', t => {
  t.throws(() => decode音韻編碼('A'), { message: 'Invalid 編碼: "A"' });
  t.throws(() => decode音韻編碼('@@@'), { message: 'Invalid character in 編碼: "@"' });
  t.throws(() => decode音韻編碼('mAA'), { message: 'Invalid 母序號: 38' });
});

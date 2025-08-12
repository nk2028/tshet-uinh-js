import test from 'ava';

import { defaultLogger } from './StringLogger';

test('測試 StringLogger', t => {
  defaultLogger.enable = true;
  defaultLogger.log('測試 1');
  defaultLogger.log('測試 2');
  t.deepEqual(defaultLogger.popAll(), ['測試 1', '測試 2']);
  t.is(defaultLogger.popAll().length, 0);
  defaultLogger.enable = false;
  defaultLogger.log('這條不應該被記錄');
  t.is(defaultLogger.popAll().length, 0);
});

const 編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
const 所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以';
const 所有呼 = '開合';
const 所有等 = '一二三四';
const 所有重紐 = 'AB';
const 所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡';
const 所有聲 = '平上去入';

function assert(b, s) {
  if (!b) {
    throw new Error(s);
  }
}

export function validate(母, 呼, 等, 重紐, 韻, 聲) {
  assert(母.length === 1 && [...所有母].includes(母), `Unexpected 母: ${JSON.stringify(母)}`);
  assert(等.length === 1 && [...所有等].includes(等), `Unexpected 等: ${JSON.stringify(等)}`);
  assert(韻.length === 1 && [...所有韻].includes(韻), `Unexpected 韻: ${JSON.stringify(韻)}`);
  assert(聲.length === 1 && [...所有聲].includes(聲), `Unexpected 聲: ${JSON.stringify(聲)}`);

  if ([...'幫滂並明'].includes(母) || 韻 === '模') {
    assert(呼 == null, '呼 should be null');
  } else {
    assert(呼.length === 1 && [...所有呼].includes(呼), `Unexpected 呼: ${JSON.stringify(呼)}`);
  }

  if ([...'支脂祭眞仙宵清侵鹽'].includes(韻) && [...'幫滂並明見溪羣疑影曉匣云以'].includes(母)) {
    assert(重紐.length === 1 && [...所有重紐].includes(重紐), `Unexpected 重紐: ${JSON.stringify(重紐)}`);
  } else {
    assert(重紐 == null, '重紐 should be null');
  }
}

/* eslint-disable no-bitwise */

export function encode(母, 呼, 等, 重紐, 韻, 聲) {
  validate(母, 呼, 等, 重紐, 韻, 聲);
  const 母編碼 = 所有母.indexOf(母);
  const 韻編碼 = 所有韻.indexOf(韻);
  const 其他編碼 = ((呼 === '合') << 5) + (所有等.indexOf(等) << 3) + ((重紐 === 'B') << 2) + (所有聲.indexOf(聲));
  return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼];
}

export function decode(s) {
  const 母編碼 = 編碼表.indexOf(s[0]);
  const 韻編碼 = 編碼表.indexOf(s[1]);
  const 其他編碼 = 編碼表.indexOf(s[2]);

  const 呼編碼 = 其他編碼 >> 5;
  const 等編碼 = (其他編碼 >> 3) & 0b11;
  const 重紐編碼 = (其他編碼 >> 2) & 0b1;
  const 聲編碼 = 其他編碼 & 0b11;

  const 母 = 所有母[母編碼];
  const 韻 = 所有韻[韻編碼];
  const 等 = 所有等[等編碼];
  const 聲 = 所有聲[聲編碼];

  let 呼 = 所有呼[呼編碼];
  let 重紐 = 所有重紐[重紐編碼];

  if ([...'幫滂並明'].includes(母) || 韻 === '模') {
    呼 = null;
  }

  if (![...'支脂祭眞仙宵清侵鹽'].includes(韻) || ![...'幫滂並明見溪羣疑影曉匣云以'].includes(母)) {
    重紐 = null;
  }

  return { 母, 呼, 等, 重紐, 韻, 聲 };
}

/* eslint-enable no-bitwise */

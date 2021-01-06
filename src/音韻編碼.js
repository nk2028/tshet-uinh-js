const 編碼表 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
const 所有母 = '幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以';
const 所有呼 = '開合';
const 所有等 = '一二三四';
const 所有重紐 = 'AB';
const 所有韻 = '東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡';
const 所有聲 = '平上去入';
const 重紐母 = '幫滂並明見溪羣疑影曉';
const 重紐韻 = '支脂祭眞仙宵清侵鹽';

function assert(b, s) {
  if (!b) {
    throw new Error(s);
  }
}

/**
 * 驗證給定的音韻地位六要素是否合法。
 *
 * 母必須為「幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日
 * 見溪羣疑影曉匣云以」三十八聲類之一。
 *
 * 韻必須為「東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢眞臻文欣元魂痕
 * 寒刪山仙先蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡」五十八韻之一。
 *
 * 注意：不設諄、桓、戈韻。分別併入眞、寒、歌韻。
 *
 * 當聲母為脣音，或韻母為模韻時，呼必須為 `null`。在其他情況下，呼必須取「開」或「合」。
 *
 * 當聲母為脣牙喉音，且韻母為「支脂祭眞仙宵清侵鹽」九韻之一時，重紐必須取 `A` 或 `B`。
 * 在其他情況下，重紐必須取 `null`。
 * @param {string} 母 聲母：幫, 滂, 並, 明, …
 * @param {string} 呼 呼：`null`, 開, 合
 * @param {string} 等 等：一, 二, 三, 四
 * @param {string} 重紐 重紐：`null`, A, B
 * @param {string} 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
 * @param {string} 聲 聲調：平, 上, 去, 入
 * @throws {Error} 若給定的音韻地位六要素不合法，則拋出異常。
 */
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

  if ([...重紐母].includes(母) && [...重紐韻].includes(韻)) {
    assert(重紐.length === 1 && [...所有重紐].includes(重紐), `Unexpected 重紐: ${JSON.stringify(重紐)}`);
  } else {
    assert(重紐 == null, '重紐 should be null');
  }
}

/* eslint-disable no-bitwise */

/**
 * 將音韻地位六要素轉換為音韻編碼。
 *
 * 此函式會首先驗證給定的音韻地位六要素是否合法，故無需重複呼叫 `validate` 函式。
 * @param {string} 母 聲母：幫, 滂, 並, 明, …
 * @param {string} 呼 呼：`null`, 開, 合
 * @param {string} 等 等：一, 二, 三, 四
 * @param {string} 重紐 重紐：`null`, A, B
 * @param {string} 韻 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
 * @param {string} 聲 聲調：平, 上, 去, 入
 * @returns {string} 給定的音韻地位對應的編碼。
 * @throws {Error} 若給定的音韻地位六要素不合法，則拋出異常。
 * @example
 * > Qieyun.encode('幫', null, '三', null, '凡', '入');
 * 'A5T'
 * > Qieyun.encode('羣', '開', '三', 'A', '支', '平');
 * 'fEQ'
 */
export function encode(母, 呼, 等, 重紐, 韻, 聲) {
  validate(母, 呼, 等, 重紐, 韻, 聲);
  const 母編碼 = 所有母.indexOf(母);
  const 韻編碼 = 所有韻.indexOf(韻);
  const 其他編碼 = ((呼 === '合') << 5) + (所有等.indexOf(等) << 3) + ((重紐 === 'B') << 2) + (所有聲.indexOf(聲));
  return 編碼表[母編碼] + 編碼表[韻編碼] + 編碼表[其他編碼];
}

/**
 * 將音韻編碼轉換為音韻地位六要素。
 * @param {string} 音韻編碼 表示音韻地位的編碼
 * @returns {{母: string, 呼: string, 等: string, 重紐: string, 韻: string, 聲: string}} 給定的音韻編碼對應的音韻地位。
 * @example
 * > Qieyun.decode('A5T');
 * { 母: '幫', 呼: null, 等: '三', 重紐: null, 韻: '凡', 聲: '入' }
 * > Qieyun.decode('fEQ');
 * { 母: '羣', 呼: '開', 等: '三', 重紐: 'A', 韻: '支', 聲: '平' }
 */
export function decode(音韻編碼) {
  const 母編碼 = 編碼表.indexOf(音韻編碼[0]);
  const 韻編碼 = 編碼表.indexOf(音韻編碼[1]);
  const 其他編碼 = 編碼表.indexOf(音韻編碼[2]);

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

  if (![...重紐母].includes(母) || ![...重紐韻].includes(韻)) {
    重紐 = null;
  }

  return { 母, 呼, 等, 重紐, 韻, 聲 };
}

/* eslint-enable no-bitwise */

import test from 'ava';

import { iter音韻地位 } from './解析資料';
import { 判斷規則列表, 邊緣地位種類指定, 音韻地位 } from './音韻地位';

// 由音韻地位得出各項音韻屬性

test('測試「法」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三C凡入');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '幫');
  t.is(當前音韻地位.呼, null);
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.類, 'C');
  t.is(當前音韻地位.韻, '凡');
  t.is(當前音韻地位.聲, '入');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全清');
  t.is(當前音韻地位.音, '脣');
  t.is(當前音韻地位.攝, '咸');

  // 其他
  t.is(當前音韻地位.描述, '幫三C凡入');
  t.is(當前音韻地位.簡略描述, '幫凡入');
  t.is(當前音韻地位.表達式, '幫母 開合中立 三等 C類 凡韻 入聲');

  t.true(當前音韻地位.等於(音韻地位.from描述('幫凡入', true)));
});

test('測試「祇」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('羣開三A支平');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '羣');
  t.is(當前音韻地位.呼, '開');
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.類, 'A');
  t.is(當前音韻地位.韻, '支');
  t.is(當前音韻地位.聲, '平');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全濁');
  t.is(當前音韻地位.音, '牙');
  t.is(當前音韻地位.攝, '止');

  // 其他
  t.is(當前音韻地位.描述, '羣開三A支平');
  t.is(當前音韻地位.簡略描述, '羣開A支平');
  t.is(當前音韻地位.表達式, '羣母 開口 三等 A類 支韻 平聲');

  t.true(當前音韻地位.等於(音韻地位.from描述('羣開A支平', true)));
});

test('音韻地位.調整', t => {
  const 地位 = 音韻地位.from描述('幫三C元上');
  t.is(地位.調整({ 聲: '平' }).描述, '幫三C元平');
  t.throws(() => 地位.調整({ 母: '見' }), { message: /missing 呼/ }, '.調整() 會驗證新地位');
  t.is(地位.調整({ 母: '見', 呼: '合' }).描述, '見合三C元上');
  t.is(地位.描述, '幫三C元上', '.調整() 不修改原對象');
});

// 屬於

test('測試「法」字對應的音韻地位的屬於函式（基本用法）', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三C凡入');
  t.true(當前音韻地位.屬於('幫母'));
  t.true(當前音韻地位.屬於('幫精組'));
  t.false(當前音韻地位.屬於('精組'));
  t.false(當前音韻地位.屬於('AB類'));
  t.true(當前音韻地位.屬於('C類'));
  t.true(當前音韻地位.屬於('BC類'));
  t.false(當前音韻地位.屬於('喉音'));
  t.true(當前音韻地位.屬於('仄聲'));
  t.false(當前音韻地位.屬於('舒聲'));
  t.true(當前音韻地位.屬於('清音'));
  t.false(當前音韻地位.屬於('全濁'));
  t.false(當前音韻地位.屬於('次濁'));
  t.true(當前音韻地位.屬於('開合中立'));
  t.false(當前音韻地位.屬於('開口 或 合口'));
  t.true(當前音韻地位.屬於('幫組 C類'));
  t.false(當前音韻地位.屬於('陰聲韻'));
});

test('測試「法」字對應的音韻地位的屬於（複雜用法）及判斷函式', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三C凡入');
  t.true(當前音韻地位.屬於('非 一等'));
  t.true(當前音韻地位.屬於('非 (一等)'));
  t.true(當前音韻地位.屬於('非 ((一等))'));
  t.true(當前音韻地位.屬於('非 (非 三等)'));
  t.true(當前音韻地位.屬於('非 非 非 一等'));
  t.true(當前音韻地位.屬於('三等 或 一等 且 來母')); // 「且」優先於「或」
  t.false(當前音韻地位.屬於('(三等 或 一等) 且 來母'));
  t.true(當前音韻地位.屬於`一四等 或 ${當前音韻地位.描述 === '幫三C凡入'}`);
  t.true(當前音韻地位.屬於`${() => '三等'} 或 ${() => '短路〔或〕'}`);
  t.false(當前音韻地位.屬於`非 ${() => '三等'} 且 ${() => '短路〔且〕'}`);
  t.throws(() => 當前音韻地位.屬於`${() => '三等'} 或 ${'立即求值'}`, { message: 'unrecognized test condition: 立即求值' });
  t.is(
    當前音韻地位.判斷(
      [
        ['遇果假攝 或 支脂之佳韻', ''],
        ['蟹攝 或 微韻', 'i'],
        ['效流攝', 'u'],
        [
          '深咸攝',
          [
            ['舒聲', 'm'],
            ['入聲', 'p'],
          ],
        ],
        [
          '臻山攝',
          [
            ['舒聲', 'n'],
            ['入聲', 't'],
          ],
        ],
        [
          '通江宕梗曾攝',
          [
            ['舒聲', 'ng'],
            ['入聲', 'k'],
          ],
        ],
      ],
      '無韻尾規則',
    ),
    'p',
  );
});

test('測試不合法表達式', t => {
  const 地位 = 音韻地位.from描述('幫三C凡入');
  const is = 地位.屬於.bind(地位);
  t.throws(() => is``, { message: 'empty expression' });
  t.throws(() => is`三等 且 ()`, { message: 'expect expression, got: )' });
  t.throws(() => is`一等 或`, { message: 'expect expression, got: end of expression' });
  t.throws(() => is`或 一等`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 (或 一等)`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 非`, { message: "expect operand or '(', got: end of expression" });
  t.throws(() => is`桓韻`, { message: 'unknown 韻: 桓' });
  t.throws(() => is`${'桓韻'}`, { message: 'unknown 韻: 桓' });
  t.throws(() => is`三等 或 桓韻`, { message: 'unknown 韻: 桓' });
});

test('測試判斷式拋異常', t => {
  const 地位 = 音韻地位.from描述('幫三C凡入');
  t.throws(
    () =>
      地位.判斷([
        ['遇果假攝 或 支脂之佳韻', ''],
        // ...
        [
          '深咸攝',
          [
            ['舒聲', 'm'],
            ['促聲', 'p'],
          ],
        ],
        // ...
        ['短路！', ''],
      ]),
    { message: 'unknown 聲: 促' },
  );
  t.throws(() => 地位.判斷([] as 判斷規則列表<never>, '壞耶'), { message: '壞耶' });
});

test('判斷式 null 與 fall through', t => {
  const 地位 = 音韻地位.from描述('幫三C凡入');

  t.is(地位.判斷([]), null);
  t.is(地位.判斷([['見母', 42]]), null);

  const 規則 = [
    ['幫組', []],
    ['幫母 凡韻', 43],
  ] as const;
  t.is(地位.判斷(規則), null);
  t.throws(() => 地位.判斷(規則, '壞耶'), { message: '壞耶' });
});

test('簡略描述', t => {
  const test簡略描述 = (描述: string, 簡略描述: string, message: string) => {
    const 地位 = 音韻地位.from描述(描述);
    t.is(地位.簡略描述, 簡略描述, 'to 簡略描述: ' + message);
    const 地位from簡略描述 = 音韻地位.from描述(簡略描述, true);
    t.is(地位.描述, 地位from簡略描述.描述, 'from 簡略描述: ' + message);
  };
  test簡略描述('精開三鹽平', '精鹽平', '省略呼、等');
  test簡略描述('見開二佳平', '見開佳平', '省略等（按韻）');
  test簡略描述('章開三麻上', '章開麻上', '省略等（按聲母）');
  test簡略描述('定開四脂去', '定開脂去', '省略等（特殊）');
  test簡略描述('幫三C凡入', '幫凡入', '省略C類');
  test簡略描述('見開三B庚平', '見開三庚平', '省略B類');
  test簡略描述('明三A清平', '明清平', '省略等、A類');
  test簡略描述('云合三B蒸入', '云蒸入', '省略呼、等、類');
  test簡略描述('影開三B蒸入', '影開B蒸入', '不省略類');
  test簡略描述('見開一歌平', '見開一歌平', '不省略');
  test簡略描述('端開四麻平', '端開四麻平', '不省略');
});

// 遍歷所有音韻地位

test('使用「iter音韻地位」函式遍歷所有音韻地位', t => {
  for (const 當前音韻地位 of iter音韻地位()) {
    t.is(音韻地位.from描述(當前音韻地位.描述).描述, 當前音韻地位.描述);
    t.true(當前音韻地位.屬於(當前音韻地位.表達式));
  }
});

test('不合法音韻地位', t => {
  t.throws(
    () => new 音韻地位('章', '開', '三', null, '眞', '平'),
    { message: /unrecognized 韻: 眞 \(did you mean: 真\?\)/ },
    '基本屬性取值有誤',
  );
  function testCase(描述: string, expectedMessage: RegExp, testMessage?: string) {
    t.throws(
      () => 音韻地位.from描述(描述),
      { message: expectedMessage },
      testMessage == null ? undefined : `不合法地位 '${描述}': ${testMessage}`,
    );
  }
  testCase('精開三祭入', /unexpected 祭韻入聲/, '聲搭配');
  testCase('莊開二陽平', /unexpected 陽韻二等/, '等搭配（韻）');
  testCase('定開三脂去', /unexpected 定母三等/, '等搭配（端組）');
  testCase('明合一魂平', /unexpected 呼/, '呼搭配（脣音）');
  testCase('端開一東平', /unexpected 呼/, '呼搭配（開合中立韻）');
  testCase('章三麻平', /missing 呼/, '呼搭配（分開合韻）');
  testCase('見合三A幽上', /unexpected 幽韻合口/, '呼搭配（僅開/僅合口韻）');
  testCase('幫四A先平', /unexpected 類/, '類搭配（等）');
  testCase('章開三A支平', /unexpected 類/, '類搭配（母）');
  testCase('明三清上', /missing 類 \(should be A\)/, '類搭配（韻）');
  testCase('明三陽去', /missing 類 \(should be C typically\)/, '類搭配（韻，可能有邊緣地位）');
  testCase('幫三B清入', /unexpected 幫母清韻B類/, '類搭配（綜合）');
  testCase('幫三C嚴入', /unexpected 嚴韻脣音/, '母搭配（凡韻）');
  testCase('初開三真去', /unexpected 真韻開口莊組/, '母搭配（臻韻）');
});

test('邊緣地位', t => {
  function passes(描述: string, 邊緣地位指定: 邊緣地位種類指定, testMessage?: string) {
    t.is(
      音韻地位.from描述(描述, false, 邊緣地位指定).描述,
      描述,
      testMessage == null ? undefined : `Should pass (${描述}): ${testMessage}`,
    );
  }
  function throws(描述: string, 邊緣地位指定: 邊緣地位種類指定, expectedMessage: RegExp, testMessage?: string) {
    t.throws(
      () => 音韻地位.from描述(描述, false, 邊緣地位指定),
      { message: expectedMessage },
      testMessage == null ? undefined : `Should throw (${描述}): ${testMessage}`,
    );
  }

  throws('見一東平', ['壞耶'], /unknown type of marginal 音韻地位: 壞耶/, '未知邊緣地位類型');

  // 嚴格邊緣地位
  passes('定開二佳上', [], '已知邊緣地位');

  throws('透開二佳上', [], /unexpected 透母二等佳韻/, '端組類隔（二等）');
  throws('端開四清上', [], /unexpected 端母四等清韻/, '端組類隔（四等）');
  passes('端開四清上', ['端組類隔'], '端組類隔');
  throws('端開四青上', ['端組類隔'], /\(note: don't specify/, '非相關邊緣地位');

  // 非嚴格邊緣地位
  throws('云開三C之平', [], /unexpected 云母開口 \(note: marginal 音韻地位/, '云母開口');
  passes('云開三C之平', ['云母開口'], '云母開口');
  passes('云開三C之平', ['云母開口', '蒸幽韻特殊類'], '非嚴格音韻地位類型指定');
});

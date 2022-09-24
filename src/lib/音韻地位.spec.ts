import { readFileSync } from 'fs';

import test, { ThrowsExpectation } from 'ava';

import { iter音韻地位, query字頭 } from './解析資料';
import { 判斷規則列表, 邊緣地位例外選項, 音韻地位 } from './音韻地位';

// 由音韻地位得出各項音韻屬性

test('測試「法」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '幫');
  t.is(當前音韻地位.呼, null);
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.重紐, null);
  t.is(當前音韻地位.韻, '凡');
  t.is(當前音韻地位.聲, '入');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全清');
  t.is(當前音韻地位.音, '脣');
  t.is(當前音韻地位.攝, '咸');

  // 其他
  t.is(當前音韻地位.描述, '幫三凡入');
  t.is(當前音韻地位.最簡描述, '幫凡入');
  t.is(當前音韻地位.表達式, '(幫母 開合中立 三等 不分重紐 凡韻 入聲)');
  t.is(當前音韻地位.編碼, 'A9D');

  t.true(當前音韻地位.等於(音韻地位.from描述('幫凡入')));
});

test('測試「祇」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('羣開三A支平');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '羣');
  t.is(當前音韻地位.呼, '開');
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.重紐, 'A');
  t.is(當前音韻地位.韻, '支');
  t.is(當前音韻地位.聲, '平');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全濁');
  t.is(當前音韻地位.音, '牙');
  t.is(當前音韻地位.攝, '止');

  // 其他
  t.is(當前音韻地位.描述, '羣開三A支平');
  t.is(當前音韻地位.最簡描述, '羣開A支平');
  t.is(當前音韻地位.表達式, '(羣母 開口 三等 重紐A類 支韻 平聲)');
  t.is(當前音韻地位.編碼, 'fFU');

  t.true(當前音韻地位.等於(音韻地位.from描述('羣開A支平')));
});

test('音韻地位.調整', t => {
  const 地位 = 音韻地位.from描述('幫三元上');
  t.is(地位.調整({ 聲: '平' }).描述, '幫三元平');
  t.throws(() => 地位.調整({ 母: '見' }), { message: /: missing 呼$/ }, '.調整() 會驗證新地位');
  t.is(地位.調整({ 母: '見', 呼: '合' }).描述, '見合三元上');
  t.is(地位.描述, '幫三元上', '.調整() 不修改原對象');
});

// 屬於

test('測試「法」字對應的音韻地位的屬於函式（基本用法）', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');
  t.true(當前音韻地位.屬於('幫母'));
  t.true(當前音韻地位.屬於('幫精組'));
  t.false(當前音韻地位.屬於('精組'));
  t.false(當前音韻地位.屬於('重紐A類 或 重紐B類'));
  t.false(當前音韻地位.屬於('喉音'));
  t.true(當前音韻地位.屬於('仄聲'));
  t.false(當前音韻地位.屬於('舒聲'));
  t.true(當前音韻地位.屬於('清音'));
  t.false(當前音韻地位.屬於('全濁'));
  t.false(當前音韻地位.屬於('次濁'));
  t.true(當前音韻地位.屬於('開合中立'));
  t.false(當前音韻地位.屬於('開口 或 合口'));
  t.false(當前音韻地位.屬於('陰聲韻'));
});

test('測試「法」字對應的音韻地位的屬於（複雜用法）及判斷函式', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');
  t.true(當前音韻地位.屬於('非 一等'));
  t.true(當前音韻地位.屬於('非 (一等)'));
  t.true(當前音韻地位.屬於('非 ((一等))'));
  t.true(當前音韻地位.屬於('非 (非 三等)'));
  t.true(當前音韻地位.屬於('非 非 非 一等'));
  t.true(當前音韻地位.屬於('三等 或 一等 且 來母')); // 「且」優先於「或」
  t.false(當前音韻地位.屬於('(三等 或 一等) 且 來母'));
  t.true(當前音韻地位.屬於`一四等 或 ${當前音韻地位.描述 === '幫三凡入'}`);
  t.true(當前音韻地位.屬於`${() => '三等'} 或 ${() => '短路〔或〕'}`);
  t.false(當前音韻地位.屬於`非 ${() => '三等'} 且 ${() => '短路〔且〕'}`);
  t.throws(() => 當前音韻地位.屬於`${() => '三等'} 或 ${'立即求值'}`, { message: 'unreconized test condition: 立即求值' });
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
      '無韻尾規則'
    ),
    'p'
  );
});

test('測試不合法表達式', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');
  const is = 地位.屬於.bind(地位);
  t.throws(() => is``, { message: 'empty expression' });
  t.throws(() => is`三等 且 ()`, { message: 'expect expression, got: )' });
  t.throws(() => is`一等 或`, { message: 'expect expression, got: end of expression' });
  t.throws(() => is`或 一等`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 (或 一等)`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 非`, { message: "expect operand or '(', got: end of expression" });
  t.throws(() => is`桓韻`, { message: '桓韻不存在' });
  t.throws(() => is`${'桓韻'}`, { message: '桓韻不存在' });
  t.throws(() => is`三等 或 桓韻`, { message: '桓韻不存在' });
});

test('測試判斷式拋異常', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');
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
    { message: '促聲不存在' }
  );
  t.throws(() => 地位.判斷([], '壞耶'), { message: '壞耶' });
});

test('判斷式 null 與 fallback', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');

  t.is(地位.判斷([]), null);
  t.is(地位.判斷([['見母', 42]]), null);

  const 規則: 判斷規則列表 = [
    ['幫組', []],
    ['幫母 凡韻', 43],
  ];
  t.is(地位.判斷(規則), null);
  t.throws(() => 地位.判斷(規則, '壞耶'), { message: '壞耶' });
});

// 遍歷所有音韻地位

test('使用「iter音韻地位」函式遍歷所有音韻地位', t => {
  for (const 當前音韻地位 of iter音韻地位()) {
    t.true(音韻地位.from編碼(當前音韻地位.編碼).等於(當前音韻地位), 當前音韻地位.描述);
    t.true(當前音韻地位.屬於(當前音韻地位.表達式));
  }
});

test('根據原資料檔遍歷所有音韻地位', t => {
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).split('\n').slice(1, -1)) {
    const [, , 韻目原貌1, 最簡描述1, 反切覈校前1, 原反切1, 字頭覈校前1, 原字頭1, 原釋義1, 釋義補充1] = line.split(',');
    if (!最簡描述1) {
      continue;
    }
    const 反切1 = 原反切1 || 反切覈校前1 || null;
    const 字頭1 = 原字頭1 || 字頭覈校前1;
    const 釋義1 = 原釋義1 + (釋義補充1 && `（${釋義補充1}）`);

    const 音韻地位1 = 音韻地位.from描述(最簡描述1);
    t.true(
      query字頭(字頭1).some(({ 音韻地位: 音韻地位2, 韻部原貌: 韻目原貌2, 反切: 反切2, 解釋: 解釋2 }) => {
        return 音韻地位1.等於(音韻地位2) && 韻目原貌1 == 韻目原貌2 && 反切1 === 反切2 && 釋義1 === 解釋2;
      }),
      line
    );
  }
});

// 音韻表達格式

test('特殊地位編碼', t => {
  for (const [描述, 編碼] of [
    ['並三A陽上', 'CpF'],
    ['明三A麻上', 'DoF'],
  ] as const) {
    const 地位 = 音韻地位.from描述(描述);
    t.is(地位.描述, 描述);
    if (編碼) {
      t.is(地位.編碼, 編碼, 地位.描述);
      t.is(音韻地位.from編碼(編碼).描述, 地位.描述);
    }
  }
});

test('最簡描述 & from描述', t => {
  const run = (描述: string, 最簡描述: string, 邊緣地位指定?: 邊緣地位例外選項) => {
    const 地位 = 音韻地位.from描述(描述, 邊緣地位指定);
    t.is(地位.描述, 描述);
    t.is(地位.最簡描述, 最簡描述);
    if (描述 !== 最簡描述) {
      const 地位from最簡描述 = 音韻地位.from描述(最簡描述, 邊緣地位指定);
      t.true(地位.等於(地位from最簡描述), `expected ${地位.描述}, got ${地位from最簡描述.描述}`);
    }
  };

  run('曉開三殷平', '曉殷平');
  run('曉合一灰平', '曉灰平');
  run('疑開三嚴平', '疑嚴平');
  run('云合三虞平', '云虞平');
  run('影開三A幽平', '影A幽平');

  run('見開二麻平', '見開二麻平');
  run('生開三庚平', '生開三庚平');

  // 庚清最簡描述省略重紐，`from描述` 時填入
  run('云合三B庚上', '云合三庚上');
  run('明三A清平', '明清平');
  // 蒸幽重紐非必須，故不作此處理
  run('云合三蒸入', '云合蒸入');
  run('云合三B蒸入', '云合B蒸入', { 蒸韻B類: true });
});

// 驗證

test('不合法音韻地位', t => {
  const run = (desc: string, expectations?: string | RegExp | ThrowsExpectation) => {
    const args = desc.split(',').map(x => x || null);
    if (args.length !== 6) {
      throw new Error(`expected 6 elements, got ${args.length} (${desc})`);
    }
    if (typeof expectations === 'string') {
      const pattern = expectations;
      expectations = { message: msg => msg.endsWith(': ' + pattern) };
    } else if (expectations instanceof RegExp) {
      expectations = { message: expectations };
    }
    return t.throws(() => new 音韻地位(...(args as ConstructorParameters<typeof 音韻地位>)), expectations);
  };
  const tipIncompatible = " (note: use nk2028's data to avoid compatibility issues)";

  // 基本屬性
  run('孃,開,三,,眞,入', 'unrecognized 韻: 眞 (did you mean: 真?)'); // 暱（v1、韻典）
  run('見,合,三,,諄,平', 'unexpected 諄韻' + tipIncompatible); // 均（全字表）

  // 等
  run('端,開,四,,庚,上', 'unexpected 庚韻四等'); // 打（韻鑒），「等」有歧義
  run('見,開,二,B,庚,平', 'unexpected 二等重紐'); // 生造地位，測試重紐當限於三等
  run('徹,開,四,,齊,去', 'unexpected 徹母四等'); // 𥱻（韻典、全字表）
  run('匣,開,三,,真,平', 'unexpected 匣母三等');
  run('昌,開,一,,咍,上', 'unexpected 昌母一等' + tipIncompatible); // 茝（字音表、韻典、全字表）

  // 聲
  run('見,開,三,,魚,入', 'unexpected 魚韻入聲'); // 生造地位，測試陰聲韻不應有入聲

  // 呼
  run('明,開,一,,寒,入', 'unexpected 呼 for 脣音'); // 藒（韻典、全字表）
  run('端,開,一,,東,平', 'unexpected 呼 for 開合中立韻'); // 東（字音表、韻典、全字表）
  run('云,,三,B,仙,平', 'missing 呼'); // 生造地位，測試分開合韻需要開合
  run('影,,三,,幽,平', 'missing 呼 (should be 開)'); // 幽（v2、韻典）
  run('影,開,三,,文,平', 'unexpected 文韻開口'); // 生造地位，測試限定開合口的韻要與呼搭配

  // 重紐
  run('幫,,三,B,清,入', 'unexpected 清韻B類' + tipIncompatible); // 碧（字音表）
  run('見,開,三,,庚,平', 'missing 重紐 (should be B)'); // 京（v2、字音韻、韻典、全字表）
  run('見,合,三,,真,平', 'missing 重紐'); // 生造地位，測試鈍音重紐韻需重紐
  run('云,開,三,A,真,平', 'unexpected 云母A類'); // 礥（字音表）
  run('影,開,三,A,蒸,入', 'unexpected 蒸韻A類'); // 生造地位，測試幽韻不標A類
  run('並,,三,B,陽,上', 'unexpected 陽韻B類'); // 生造地位，測試陽韻無B類
  run('章,開,三,A,脂,上', 'unexpected 重紐 for 章母'); // 旨（字音表）

  // 母韻
  run('崇,開,三,,真,上', 'unexpected 莊組真韻' + tipIncompatible); // 濜（v1）
  run('見,開,三,,臻,平', 'unexpected 見母臻韻'); // 生造地位，測試臻韻限莊組
  run('幫,,三,,之,平', 'unexpected 脣音之韻'); // 生造地位，測試僅開口韻無脣音
  run('溪,合,三,,凡,上', 'unexpected 溪母凡韻' + tipIncompatible); // 凵（韻典、全字表）
});

test('邊緣地位', t => {
  // 內建已知地位
  t.is(音韻地位.from描述('端開二庚上').描述, '端開二庚上');
  // 未知地位
  t.throws(() => 音韻地位.from描述('端開二庚平'), { message: /: unexpected 端母二等$/ });
  // 邊緣地位指定
  t.is(音韻地位.from描述('端開二庚平', { 端組二三等: true }).描述, '端開二庚平');
  // 非該類地位不可指定
  t.throws(() => 音韻地位.from描述('知開二庚上', { 端組二三等: true }), { message: /: expected marginal 音韻地位:/ });

  t.is(音韻地位.from描述('明三A麻上').描述, '明三A麻上');
  t.throws(() => 音韻地位.from描述('曉開三A麻上'), { message: /: unexpected 麻韻三等曉母$/ });
  t.is(音韻地位.from描述('曉開三A麻上', { 麻三鈍音: true }).描述, '曉開三A麻上');
  t.throws(() => 音韻地位.from描述('曉開魚上', { 麻三鈍音: true }), { message: /: expected marginal 音韻地位:/ });

  // 非嚴格型邊緣地位，可以一律指定
  t.is(音韻地位.from描述('幫凡入', { 云母開口: true, 蒸韻B類: true, 羣邪俟母非三等: true }).描述, '幫三凡入');

  // `from編碼` 不檢查邊緣地位
  t.is(音韻地位.from編碼(音韻地位.from描述('端開二庚平', { 端組二三等: true }).編碼).描述, '端開二庚平');
});

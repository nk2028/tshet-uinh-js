import test, { ExecutionContext } from 'ava';

import { 導入或驗證, 正則化或驗證 } from './正則化';
import { 任意音韻地位, 音韻地位 } from './音韻地位';

// Helper functions

function raw地位fromString(s: string): 任意音韻地位 {
  const 六元組 = s.split(',');
  if (六元組.length !== 6) {
    throw new Error(`expected 6 elements, got ${六元組.length} (${s})`);
  }
  const [母, 呼, 等, 重紐, 韻, 聲] = 六元組;
  return { 母, 呼: 呼 || null, 等, 重紐: 重紐 || null, 韻, 聲 };
}
function stringFromRaw地位(地位: 任意音韻地位) {
  const { 母, 呼, 等, 重紐, 韻, 聲 } = 地位;
  return [母, 呼 ?? '', 等, 重紐 ?? '', 韻, 聲].join();
}

function test導入或驗證(t: ExecutionContext, 原體系脣音分寒桓歌戈: boolean) {
  const run = (input: string, expected?: string) => {
    if (input === expected) {
      throw new Error(`unnecessary argument "expected": ${input}`);
    }
    const input地位 = raw地位fromString(input);
    const expected地位 = expected !== undefined ? raw地位fromString(expected) : undefined;
    t.is(
      stringFromRaw地位(導入或驗證(input地位, true, 原體系脣音分寒桓歌戈)),
      expected ?? input,
      `導入: (${input}) (原體系脣音分寒桓歌戈: ${原體系脣音分寒桓歌戈})`
    );
    const 待驗證地位 = expected地位 ?? input地位;
    t.is(導入或驗證(待驗證地位, false), 待驗證地位, `驗證: (${input}) (原體系脣音分寒桓歌戈: ${原體系脣音分寒桓歌戈})`);
    if (expected !== undefined && 原體系脣音分寒桓歌戈 === true) {
      t.throws(
        () => 導入或驗證(input地位, false),
        { message: /^Invalid 音韻屬性 {/ },
        `驗證導入前地位: (${input}) (原體系脣音分寒桓歌戈: ${原體系脣音分寒桓歌戈})`
      );
    }
  };

  const reject = (input: string, 原體系脣音分寒桓歌戈 = false) => {
    const input地位 = raw地位fromString(input);
    t.throws(() => 導入或驗證(input地位, true, 原體系脣音分寒桓歌戈), { message: /^Invalid 音韻屬性 {/ });
  };
  return [run, reject] as const;
}

// XXX DRY?
function test正則化或驗證(t: ExecutionContext, 寬鬆 = false) {
  const run = (input: string, expected?: string) => {
    const input地位 = 音韻地位.from描述(input);
    const expected地位 = expected !== undefined ? 音韻地位.from描述(expected) : undefined;
    if (expected地位?.等於(input地位)) {
      throw new Error(`unnecessary argument "expected": ${expected} (equivalent to ${input})`);
    }
    const 正則地位 = expected地位 ?? input地位;
    t.is(正則化或驗證(input地位, true, 寬鬆).描述, 正則地位.描述, `正則化: ${input地位.描述} (寬鬆: ${寬鬆})`);
    t.is(正則化或驗證(正則地位, false, 寬鬆), 正則地位, `驗證: ${正則地位.描述} (寬鬆: ${寬鬆})`);
    if (expected地位 !== undefined) {
      t.throws(
        () => 正則化或驗證(input地位, false, 寬鬆),
        { message: /^非正則地位 / },
        `驗證正則化前地位: ${input地位.描述} (寬鬆: ${寬鬆})`
      );
    }
  };

  const reject = (input: string) => {
    const input地位 = 音韻地位.from描述(input);
    t.throws(() => 正則化或驗證(input地位, true, 寬鬆), { message: /^cannot normalize 音韻地位 / });
  };

  return [run, reject] as const;
}

// 導入/驗證

test('導入/驗證', t => {
  const [run] = test導入或驗證(t, true);
  run('幫,,三,,凡,入'); // 法
  run('羣,開,三,B,真,去'); // 僅
});

test('導入/驗證（基本屬性）', t => {
  const [run, reject] = test導入或驗證(t, true);

  // 其他家用字
  run('娘,開,三,B,眞,入', '孃,開,三,,真,入'); // 暱（全字表）
  run('群,開,三,,欣,平', '羣,開,三,,殷,平'); // 勤（字音表、全字表）

  reject('禪,開,三,,陽,上'); // 上（東方語言學網）
  reject('山,開,二,,山,平'); // 山（王力？）

  // 諄桓戈
  run('見,合,三,,諄,平', '見,合,三,A,真,平'); // 均（全字表）
  run('見,合,三,A,諄,平', '見,合,三,A,真,平'); // 均（韻典）
  run('匣,合,一,,桓,平', '匣,合,一,,寒,平'); // 桓（韻典、全字表）
  run('見,合,一,,戈,平', '見,合,一,,歌,平'); // 戈（韻典、全字表）
  run('見,開,三,,戈,平', '見,開,三,,歌,平'); // 迦（韻典、全字表）
  run('曉,合,三,,戈,平', '曉,合,三,,歌,平'); // 靴（韻典、全字表）

  // 等搭配
  run('定,開,四,,脂,去', '定,開,三,,脂,去'); // 地（韻鑒）
  reject('端,開,四,,庚,上'); // 打（韻鑒），「等」有歧義
  reject('端,開,四,,麻,平'); // 爹（韻鑒），「等」有歧義
  run('定,合,四,,佳,上', '定,合,二,,佳,上'); // 箉（韻鑒）
  run('章,開,三,,咍,上', '章,開,一,,咍,上'); // 茝（字音表）
  reject('見,開,二,B,庚,平'); // 生造地位，測試重紐當限於三等

  // 必要呼、重紐
  reject('章,,三,,麻,平'); // 遮（各家均不省略麻三之「開」）
  reject('羣,合,三,,眞,上'); // 窘（各家均不省略《廣韻》眞韻合口鈍音之「B」

  // 陰聲韻
  reject('見,開,三,,魚,入'); // 生造地位，測試陰聲韻不應有入聲
});

test('導入/驗證（類隔）', t => {
  const [run] = test導入或驗證(t, true);

  run('云,開,三,A,真,平', '匣,開,三,A,真,平');
});

test('導入/驗證（呼）', t => {
  const [run, reject] = test導入或驗證(t, true);

  // 脣音

  // 碧
  run('幫,合,三,,清,入', '幫,,三,B,清,入'); // 碧（全字表）

  // 寒歌韻
  // K: 指原地位脣音區分寒桓歌戈（即廣(Kwangq)韻分韻），用於 ext、v2ext、韻典、全字表之桓（寒）戈（歌）韻脣音
  // T: 指原地位脣音不分寒桓歌戈（即切(Tshet)韻分韻），用於 std、v2、字音表之寒歌韻脣音
  const runK = run;
  const [runT] = test導入或驗證(t, false);
  runK('明,合,一,,桓,入', '明,,一,,寒,入'); // 末（韻典、全字表）
  runK('明,開,一,,寒,入'); // 藒（韻典、全字表）
  runT('明,開,一,,寒,入', '明,,一,,寒,入'); // 末（字音表），注意該輸入地位與上一筆沒有區別，僅可依靠參數指示原地位是否分寒桓
  runK('並,合,一,,戈,上', '並,,一,,歌,上'); // 爸（韻典、全字表）
  runK('並,開,一,,歌,上'); // 爸（嚴拼輸入法 RIME 版）
  runT('並,開,一,,歌,上', '並,,一,,歌,上'); // 爸（字音表），注意該輸入地位與上一筆沒有區別，僅可依靠參數指示原地位是否分歌戈

  // 其他
  run('幫,開,三,,東,平', '幫,,三,,東,平'); // 風（韻典、全字表）
  run('幫,合,三,,東,平', '幫,,三,,東,平'); // 風（字音表）
  run('幫,合,三,,元,上', '幫,,三,,元,上'); // 反（字音表、韻典、全字表）
  run('並,開,一,,咍,上', '並,,一,,咍,上'); // 倍（韻典、全字表）
  run('並,合,一,,灰,上', '並,,一,,灰,上'); // 倍（字音表）
  run('明,合,三,,虞,平', '明,,三,,虞,平'); // 無（字音表、韻典、全字表）
  run('幫,開,三,,幽,平', '幫,,三,,幽,平'); // 彪（韻典、全字表）

  // 非脣音

  // 虞、幽韻
  run('章,,三,,虞,平', '章,合,三,,虞,平'); // 朱（v2、v1）
  run('影,,三,,幽,平', '影,開,三,,幽,平'); // 幽（v2、v1）
  run('溪,,三,B,幽,平', '溪,開,三,B,幽,平'); // 𠁫（v2）

  // 其他
  run('端,開,一,,東,平', '端,,一,,東,平'); // 東（全字表）
  run('見,開,一,,侯,上', '見,,一,,侯,上'); // 苟（v2、字音表、全字表）
  reject('書,合,一,,侵,平'); // 生造地位，測試限定開合的韻
  reject('見,開,三,,文,平'); // 同上
});

test('導入/驗證（重紐）', t => {
  const [run, reject] = test導入或驗證(t, true);
  // 鈍音

  // 重紐八韻（略，其他測試已覆蓋）

  // 庚清
  run('溪,開,三,,庚,平', '溪,開,三,B,庚,平'); // 卿（v2、字音表、韻典、全字表）
  run('溪,開,三,,清,平', '溪,開,三,A,清,平'); // 輕（v2、全字表）
  run('幫,,三,,庚,入', '幫,,三,B,庚,入'); // 碧（v2）
  run('幫,開,三,,庚,入', '幫,,三,B,庚,入'); // 碧（韻典、全字表）
  run('幫,開,三,B,清,入', '幫,,三,B,清,入'); // 碧（字音表）
  run('云,合,三,,庚,上', '云,合,三,B,庚,上'); // 永（v2、字音表、韻典、全字表）

  // 蒸幽麻陽
  run('影,開,三,B,蒸,入'); // 抑
  run('影,開,三,,蒸,入'); // 抑（字音表、韻典、全字表）、憶；別家地位不區分兩者
  run('影,開,三,A,蒸,入'); // 預留地位，測試蒸韻可標A類
  run('云,合,三,,蒸,入'); // 域
  run('云,合,三,B,蒸,入'); // 預留地位，測試蒸韻合口可標重紐
  run('曉,開,三,B,幽,平'); // 烋
  run('曉,開,三,,幽,平'); // 烋（字音表、韻典、全字表）、飍；別家地位不區分兩者
  run('明,,三,A,幽,去'); // 謬（推測可能地位），測試幽韻可標A類
  run('明,,三,A,麻,上'); // 乜
  run('明,,三,,麻,上'); // 乜（v2、字音表、韻典、全字表）；別家地位麻韻不分類
  run('明,,三,B,麻,上'); // 預留地位，測試麻韻可標B類
  run('並,,三,A,陽,上'); // 𩦠
  run('並,合,三,,陽,上', '並,,三,,陽,上'); // 𩦠（字音表、韻典、全字表）；別家地位不區分「𩦠」與其他陽韻
  reject('並,,三,B,陽,上'); // 生造地位，測試陽韻不可標B類

  // 其他
  reject('見,開,三,A,之,平'); // 生造地位，測試不支持重紐的韻

  // 銳音

  // 重紐八韻與清韻
  run('章,開,三,A,脂,上', '章,開,三,,脂,上'); // 旨（字音表、古韻表）
  run('章,開,三,B,脂,上', '章,開,三,,脂,上'); // 旨（全字表）
  run('生,合,三,B,眞,入', '生,合,三,,真,入'); // 率（全字表）
  run('初,開,三,B,眞,去', '初,開,三,,真,去'); // 襯（全字表）
  run('初,開,三,,臻,去'); // 襯（v2, 韻典）
  run('知,開,三,B,清,平', '知,開,三,,清,平'); // 貞（字音表）
  run('徹,合,三,B,真,平', '徹,合,三,,真,平'); // 椿（字音表）
  run('徹,合,三,,諄,平', '徹,合,三,,真,平'); // 椿（韻典、全字表）

  // 其他
  reject('生,開,三,B,蒸,入'); // 生造地位，測試重紐八韻與清韻以外銳音不要重紐
});

// 正則化/驗證

test('正則化/驗證（類隔）', t => {
  const [run, reject] = test正則化或驗證(t);
  const [lenient] = test正則化或驗證(t, true);

  // 端知
  run('定開脂去');
  run('定合山平', '澄合山平');
  run('定開佳上');
  run('端開三麻平');
  run('端開二庚上');
  run('端幽平');

  // 蟹三平上
  run('昌咍上', '昌開廢上');

  // 齒音
  run('昌開山平', '初開山平');
  reject('以開寒入');
  lenient('以開寒入');
  run('清合夬去', '初合夬去');
  reject('崇開先平');
  lenient('崇開先平');

  // 云匣
  run('云灰上', '云合廢上');
  reject('云合山平');
  lenient('云合山平');

  // 莊組臻攝開口
  run('崇開臻上');
  run('莊開殷上', '莊開臻上');
  run('崇開真上', '崇開臻上');
  run('崇合真上');
});

test('正則化/驗證（呼、重紐）', t => {
  const [run] = test正則化或驗證(t, false);

  // 寒、歌
  run('並開一歌上', '並一歌上');
  run('明開寒入', '明寒入');

  // 灰咍嚴凡
  run('並咍上', '並灰上');
  run('明嚴去', '明凡去');
  run('見凡去', '見嚴去');

  // 重紐：清
  run('幫A清入');
  run('幫B清入', '幫三庚入');
});

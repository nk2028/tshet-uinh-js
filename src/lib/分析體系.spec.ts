import test from 'ava';

import 適配分析體系 from './分析體系';
import { iter音韻地位, 音韻地位 } from './音韻地位';

const from = (x: string) => 音韻地位.from描述(x);

test('v2 & v2Strict', t => {
  const conv = (描述1: string, 描述2: string) => {
    const 地位1 = from(描述1);
    const 地位2 = from(描述2);
    t.is(適配分析體系.v2(地位1).描述, 地位2.描述);
    if (!地位1.等於(地位2)) {
      t.throws(() => 適配分析體系.v2Strict(地位1), undefined, 地位1.描述);
    }
  };
  const rej = (x: string, msg?: string) => t.throws(() => 適配分析體系.v2(from(x)), msg ? { message: msg } : undefined);

  conv('幫凡入', '幫凡入');
  conv('定開脂去', '定開脂去');

  // 中立韻、脣音呼
  conv('端開冬平', '端冬平');
  conv('端合冬平', '端冬平');
  conv('疑合虞平', '疑虞平');
  conv('幫合三東平', '幫三東平');

  // 灰咍嚴凡
  conv('並咍上', '並灰上');
  conv('並開咍上', '並灰上');
  conv('明嚴去', '明凡去');
  conv('見凡去', '見嚴去');

  // 指定開合韻
  rej('見開文平');
  rej('見合欣平');
  rej('幫開凡入');
  rej('幫合嚴入');

  // 重紐八韻非鈍音
  conv('章開A仙平', '章開仙平');
  conv('俟開B脂上', '俟開脂上');

  // 清
  conv('幫開A清入', '幫清入');
  conv('幫合B清入', '幫三庚入');

  // 陽蒸幽
  conv('並三A陽上', '並三A陽上');
  conv('溪B幽平', '溪B幽平');
  conv('影A幽平', '影幽平');
  rej('並三B陽上');
  rej('見開A蒸平');

  // 其他重紐
  rej('見開A之平');

  // 端知類隔
  conv('端開二庚上', '端開二庚上');
  conv('定合山平', '澄合山平');

  // 蟹三平上
  conv('昌咍上', '昌開廢上');

  // 齒音
  conv('昌開山平', '初開山平');
  rej('以開寒入');
  conv('清合夬去', '初合夬去');
  rej('崇開先平');

  // 云匣
  conv('匣開A眞平', '匣開A眞平');
  conv('云灰上', '云合廢上');
  rej('云合山平');

  // 莊組臻攝開口
  conv('崇開三臻上', '崇開三臻上');
  conv('莊開三欣上', '莊開三欣上');
});

test('v1', t => {
  for (const 地位 of iter音韻地位()) {
    t.is(適配分析體系.v1(地位).描述, 地位.描述);
    let 地位2;
    try {
      地位2 = 適配分析體系.v1(適配分析體系.v2Nonstrict(地位));
      if (!地位.屬於`二等 (章組 或 日母) 或 清韻 重紐B類`) {
        t.true(地位.等於(地位2), 地位.描述);
      }
    } catch (e) {
      t.fail(`${地位.描述} ${e}`);
    }
  }
});

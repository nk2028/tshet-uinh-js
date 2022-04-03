import test from 'ava';

import 適配分析體系 from './分析體系';
import { 音韻地位 } from './音韻地位';

const from = (x: string) => 音韻地位.from描述(x);

test('v2', t => {
  const conv = (x: string, y: string) => {
    const px = from(x);
    const py = from(y);
    t.is(適配分析體系.v2(px).描述, py.描述);
    if (!px.等於(py)) {
      t.throws(() => 適配分析體系.v2Strict(px), undefined, px.描述);
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

  // 清
  conv('幫A清入', '幫清入');
  conv('幫B清入', '幫三庚入');

  // 端知類隔
  conv('端開二庚上', '端開二庚上');
  conv('定合山平', '澄合山平');

  // 蟹三平上
  conv('昌咍上', '昌開廢上');

  // 章組日以母其他類隔
  conv('昌開山平', '初開山平');
  rej('以開寒入');

  // 精莊
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

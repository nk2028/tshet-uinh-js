const chai = require('chai');
const Qieyun = require('../bundle.js');

chai.should();

// 1. 由字頭查出相應的音韻地位和解釋

(function test1_1() {
  // 1.1. 查詢「之」字
  let res = Qieyun.query字頭('之');
  res.length.should.equal(1);
  res[0].音韻地位.描述.should.equal('章開三之平');
  res[0].解釋.should.equal('適也往也閒也亦姓出姓苑止而切四');
}());

(function test1_2() {
  // 1.2. 查詢「過」字。「過」字有兩讀
  res = Qieyun.query字頭('過');
  res.length.should.equal(2);
}());

(function test1_3() {
  // 1.3. 查詢不存在的字，沒有讀音
  res = Qieyun.query字頭('!');
  res.length.should.equal(0);
}());

// 2. 由音韻地位查出相應的字頭和解釋

(function test2_1() {
  // 2.1. 查音韻地位「見合一歌平」，含「戈」、「過」等字
  const 音韻地位 = new Qieyun.音韻地位('見', '合', '一', null, '歌', '平'); // 注意：戈韻不獨立，屬歌韻
  (音韻地位.條目.length > 0).should.equal(true);
}());

(function test2_2() {
  // 2.2. 查音韻地位「從合三歌平」，有音無字
  const 音韻地位 = new Qieyun.音韻地位('從', '合', '三', null, '歌', '平');
  (音韻地位.條目.length === 0).should.equal(true);
}());

// 3. 由音韻地位查出對應的反切

(function test3_1() {
  // 3.1. 查「東」字的反切
  const res = Qieyun.query字頭('東');
  res.length.should.equal(1);
  res[0].音韻地位.反切.should.equal('德紅');
}());

(function test3_2() {
  // 3.2. 查「拯」字的反切，「拯」字無反切，值為 null
  const res = Qieyun.query字頭('拯');
  res.length.should.equal(1);
  (res[0].音韻地位.反切 == null).should.equal(true);
}());

// 4. 由音韻地位得出各項音韻屬性

(function test4_1() {
  const 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入'); // 「法」字對應的音韻地位

  // 4.1. 基本音韻屬性（六個）
  音韻地位.母.should.equal('幫');
  (音韻地位.呼 == null).should.equal(true);
  音韻地位.等.should.equal('三');
  (音韻地位.重紐 == null).should.equal(true);
  音韻地位.韻.should.equal('凡');
  音韻地位.聲.should.equal('入');

  // 4.2. 拓展音韻屬性
  音韻地位.攝.should.equal('咸');

  // 4.3. 其他
  音韻地位.描述.should.equal('幫三凡入');
  音韻地位.表達式.should.equal('幫母 三等 凡韻 入聲');
}());

(function test4_2() {
  const 音韻地位 = new Qieyun.音韻地位('羣', '開', '三', 'A', '支', '平'); // 「祇」字對應的音韻地位

  // 4.1. 基本音韻屬性（六個）
  音韻地位.母.should.equal('羣');
  音韻地位.呼.should.equal('開');
  音韻地位.等.should.equal('三');
  音韻地位.重紐.should.equal('A');
  音韻地位.韻.should.equal('支');
  音韻地位.聲.should.equal('平');

  // 4.2. 拓展音韻屬性
  音韻地位.攝.should.equal('止');

  // 4.3. 其他
  音韻地位.描述.should.equal('羣開三A支平');
  音韻地位.表達式.should.equal('羣母 開口 三等 重紐A類 支韻 平聲');
}());

// 5. 屬於

(function test5_1() {
  const 音韻地位 = new Qieyun.音韻地位('幫', null, '三', null, '凡', '入'); // 「法」字對應的音韻地位
  音韻地位.屬於('幫母').should.equal(true);
  音韻地位.屬於('幫精組').should.equal(true);
  音韻地位.屬於('精組').should.equal(false);
  音韻地位.屬於('重紐A類 或 重紐B類').should.equal(false);
}());

const Qieyun = require('../index.js');
const Database = require('better-sqlite3');
const chai = require('chai');
const should = chai.should();
const db = new Database('cache/qieyun.sqlite3');

/* 1. 由漢字查出對應的《廣韻》小韻號和解釋 */

(function test1() {
	const stmt = db.prepare('SELECT * FROM 廣韻字頭');

	for (const expected of stmt.iterate()) {
		const 字頭 = expected.字頭;
		if ([...字頭].length === 1) {
			Qieyun.query漢字(字頭).some((got) => got.小韻號 === expected.小韻號 && got.解釋 === expected.解釋).should.equal(true);
		}
	}
})();

/* 2. 查詢《廣韻》小韻號對應的音韻地位 */

(function test2() {
	const stmt = db.prepare('SELECT 小韻號, 音韻描述 FROM 廣韻小韻全');

	for (const expected of stmt.iterate()) {
		Qieyun.get音韻地位(expected.小韻號).音韻描述.should.equal(expected.音韻描述);
	}
})();

/* 3. 判斷某個小韻是否屬於給定的音韻地位（以字串描述） */

(function test3() {
	Qieyun.get音韻地位(12).屬於('云母').should.equal(true);
	Qieyun.get音韻地位(526).屬於('透母').should.equal(true);

	Qieyun.get音韻地位(1852).屬於('開口').should.equal(true);

	Qieyun.get音韻地位(13).屬於('三等').should.equal(true);

	Qieyun.get音韻地位(1113).屬於('重紐B類').should.equal(true);

	Qieyun.get音韻地位(3822).屬於('鹽韻').should.equal(true);

	Qieyun.get音韻地位(2245).屬於('開口').should.equal(false);
	Qieyun.get音韻地位(2245).屬於('開口 或 三等').should.equal(true);

	Qieyun.get音韻地位(1352).屬於('影組').should.equal(true); // 羽
	Qieyun.get音韻地位(1291).屬於('影組').should.equal(false); // 以
})();

/* 4. 查詢《廣韻》某個小韻的反切 */

(function test4() {
	Qieyun.get上字(1).should.equal('德');
	should.equal(Qieyun.get下字(1919), null);  // 拯小韻無反切
	Qieyun.get反切(1644).should.equal('陟兖切');
	should.equal(Qieyun.get反切(1919), null);
})();

/* Tests in documentation */

(function test5() {
	let 音韻地位 = Qieyun.get音韻地位(739);
	音韻地位.母.should.equal('見');
	音韻地位.開合.should.equal('合');
	音韻地位.等.should.equal('一');
	should.equal(音韻地位.重紐, null);
	音韻地位.韻賅上去入.should.equal('戈');
	音韻地位.聲.should.equal('平');
	音韻地位.攝.should.equal('果');
	音韻地位.音韻描述.should.equal('見合一戈平');
	音韻地位.屬於('果攝').should.equal(true);
})();

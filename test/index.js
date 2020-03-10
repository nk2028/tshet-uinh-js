'use strict';

const Qieyun = require('../qieyun.js');
const Database = require('better-sqlite3');

const db = new Database('cache/data.sqlite3');

function assertEqual(a, b) {
	if (a !== b) {
		console.error(a, 'should be equal to', b);
		throw new Error('Test failed!');
	}
}

/* 1. 由漢字查出對應的小韻號和解釋 */

(function test1() {

const stmt = db.prepare('SELECT * FROM 廣韻字頭');

for (const expected of stmt.iterate()) {
	const 字頭 = expected.字頭;
	if ([...字頭].length == 1)
		if (!Qieyun.query切韻音系(字頭).some(got => got.小韻號 === expected.小韻號 && got.解釋 === expected.解釋))
			throw new Error('Test failed!');
}

})();

/* 2. 判斷某個小韻是否屬於給定的音韻地位（以字符串描述） */

(function test2() {

assertEqual(Qieyun.equal音韻地位(12, '云母'), true);
assertEqual(Qieyun.equal音韻地位(526, '透母'), true);

assertEqual(Qieyun.equal音韻地位(1852, '開口'), true);

assertEqual(Qieyun.equal音韻地位(13, '三等'), true);

assertEqual(Qieyun.equal音韻地位(1113, '重紐B類'), true);

assertEqual(Qieyun.equal音韻地位(3822, '鹽韻'), true);

assertEqual(Qieyun.equal音韻地位(2245, '開口'), false);
assertEqual(Qieyun.equal音韻地位(2245, '開口 或 三等'), true);

})();

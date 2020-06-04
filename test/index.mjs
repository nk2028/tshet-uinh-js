import { query漢字, get音韻地位 } from '../index.mjs';
import Database from 'better-sqlite3';

const db = new Database('cache/data.sqlite3');

function assertEqual(a, b) {
	if (a !== b) {
		console.error(a, 'should be equal to', b);
		throw new Error('Test failed!');
	}
}

/* 1. 由漢字查出對應的《廣韻》小韻號和解釋 */

(function test1() {

const stmt = db.prepare('SELECT * FROM 廣韻字頭');

for (const expected of stmt.iterate()) {
	const 字頭 = expected.字頭;
	if ([...字頭].length == 1)
		if (!query漢字(字頭).some(got => got.小韻號 === expected.小韻號 && got.解釋 === expected.解釋))
			throw new Error('Test failed!');
}

})();

/* 2. 查詢《廣韻》小韻號對應的音韻地位 */

(function test2() {

const stmt = db.prepare('SELECT 小韻號, 音韻地位 FROM 廣韻小韻全');

for (const expected of stmt.iterate())
	if (get音韻地位(expected.小韻號).音韻描述 !== expected.音韻地位)
		throw new Error('Test failed!' + expected.小韻號);
})();

/* 3. 判斷某個小韻是否屬於給定的音韻地位（以字符串描述） */

(function test3() {

assertEqual(get音韻地位(12).屬於('云母'), true);
assertEqual(get音韻地位(526).屬於('透母'), true);

assertEqual(get音韻地位(1852).屬於('開口'), true);

assertEqual(get音韻地位(13).屬於('三等'), true);

assertEqual(get音韻地位(1113).屬於('重紐B類'), true);

assertEqual(get音韻地位(3822).屬於('鹽韻'), true);

assertEqual(get音韻地位(2245).屬於('開口'), false);
assertEqual(get音韻地位(2245).屬於('開口 或 三等'), true);

})();

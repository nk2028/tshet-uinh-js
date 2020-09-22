// 返回值為數組，長度為小韻總數 (3874)，每個元素為長度為 5 的字串
function _解凍小韻資料(壓縮的小韻資料) {
	return 壓縮的小韻資料.match(/.{5}/gu);
}

// 返回值有兩個。
// 第一個返回值為字頭資料，類型為 Map，其中 key 為字頭的 Unicode 碼位（《廣韻》中
// 有幾個字未入 Unicode，以 IDS 描述，故不只一個字元，此處不含），val 為二維數組，
// 數組的每一維是 (小韻號, 解釋)。
// 第二個返回值為小韻數組，長度為小韻總數 (3874)，每個元素為二維數組，數組的每一維是
// (字頭, 解釋)。
function _解凍字頭資料(壓縮的字頭資料) {
	const r = /(\d+)([^\d])([^\d]+)/gu;
	const 字頭資料 = new Map();
	let match;

	const 小韻數組 = new Array(3874);
	for (let i = 0; i < 3874; i++) {
		小韻數組[i] = new Array();
	}

	while ((match = r.exec(壓縮的字頭資料)) !== null) {
		const 小韻號 = match[1] | 0;
		const 字頭 = match[2];
		const 字頭編碼 = 字頭.codePointAt(0);
		const 解釋 = match[3];

		if (!字頭資料.has(字頭編碼)) {
			字頭資料.set(字頭編碼, [[小韻號, 解釋]]);
		} else {
			const arr = 字頭資料.get(字頭編碼);
			arr.push([小韻號, 解釋]);
			字頭資料.set(字頭編碼, arr);
		}

		小韻數組[小韻號 - 1].push([字頭, 解釋]);
	}

	return [字頭資料, 小韻數組];
}

const _小韻資料 = _解凍小韻資料(壓縮的小韻資料);
const [_字頭資料, _小韻數組] = _解凍字頭資料(壓縮的字頭資料);

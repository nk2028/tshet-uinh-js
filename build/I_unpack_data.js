function _解凍小韻資料(壓縮的小韻資料) {
	return 壓縮的小韻資料.match(/.{5}/gu);
}

function _解凍字頭資料(壓縮的字頭資料) {
	const r = /(\d+)([^\d])([^\d]+)/gu, d = {};
	let match;

	const 小韻數組 = new Array(3874);
	for (let i = 0; i < 3874; i++) {
		小韻數組[i] = new Array();
	}

	while ((match = r.exec(壓縮的字頭資料)) !== null) {
		const 小韻號 = match[1] | 0, 字頭 = match[2], 解釋 = match[3];

		if (!d[字頭])
			d[字頭] = [[小韻號, 解釋]];
		else
			d[字頭].push([小韻號, 解釋]);

		小韻數組[小韻號 - 1].push([字頭, 解釋]);
	}

	return [d, 小韻數組];
}

const _小韻資料 = _解凍小韻資料(壓縮的小韻資料);
const [_字頭資料, _小韻數組] = _解凍字頭資料(壓縮的字頭資料);

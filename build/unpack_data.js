function _解析小韻資料(str) {
	const res = str.match(/.{5}/gu);
	if (res.length != 3874) {
		throw new Error('Invalid length of small rhymes, the length is ' + res.length);
	}
	return res;
}

function _解析字頭資料(str) {
	const r = /(\d+)([^\d])([^\d]+)/gu, d = {};
	let match;

	const 小韻數組 = new Array(3874);
	for (let i = 0; i < 3874; i++)
		小韻數組[i] = new Array();

	while ((match = r.exec(str)) !== null) {
		const 小韻號 = match[1] | 0, 字頭 = match[2], 解釋 = match[3];

		if (!d[字頭])
			d[字頭] = [[小韻號, 解釋]];
		else
			d[字頭].push([小韻號, 解釋]);

		小韻數組[小韻號 - 1].push([字頭, 解釋]);
	}

	return [d, 小韻數組];
}

const _small_rhymes = _解析小韻資料(小韻資料);
const _char_entities_and_小韻數組 = _解析字頭資料(字頭資料)
	, _char_entities = _char_entities_and_小韻數組[0]
	, _小韻數組 = _char_entities_and_小韻數組[1];

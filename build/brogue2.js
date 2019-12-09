/* Low-Level API - equal-prefixed */

function equal韻(i, s) {
	return small_rhymes[i - 1][1] == s;
}

function equal韻賅上去(i, s) {
	return 韻賅上去到韻[s].includes(small_rhymes[i - 1][1]);
}

function equal韻賅上去入(i, s) {
	// inner function does not consider 重紐
	function equal韻賅上去入_inner(i, s) {
		return 韻賅上去入到韻[s].includes(small_rhymes[i - 1][1]);
	}

	const ns = 韻賅上去入到重紐[s];
	if (!ns)
		return equal韻賅上去入_inner(i, s);
	else
		return ns.some(n => equal韻賅上去入_inner(i, n));
}

function equal攝(i, s) {
	return 攝到韻[s].includes(small_rhymes[i - 1][1]);
}

function equal母(i, s) {
	return small_rhymes[i - 1][2] == s;
}

function equal組(i, s) {
	return 組到母[s].some(x => equal母(i, x));
}

function equal等(i, s) {
	// inner function does not consider 等 in Chinese characters
	function equal等_inner(i, s) {
		return small_rhymes[i - 1][4] == s;
	}

	// 等 (Chinese character) -> 等 (number)
	if (s == '一')
		s = 1;
	else if (s == '二')
		s = 2;
	else if (s == '三')
		s = 3;
	else if (s == '四')
		s = 4;

	return equal等_inner(i, s);
}

function equal聲(i, s) {
	if (s == '平')
		return i <= 1156;
	else if (s == '上')
		return i > 1156 && i <= 2091;
	else if (s == '去')
		return i > 2091 && i <= 3182;
	else if (s == '入')
		return i > 3182;
	else if (s == '仄')
		return i > 1156;
	else if (s == '舒')
		return i <= 3182;
}

/* Low-Level API - in-prefixed */

let in韻 = (i, a) => a.includes(small_rhymes[i - 1][1]);
let in韻賅上去 = (i, a) => a.some(s => equal韻賅上去(i, s));
let in韻賅上去入 = (i, a) => a.some(s => equal韻賅上去入(i, s));
let in攝 = (i, a) => a.some(s => equal攝(i, s));
let in母 = (i, a) => a.includes(small_rhymes[i - 1][2]);
let in組 = (i, a) => a.some(s => equal組(i, s));
let in等 = (i, a) => a.some(s => equal等(i, s));
let in聲 = (i, a) => a.some(s => equal聲(i, s));

/* Low-Level API - is-prefixed */

let is開 = i => small_rhymes[i - 1][3] == '開';
let is合 = i => small_rhymes[i - 1][3] == '合';
let is重紐A類 = i => small_rhymes[i - 1][1].endsWith('A');
let is重紐B類 = i => small_rhymes[i - 1][1].endsWith('B');

/* High-Level API */

function split韻(s) {
	const arr = [];
	while (s != '') {
		if (s.length == 1) {
			arr.push(s);
			s = '';
		} else if (s[1] == 'A' || s[1] == 'B') {
			arr.push(s.slice(0, 2));
			s = s.substr(2);
		} else {
			arr.push(s.slice(0, 1));
			s = s.substr(1);
		}
	}
	return arr;
}

function check小韻(小韻號, s) {
	if (小韻號 <= 0 || 小韻號 > 3874)
		throw new Error('無此小韻');
	return s.split(' 或 ').some(s => s.split(' ').every(s => {
		if (s.endsWith('韻'))
			return in韻(小韻號, split韻(s.slice(0, -1)));
		else if (s.endsWith('母'))
			return in母(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('組'))
			return in組(小韻號, s.slice(0, -1).split(''));
		else if (s == '開')
			return is開(小韻號);
		else if (s == '合')
			return is合(小韻號);
		else if (s.endsWith('等'))
			return in等(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('韻賅上去'))
			return in韻賅上去(小韻號, split韻(s.slice(0, -4)));
		else if (s.endsWith('韻賅上去入'))
			return in韻賅上去入(小韻號, split韻(s.slice(0, -5)));
		else if (s.endsWith('攝'))
			return in攝(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('聲'))
			return in聲(小韻號, s.slice(0, -1).split(''));
		else if (s == '重紐A類')
			return is重紐A類(小韻號);
		else if (s == '重紐B類')
			return is重紐B類(小韻號);
		else
			throw new Error('無此運算符');
	}));
}

/* Determine 音韻地位 from 小韻號 */

function get母(小韻號) {
	return small_rhymes[小韻號 - 1][0];
}

function get開合(小韻號) {
	var oc = small_rhymes[小韻號 - 1][1];
	return oc == 'O' ? '開' : '合';
}

function get等(小韻號) {
	return small_rhymes[小韻號 - 1][2] | 0;
}

function get等漢字(小韻號) {
	var 等 = get等(小韻號);
	return 等 == 1 ? '一' : 等 == 2 ? '二' : 等 == 3 ? '三' : '四';
}

function get韻(小韻號) {
	// return small_rhymes[小韻號 - 1][3];  // JS: '莊O3𧤛'[3] = "\ud85e"
	return [...small_rhymes[小韻號 - 1]][3];
}

function get韻賅上去(小韻號) {
	return 韻到韻賅上去[get韻(小韻號)];
}

function get韻賅上去入(小韻號) {
	return 韻到韻賅上去入[get韻(小韻號)];
}

function get攝(小韻號) {
	return 韻賅上去入到攝[get韻賅上去入(小韻號)];
}

function get重紐(小韻號) {
	// return small_rhymes[小韻號 - 1][4];
	return [...small_rhymes[小韻號 - 1]][4];
}

function get聲(小韻號) {
	if (小韻號 <= 1156)
		return '平';
	if (小韻號 > 1156 && 小韻號 <= 2091)
		return '上'
	if (小韻號 > 2091 && 小韻號 <= 3182)
		return '去';
	if (小韻號 > 3182)
		return '入';
}

function get音韻地位(小韻號) {
	return get母(小韻號) + get開合(小韻號) + get等漢字(小韻號) + get韻賅上去入(小韻號) + (get重紐(小韻號) || '') + get聲(小韻號);
}

/* Low-Level API - equal-prefixed */

function equal組(小韻號, s) {
	return 組到母[s].some(x => get母(小韻號) == x);
}

function equal等(小韻號, s) {
	return get等(小韻號) == s || get等漢字(小韻號) == s;
}

function equal聲(小韻號, s) {
	var 聲 = get聲(小韻號);
	if (s == '仄')
		return 聲 == '上' || 聲 == '去' || 聲 == '入';
	if (s == '舒')
		return 聲 == '平' || 聲 == '上' || 聲 == '去';
	return s == 聲;
}

/* Low-Level API - in-prefixed */

function in韻(小韻號, a) {
	return a.some(s => get韻(小韻號) == s);
}

function in韻賅上去(小韻號, a) {
	return a.some(s => get韻賅上去(小韻號) == s);
}

function in韻賅上去入(小韻號, a) {
	return a.some(s => get韻賅上去入(小韻號) == s);
}

function in攝(小韻號, a) {
	return a.some(s => get攝(小韻號) == s);
}

function in母(小韻號, a) {
	return a.some(s => get母(小韻號) == s);
}

function in組(小韻號, a) {
	return a.some(s => equal組(小韻號, s));
}

function in等(小韻號, a) {
	return a.some(s => equal等(小韻號, s));
}

function in聲(小韻號, a) {
	return a.some(s => equal聲(小韻號, s));
}

/* High-Level API */

function check小韻(小韻號, s) {
	if (小韻號 <= 0 || 小韻號 > 3874)
		throw new Error('無此小韻');
	return s.split(' 或 ').some(s => s.split(' ').every(s => {
		if (s.endsWith('韻'))
			return in韻(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('母'))
			return in母(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('組'))
			return in組(小韻號, s.slice(0, -1).split(''));
		else if (s == '開')
			return get開合(小韻號) == '開';
		else if (s == '合')
			return get開合(小韻號) == '合';
		else if (s.endsWith('等'))
			return in等(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('韻賅上去'))
			return in韻賅上去(小韻號, s.slice(0, -4).split(''));
		else if (s.endsWith('韻賅上去入'))
			return in韻賅上去入(小韻號, s.slice(0, -5).split(''));
		else if (s.endsWith('攝'))
			return in攝(小韻號, s.slice(0, -1).split(''));
		else if (s.endsWith('聲'))
			return in聲(小韻號, s.slice(0, -1).split(''));
		else if (s == '重紐A類')
			return get重紐(小韻號) == 'A';
		else if (s == '重紐B類')
			return get重紐(小韻號) == 'B';
		else
			throw new Error('無此運算符');
	}));
}

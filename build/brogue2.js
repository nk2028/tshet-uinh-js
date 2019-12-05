const equal韻 = (i, s) => small_rhymes[i - 1][1] == s;
const in韻 = (i, a) => a.includes(small_rhymes[i - 1][1]);

const equal母 = (i, s) => small_rhymes[i - 1][2] == s;
const in母 = (i, a) => a.includes(small_rhymes[i - 1][2]);

const equal組 = (i, s) => 組到母[s].some(x => equal母(i, x));
const in組 = (i, a) => a.some(s => equal組(i, s));

const equal開合 = (i, s) => small_rhymes[i - 1][3] == s;

const __equal等 = (i, s) => small_rhymes[i - 1][4] == s;
const equal等 = (i, s) => {
	if (s == '一') s = 1;
	if (s == '二') s = 2;
	if (s == '三') s = 3;
	if (s == '四') s = 4;
	return __equal等(i, s);
};
const in等 = (i, a) => a.some(s => equal等(i, s));

const equal韻賅上去 = (i, s) => 韻賅上去到韻[s].includes(small_rhymes[i - 1][1]);
const in韻賅上去 = (i, a) => a.some(s => equal韻賅上去(i, s));

const __equal韻賅上去入 = (i, s) => 韻賅上去入到韻[s].includes(small_rhymes[i - 1][1]);
const equal韻賅上去入 = (i, s) => {
	const newS = 韻賅上去入到重紐[s];
	if (!newS)
		return __equal韻賅上去入(i, s);
	else
		return newS.some(newX => __equal韻賅上去入(i, newX));
};
const in韻賅上去入 = (i, a) => a.some(s => equal韻賅上去入(i, s));

const equal攝 = (i, s) => 攝到韻[s].includes(small_rhymes[i - 1][1]);
const in攝 = (i, a) => a.some(s => equal攝(i, s));

const equal聲 = (i, s) => {
	if (i <= 1156)
		return s == '平';
	if (i <= 2091)
		return s == '上';
	if (i <= 3182)
		return s == '去';
	if (i <= 3874)
		return s == '入';
}
const in聲 = (i, a) => a.some(s => equal聲(i, s));

const is重紐A類 = i => small_rhymes[i - 1][1].endsWith('A');
const is重紐B類 = i => small_rhymes[i - 1][1].endsWith('B');

/* High-Level API */

const check小韻 = (小韻號, s) => s.split(' 或 ').some(s => s.split(' ').every(s => {
	if (s.endsWith('韻')) return in韻(小韻號, s.slice(0, -1).split(''));
	if (s.endsWith('母')) return in母(小韻號, s.slice(0, -1).split(''));
	if (s.endsWith('組')) return in組(小韻號, s.slice(0, -1).split(''));
	if (s == '開') return equal開合(小韻號, '開');
	if (s == '合') return equal開合(小韻號, '合');
	if (s.endsWith('等')) return in等(小韻號, s.slice(0, -1).split(''));
	if (s.endsWith('韻賅上去')) return in韻賅上去(小韻號, s.slice(0, -4).split(''));
	if (s.endsWith('韻賅上去入')) return in韻賅上去入(小韻號, s.slice(0, -5).split(''));
	if (s.endsWith('攝')) return in攝(小韻號, s.slice(0, -1).split(''));
	if (s.endsWith('聲')) return in聲(小韻號, s.slice(0, -1).split(''));
	if (s == '重紐A類') return is重紐A類(小韻號);
	if (s == '重紐B類') return is重紐B類(小韻號);
}));

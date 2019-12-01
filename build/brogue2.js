const equal韻 = (i, s) => small_rhymes[i - 1][1] == s;
const in韻 = (i, a) => a.includes(small_rhymes[i - 1][1]);

const equal母 = (i, s) => small_rhymes[i - 1][2] == s;
const in母 = (i, a) => a.includes(small_rhymes[i - 1][2]);

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

const equal聲 = (i, s) => 聲到韻[s].includes(small_rhymes[i - 1][1]);
const in聲 = (i, a) => a.some(s => equal聲(i, s));

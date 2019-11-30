const equal韻 = (i, s) => small_rhymes[i - 1][1] == s;
const in韻 = (i, a) => a.includes(small_rhymes[i - 1][1]);

const equal母 = (i, s) => small_rhymes[i - 1][2] == s;
const in母 = (i, a) => a.includes(small_rhymes[i - 1][2]);

const equal開合 = (i, s) => small_rhymes[i - 1][3] == s;

const equal等 = (i, s) => small_rhymes[i - 1][4] == s;
const in等 = (i, a) => a.includes(small_rhymes[i - 1][4]);

const equal韻賅上去 = (i, s) => 韻賅上去到韻[s].includes(small_rhymes[i - 1][1]);
const in韻賅上去 = (i, a) => a.some(s => 韻賅上去到韻[s].includes(small_rhymes[i - 1][1]));

const equal韻賅上去入 = (i, s) => 韻賅上去入到韻[s].includes(small_rhymes[i - 1][1]);
const in韻賅上去入 = (i, a) => a.some(s => 韻賅上去入到韻[s].includes(small_rhymes[i - 1][1]));

const equal攝 = (i, s) => 攝到韻[s].includes(small_rhymes[i - 1][1]);
const in攝 = (i, a) => a.some(s => 攝到韻[s].includes(small_rhymes[i - 1][1]));

const equal聲 = (i, s) => 聲到韻[s].includes(small_rhymes[i - 1][1]);
const in聲 = (i, a) => a.some(s => 聲到韻[s].includes(small_rhymes[i - 1][1]));

console.log(equal母(1919, '章'));
console.log(in母(1919, ['曉', '匣']));
console.log(equal開合(1919, '開'));
console.log(in等(1919, [1, 2]));
console.log(in等(1919, [3, 4]));
console.log(equal韻賅上去(1919, '蒸'));
console.log(in韻賅上去(1919, ['蒸', '脂']));

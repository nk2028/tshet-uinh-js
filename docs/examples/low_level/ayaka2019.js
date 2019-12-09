const 類
= in等(小韻號, ['一', '四']) ? '甲'
: equal等(小韻號, '二') ? '乙'
: is重紐A類(小韻號) || equal母(小韻號, '以') || in組(小韻號, ['端', '精', '章']) || equal母(小韻號, '日') ? '丁'
: '丙';

function 聲母規則() {
	// 幫
	if (equal母(小韻號, '幫')) return 'p';
	if (equal母(小韻號, '滂')) return 'ph';
	if (equal母(小韻號, '並')) return 'b';
	if (equal母(小韻號, '明')) return 'm';
	// 端
	if (equal母(小韻號, '端')) return 't';
	if (equal母(小韻號, '透')) return 'th';
	if (equal母(小韻號, '定')) return 'd';
	if (equal母(小韻號, '泥')) return 'n';
	// 知來
	if (equal母(小韻號, '知')) return 't';
	if (equal母(小韻號, '徹')) return 'th';
	if (equal母(小韻號, '澄')) return 'd';
	if (equal母(小韻號, '孃')) return 'n';
	if (equal母(小韻號, '來')) {
		if (類 == '乙' || 類 == '丙')
			return '';
		if (類 == '甲')
			return 'l';
	}
	// 精
	if (equal母(小韻號, '精')) return 'ts';
	if (equal母(小韻號, '清')) return 'tsh';
	if (equal母(小韻號, '從')) return 'dz';
	if (equal母(小韻號, '心')) return 's';
	if (equal母(小韻號, '邪')) return 'z';
	// 莊
	if (equal母(小韻號, '莊')) return 'ts';
	if (equal母(小韻號, '初')) return 'tsh';
	if (equal母(小韻號, '崇')) return 'dz';
	if (equal母(小韻號, '生')) return 's';
	if (equal母(小韻號, '俟')) return 'z';
	// 章日
	if (equal母(小韻號, '章')) return 'tsc';
	if (equal母(小韻號, '昌')) return 'tsch';
	if (equal母(小韻號, '船')) return 'dzc';
	if (equal母(小韻號, '書')) return 'sc';
	if (equal母(小韻號, '常')) return 'zc';
	if (equal母(小韻號, '日')) return 'nc';
	// 見
	if (equal母(小韻號, '見')) return 'k';
	if (equal母(小韻號, '溪')) return 'kh';
	if (equal母(小韻號, '羣')) return 'g';
	if (equal母(小韻號, '疑')) return 'ng';
	// 影曉匣云以
	if (equal母(小韻號, '影')) return 'q';
	if (equal母(小韻號, '曉')) return 'h';
	if (equal母(小韻號, '匣')) return 'gh';
	if (equal母(小韻號, '云')) return 'gh';
	if (equal母(小韻號, '以')) return '';
	throw new Error('無聲母規則');
}

function 介音規則() {
	if (is開(小韻號)) {
		if (類 == '甲')
			return '';
		if (類 == '乙')
			return 'r';
		if (類 == '丙')
			return 'rj';
		if (類 == '丁')
			return 'j';
	}
	if (is合(小韻號)) {
		if (類 == '甲')
			return 'w';
		if (類 == '乙')
			return 'rw';
		if (類 == '丙')
			return 'rjw';
		if (類 == '丁')
			return 'jw';
	}
}

// oa: ɔ; ea: ə
function 韻母規則() {
	if (equal攝(小韻號, '果')) {
		if (equal韻賅上去入(小韻號, '歌')) return 'oa';
		if (equal韻賅上去入(小韻號, '戈')) return 'oa';
	}
	if (equal攝(小韻號, '假'))
		if (equal韻賅上去入(小韻號, '麻')) return 'a';
	if (equal攝(小韻號, '遇')) {
		if (equal韻賅上去入(小韻號, '模')) return 'u';
		if (equal韻賅上去入(小韻號, '魚')) return 'o';
		if (equal韻賅上去入(小韻號, '虞')) return 'u';
	}
	if (equal攝(小韻號, '蟹')) {
		if (equal韻賅上去入(小韻號, '咍')) return 'oai';
		if (equal韻賅上去入(小韻號, '灰')) return 'oi';
		if (equal韻賅上去入(小韻號, '泰')) return 'ai';
		if (equal韻賅上去入(小韻號, '皆')) return 'ei';
		if (equal韻賅上去入(小韻號, '佳')) return 'e';
		if (equal韻賅上去入(小韻號, '夬')) return 'ai';
		if (equal韻賅上去入(小韻號, '祭')) return 'ei';
		if (equal韻賅上去入(小韻號, '廢')) return 'oai';
		if (equal韻賅上去入(小韻號, '齊')) return 'ei';
	}
	if (equal攝(小韻號, '止')) {
		if (equal韻賅上去入(小韻號, '支')) return 'e';
		if (equal韻賅上去入(小韻號, '脂')) return 'i';
		if (equal韻賅上去入(小韻號, '之')) return 'ea';
		if (equal韻賅上去入(小韻號, '微')) return 'eai';
	}
	if (equal攝(小韻號, '效')) {
		if (equal韻賅上去入(小韻號, '豪')) return 'oau';
		if (equal韻賅上去入(小韻號, '肴')) return 'eu';
		if (equal韻賅上去入(小韻號, '宵')) return 'eu';
		if (equal韻賅上去入(小韻號, '蕭')) return 'eu';
	}
	if (equal攝(小韻號, '流')) {
		if (equal韻賅上去入(小韻號, '侯')) return 'eau';
		if (equal韻賅上去入(小韻號, '尤')) return 'ou';
		if (equal韻賅上去入(小韻號, '幽')) return 'iu';
	}
	if (equal攝(小韻號, '咸')) {
		if (equal韻賅上去入(小韻號, '覃')) return 'oam';
		if (equal韻賅上去入(小韻號, '談')) return 'am';
		if (equal韻賅上去入(小韻號, '咸')) return 'em';
		if (equal韻賅上去入(小韻號, '銜')) return 'am';
		if (equal韻賅上去入(小韻號, '鹽')) return 'em';
		if (equal韻賅上去入(小韻號, '嚴')) return 'oam';
		if (equal韻賅上去入(小韻號, '凡')) return 'om';
		if (equal韻賅上去入(小韻號, '添')) return 'em';
	}
	if (equal攝(小韻號, '深'))
		if (equal韻賅上去入(小韻號, '侵')) return 'im';
	if (equal攝(小韻號, '山')) {
		if (equal韻賅上去入(小韻號, '寒')) return 'oan';
		if (equal韻賅上去入(小韻號, '桓')) return 'oan';
		if (equal韻賅上去入(小韻號, '刪')) return 'an';
		if (equal韻賅上去入(小韻號, '山')) return 'en';
		if (equal韻賅上去入(小韻號, '仙')) return 'en';
		if (equal韻賅上去入(小韻號, '先')) return 'en';
	}
	if (equal攝(小韻號, '臻')) {
		if (equal韻賅上去入(小韻號, '痕')) return 'ean';
		if (equal韻賅上去入(小韻號, '魂')) return 'un';
		if (equal韻賅上去入(小韻號, '臻')) return 'in';
		if (equal韻賅上去入(小韻號, '眞')) return 'in';
		if (equal韻賅上去入(小韻號, '諄')) return 'in';
		if (equal韻賅上去入(小韻號, '欣')) return 'ean';
		if (equal韻賅上去入(小韻號, '文')) return 'un';
		if (equal韻賅上去入(小韻號, '元')) return 'on';
	}
	if (equal攝(小韻號, '宕')) {
		if (equal韻賅上去入(小韻號, '唐')) return 'oang';
		if (equal韻賅上去入(小韻號, '陽')) return 'oang';
	}
	if (equal攝(小韻號, '梗')) {
		if (equal韻賅上去入(小韻號, '庚')) return 'ang';
		if (equal韻賅上去入(小韻號, '耕')) return 'eng';
		if (equal韻賅上去入(小韻號, '清')) return 'eng';
		if (equal韻賅上去入(小韻號, '青')) return 'eng';
	}
	if (equal攝(小韻號, '曾')) {
		if (equal韻賅上去入(小韻號, '登')) return 'eang';
		if (equal韻賅上去入(小韻號, '蒸')) return 'ing';
	}
	if (equal攝(小韻號, '通')) {
		if (equal韻賅上去入(小韻號, '東')) return 'ung';
		if (equal韻賅上去入(小韻號, '冬')) return 'ong';
		if (equal韻賅上去入(小韻號, '鍾')) return 'ong';
	}
	if (equal攝(小韻號, '江'))
		if (equal韻賅上去入(小韻號, '江')) return 'ong';
	throw new Error('無韻母規則');
}

let 聲母 = 聲母規則();
let 介音 = 介音規則();
let 韻母 = 韻母規則();

if (equal聲(小韻號, '入'))
	if (韻母.endsWith('m'))
		韻母 = 韻母.slice(0, -1) + 'p';
	else if (韻母.endsWith('n'))
		韻母 = 韻母.slice(0, -1) + 't';
	else if (韻母.endsWith('ng'))
		韻母 = 韻母.slice(0, -2) + 'k';

if (equal韻賅上去入(小韻號, '虞'))
	介音 = 介音.slice(0, -1);

// 需特殊記憶的小韻
if (小韻號 == 574) 聲母 = 'dzc';  // 山從開2, dz -> dzc
if (小韻號 == 1444) 聲母 = '';  // 賄云合1, gh -> /
if (小韻號 == 1439) 聲母 = 'tsc';  // 賄知合1, t -> tsc
if (小韻號 == 1871) 聲母 = 'tsc';  // 梗端開2, t -> tsc
if (小韻號 == 2381) 聲母 = 'tsch';  // 霽徹開4, th -> tsch
if (小韻號 == 2506) 聲母 = 'tsch';  // 夬清合2, tsh -> tsch
if (小韻號 == 3693) 聲母 = 'tsch';  // 錫徹開4, th -> tsch

function 聲調規則() {
	const 清聲母 = new Set(['', 'h', 'k', 'kh', 'p', 'ph', 'q', 's', 'sc', 't', 'th', 'ts', 'tsc', 'tsch', 'tsh']);
	if (清聲母.has(聲母)) {
		if (equal聲(小韻號, '平')) return '55';  // '˥'
		if (equal聲(小韻號, '上')) return '35';  // '˧˥'
		if (equal聲(小韻號, '去')) return '53';  // '˥˧'
		if (equal聲(小韻號, '入')) return '33';  // '˧'
	} else {
		if (equal聲(小韻號, '平')) return '33';  // '˧'
		if (equal聲(小韻號, '上')) return '13';  // '˩˧'
		if (equal聲(小韻號, '去')) return '31';  // '˧˩'
		if (equal聲(小韻號, '入')) return '11';  // '˩'
	}
}
const 聲調 = 聲調規則();

return 聲母 + 介音 + 韻母 + 聲調;

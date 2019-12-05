const is = s => check小韻(小韻號, s);

const 類
= is('一四等') ? '甲'
: is('二等') ? '乙'
: is('重紐A類 或 以母 或 端精章組 或 日母') ? '丁'
: '丙';

function 聲母規則() {
	// 幫
	if (is('幫母')) return 'p';
	if (is('滂母')) return 'ph';
	if (is('並母')) return 'b';
	if (is('明母')) return 'm';
	// 端
	if (is('端母')) return 't';
	if (is('透母')) return 'th';
	if (is('定母')) return 'd';
	if (is('泥母')) return 'n';
	// 知來
	if (is('知母')) return 't';
	if (is('徹母')) return 'th';
	if (is('澄母')) return 'd';
	if (is('孃母')) return 'n';
	if (is('來母')) {
		if (類 == '乙' || 類 == '丙')
			return '';
		if (類 == '甲')
			return 'l';
	}
	// 精
	if (is('精母')) return 'ts';
	if (is('清母')) return 'tsh';
	if (is('從母')) return 'dz';
	if (is('心母')) return 's';
	if (is('邪母')) return 'z';
	// 莊
	if (is('莊母')) return 'ts';
	if (is('初母')) return 'tsh';
	if (is('崇母')) return 'dz';
	if (is('生母')) return 's';
	if (is('俟母')) return 'z';
	// 章日
	if (is('章母')) return 'tsc';
	if (is('昌母')) return 'tsch';
	if (is('船母')) return 'dzc';
	if (is('書母')) return 'sc';
	if (is('常母')) return 'zc';
	if (is('日母')) return 'nc';
	// 見
	if (is('見母')) return 'k';
	if (is('溪母')) return 'kh';
	if (is('羣母')) return 'g';
	if (is('疑母')) return 'ng';
	// 影曉匣云以
	if (is('影母')) return 'q';
	if (is('曉母')) return 'h';
	if (is('匣母')) return 'gh';
	if (is('云母')) return 'gh';
	if (is('以母')) return '';
	throw new Error('無聲母規則');
}

function 介音規則() {
	if (is('開')) {
		if (類 == '甲')
			return '';
		if (類 == '乙')
			return 'r';
		if (類 == '丙')
			return 'rj';
		if (類 == '丁')
			return 'j';
	}
	if (is('合')) {
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
	if (is('果攝')) {
		if (is('歌韻賅上去入')) return 'oa';
		if (is('戈韻賅上去入')) return 'oa';
	}
	if (is('假攝'))
		if (is('麻韻賅上去入')) return 'a';
	if (is('遇攝')) {
		if (is('模韻賅上去入')) return 'u';
		if (is('魚韻賅上去入')) return 'o';
		if (is('虞韻賅上去入')) return 'u';
	}
	if (is('蟹攝')) {
		if (is('咍韻賅上去入')) return 'oai';
		if (is('灰韻賅上去入')) return 'oi';
		if (is('泰韻賅上去入')) return 'ai';
		if (is('皆韻賅上去入')) return 'ei';
		if (is('佳韻賅上去入')) return 'e';
		if (is('夬韻賅上去入')) return 'ai';
		if (is('祭韻賅上去入')) return 'ei';
		if (is('廢韻賅上去入')) return 'oai';
		if (is('齊韻賅上去入')) return 'ei';
	}
	if (is('止攝')) {
		if (is('支韻賅上去入')) return 'e';
		if (is('脂韻賅上去入')) return 'i';
		if (is('之韻賅上去入')) return 'ea';
		if (is('微韻賅上去入')) return 'eai';
	}
	if (is('效攝')) {
		if (is('豪韻賅上去入')) return 'oau';
		if (is('肴韻賅上去入')) return 'eu';
		if (is('宵韻賅上去入')) return 'eu';
		if (is('蕭韻賅上去入')) return 'eu';
	}
	if (is('流攝')) {
		if (is('侯韻賅上去入')) return 'eau';
		if (is('尤韻賅上去入')) return 'ou';
		if (is('幽韻賅上去入')) return 'iu';
	}
	if (is('咸攝')) {
		if (is('覃韻賅上去入')) return 'oam';
		if (is('談韻賅上去入')) return 'am';
		if (is('咸韻賅上去入')) return 'em';
		if (is('銜韻賅上去入')) return 'am';
		if (is('鹽韻賅上去入')) return 'em';
		if (is('嚴韻賅上去入')) return 'oam';
		if (is('凡韻賅上去入')) return 'om';
		if (is('添韻賅上去入')) return 'em';
	}
	if (is('深攝'))
		if (is('侵韻賅上去入')) return 'im';
	if (is('山攝')) {
		if (is('寒韻賅上去入')) return 'oan';
		if (is('桓韻賅上去入')) return 'oan';
		if (is('刪韻賅上去入')) return 'an';
		if (is('山韻賅上去入')) return 'en';
		if (is('仙韻賅上去入')) return 'en';
		if (is('先韻賅上去入')) return 'en';
	}
	if (is('臻攝')) {
		if (is('痕韻賅上去入')) return 'ean';
		if (is('魂韻賅上去入')) return 'un';
		if (is('臻韻賅上去入')) return 'in';
		if (is('眞韻賅上去入')) return 'in';
		if (is('諄韻賅上去入')) return 'in';
		if (is('欣韻賅上去入')) return 'ean';
		if (is('文韻賅上去入')) return 'un';
		if (is('元韻賅上去入')) return 'on';
	}
	if (is('宕攝')) {
		if (is('唐韻賅上去入')) return 'oang';
		if (is('陽韻賅上去入')) return 'oang';
	}
	if (is('梗攝')) {
		if (is('庚韻賅上去入')) return 'ang';
		if (is('耕韻賅上去入')) return 'eng';
		if (is('清韻賅上去入')) return 'eng';
		if (is('青韻賅上去入')) return 'eng';
	}
	if (is('曾攝')) {
		if (is('登韻賅上去入')) return 'eang';
		if (is('蒸韻賅上去入')) return 'ing';
	}
	if (is('通攝')) {
		if (is('東韻賅上去入')) return 'ung';
		if (is('冬韻賅上去入')) return 'ong';
		if (is('鍾韻賅上去入')) return 'ong';
	}
	if (is('江攝'))
		if (is('江韻賅上去入')) return 'ong';
	throw new Error('無韻母規則');
}

let 聲母 = 聲母規則();
let 介音 = 介音規則();
let 韻母 = 韻母規則();

if (is('入聲'))
	if (韻母.endsWith('m'))
		韻母 = 韻母.slice(0, -1) + 'p';
	else if (韻母.endsWith('n'))
		韻母 = 韻母.slice(0, -1) + 't';
	else if (韻母.endsWith('ng'))
		韻母 = 韻母.slice(0, -2) + 'k';

if (is('虞韻賅上去入'))
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
		if (is('平聲')) return '55';  // '˥'
		if (is('上聲')) return '35';  // '˧˥'
		if (is('去聲')) return '53';  // '˥˧'
		if (is('入聲')) return '33';  // '˧'
	} else {
		if (is('平聲')) return '33';  // '˧'
		if (is('上聲')) return '13';  // '˩˧'
		if (is('去聲')) return '31';  // '˧˩'
		if (is('入聲')) return '11';  // '˩'
	}
}
const 聲調 = 聲調規則();

return 聲母 + 介音 + 韻母 + 聲調;

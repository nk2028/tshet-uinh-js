function 聲母規則() {
	if (equal母(小韻號, '幫')) return 'p';
	if (equal母(小韻號, '滂')) return 'ph';
	if (equal母(小韻號, '並')) return 'b';
	if (equal母(小韻號, '明')) return 'm';
	if (equal母(小韻號, '端')) return 't';
	if (equal母(小韻號, '透')) return 'th';
	if (equal母(小韻號, '定')) return 'd';
	if (equal母(小韻號, '泥')) return 'n';
	if (equal母(小韻號, '知')) return 'tr';
	if (equal母(小韻號, '徹')) return 'thr';
	if (equal母(小韻號, '澄')) return 'dr';
	if (equal母(小韻號, '孃')) return 'nr';
	if (equal母(小韻號, '精')) return 'c';
	if (equal母(小韻號, '清')) return 'ch';
	if (equal母(小韻號, '從')) return 'z';
	if (equal母(小韻號, '心')) return 's';
	if (equal母(小韻號, '邪')) return 'zs';
	if (equal母(小韻號, '莊')) return 'cr';
	if (equal母(小韻號, '初')) return 'chr';
	if (equal母(小韻號, '崇')) return 'zr';
	if (equal母(小韻號, '生')) return 'sr';
	if (equal母(小韻號, '俟')) return 'zsr';
	if (equal母(小韻號, '章')) return 'cj';
	if (equal母(小韻號, '昌')) return 'chj';
	if (equal母(小韻號, '船')) return 'zsj';
	if (equal母(小韻號, '書')) return 'sj';
	if (equal母(小韻號, '常')) return 'zj';
	if (equal母(小韻號, '見')) return 'k';
	if (equal母(小韻號, '溪')) return 'kh';
	if (equal母(小韻號, '羣')) return 'g';
	if (equal母(小韻號, '疑')) return 'ng';
	if (equal母(小韻號, '影')) return 'q';
	if (equal母(小韻號, '曉')) return 'h';
	if (equal母(小韻號, '匣')) return 'gh';
	if (equal母(小韻號, '云')) return '';
	if (equal母(小韻號, '以')) return 'j';
	if (equal母(小韻號, '來')) return 'l';
	if (equal母(小韻號, '日')) return 'nj';
	throw new Error('無聲母規則');
}

function 韻母規則() {
	if (equal攝(小韻號, '果'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '歌')) return 'a';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '戈')) return 'ia';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '戈')) return 'ua';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '戈')) return 'ya';
		}
	if (equal攝(小韻號, '假'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '麻')) return 'ra';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '麻')) return 'ia';
		}
		if (is合(小韻號))
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '麻')) return 'rua';
	if (equal攝(小韻號, '遇')) {
		if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '模')) return 'o';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '魚')) return 'io';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '虞')) return 'yo';
	}
	if (equal攝(小韻號, '蟹'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '咍')) return 'ai';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '佳')) return 're';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '皆')) return 'rai';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '齊')) return 'e';
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '泰')) return 'ad';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '夬')) return 'rad';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '祭A')) return 'jed';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '祭')) return 'ied';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '廢')) return 'iad';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '灰')) return 'uai';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '佳')) return 'rue';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '皆')) return 'ruai';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '齊')) return 'ue';
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '泰')) return 'uad';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '夬')) return 'ruad';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '祭')) return 'yed';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '廢')) return 'yad';
		}
	if (equal攝(小韻號, '止'))
		if (is開(小韻號) && equal等(小韻號, '三')) {
			if (equal韻賅上去入(小韻號, '支A')) return 'je';
			if (equal韻賅上去入(小韻號, '支')) return 'ie';
			if (equal韻賅上去入(小韻號, '脂A')) return 'jii';
			if (equal韻賅上去入(小韻號, '脂')) return 'ii';
			if (equal韻賅上去入(小韻號, '之')) return 'i';
			if (equal韻賅上去入(小韻號, '微')) return 'ioi';
		}
		if (is合(小韻號) && equal等(小韻號, '三')) {
			if (equal韻賅上去入(小韻號, '支A')) return 'jye';
			if (equal韻賅上去入(小韻號, '支')) return 'ye';
			if (equal韻賅上去入(小韻號, '脂A')) return 'jyi';
			if (equal韻賅上去入(小韻號, '脂')) return 'yi';
			if (equal韻賅上去入(小韻號, '微')) return 'yoi';
		}
	if (equal攝(小韻號, '效')) {
		if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '豪')) return 'au';
		if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '肴')) return 'rau';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '宵A')) return 'jeu';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '宵')) return 'ieu';
		if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '蕭')) return 'eu';
	}
	if (equal攝(小韻號, '流')) {
		if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '侯')) return 'u';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '尤')) return 'iu';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '幽')) return 'y';
	}
	if (equal攝(小韻號, '咸'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '談')) return 'am';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '銜')) return 'ram';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '咸')) return 'rem';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '鹽A')) return 'jem';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '鹽')) return 'iem';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '嚴')) return 'iam';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '添')) return 'em';
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '覃')) return 'om';
		}
		if (is合(小韻號))
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '凡')) return 'yam';
	if (equal攝(小韻號, '深')) {
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '侵A')) return 'jim';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '侵')) return 'im';
	}
	if (equal攝(小韻號, '山'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '寒')) return 'an';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '刪')) return 'ran';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '山')) return 'ren';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '仙A')) return 'jen';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '仙')) return 'ien';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '先')) return 'en';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '桓')) return 'uan';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '刪')) return 'ruan';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '山')) return 'ruen';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '仙A')) return 'jyen';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '仙')) return 'yen';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '先')) return 'uen';
		}
	if (equal攝(小韻號, '臻'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '痕')) return 'on';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '眞A')) return 'jin';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '眞')) return 'in';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '臻')) return 'in';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '欣')) return 'ion';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '元')) return 'ian';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '魂')) return 'uon';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '眞')) return 'yn';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '諄A')) return 'jyn';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '諄')) return 'yn';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '文')) return 'yon';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '元')) return 'yan';
		}
	if (equal攝(小韻號, '宕'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '唐')) return 'ang';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '陽')) return 'iang';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '唐')) return 'uang';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '陽')) return 'yang';
		}
	if (equal攝(小韻號, '梗'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '庚')) return 'rang';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '耕')) return 'reng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '庚')) return 'ieng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '清A')) return 'jeng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '清')) return 'ieng';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '青')) return 'eng';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '庚')) return 'ruang';
			if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '耕')) return 'rueng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '庚')) return 'yeng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '清A')) return 'jyeng';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '清')) return 'yeng';
			if (equal等(小韻號, '四') && equal韻賅上去入(小韻號, '青')) return 'ueng';
		}
	if (equal攝(小韻號, '曾'))
		if (is開(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '登')) return 'ong';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '蒸')) return 'ing';
		}
		if (is合(小韻號)) {
			if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '登')) return 'uong';
			if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '蒸')) return 'yng';
		}
	if (equal攝(小韻號, '通')) {
		if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '東')) return 'ung';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '鍾')) return 'yung';
		if (equal等(小韻號, '一') && equal韻賅上去入(小韻號, '冬')) return 'uung';
		if (equal等(小韻號, '三') && equal韻賅上去入(小韻號, '東')) return 'iung';
	}
	if (equal攝(小韻號, '江'))
		if (equal等(小韻號, '二') && equal韻賅上去入(小韻號, '江')) return 'rung';
	throw new Error('無韻母規則');
}

function 聲調規則() {
	if (in聲(小韻號, ['平', '入'])) return '';
	if (equal聲(小韻號, '上')) return 'x';
	if (equal聲(小韻號, '去')) return 'h';
	throw new Error('無聲調規則');
}

let 聲母 = 聲母規則();
let 隔音符號 = "'";
let 韻母 = 韻母規則();
let 聲調 = 聲調規則();

if (equal聲(小韻號, '入'))
	if (韻母.endsWith('m'))
		韻母 = 韻母.slice(0, -1) + 'p';
	else if (韻母.endsWith('n'))
		韻母 = 韻母.slice(0, -1) + 't';
	else if (韻母.endsWith('ng'))
		韻母 = 韻母.slice(0, -2) + 'k';

if (韻母.endsWith('d'))
	聲調 = '';

if (聲母.endsWith('r') && 韻母.startsWith('r'))
	韻母 = 韻母.substr(1);

if (聲母.endsWith('j') && 韻母.startsWith('i') && 'aeou'.split('').some(x => 韻母.includes(x)))
	韻母 = 韻母.substr(1);

if
(  equal組(小韻號, '幫') && in等(小韻號, '一二三四'.split(''))
|| equal組(小韻號, '端') && in等(小韻號, '一四'.split(''))
|| equal組(小韻號, '知') && in等(小韻號, '二三'.split(''))
|| equal組(小韻號, '精') && in等(小韻號, '一三四'.split(''))
|| equal組(小韻號, '莊') && in等(小韻號, '二三'.split(''))
|| equal組(小韻號, '章') && equal等(小韻號, '三')
|| in母(小韻號, '見溪疑'.split('')) && in等(小韻號, '一二三四'.split(''))
|| equal母(小韻號, '羣') && in等(小韻號, '二三'.split(''))
|| in母(小韻號, '影曉'.split('')) && in等(小韻號, '一二三四'.split(''))
|| equal母(小韻號, '匣') && in等(小韻號, '一二四'.split(''))
|| in母(小韻號, '云以'.split('')) && equal等(小韻號, '三')
|| equal母(小韻號, '來') && in等(小韻號, '一二三四'.split(''))
|| equal母(小韻號, '日') && equal等(小韻號, '三')
)
	隔音符號 = '';

if (equal母(小韻號, '云') && equal等(小韻號, '一'))  // 1444 倄小韻 i'uaix
	聲母 = 'i';

if (equal母(小韻號, '定') && equal等(小韻號, '三'))  // 2237 地小韻 diih
	隔音符號 = '';

return 聲母 + 隔音符號 + 韻母 + 聲調;

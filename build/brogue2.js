var __組到母=
{"幫":["幫","滂","並","明"]
,"端":["端","透","定","泥"]
,"知":["知","徹","澄","孃"]
,"精":["精","清","從","心","邪"]
,"莊":["莊","初","崇","生","俟"]
,"章":["章","昌","船","書","常"]
,"見":["見","溪","羣","疑"]
}

function __解析小韻資料(str) {
	var res = str.match(/.{5}/gu);
	if (res.length != 3874)
		throw new Error('Invalid length of small rhymes');
	return res;
}

function __解析字頭資料(str) {
	var r = /(\d+)([^\d])([^\d]+)/gu, d = {}, match;

	var 小韻數組 = new Array(3874);
	for (var i = 0; i < 3874; i++)
		小韻數組[i] = new Array();

	while ((match = r.exec(str)) !== null) {
		var 小韻號 = match[1] | 0, 字頭 = match[2], 解釋 = match[3];

		if (!d[字頭])
			d[字頭] = [[小韻號, 解釋]];
		else
			d[字頭].push([小韻號, 解釋]);

		小韻數組[小韻號 - 1].push([字頭, 解釋]);
	}

	return [d, 小韻數組];
}

var __small_rhymes = __解析小韻資料(小韻資料);
var __char_entities_and_小韻數組 = __解析字頭資料(字頭資料)
	, __char_entities = __char_entities_and_小韻數組[0]
	, __小韻數組 = __char_entities_and_小韻數組[1];

/* 1. 由字頭查出對應的小韻號和解釋 */

function query漢字(漢字) {
	var res = __char_entities[漢字];
	if (!res)
		return [];
	else
		return res.map(function(小韻號_解釋) {
			var 小韻號 = 小韻號_解釋[0], 解釋 = 小韻號_解釋[1];
			return {"小韻號": 小韻號, "解釋": 解釋};
		});
}

/* 2. 由小韻號查出對應的字頭和解釋 */

function query小韻號(小韻號) {
	return __小韻數組[小韻號 - 1];
}

/* 3. 查詢《廣韻》某個小韻的反切 */

function get上字(小韻號) {
	// return __small_rhymes[小韻號 - 1][3];
	var res = [...__small_rhymes[小韻號 - 1]][3];
	if (res == 'x')  // 沒有反切的小韻
		return null;
	else
		return res;
}

function get下字(小韻號) {
	// return __small_rhymes[小韻號 - 1][4];
	var res = [...__small_rhymes[小韻號 - 1]][4];
	if (res == 'x')  // 沒有反切的小韻
		return null;
	else
		return res;
}

function get反切(小韻號) {
	var 上字 = get上字(小韻號);
	if (!上字)
		return null;
	else
		return 上字 + get下字(小韻號) + '切';
}

/* 4. 查詢《廣韻》小韻號對應的《切韻》音系音韻地位 */

function get音韻地位(小韻號) {
	function __小韻號2母(小韻號) {
		return __母id到母[__small_rhymes[小韻號 - 1][0]];
	}

	/* def make開合等重紐(開合, 等, 重紐):
		if 開合 == '開':
			if 等 == 1: return '0'
			if 等 == 2: return '1'
			if 等 == 3 and 重紐 == 'A': return '2'
			if 等 == 3 and 重紐 == 'B': return '3'
			if 等 == 3: return '4'
			if 等 == 4: return '5'
		if 開合 == '合':
			if 等 == 1: return '6'
			if 等 == 2: return '7'
			if 等 == 3 and 重紐 == 'A': return '8'
			if 等 == 3 and 重紐 == 'B': return '9'
			if 等 == 3: return 'a'
			if 等 == 4: return 'b' */
	
	function __小韻號2開合(小韻號) {
		var res = __small_rhymes[小韻號 - 1][1];
		return ['0','1','2','3','4','5'].some(x => res == x) ? '開' : '合';
	}
	
	function __小韻號2等(小韻號) {
		var res = __small_rhymes[小韻號 - 1][1];
		return ['0','6'].some(x => res == x) ? '一'
			: ['1','7'].some(x => res == x) ? '二'
			: ['2','3','4','8','9','a'].some(x => res == x) ? '三' : '四';
	}
	
	function __小韻號2重紐(小韻號) {
		var res = __small_rhymes[小韻號 - 1][1];
		return ['2','8'].some(x => res == x) ? 'A'
			: ['3','9'].some(x => res == x) ? 'B' : null;
	}
	
	function __小韻號2韻賅上去入(小韻號) {
		function __getProto韻(小韻號) {
			// return __small_rhymes[小韻號 - 1][2];  // JS: '莊O3𧤛'[3] = "\ud85e"
			return [...__small_rhymes[小韻號 - 1]][2];
		}
	
		return __韻到韻賅上去入[__getProto韻(小韻號)];
	}
	
	function __小韻號2聲(小韻號) {
		if (小韻號 <= 0)
			throw new Error('Invalid 小韻號');
		if (小韻號 <= 1156)
			return '平';
		if (小韻號 <= 2091)
			return '上'
		if (小韻號 <= 3182)
			return '去';
		if (小韻號 <= 3874)
			return '入';
		throw new Error('Invalid 小韻號');
	}

	return new 音韻地位(__小韻號2母(小韻號), __小韻號2開合(小韻號), __小韻號2等(小韻號), __小韻號2重紐(小韻號), __小韻號2韻賅上去入(小韻號), __小韻號2聲(小韻號));
}

/* 5. 由《切韻》音系音韻地位得出各項音韻屬性 */

function 音韻地位(母, 開合, 等, 重紐, 韻賅上去入, 聲) {
	var 韻 = __韻賅上去入and聲到韻[韻賅上去入 + 聲];
	var 攝 = __韻賅上去入到攝[韻賅上去入];

	this.get母 = function get母() { return 母; }
	this.get開合 = function get開合() { return 開合; }
	this.get等 = function get等() { return 等; }
	this.get重紐 = function get重紐() { return 重紐; }
	this.get韻 = function get韻() { return 韻; }
	this.get韻賅上去入 = function get韻賅上去入() { return 韻賅上去入; }
	this.get攝 = function get攝() { return 攝; }
	this.get聲 = function get聲() { return 聲; }

	this.get音韻描述 = function get音韻描述() {
		return 母 + 開合 + 等 + (重紐 || '') + 韻賅上去入 + 聲;
	}

/* 6. 判斷某個小韻是否屬於給定的音韻地位 */

	this.屬於 = function 屬於(s) {
		function __equal組(s) {
			return __組到母[s].some(x => 母 == x);
		}

		function __equal聲(s) {
			if (['平', '上', '去', '入'].some(x => s == x))
				return s == 聲;
			if (s == '仄')
				return 聲 == '上' || 聲 == '去' || 聲 == '入';
			if (s == '舒')
				return 聲 == '平' || 聲 == '上' || 聲 == '去';
			throw new Error('Invalid 聲');
		}

		return s.split(' 或 ').some(s => s.split(' ').every(function(s) {
			if (s.endsWith('母'))
				return s.slice(0, -1).split('').some(s => 母 == s);
			else if (s.endsWith('韻'))
				return s.slice(0, -1).split('').some(s => 韻賅上去入 == s);
			else if (s.endsWith('攝'))
				return s.slice(0, -1).split('').some(s => 攝 == s);
	
			else if (s.endsWith('組'))
				return s.slice(0, -1).split('').some(s => __equal組(s));
			else if (s.endsWith('等'))
				return s.slice(0, -1).split('').some(s => 等 == s);
			else if (s.endsWith('聲'))
				return s.slice(0, -1).split('').some(s => __equal聲(s));

			else if (s == '開口')
				return 開合 == '開';
			else if (s == '合口')
				return 開合 == '合';
			else if (s == '重紐A類')
				return 重紐 == 'A';
			else if (s == '重紐B類')
				return 重紐 == 'B';
	
			throw new Error('無此運算符');
		}));
	}
}

/* 1. 由字頭查出對應的小韻號和解釋 */

/**
 * 由字頭查出對應的小韻號和解釋。
 *
 * **注意**：此函數不具備異體字轉換功能，如：
 *
 * ```javascript
 * > Qieyun.query漢字('笑');
 * []
 * > Qieyun.query漢字('𥬇');
 * [{ "小韻號": 2768, "解釋": "欣也喜也亦作笑私妙切五" }]
 * ```
 * @param {number} 漢字
 * @returns {Array} 該漢字對應的小韻號和解釋。
 *
 * 數組的每一項包括 `小韻號` 與 `解釋` 兩個字段。
 * 小韻號表示該字在《廣韻》中的小韻號，取值 (1 ≤ _i_ ≤ 3874)。
 *
 * 若找不到結果，則返回空數組。
 * @example
 * > Qieyun.query漢字('過');
 * [ { "小韻號": 739, "解釋": "經也又過所也釋名曰過所至關津以示之也或曰傳過也移所在識以爲信也亦姓風俗通云過國夏諸侯後因爲氏漢有兖州刺史過栩" }
 * , { "小韻號": 2837, "解釋": "誤也越也責也度也古臥切七" }
 * ]
 */
function query漢字(漢字) {
	const 漢字編碼 = 漢字.codePointAt(0);
	const res = _字頭資料.get(漢字編碼);
	return !res ? [] : res.map(function(小韻號_解釋) {
		const 小韻號 = 小韻號_解釋[0], 解釋 = 小韻號_解釋[1];
		return {"小韻號": 小韻號, "解釋": 解釋};
	});
}

/* 2. 由小韻號查出對應的字頭和解釋 */

/**
 * 由小韻號查出對應的字頭和解釋。
 * @param {number} 小韻號 《廣韻》小韻號 (1 ≤ _i_ ≤ 3874)
 * @returns {Array} 返回值為二維數組，表示該小韻中的所有漢字及其解釋。
 * @example
 * > Qieyun.query小韻號(1919);
 * [
 *   [ '拯', '救也助也無韻切音蒸上聲五' ],
 *   [ '抍', '[同上]' ],
 *   [ '撜', '並上同見說文' ],
 *   [ '𨋬', '[⿱氶車/𨋬]' ],
 *   [ '氶', '晉譙王名' ]
 * ]
 */
function query小韻號(小韻號) {
	return _小韻數組[小韻號 - 1];
}

/* 3. 查詢《廣韻》某個小韻的反切 */

/**
 * 查詢《廣韻》某個小韻的反切上字。
 * @param {number} 小韻號 《廣韻》小韻號 (1 ≤ _i_ ≤ 3874)
 * @returns {string} 返回該小韻的反切上字。若無反切，返回 `null`。
 * @example
 * > Qieyun.get上字(1);
 * '德'
 * @see {@link get下字} {@link get反切}
 */
function get上字(小韻號) {
	// return _小韻資料[小韻號 - 1][3];
	const res = [..._小韻資料[小韻號 - 1]][3];
	if (res == 'x')  // 沒有反切的小韻
		return null;
	else
		return res;
}

/**
 * 查詢《廣韻》某個小韻的反切下字。
 * @param {number} 小韻號 《廣韻》小韻號 (1 ≤ _i_ ≤ 3874)
 * @returns {string} 返回該小韻的反切下字。若無反切，返回 `null`。
 * @example
 * > Qieyun.get下字(1919);  // 拯小韻無反切
 * null
 * @see {@link get上字} {@link get反切}
 */
function get下字(小韻號) {
	// return _小韻資料[小韻號 - 1][4];
	const res = [..._小韻資料[小韻號 - 1]][4];
	if (res == 'x')  // 沒有反切的小韻
		return null;
	else
		return res;
}

/**
 * 查詢《廣韻》某個小韻的反切。
 * @param {number} 小韻號 《廣韻》小韻號 (1 ≤ _i_ ≤ 3874)
 * @returns {string} 返回該小韻的反切。若無反切，返回 `null`。
 * @example
 * > Qieyun.get反切(1644);  // 轉小韻
 * '陟兖切'
 * @see {@link get上字} {@link get下字}
 */
function get反切(小韻號) {
	const 上字 = get上字(小韻號);
	if (!上字)
		return null;
	else
		return 上字 + get下字(小韻號) + '切';
}

/* 4. 查詢《廣韻》小韻號對應的《切韻》音系音韻地位 */

/**
 * 查詢《廣韻》小韻號對應的《切韻》音系音韻地位。
 * @param {number} 小韻號
 * @returns {音韻地位} 該小韻號對應的音韻地位。
 * @example
 * > let 音韻地位 = Qieyun.get音韻地位(739);
 */
function get音韻地位(小韻號) {
	function _小韻號到母(小韻號) {
		return _母id到母[_小韻資料[小韻號 - 1][0]];
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
	
	function _小韻號到開合(小韻號) {
		const res = _小韻資料[小韻號 - 1][1];
		return ['0','1','2','3','4','5'].some(x => res == x) ? '開' : '合';
	}
	
	function _小韻號到等(小韻號) {
		const res = _小韻資料[小韻號 - 1][1];
		return ['0','6'].some(x => res == x) ? '一'
			: ['1','7'].some(x => res == x) ? '二'
			: ['2','3','4','8','9','a'].some(x => res == x) ? '三' : '四';
	}
	
	function _小韻號到重紐(小韻號) {
		const res = _小韻資料[小韻號 - 1][1];
		return ['2','8'].some(x => res == x) ? 'A'
			: ['3','9'].some(x => res == x) ? 'B' : null;
	}
	
	function _小韻號到韻賅上去入(小韻號) {
		function _getProto韻(小韻號) {
			// return _小韻資料[小韻號 - 1][2];  // JS: '莊O3𧤛'[3] = "\ud85e"
			return [..._小韻資料[小韻號 - 1]][2];
		}
	
		return _韻到韻賅上去入[_getProto韻(小韻號)];
	}
	
	function _小韻號到聲(小韻號) {
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

	return new 音韻地位(_小韻號到母(小韻號), _小韻號到開合(小韻號), _小韻號到等(小韻號), _小韻號到重紐(小韻號), _小韻號到韻賅上去入(小韻號), _小韻號到聲(小韻號));
}

/* 5. 由《切韻》音系音韻地位得出各項音韻屬性 */

/**
 * 《切韻》音系音韻地位。
 *
 * 可使用字符串 \(母, 開合, 等, 重紐, 韻賅上去入, 聲\) 初始化。
 * @param {string} 母 聲母：幫, 滂, 並, 明, …
 * @param {string} 開合 開合：開, 合
 * @param {string} 等 等：一, 二, 三, 四
 * @param {string} 重紐 重紐：`null`, A, B
 * @param {string} 韻賅上去入 韻母（舉平以賅上去入）：東, 冬, 鍾, 江, …, 祭, 泰, 夬, 廢
 * @param {string} 聲 聲調：平, 上, 去, 入
 * @returns {音韻地位} 字符串所描述的音韻地位。
 * @example
 * > let 音韻地位 = new Qieyun.音韻地位("見", "合", "一", null, "戈", "平");
 */
class 音韻地位 {
	constructor(母, 開合, 等, 重紐, 韻賅上去入, 聲) {
		/**
		 * 聲母
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.母;
		 * '見'
		 */
		this.母 = 母;

		/**
		 * 開合
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.開合;
		 * '合'
		 */
		this.開合 = 開合;

		/**
		 * 等
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.等;
		 * '一'
		 */
		this.等 = 等;

		/**
		 * 重紐
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.重紐;
		 * null
		 */
		this.重紐 = 重紐;

		/**
		 * 韻母（舉平以賅上去入）
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.韻賅上去入;
		 * '戈'
		 */
		this.韻賅上去入 = 韻賅上去入;

		/**
		 * 聲調
		 * @member {string}
		 * @example
		 * > let 音韻地位 = Qieyun.get音韻地位(739);
		 * > 音韻地位.聲;
		 * '平'
		 */
		this.聲 = 聲;
	}

	/**
	 * 韻母
	 * @member {string}
	 * @example
	 * > let 音韻地位 = Qieyun.get音韻地位(739);
	 * > 音韻地位.韻;
	 * '戈'
	 */
	get 韻() {
		return _韻賅上去入與聲到韻[this.韻賅上去入 + this.聲];
	};

	/**
	 * 攝
	 * @member {string}
	 * @example
	 * > let 音韻地位 = Qieyun.get音韻地位(739);
	 * > 音韻地位.攝;
	 * '果'
	 */
	get 攝() {
		return _韻賅上去入到攝[this.韻賅上去入];
	};

	/**
	 * 音韻描述
	 * @member {string}
	 * @example
	 * > let 音韻地位 = Qieyun.get音韻地位(739);
	 * > 音韻地位.音韻描述;
	 * '見合一戈平'
	 */
	get 音韻描述() {
		let 母 = this.母
			, 開合 = this.開合
			, 等 = this.等
			, 重紐 = this.重紐
			, 韻賅上去入 = this.韻賅上去入
			, 聲 = this.聲;
		return 母 + 開合 + 等 + (重紐 || '') + 韻賅上去入 + 聲;
	};

	/* 6. 判斷某個小韻是否屬於給定的音韻地位 */

	/**
	 * 判斷某個小韻是否屬於給定的音韻地位。
	 * @param {string} s 描述音韻地位的字符串
	 *
	 * 字符串中音韻地位的描述格式：`...母`, `...組`, `...等`, `...韻`, `...攝`, `...聲`, `開口`, `合口`, `重紐A類`, `重紐B類`。
	 *
	 * 亦支援「開口」、「合口」、「重紐A類」、「重紐B類」四項。
	 *
	 * 字符串先以「或」字分隔，再以空格分隔。不支援括號。
	 *
	 * 如「(端精組 且 重紐A類) 或 (以母 且 四等 且 去聲)」可以表示為 `端精組 重紐A類 或 以母 四等 去聲`。
	 *
	 * **注意**：`屬於` 函數中的「韻」指的是韻賅上去入。
	 * @returns {boolean} 若描述音韻地位的字符串符合該音韻地位，返回 `true`；否則返回 `false`。
	 * @example
	 * > let 音韻地位 = Qieyun.get音韻地位(1919);  // 拯小韻
	 * > 音韻地位.屬於('章母');
	 * true
	 * > 音韻地位.屬於('清韻');
	 * false
	 * > 音韻地位.屬於('重紐A類 或 以母 或 端精章組 或 日母');
	 * true
	 */
	屬於(s) {
		let 母 = this.母
			, 開合 = this.開合
			, 等 = this.等
			, 重紐 = this.重紐
			, 韻賅上去入 = this.韻賅上去入
			, 聲 = this.聲
			, 攝 = this.攝;

		function _equal組(s) {
			return _組到母[s].some(x => 母 == x);
		}

		function _equal聲(s) {
			if (['平', '上', '去', '入'].some(x => s == x))
				return s == 聲;
			if (s == '仄')
				return 聲 == '上' || 聲 == '去' || 聲 == '入';
			if (s == '舒')
				return 聲 == '平' || 聲 == '上' || 聲 == '去';
			throw new Error('Invalid 聲');
		}

		return s.split(' 或 ').some(s => s.split(' ').every(function (s) {
			if (s.endsWith('母'))
				return s.slice(0, -1).split('').some(s => 母 == s);
			else if (s.endsWith('韻'))
				return s.slice(0, -1).split('').some(s => 韻賅上去入 == s);
			else if (s.endsWith('攝'))
				return s.slice(0, -1).split('').some(s => 攝 == s);

			else if (s.endsWith('組'))
				return s.slice(0, -1).split('').some(s => _equal組(s));
			else if (s.endsWith('等'))
				return s.slice(0, -1).split('').some(s => 等 == s);
			else if (s.endsWith('聲'))
				return s.slice(0, -1).split('').some(s => _equal聲(s));

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

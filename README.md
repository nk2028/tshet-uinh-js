# qieyun-js [![JSDelivr badge](https://data.jsdelivr.com/v1/package/npm/qieyun/badge)](https://www.jsdelivr.com/package/npm/qieyun)

《切韻》音系 JavaScript 函式庫

姊妹項目：《切韻》音系 SQLite 資料庫 \([sgalal/qieyun-sqlite](https://github.com/sgalal/qieyun-sqlite)\)。

## Usage

Browser:

```html
<script src="https://cdn.jsdelivr.net/npm/qieyun@0.4.1"></script>
```

Node.js:

```sh
$ npm install qieyun
```

```javascript
const Qieyun = require('qieyun');
```

## API

**1. 由字頭查出對應的小韻號和解釋**

```javascript
>>> Qieyun.query字頭('過');
[ { "小韻號": 739, "解釋": "經也又過所也釋名曰過所至關津以示之也或曰傳過也移所在識以爲信也亦姓風俗通云過國夏諸侯後因爲氏漢有兖州刺史過栩" }
, { "小韻號": 2837, "解釋": "誤也越也責也度也古臥切七" }
]
```

`query字頭` 函數，參數為單個漢字，返回值為數組。每一項包括 `小韻號` 與 `解釋` 兩個字段。

若找不到結果，則返回空數組。

注意：此函數不具備異體字轉換功能，如：

```javascript
>>> Qieyun.query字頭('笑');
[]
>>> Qieyun.query字頭('𥬇');
[{ "小韻號": 2768, "解釋": "欣也喜也亦作笑私妙切五" }]
```

**2. 由小韻號查出對應的字頭和解釋**

```javascript
>>> Qieyun.query小韻號(1919);
[
  [ '拯', '救也助也無韻切音蒸上聲五' ],
  [ '抍', '[同上]' ],
  [ '撜', '並上同見說文' ],
  [ '𨋬', '[⿱氶車/𨋬]' ],
  [ '氶', '晉譙王名' ]
]
```

**3. 查詢小韻號對應的音韻地位**

```javascript
>>> Qieyun.get音韻描述(739);
"見合一戈平"
>>> Qieyun.get母(739);
"見"
>>> Qieyun.get韻賅上去入(2837);
"戈"
>>> Qieyun.get上字(1);
"德"
>>> Qieyun.get下字(1919);  // 拯小韻無反切
null
```

此類函數包括：

* 母類：`get母`
* 開合類：`get開合`
* 等類：`get等`, `get等漢字`
* 重紐類：`get重紐`
* 韻類：`get韻`, `get韻賅上去`, `get韻賅上去入`, `get攝`, `get聲`
* 綜合類：`get音韻描述`
* 其他：`get上字`, `get下字`, `get反切`

其中，參數為小韻號 (1 ≤ i ≤ 3874)。

**4. 判斷某個小韻是否屬於給定的音韻地位**

```javascript
>>> Qieyun.equal音韻地位(1919, '章母');  // 拯小韻
true
>>> Qieyun.equal音韻地位(1919, '清韻');
false
>>> Qieyun.equal音韻地位(1919, '重紐A類 或 以母 或 端精章組 或 日母');
true
```

`equal音韻地位` 函數：第一個參數為小韻號 (1 ≤ i ≤ 3874)，第二個參數為表示音韻地位的字符串。

字符串中音韻地位的描述格式：`...母`, `...組`, `...等`, `...韻`, `...攝`, `...聲`, `開口`, `合口`, `重紐A類`, `重紐B類`。

字符串先以「或」字分隔，再以空格分隔。不支援括號。

如「(端精組 且 重紐A類) 或 (以母 且 四等 且 去聲)」可以表示為 `端精組 重紐A類 或 以母 四等 去聲`。

| 音韻屬性 | 中文名稱 | 英文名稱 | 可能取值 |
| :- | :- | :- | :- |
| 母 | 聲母 | initial | 幫滂並明<br/>端透定泥<br/>知徹澄孃<br/>精清從心邪<br/>莊初崇生俟<br/>章昌船書常<br/>見溪羣疑<br/>影曉匣云以來日 |
| 組 | 組 | group | 幫端知精莊章見<br/>（未涵蓋「影曉匣云以來日」） |
| 等 | 等 | division | 一二三四<br/>1234 |
| 韻 | 韻母 | rhyme | 東冬鍾江支脂之微魚虞模齊佳皆灰咍眞諄臻文欣元魂痕寒桓刪山先仙蕭宵肴豪歌戈麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡祭廢泰夬 |
| 攝 | 攝 | class | 通江止遇蟹臻山效果假宕梗曾流深咸 |
| 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |

此處的「韻」指的是韻賅上去入。

亦支援「開口」、「合口」、「重紐A類」、「重紐B類」四項。

## 説明

説明：

* 「等」既可以使用「1、2、3、4」表示，亦可以使用「一、二、三、四」表示
* 元韻置於臻攝而非山攝

不支援異體字，請手動轉換：

* 聲母 娘 -> 孃
* 聲母 谿 -> 溪
* 聲母 群 -> 羣
* 韻母 餚 -> 肴
* 韻母 眞 -> 真

## Build

Build:

```sh
$ pip install -r requirements.txt
$ python build/main.py
```

Test:

```
$ npm install
$ npm test
```

## License

Dictionary data is in the public domain.

Source code is distributed under MIT license.

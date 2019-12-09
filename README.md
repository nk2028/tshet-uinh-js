# Brogue 2

## Usage

```html
<script src="https://sgalal.github.io/Brogue2/brogue2.js"></script>
```

## High-Level API

```javascript
let 小韻號 = 1919;  // 選擇第 1919 小韻（拯小韻）
const is = s => check小韻(小韻號, s);
is('章母');  // true, 拯小韻是章母
is('曉匣母');  // false, 拯小韻不是曉匣母
is('重紐A類 或 以母 或 端精章組 或 日母');  // true, 拯小韻是章組
```

function `check小韻`：

參數 1：小韻號 (1 ≤ i ≤ 3874)

參數 2：字符串

字符串格式：如 `見組 重紐A類 或 以母 四等 去聲` 表示「(見組 且 重紐A類) 或 (以母 且 四等 且 去聲)」。

字符串不支援括號。

支援的音韻屬性如下：

Phonological Attribute | Chinese Name | English Name | Possible Values
:- | :- | :- | :-
韻 | 韻母 | rhyme | 東冬鍾江支支A支B…<br/>董湩腫講紙紙A紙B…<br/>送宋用絳寘寘A寘B…<br/>屋沃燭覺…
韻賅上去 | 韻母（舉平以賅上去） | rhyme (舉平以賅上去) | 東冬鍾江支支A支B…<br/>祭泰夬廢<br/>屋沃燭覺…
韻賅上去入 | 韻母（舉平以賅上去入） | rhyme (舉平以賅上去入) | 東冬鍾江支支A支B…<br/>祭泰夬廢
攝 | 攝 | class | 通江止遇蟹臻山效果假宕梗曾流深咸
母 | 聲母 | initial | 幫滂並明<br/>端透定泥<br/>知徹澄孃<br/>精清從心邪<br/>莊初崇生俟<br/>章昌船書常<br/>見溪羣疑<br/>影曉匣云以來日
組 | 組 | group | 幫端知精莊章見<br/>（未涵蓋「影曉匣云以來日」）
等 | 等 | division | 一二三四<br/>1234
聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒

亦支援「開」、「合」、「重紐A類」、「重紐B類」。

説明：

對重紐的處理：韻賅上去入的「支」就包括了「支、支A、支B」三種情況。

重紐四等（A類）是三等韻。

元韻放在臻攝而不是山攝。

## Low-Level API

```javascript
let 小韻號 = 1919;  // 選擇第 1919 小韻（拯小韻）
equal母(小韻號, '章');  // true, 拯小韻是章母
in母(小韻號, ['曉', '匣']);  // false, 拯小韻不是曉匣母
is重紐A類(小韻號) || equal母(小韻號, '以') || in組(小韻號, ['端', '精', '章']) || equal母(小韻號, '日');  // true, 拯小韻是章組
```

### `equal`, `in` 類

* function `equal韻` `in韻`
* function `equal韻賅上去` `in韻賅上去`
* function `equal韻賅上去入` `in韻賅上去入`
* function `equal攝` `in攝`
* function `equal母` `in母`
* function `equal組` `in組`
* function `equal等` `in等`
* function `equal聲` `in聲`

參數 1：小韻號 (1 ≤ i ≤ 3874)

參數 2：相應音韻屬性的可能取值

### `is` 類

* function `is開` `is合`
* function `is重紐A類` `is重紐B類`

參數：小韻號 (1 ≤ i ≤ 3874)

### 映射表

* `韻賅上去到韻`
* `韻賅上去入到韻`
* `攝到韻`
* `韻賅上去入到重紐`
* `組到母`

## Build

Prerequisite:

```sh
$ npm install -g minify
```

CodeMirror:

```raw
https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.min.js
https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.min.css
https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode/javascript/javascript.min.js
```

Build:

```sh
$ wget -P build https://github.com/sgalal/Guangyun/releases/download/v2.1/data.sqlite3
$ python build/build.py
```

## License

BSD 3-Clause License

Codes from CodeMirror project (`docs/codemirror`) is distributed under MIT license.

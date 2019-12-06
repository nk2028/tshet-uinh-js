# Brogue 2

## Usage

HTML:

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

function `check小韻`

字符串格式：先以「或」字分隔，再以空格分隔，空格表示「且」。如：

```raw
見組 重紐A類 或 以母 四等 去聲
```

表示「(見組 且 重紐A類) 或 (以母 且 四等 且 去聲)」。

字符串不支援括號。

## Low-Level API

```javascript
let 小韻號 = 1919;  // 選擇第 1919 小韻（拯小韻）
equal母(小韻號, '章');  // true, 拯小韻是章母
in母(小韻號, ['曉', '匣']);  // false, 拯小韻不是曉匣母
is重紐A類(小韻號) || equal母(小韻號, '以') || in組(小韻號, ['端', '精', '章']) || equal母(小韻號, '日');  // true, 拯小韻是章組
```

* function `equal韻`
* function `in韻`
* function `equal韻賅上去`
* function `in韻賅上去`
* function `equal韻賅上去入`
* function `in韻賅上去入`
* function `equal母`
* function `in母`
* function `equal組`
* function `in組`
* function `equal開合`
* function `equal等`
* function `in等`
* function `equal攝`
* function `in攝`
* function `equal聲`
* function `in聲`

Property Name | Chinese Name | English Name | Possible Values
:- | :- | :- | :-
韻 | 韻母 | rhyme | 東冬鍾江…；董湩腫講…；送宋用絳…；屋沃燭覺…
韻賅上去 | 韻母（舉平以賅上去） | rhyme (舉平以賅上去) | 東冬鍾江…；祭泰夬廢；屋沃燭覺…
韻賅上去入 | 韻母（舉平以賅上去入） | rhyme (舉平以賅上去入) | 東冬鍾江…；祭泰夬廢
攝 | 攝 | class | 通江止遇蟹臻山效果假宕梗曾流深咸
母 | 聲母 | initial | 幫滂並明端透定泥知徹澄孃精清從心邪莊初崇生俟章昌船書常見溪羣疑影曉匣云以來日
組 | 組 | group | 幫端知精莊章見（未涵蓋「影曉匣云以來日」）
開合 | 開合 | rounding | 開合
等 | 等 | division | 一二三四；1234
聲 | 聲調 | tone | 平上去入；<del>仄</del>；<del>舒</del>

* function `is重紐A類`
* function `is重紐B類`

<del>Not implemented</del>

對重紐的處理：韻賅上去入的「支」就包括了「支、支A、支B」三種情況。

重紐四等（A類）是三等韻。

元韻放在臻攝而不是山攝。

## Internal APIs

`small_rhymes`

二維數組。低維中的每一維：小韻, 韻母, 聲母, 開合, 等。

`char_entities`

Dict

Key: Chinese Character

Value: `Int` or `Array Int`. Corresponding small rhymes.

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

Codes from CodeMirror project (`docs/index.files/codemirror`) is distributed under MIT license.

# qieyun-js

## Usage

```html
<script src="https://sgalal.github.io/qieyun-js/brogue2.js"></script>
```

The size of the library is less than 0.8 MB, which is satisfactory for most of the web applications. The actual transferred size (compressed) is less than 0.5 MB.

## Examples

```javascript
char_entities['拯'];  // [["1919", "救也助也無韻切音蒸上聲五"]]

/* High-Level API */
let 小韻號 = 1919;  // 選擇第 1919 小韻（拯小韻）
const is = s => check小韻(小韻號, s);
is('章母');  // true, 拯小韻是章母
is('曉匣母');  // false, 拯小韻不是曉匣母
is('重紐A類 或 以母 或 端精章組 或 日母');  // true, 拯小韻是章組

/* Low-Level API */
let 小韻號 = 1919;  // 選擇第 1919 小韻（拯小韻）
get母(小韻號);  // '章', 拯小韻是章母
in母(小韻號, ['曉', '匣']);  // false, 拯小韻不是曉匣母
is重紐A類(小韻號) || get母(小韻號) == '以' || in組(小韻號, ['端', '精', '章']) || get母(小韻號) == '日';  // true, 拯小韻是章組
```

## API

### High-Level API (Function `check小韻`)

* Argument 1: 小韻號 (1 ≤ i ≤ 3874)
* Argument 2: String of phonological attributes

String format: 先以「或」字分隔，再以空格分隔

如 `見組 重紐A類 或 以母 四等 去聲` 表示「(見組 且 重紐A類) 或 (以母 且 四等 且 去聲)」。

字符串不支援括號。

Supported phonological attributes:

| Phonological Attribute | Chinese Name | English Name | Possible Values |
| :- | :- | :- | :- |
| 母 | 聲母 | initial | 幫滂並明<br/>端透定泥<br/>知徹澄孃<br/>精清從心邪<br/>莊初崇生俟<br/>章昌船書常<br/>見溪羣疑<br/>影曉匣云以來日 |
| 組 | 組 | group | 幫端知精莊章見<br/>（未涵蓋「影曉匣云以來日」） |
| 等 | 等 | division | 一二三四<br/>1234 |
| 韻 | 韻母 | rhyme | 東冬鍾江…<br/>董湩腫講…<br/>送宋用絳…<br/>屋沃燭覺… |
| 韻賅上去 | 韻母（舉平以賅上去） | rhyme (舉平以賅上去) | 東冬鍾江…<br/>祭泰夬廢<br/>屋沃燭覺… |
| 韻賅上去入 | 韻母（舉平以賅上去入） | rhyme (舉平以賅上去入) | 東冬鍾江…<br/>祭泰夬廢 |
| 攝 | 攝 | class | 通江止遇蟹臻山效果假宕梗曾流深咸 |
| 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |

亦支援「開」、「合」、「重紐A類」、「重紐B類」。

説明：

元韻放在臻攝而不是山攝。

異體字：

* 聲母 娘 -> 孃
* 聲母 谿 -> 溪
* 聲母 群 -> 羣
* 韻母 餚 -> 肴
* 韻母 眞 -> 真

### Low-Level API

* function `get韻` `in韻`
* function `get韻賅上去` `in韻賅上去`
* function `get韻賅上去入` `in韻賅上去入`
* function `get攝` `in攝`
* function `get母` `in母`
* function `equal組` `in組`
* function `equal等` `in等`
* function `equal聲` `in聲`

參數 1：小韻號 (1 ≤ i ≤ 3874)

參數 2：相應音韻屬性的可能取值

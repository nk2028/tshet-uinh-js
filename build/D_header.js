/**
 * <style>
 *   th, td { border: 1px solid; }
 *   h3#qieyun, div#split-right > section:first-child > div.pre.p1.fill-light.mt0 { display: none; }
 *   p > img { max-width: 100%; }
 * </style>
 * <script>
 *   window.addEventListener("load", function(event) {
 *     document.documentElement.lang = 'zh-Hant';
 *     var xs = document.querySelectorAll('div.clearfix.small.pointer.toggle-sibling');  // Right
 *     for (const x of xs)
 *       x.click();
 *     xs = document.querySelectorAll('li > a.toggle-sibling');  // Left
 *     for (const x of xs) {
 *       var href = x.href;
 *       x.href = 'javascript:void(0)';
 *       x.click();
 *       x.href = href;
 *     }
 *   });
 * </script>
 *
 * # 《切韻》音系 JavaScript 函式庫
 *
 * Browser:
 *
 * ```html
 * <script src="https://cdn.jsdelivr.net/npm/qieyun@0.7.3"></script>
 * ```
 *
 * Node.js:
 *
 * ```sh
 * $ npm install qieyun
 * ```
 *
 * ```javascript
 * > const Qieyun = require('qieyun');
 * ```
 *
 * ![如圖為《切韻》音系 JavaScript 函式庫的工作流](/qieyun-js/demo/qieyun-js.png)
 *
 * 各參數的取值如下：
 *
 * | 音韻屬性 | 中文名稱 | 英文名稱 | 可能取值 |
 * | :- | :- | :- | :- |
 * | 母<br/>組 | 聲母<br/>組 | initial<br/>group | **幫**滂並明<br/>**端**透定泥<br/>來<br/>**知**徹澄孃<br/>**精**清從心邪<br/>**莊**初崇生俟<br/>**章**昌常書船<br/>日<br/>**見**溪羣疑<br/>**影**曉匣云<br/>以<br/>（粗體字為組，未涵蓋「來日以」） |
 * | 等 | 等 | division | 一二三四 |
 * | 開合 | 開合 | rounding | 開口<br/>合口 |
 * | 重紐 | 重紐 | repeated initials | 重紐A類<br/>重紐B類 |
 * | 韻<br/>攝 | 韻母<br/>攝 | rhyme<br/>class | 通：東冬鍾<br/>江：江<br/>止：支脂之微<br/>遇：魚虞模<br/>蟹：齊祭泰佳皆夬灰咍廢<br/>臻：眞諄臻文欣元魂痕<br/>山：寒桓刪山先仙<br/>效：蕭宵肴豪<br/>果：歌戈<br/>假：麻<br/>宕：陽唐<br/>梗：庚耕清青<br/>曾：蒸登<br/>流：尤侯幽<br/>深：侵<br/>咸：覃談鹽添咸銜嚴凡<br/>（冒號前為攝，後為對應的韻） |
 * | 聲 | 聲調 | tone | 平上去入<br/>仄<br/>舒 |
 *
 * **注意**：元韻置於臻攝而非山攝。
 * 
 * 不支援異體字，請手動轉換：
 * 
 * * 母 娘 -> 孃
 * * 母 荘 -> 莊
 * * 母 谿 -> 溪
 * * 母 群 -> 羣
 * * 韻 餚 -> 肴
 * * 韻 眞 -> 真
 *
 * [GitHub](https://github.com/nk2028/qieyun-js) - [npm](https://www.npmjs.com/package/qieyun) - [JSDelivr](https://www.jsdelivr.com/package/npm/qieyun)
 * @module Qieyun
 */

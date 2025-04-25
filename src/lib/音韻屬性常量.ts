import { assert } from './utils';

/** 全部六要素之枚舉 */
export const 所有 = {
  母: [...'幫滂並明端透定泥來知徹澄孃精清從心邪莊初崇生俟章昌常書船日見溪羣疑影曉匣云以'],
  呼: [...'開合'],
  等: [...'一二三四'],
  類: [...'ABC'],
  韻: [...'東冬鍾江支脂之微魚虞模齊祭泰佳皆夬灰咍廢真臻文殷元魂痕寒刪山先仙蕭宵肴豪歌麻陽唐庚耕清青蒸登尤侯幽侵覃談鹽添咸銜嚴凡'],
  聲: [...'平上去入'],
} as const;

/** 幫見影組聲母，在三等分ABC類 */
export const 鈍音母 = [...'幫滂並明見溪羣疑影曉匣云'] as const;

export const 陰聲韻 = [...'支脂之微魚虞模齊祭泰佳皆夬灰咍廢蕭宵肴豪歌麻侯尤幽'] as const;

function reverseLookup(搭配表: Readonly<Record<string, readonly string[]>>): Readonly<Record<string, string>> {
  const res: Record<string, string> = {};
  for (const [k, vs] of Object.entries(搭配表)) {
    for (const v of vs) {
      assert(!(v in res), () => `duplicate entry: ${v}`);
      res[v] = k === '中立' ? '' : k;
    }
  }
  return res;
}

/** 依可搭配的等列出各韻 */
export const 等韻搭配 = {
  一: [...'冬模泰灰咍魂痕寒豪唐登侯覃談'],
  二: [...'江佳皆夬刪山肴耕咸銜'],
  三: [...'鍾支脂之微魚虞祭廢真臻文殷元仙宵陽清蒸尤幽侵鹽嚴凡'],
  四: [...'齊先蕭青添'],
  一三: [...'東歌'],
  二三: [...'麻庚'],
} as const;
/** 依韻取得可搭配的所有等 */
export const 韻搭配等 = reverseLookup(等韻搭配);

/** 依可搭配的呼列出各韻。開合中立韻的索引為 `中立`。 */
export const 呼韻搭配 = {
  開合: [...'支脂微齊祭泰佳皆夬廢真元寒刪山先仙歌麻陽唐庚耕清青蒸登'],
  開: [...'之魚咍臻殷痕蕭宵肴豪幽侵覃談鹽添咸銜嚴'],
  合: [...'虞灰文魂凡'],
  中立: [...'東冬鍾江模尤侯'],
} as const;
/** 依韻取得可搭配的所有呼，但中立韻對應的值為空串而非 `中立` */
export const 韻搭配呼 = reverseLookup(呼韻搭配);

/** 依可搭配的等列出各母，包含邊緣搭配 */
export const 等母搭配 = {
  一二三四: [...'幫滂並明來見溪羣疑影曉匣'],
  二三: [...'知徹澄孃莊初崇生俟'],
  一三四: [...'精清從心邪'],
  三: [...'章昌常書船日云以'],
  一二四: [...'端透定泥'],
} as const;
/** 依母取得可搭配的所有等，包含邊緣搭配 */
export const 母搭配等 = reverseLookup(等母搭配);

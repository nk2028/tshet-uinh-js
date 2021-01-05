import 字頭資料 from './字頭資料';
import 小韻資料 from './小韻資料';

function 解析字頭資料() {
  const pattern = /([A-Za-z0-9+-]{3})(.)([^A-Za-z0-9+-]+)/gu;
  const res = [];
  while (true) {
    const match = pattern.exec(字頭資料);
    if (match == null) break;
    const { 1: 音韻編碼, 2: 字頭, 3: 解釋 } = match;
    res.push({ 音韻編碼, 字頭, 解釋 });
  }
  return res;
}

function 解析小韻資料() {
  return 小韻資料.match(/...../gu).map((小韻條目) => {
    const 音韻編碼 = 小韻條目.slice(0, 3);
    const 反切 = 小韻條目.slice(3);
    return { 音韻編碼, 反切 };
  });
}

export const m字頭2音韻編碼解釋 = new Map();
export const m音韻編碼2字頭解釋 = new Map();

for (const { 音韻編碼, 字頭, 解釋 } of 解析字頭資料(字頭資料)) {
  if (!m字頭2音韻編碼解釋.has(字頭)) {
    m字頭2音韻編碼解釋.set(字頭, []); // set default value
  }
  m字頭2音韻編碼解釋.get(字頭).push({ 音韻編碼, 解釋 });
  if (!m音韻編碼2字頭解釋.has(音韻編碼)) {
    m音韻編碼2字頭解釋.set(音韻編碼, []); // set default value
  }
  m音韻編碼2字頭解釋.get(音韻編碼).push({ 字頭, 解釋 });
}

export const m音韻編碼2反切 = new Map();

for (const { 音韻編碼, 反切 } of 解析小韻資料(小韻資料)) {
  m音韻編碼2反切.set(音韻編碼, 反切);
}

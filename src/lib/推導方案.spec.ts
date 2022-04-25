import test from 'ava';

import * as 推導方案 from './推導方案';
import { 音韻地位 } from './音韻地位';

const mockParameters: 推導方案.選項列表 = [
  ['$legacy', true],
  ['p1', true],
  ['p2', false],
  ['p3', 'orz'],
  ['p4', 42],
  ['p5', [3, 'haha', true, 'hehe']],
  ['p6', ['a2', 'a1', 'a2', 'a3']],
];

const mockProcessed: 推導方案.選項列表 = mockParameters.slice(1);
mockProcessed[4] = ['p5', ['hehe', 'haha', true, 'hehe']];

const mockOptions = {
  p1: true,
  p2: false,
  p3: 'orz',
  p4: 42,
  p5: 'hehe',
  p6: 'a2',
};

// XXX Ĉu estas pli bona maniero por difini tiajn funkciojn?
function mock(): 推導方案.選項列表;
function mock(地位: 音韻地位, 字頭: string | null, 選項: 推導方案.推導選項): string;
function mock(地位?: 音韻地位, 字頭?: string | null, 選項?: 推導方案.推導選項) {
  if (!地位) {
    return mockParameters.slice(1);
  }
  return JSON.stringify({ 地位: 地位.描述, 字頭, 選項 });
}

function mockLegacy(): 推導方案.選項列表;
function mockLegacy(地位: 音韻地位, 字頭: string | null, 選項: 推導方案.推導選項): string;
function mockLegacy(地位?: 音韻地位, 字頭?: string | null, 選項?: 推導方案.推導選項) {
  if (!地位) {
    return mockParameters;
  }
  return JSON.stringify({ 地位: 地位.描述, 字頭, 選項 });
}

test('推導方案 API', t => {
  const 辟小韻 = 音韻地位.from描述('幫清入');

  const runFor = (derive: 推導方案.推導函數<string>, isLegacy: boolean, expected地位: string) => {
    t.is(derive.isLegacy, isLegacy);
    t.deepEqual(derive.parameters, mockProcessed);
    t.deepEqual(derive.defaultOptions, mockOptions);
    t.deepEqual(JSON.parse(derive(辟小韻, '辟')), { 地位: expected地位, 字頭: '辟', 選項: mockOptions });
    t.like(JSON.parse(derive(辟小韻, '辟', { p5: -1 })), { 選項: { ...mockOptions, p5: -1 } });
  };

  runFor(推導方案.建立(mock), false, '幫三清入');
  runFor(推導方案.建立(mockLegacy), true, '幫三A清入');
});

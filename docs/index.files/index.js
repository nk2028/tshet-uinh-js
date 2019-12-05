let myCodeMirror;

document.addEventListener('DOMContentLoaded', () => {
	myCodeMirror = CodeMirror(scriptInput, {
		value: 'function brogue2(小韻號) {\n\t// Your script goes here\n}\n',
		mode: 'javascript',
		theme: 'blackboard-modified',
		lineNumbers: true
	});
});

function splitEvenOdd(arr) {
	const a = [], b = [];
	for (let i = 0; i < arr.length; i += 2) {
		a.push(arr[i]);
		b.push(arr[i + 1]);
	}
	return [a, b];
}

let brogue2;

async function handlePredefinedScriptsChange() {
	const v = predefinedScripts.value;

	let url;
	if (v == 'kuxyonh')
		url = 'examples/low_level/kuxyonh.js';
	if (v == 'ayaka2019')
		url = 'examples/low_level/ayaka2019.js';

	const response = await fetch(url);
	const text = await response.text();
	myCodeMirror.setValue(text);
	brogue2 = new Function('小韻號', text);
}

function handlePredefinedOptionsChange() {
	if (predefinedOptions.value == 'exportAllSmallRhymes') {
		outputArea.innerText = [...Array(3874).keys()].map(i => {
			const [小韻名, 韻, 母, 開合, 等] = small_rhymes[i];
			return (i + 1) + ' ' + 小韻名 + ' ' + 韻 + 母 + 開合 + 等 + ' ' + brogue2(i + 1);
		}).join('\n');
	} else if (predefinedOptions.value == 'exportAllSyllables') {
		outputArea.innerText = [...Array(3874).keys()].map(i => {
			const [小韻名, 韻, 母, 開合, 等] = small_rhymes[i];
			return (i + 1) + ' ' + 小韻名 + ' ' + brogue2(i + 1);
		}).join('\n');
	} else if (predefinedOptions.value == 'convertArticle')
		handleArticle();
}

function retrievePronunciation(sr) {
	return brogue2(sr);
}

/* Converter */

function makeLongStr(sr) {
	const [小韻名, 韻, 母, 開合, 等] = small_rhymes[sr - 1];
	return 韻 + 開合 + 等 + 母;
}

function makeTooltip(ch, pronunciation, sr, expl) {
	const div = document.createElement('div');
	div.classList.add('tooltip-item');
	div.innerText = ch + ' ' + pronunciation + ' ' + makeLongStr(sr) + ' ' + expl;
	return div;
}

function makeNoEntry(ch) {
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-no');
	outerContainer.innerText = ch;
	outerContainer.handleExport = () => ch;
	outputArea.appendChild(outerContainer);
}

function makeSingleEntry(ch, res) {
	const [sr, expl] = res;
	const pronunciation = retrievePronunciation(sr);

	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-single');

	const ruby = document.createElement('ruby');
	const rb = document.createElement('rb');
	rb.innerText = ch;
	ruby.appendChild(rb);

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	const rt = document.createElement('rt');
	rt.innerText = pronunciation;
	ruby.appendChild(rt);

	const tooltip = makeTooltip(ch, pronunciation, sr, expl);
	tooltipContainer.appendChild(tooltip);

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	const exportText = ch + '(' + pronunciation + ')';
	outerContainer.handleExport = () => exportText;
	outputArea.appendChild(outerContainer);
}

function makeMultipleEntry(ch, ress) {
	const outerContainer = document.createElement('div');
	outerContainer.classList.add('entry');
	outerContainer.classList.add('entry-multiple');
	outerContainer.classList.add('unresolved');

	const ruby = document.createElement('ruby');
	const rb = document.createElement('rb');
	rb.innerText = ch;
	ruby.appendChild(rb);

	const tooltipContainer = document.createElement('div');
	tooltipContainer.classList.add('tooltip-container');

	let rtArray = [];
	let tooltipArray = [];

	for (let i = 0, len = ress.length; i < len; i++) {
		const res = ress[i];
		const [sr, expl] = res;
		const pronunciation = retrievePronunciation(sr);

		const rt = document.createElement('rt');
		rt.innerText = pronunciation;

		ruby.appendChild(rt);
		rtArray.push(rt);

		const tooltip = makeTooltip(ch, pronunciation, sr, expl);
		tooltip.addEventListener('click', () => {
			rtArray.map(rt => rt.classList.add('hidden'));
			rt.classList.remove('hidden');

			outerContainer.currentSelection = pronunciation;
			outerContainer.classList.remove('unresolved');

			tooltipArray.map(tooltip => tooltip.classList.remove('selected'));
			tooltip.classList.add('selected');
		});
		tooltipContainer.appendChild(tooltip);
		tooltipArray.push(tooltip);

		if (i == 0) {
			outerContainer.currentSelection = pronunciation;
			tooltip.classList.add('selected');
		} else {
			rt.classList.add('hidden');
		}
	}

	outerContainer.appendChild(ruby);
	outerContainer.appendChild(tooltipContainer);
	outerContainer.handleExport = () => ch + '(' + outerContainer.currentSelection + ')';
	outputArea.appendChild(outerContainer);
}

function makeConversion(c) {
	const res = char_entities[c];
	if (!res)
		makeNoEntry(c);
	else if (res.length == 1)
		makeSingleEntry(c, res[0]);
	else
		makeMultipleEntry(c, res);
}

function handleArticle() {
	outputArea.innerHTML = '';
	const convertText = articleInput.value;
	if (convertText.length == 0) {
		;
	} else {
		convertText.split('').map(makeConversion);
	}
}

function getSelectedData() {
	return [...outputArea.childNodes].map(node => node.handleExport()).join('');
}

function handleCopy() {
	try {
		navigator.clipboard.writeText(getSelectedData()).then(() => {
			console.log('已成功匯出至剪貼簿。');
		}, () => {
			console.log('匯出至剪貼簿失敗。');
		});
	} catch (e) {
		console.log('轉換結果區域為空。請先點擊轉換，再點擊匯出。');
	}
}

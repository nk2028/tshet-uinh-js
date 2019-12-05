let myCodeMirror;

document.addEventListener('DOMContentLoaded', () => {
	myCodeMirror = CodeMirror(scriptInput, {
		value: 'function brogue2(小韻號) {\n\t// Your script goes here\n}\n',
		mode: 'javascript',
		theme: 'blackboard-modified',
		lineNumbers: true
	});
});

async function handleLoad() {
	const response = await fetch('examples/low_level/kuxyonh.js');
	const text = await response.text();
	myCodeMirror.setValue(text);
}

function handleEval() {
	resultOutput.value = eval(myCodeMirror.getValue() + '\n' + exprInput.value);
}

function splitEvenOdd(arr) {
	const a = [], b = [];
	for (let i = 0; i < arr.length; i += 2) {
		a.push(arr[i]);
		b.push(arr[i + 1]);
	}
	return [a, b];
}

function handleArticle() {
	resultOutput.value = articleInput.value.split('').map(c => {
		const smallRhymes = char_entities[c];
		if (!smallRhymes) {
			return c;
		} else {
			[srs, expls] = splitEvenOdd(smallRhymes);
			return c + '(' + srs.map(sr => eval(myCodeMirror.getValue() + '\nbrogue2(sr);')).join(', ') + ')';
		}
	}).join('');
}

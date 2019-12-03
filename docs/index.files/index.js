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
	resultOutput.value = eval(myCodeMirror.getValue() + '\n[...Array(3874).keys()].map(i => (i + 1) + " " + small_rhymes[i][0] + " " + brogue2(i + 1)).join("\\n");');
}

function splitEvenOdd(arr) {
	const a = [], b = [];
	for (let i = 0; i < arr.length; i += 2) {
		a.push(arr[i]);
		b.push(arr[i + 1]);
	}
	return [a, b];
}

function handleQuery() {
	const character = charInput.value;
	const smallRhymes = char_entities[character];
	if (!smallRhymes) {
		resultOutput.value = 'No result';
	} else {
		[srs, expls] = splitEvenOdd(smallRhymes);
		resultOutput.value = eval(myCodeMirror.getValue() + '\nsrs.map(brogue2).join(", ");')
	}
}

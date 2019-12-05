let myCodeMirror;

document.addEventListener('DOMContentLoaded', () => {
	myCodeMirror = CodeMirror(scriptInput, {
		value: 'function brogue2(小韻號) {\n\t// Your script goes here\n}\n',
		mode: 'javascript',
		theme: 'blackboard-modified',
		lineNumbers: true
	});
});

function handleEvalWithValue(x) {
	resultOutput.value = eval(myCodeMirror.getValue() + '\n' + x);
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

async function handlePredefinedScriptsChange() {
	const v = predefinedScripts.value;
	if (v == 'kuxyonh') {
		const response = await fetch('examples/low_level/kuxyonh.js');
		const text = await response.text();
		myCodeMirror.setValue(text);
		return;
	}
	if (v == 'ayaka2019') {
		const response = await fetch('examples/low_level/ayaka2019.js');
		const text = await response.text();
		myCodeMirror.setValue(text);
		return;
	}
}

function handlePredefinedOptionsChange() {
	if (predefinedOptions.value == 'exportAllSmallRhymes')
		handleEvalWithValue('[...Array(3874).keys()].map(i => (i + 1) + " " +small_rhymes[i][0] + " " +small_rhymes[i][1]+small_rhymes[i][2]+small_rhymes[i][3]+small_rhymes[i][4] + " " + brogue2(i + 1)).join("\\n")');
	else if (predefinedOptions.value == 'exportAllSyllables')
		handleEvalWithValue('[...Array(3874).keys()].map(i => (i + 1) + " " + small_rhymes[i][0] + " " + brogue2(i + 1)).join("\\n");');
	else if (predefinedOptions.value == 'convertArticle')
		handleArticle();
}

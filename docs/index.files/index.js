async function handleLoad() {
	const response = await fetch('examples/low_level/kuxyonh.js');
	const text = await response.text();
	scriptInput.value = text;
}

function handleEval() {
	resultOutput.value = eval(scriptInput.value + '\n[...Array(3874).keys()].map(i => brogue2(i + 1)).join("\\n");');
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
		resultOutput.value = eval(scriptInput.value + '\nsrs.map(brogue2).join(", ");')
	}
}

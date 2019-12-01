async function handleLoad() {
	const response = await fetch('examples/low_level/kuxyonh.js');
	const text = await response.text();
	scriptInput.value = text;
}

function handleEval() {
	eval(scriptInput.value);
}

function handleQuery() {
	const character = charInput.value;
	const small_rhymes = char_entities[character];
	if (Array.isArray(small_rhymes)) {
		const res = eval(scriptInput.value + `\nsmall_rhymes.map(brogue2);`);
		resultOutput.value = res;
	} else if (!isNaN(small_rhymes)) {
		const res = eval(scriptInput.value + `\nbrogue2(small_rhymes);`);
		resultOutput.value = res;
	} else {
		resultOutput.value = brogue2;
	}
}

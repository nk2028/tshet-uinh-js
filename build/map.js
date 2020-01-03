const 組到母=
{"幫":["幫","滂","並","明"]
,"端":["端","透","定","泥"]
,"知":["知","徹","澄","孃"]
,"精":["精","清","從","心","邪"]
,"莊":["莊","初","崇","生","俟"]
,"章":["章","昌","船","書","常"]
,"見":["見","溪","羣","疑"]
}

function __process_small_rhyme(str) {
	var r = /.[OC][1234].[AB]?/gu;
	return str.match(r);
}

function __process_char_entities(str) {
	var r = /(\d+)([^\d])([^\d]+)/gu, d = {}, match;
	while ((match = r.exec(str)) !== null) {
		var small_rhyme_num = match[1], ch = match[2], expl = match[3];
		if (!d[ch])
			d[ch] = [[small_rhyme_num | 0, expl]];
		else
			d[ch].push([small_rhyme_num | 0, expl]);
	}
	return d;
}

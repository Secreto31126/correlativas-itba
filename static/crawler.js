/**
 * With this script, you can get the subjects from the ITBA website and
 * save them in the JSON format that the code can read.
 *
 * It asumes JQuery is loaded in the page.
 *
 * To use it, open SGA, go to a career's "Plan de estudio", open the
 * browser's console (ctrl + mayus + i) and paste the code. Copy the
 * output and save it in `src/lib/server/data/{CAREER}.json`.
 *
 * Last, you need to manually change the `name` property of the subjects
 * to be cooler :D
 */

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

class Subject {
	constructor(code, name, parents, year, semester, credits, requires) {
		this.code = code;
		this.parent = parents;
		this.name = name;
		this.formal = name;
		this.semester = year !== null ? (year - 1) * 2 + semester * 1 : undefined;
		this.credits = credits;
		this.requires = requires;
	}
}

const db = {
	credits: 0,
	mandatories: [],
	optatives: {}
};

const mecanica = false;
const old = null;

db.credits = +$('table:last tr:has(td:contains("Principal")) span:last')
	.text()
	.match(/sumar ([0-9]+) créditos/)?.[1];

$('tr:not(:has(table)):has(td > a)').each(function () {
	const title = $(this).closest('td').find('h4 > span').first().text().trim();

	let specialization;
	if (title === 'Contenido:') {
		if (mecanica) return false; // Mecánica is a special case
		specialization = $(this).closest('table:has(table)').find('thead span').eq(1).text();
	}

	const [year, semester] = !specialization ? title.match(/\d/g) : [null, null];

	const data = $(this).children('td');
	const [code, name] = data.first().text().split(' - ');
	const credits = data.eq(1).text() * 1;
	const requires = data.eq(2).text() * 1;
	const parents = data
		.last()
		.text()
		.trim()
		.split(' ')
		.filter((e) => !!e)
		.map((e) => e.trim());

	const subject = new Subject(code, name, parents, year, semester, credits, requires);

	if (specialization) {
		if (!(specialization in db.optatives)) {
			db.optatives[specialization] = [];
		}

		db.optatives[specialization].push(subject);
	} else {
		db.mandatories.push(subject);
	}
});

if (old) {
	db.mandatories.forEach((e) => {
		e.name = old.mandatories.find((o) => o.code === e.code)?.name ?? e.name;
	});

	for (const specialization in old.optatives) {
		if (!(specialization in db.optatives)) {
			continue;
		}

		old.optatives[specialization].forEach((e) => {
			const existing = db.optatives[specialization].find((o) => o.code === e.code);
			if (existing) {
				existing.name = e.name;
			}
		});
	}
}

console.log(JSON.stringify(db, null, 4));

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

const credits = +$('table:last tr:has(td:contains("Principal")) span:last')
	.text()
	.match(/sumar ([0-9]+) créditos/)?.[1];

const orientations = $('tr:has(td:contains("Orientación"))')
	.find('td:last')
	.map(function () {
		return $(this)
			.text()
			.match(/Aprobar (.+) \(sumar [0-9]+ créditos\)/)[1];
	})
	.get();

const dbs = orientations.reduce((acc, e) => {
	acc[e] = {
		credits,
		mandatories: [],
		optatives: {}
	};

	return acc;
}, {});

let specialization = null;
$('tr:not(:has(table)):has(td > a)').each(function () {
	const title = $(this).closest('td').find('h4 > span').first().text().trim();
	const subtitle = $(this).closest('table:has(table)').find('thead span').eq(1).text();

	const electives = title === 'Contenido:';
	if (subtitle in dbs) {
		specialization = subtitle;
	}

	const [year, semester] = !electives ? title.match(/\d/g) : [null, null];

	const data = $(this).children('td');
	const [code, name] = data
		.first()
		.text()
		.split(' - ')
		.map((e) => e.trim());
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

	function insert(key) {
		const db = dbs[key];

		if (electives) {
			if (!(subtitle in db.optatives)) {
				db.optatives[subtitle] = [];
			}

			db.optatives[subtitle].push(subject);
		} else {
			db.mandatories.push(subject);
		}
	}

	if (specialization) {
		insert(specialization);
	} else {
		orientations.forEach(insert);
	}
});

for (const key in dbs) {
	console.log(`\n${key}:\n`);
	console.log(JSON.stringify(dbs[key], null, 4));
}

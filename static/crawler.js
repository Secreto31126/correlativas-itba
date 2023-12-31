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
        this.semester = (year - 1) * 2 + (semester * 1);
        this.credits = credits;
        this.requires = requires;
    }
}

const db = [];
const old = null;

$("tr:not(:has(table)):has(td > a)").each(function () {
    const title = $(this)
        .closest("td")
        .find("h4 > span")
        .first()
        .text()
        .trim()

    if (title === "Contenido:") return false;

    const [year, semester] = title.match(/\d/g);

    const data = $(this).children("td");
    const [code, name] = data.first().text().split(" - ");
    const credits = data.eq(1).text() * 1;
    const requires = data.eq(2).text() * 1;
    const parents = data
        .last()
        .text()
        .trim()
        .split(" ")
        .filter(e => !!e)
        .map(e => e.trim());

    db.push(
        new Subject(code, name, parents, year, semester, credits, requires)
    );
});

if (old) {
    db.forEach(e => {
        e.name = old.find(o => o.code === e.code)?.name ?? e.name;
    });
}

console.log(JSON.stringify(db, null, 4));

/**
 * Merges fresh crawler.js output into an existing career JSON file,
 * preserving the manually curated `name` of each subject.
 *
 * Usage:
 *   node static/merge.js src/lib/server/data/{CAREER}.json
 *
 * Then paste the crawler output into the terminal and press Ctrl+D
 * (Ctrl+Z + Enter on Windows). The file is overwritten in place.
 *
 * The new crawl is the source of truth: subjects are added, updated
 * and removed to match it. Only `name` survives from the current file
 * (matched by subject code). Everything else (`formal`, `parent`,
 * `semester`, `credits`, `requires`) comes from the crawl.
 *
 * Each subject list is deduped by code (first copy wins), and codes
 * listed in static/exclusions.json are dropped from the crawl before
 * merging.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filePath = process.argv[2];

if (!filePath) {
	console.error('Usage: node static/merge.js <path/to/CAREER.json>  (then paste crawler output, Ctrl+D)');
	process.exit(1);
}

let current;
try {
	current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (err) {
	console.error(`Could not read ${filePath}: ${err.message}`);
	process.exit(1);
}

console.log(`Paste the crawler output for ${filePath} and press Ctrl+D:\n`);

let incoming;
try {
	incoming = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch (err) {
	console.error(`Pasted input is not valid JSON: ${err.message}`);
	process.exit(1);
}

for (const key of ['mandatories', 'optatives']) {
	if (!(key in incoming)) {
		console.error(`Pasted input has no "${key}" property. Is it crawler output?`);
		process.exit(1);
	}
}

const allSubjects = (db) => [...db.mandatories, ...Object.values(db.optatives).flat()];

// Dedupe by code, keep the first copy, and remember codes whose
// repeated copies were not identical.
const conflicts = new Set();
const dedupe = (subjects, seen = new Map()) => {
	const out = [];
	for (const subject of subjects) {
		const prev = seen.get(subject.code);
		if (!prev) {
			seen.set(subject.code, subject);
			out.push(subject);
		} else if (JSON.stringify(prev) !== JSON.stringify(subject)) {
			conflicts.add(subject.code);
		}
	}
	return out;
};

// Codes in static/exclusions.json never make it into the merged file
// (e.g. subjects the plan still lists but the app should not show).
const exclusionsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'exclusions.json');
const exclusions = fs.existsSync(exclusionsPath)
	? JSON.parse(fs.readFileSync(exclusionsPath, 'utf8'))
	: [];
const excluded = new Set();
const clean = (subjects) =>
	dedupe(
		subjects.filter((s) => {
			if (!exclusions.includes(s.code)) return true;
			excluded.add(s.code);
			return false;
		})
	);

incoming.mandatories = clean(incoming.mandatories);
for (const specialization of Object.keys(incoming.optatives)) {
	incoming.optatives[specialization] = clean(incoming.optatives[specialization]);
}

const names = new Map(allSubjects(current).map((s) => [s.code, s.name]));

const mergeSubject = (subject) => ({
	code: subject.code,
	parent: subject.parent,
	name: names.get(subject.code) ?? subject.name,
	formal: subject.formal,
	semester: subject.semester,
	credits: subject.credits,
	requires: subject.requires
});

const merged = {
	credits: incoming.credits,
	mandatories: incoming.mandatories.map(mergeSubject),
	optatives: Object.fromEntries(
		Object.entries(incoming.optatives).map(([specialization, subjects]) => [
			specialization,
			subjects.map(mergeSubject)
		])
	)
};

// Match prettier's format: arrays of strings (`parent`) collapse onto one line
const json = JSON.stringify(merged, null, '\t').replace(
	/\[\s*("(?:[^"\\]|\\.)*"(?:\s*,\s*"(?:[^"\\]|\\.)*")*)\s*\]/g,
	(_, inner) => `[${inner.replace(/,\s+/g, ', ')}]`
);

fs.writeFileSync(filePath, json + '\n');

const paint = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);

const oldCodes = new Set(names.keys());
const newCodes = new Set(allSubjects(merged).map((s) => s.code));
const added = [...newCodes].filter((c) => !oldCodes.has(c));
const removed = [...oldCodes].filter((c) => !newCodes.has(c));
const oldSpecs = Object.keys(current.optatives);
const newSpecs = Object.keys(merged.optatives);

console.log(`\nWrote ${filePath}`);
console.log(
	`Subjects: ${newCodes.size} total, ${green(`${added.length} added`)}, ${red(`${removed.length} removed`)}`
);
if (added.length) console.log(green(`  Added (name needs manual love): ${added.join(', ')}`));
if (removed.length) console.log(red(`  Removed: ${removed.join(', ')}`));
const addedSpecs = newSpecs.filter((s) => !oldSpecs.includes(s));
const removedSpecs = oldSpecs.filter((s) => !newSpecs.includes(s));
if (addedSpecs.length) console.log(green(`  New specializations: ${addedSpecs.join(', ')}`));
if (removedSpecs.length) console.log(red(`  Removed specializations: ${removedSpecs.join(', ')}`));
if (conflicts.size)
	console.log(
		yellow(`  Duplicate copies differed (kept first, review manually): ${[...conflicts].join(', ')}`)
	);
if (excluded.size)
	console.log(yellow(`  Excluded (static/exclusions.json): ${[...excluded].join(', ')}`));

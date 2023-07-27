import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

function codify(s: string) {
	return `i${s.replace('.', '')}`;
}

export const load = (async ({ params }) => {
	type Subject = {
		code: string;
		parent: string[];
		name: string;
		formal: string;
		semester: number;
		parentc?: string[];
		codec?: string;
	};

	let data: Subject[];

	try {
		data = (await import(/* @vite-ignore */ `../../lib/subjects/${params.materia}.json`)).default;
	} catch (e) {
		throw error(404, `Materia ${params.materia} not found`);
	}

	return {
		career: data.map((e) => {
			e.codec = codify(e.code);
			e.parentc = e.parent.map(codify);
			return e as Subject & { codec: string; parentc: string[] };
		})
	};
}) satisfies PageServerLoad;

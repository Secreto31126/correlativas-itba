import type { PageServerLoad } from './$types';
import type { Subject, FilledSubject } from '$lib/types/subjects';

import { error } from '@sveltejs/kit';
import { codify } from '$lib/modules/codes';
import Careers from '$lib/server/data/index.json';

export const load = (async ({ params }) => {
	const filename = Careers.find((c) => params.materia === c.cute)?.file;
	if (!filename) throw error(404, `Materia ${params.materia} not found`);

	let data: Subject[];
	try {
		const files = import.meta.glob('$lib/server/data/*.json', { as: 'raw' });
		const path = Object.keys(files).find((e) => e.endsWith(filename)) ?? 'LOL no.';
		data = JSON.parse(await files[path]()) as Subject[];
	} catch (e) {
		throw error(500, 'Failed to open file');
	}

	return {
		career: data.map((e) => {
			e.codec = codify(e.code);
			e.parentc = e.parent.map(codify);
			return e as FilledSubject;
		})
	};
}) satisfies PageServerLoad;

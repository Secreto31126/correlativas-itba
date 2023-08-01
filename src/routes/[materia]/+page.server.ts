import type { PageServerLoad } from './$types';
import type { Subject, FilledSubject } from '$lib/types/subjects';

import { error } from '@sveltejs/kit';
import { codify } from '$lib/modules/codes';
import { isPath } from '$lib/server/modules/files';

export const load = (async ({ params }) => {
	const files = import.meta.glob('$lib/server/data/*.json', { as: 'raw' });
	const path = Object.keys(files).find((p) => isPath(params.materia, p));

	if (!path) throw error(404, `Materia ${params.materia} not found`);

	let data;
	try {
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

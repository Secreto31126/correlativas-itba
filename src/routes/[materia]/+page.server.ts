import type { PageServerLoad } from './$types';
import type Subject from '$lib/subjects';

import { error } from '@sveltejs/kit';
import { codify } from '$lib/codes';
import { isPath } from '$lib/files';

export const load = (async ({ params }) => {
	const files = import.meta.glob('$lib/subjects/*.json', { as: 'raw' });
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
			return e as Subject & { codec: string; parentc: string[] };
		})
	};
}) satisfies PageServerLoad;

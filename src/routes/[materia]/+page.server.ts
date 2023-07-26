import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	try {
		return {
			subject: (await import(/* @vite-ignore */ `../../lib/${params.materia}.json`)).default as {
				code: string;
				dep: string[];
				name: string;
				formal: string;
				semester: number;
			}[]
		};
	} catch (e) {
		throw error(404, `Materia ${params.materia} not found`);
	}
}) satisfies PageServerLoad;

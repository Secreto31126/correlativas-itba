import type { PageServerLoad } from './$types';
import { getName } from '$lib/files';

export const load = (async () => {
	const files = import.meta.glob('$lib/subjects/*.json');
	return {
		careers: Object.keys(files).map((s) => {
			return {
				og: getName(s, false),
				url: getName(s)
			};
		})
	};
}) satisfies PageServerLoad;

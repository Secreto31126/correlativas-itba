import type { PageServerLoad } from './$types';
import { getName } from '$lib/server/modules/files';

export const load = (async () => {
	const files = import.meta.glob('$lib/server/data/*.json');
	return {
		careers: Object.keys(files).map((s) => {
			return {
				og: getName(s, false),
				url: getName(s)
			};
		})
	};
}) satisfies PageServerLoad;

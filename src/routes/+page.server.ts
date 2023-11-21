import type { PageServerLoad } from './$types';
import Careers from '$lib/server/data/index.json';

export const load = (async () => {
	return { careers: Careers };
}) satisfies PageServerLoad;

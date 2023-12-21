import { error, redirect } from '@sveltejs/kit';
import { getDocuments } from '$lib/server/modules/firebase';

import type { PageServerLoad } from './$types';
import type { UserData } from '$lib/types/documents';

export const load = (async ({ locals }) => {
	if (!locals.userSession) throw redirect(304, '/');

	const docs = <UserData[]>await getDocuments('user_data', locals.userSession.uid);
	if (!docs.length) throw error(404, 'User data not found, unexpectedly');

	return {
		user_data: docs[0]
	};
}) satisfies PageServerLoad;

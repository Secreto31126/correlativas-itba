import type { PageServerLoad } from './$types';

import { UserData } from '$lib/types/documents';

import Careers from '$lib/server/data/index.json';
import { createDocument, getDocuments } from '$lib/server/modules/firebase';

export const load = (async ({ locals }) => {
	let user_data: UserData | null = null;
	if (locals.userSession) {
		const { uid } = locals.userSession;
		const docs = await getDocuments('user_data', uid, UserData);

		if (!docs.length) {
			const doc = await createDocument('user_data', uid, UserData);
			user_data = doc;
		} else {
			user_data = docs[0];
		}
	}

	return {
		user_data,
		careers: Careers
	};
}) satisfies PageServerLoad;

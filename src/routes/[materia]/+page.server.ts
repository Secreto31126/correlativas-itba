import type { PageServerLoad } from './$types';
import type { UserData } from '$lib/types/documents';
import type { Subject, FilledSubject } from '$lib/types/subjects';

import { error } from '@sveltejs/kit';
import { codify } from '$lib/modules/codes';
import Careers from '$lib/server/data/index.json';
import { createDocument, getDocuments } from '$lib/server/modules/firebase';

export const load = (async ({ params, locals }) => {
	// #region Career Content
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
	// #endregion

	// #region DB Data
	let user_data: UserData | null = null;
	if (locals.userSession) {
		const { uid } = locals.userSession;
		const docs = <UserData[]>await getDocuments('user_data', uid);

		if (!docs.length) {
			const doc = <UserData>await createDocument('user_data', uid);
			user_data = doc;
		} else {
			user_data = docs[0];
		}
	}
	// #endregion

	return {
		user_data,
		career: data.map((e) => {
			e.codec = codify(e.code);
			e.parentc = e.parent.map(codify);
			return e as FilledSubject;
		})
	};
}) satisfies PageServerLoad;

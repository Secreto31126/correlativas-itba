import type { PageServerLoad } from './$types';
import type { UserData } from '$lib/types/documents';
import type { FilledSubject, CareerData } from '$lib/types/subjects';

import { error } from '@sveltejs/kit';
import { codify } from '$lib/modules/codes';
import Careers from '$lib/server/data/index.json';
import { createDocument, getDocuments } from '$lib/server/modules/firebase';

export const load = (async ({ params, locals }) => {
	// #region Career Content
	let career_data = Careers.find((c) => params.carrera === c.cute);

	// Search within specializations if not found
	if (!career_data) {
		let specialization: NonNullable<(typeof Careers)[number]['specialization']>[number] | undefined;

		let pointer = Careers.find((c) => {
			specialization ??= c.specialization?.find((s) => params.carrera === s.cute);
			return !!specialization;
		});

		if (pointer && specialization) {
			career_data = {
				...pointer,
				...specialization
			};
			delete career_data.specialization;
		}
	}

	if (!career_data || !career_data.file) error(404, `Materia ${params.carrera} not found`);

	const filename = career_data.file;

	let data: CareerData;
	try {
		const files = import.meta.glob('$lib/server/data/*.json', {
			query: '?json',
			import: 'default'
		});

		const path = Object.keys(files).find((e) => e.endsWith(filename)) ?? 'LOL no.';

		data = (await files[path]()) as CareerData;
	} catch (e) {
		error(500, 'Failed to open file');
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

	const optatives: Record<string, FilledSubject[]> = {};
	if (!user_data || user_data.options.optatives) {
		Object.keys(data.optatives).forEach((key) => {
			optatives[key] = data.optatives[key].map((e) => {
				e.codec = codify(e.code);
				e.parentc = e.parent.map(codify);
				e.optative = key;
				return e as FilledSubject;
			});
		});
	}

	return {
		user_data,
		career_data,
		credits: data.credits,
		career: data.mandatories.map((e) => {
			e.codec = codify(e.code);
			e.parentc = e.parent.map(codify);
			return e as FilledSubject;
		}),
		optatives
	};
}) satisfies PageServerLoad;

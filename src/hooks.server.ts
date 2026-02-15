import { decodeToken } from '$lib/server/modules/firebase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token') ?? '';
	const decodedToken = await decodeToken(token);

	if (decodedToken) {
		const { uid, picture } = decodedToken;
		event.locals.userSession = { uid, picture };
	}

	const response = await resolve(event);

	return response;
};

import { text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { token } = await request.json();

	if (token) {
		cookies.set('token', token, {
			path: '/',
			httpOnly: true
		});
	} else {
		cookies.delete('token', { path: '/' });
	}

	return text('Ok', { status: 200 });
};

import { inject } from '@vercel/analytics';
import { dev, browser } from '$app/environment';
import { initializeFirebase } from '$lib/modules/firebase';

inject({ mode: dev ? 'development' : 'production' });

if (browser) {
	try {
		initializeFirebase({
			apiKey: 'AIzaSyBYq_krHmwalCZOw1qQW24k1dfzGpIgm0A',
			authDomain: 'correlativas-itba.firebaseapp.com',
			projectId: 'correlativas-itba',
			storageBucket: 'correlativas-itba.appspot.com',
			messagingSenderId: '224247360201',
			appId: '1:224247360201:web:942f53e0e448293ac1fb18'
		});
	} catch (e) {
		console.error(e);
	}
}

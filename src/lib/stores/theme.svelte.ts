import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

if (browser) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		setTheme(event.matches ? 'dark' : 'light');
	});
}

let store: Theme = $state(
	browser
		? ((localStorage.getItem('theme') as Theme | null) ??
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
		: 'light'
);

export function getTheme() {
	return store;
}

export function setTheme(theme: Theme) {
	store = theme;
	if (browser) {
		localStorage.setItem('theme', store);
	}
}

export function toggleTheme() {
	setTheme(getTheme() === 'light' ? 'dark' : 'light');
}

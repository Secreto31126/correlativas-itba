import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const dark_query = browser ? window.matchMedia('(prefers-color-scheme: dark)') : null;

let store: Theme = $state(
	browser
		? ((localStorage.getItem('theme') as Theme | null) ?? (dark_query?.matches ? 'dark' : 'light'))
		: 'light'
);

dark_query?.addEventListener('change', (event) => {
	setTheme(event.matches ? 'dark' : 'light');
});

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

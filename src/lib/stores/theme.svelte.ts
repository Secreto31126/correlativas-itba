import { browser } from '$app/environment';

type Theme = 'light' | 'dark';
let store: Theme = $state(
	(browser
		? ((localStorage.getItem('theme') as Theme | null) ??
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : null))
		: null) ?? 'light'
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

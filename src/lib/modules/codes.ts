export function codify(s: string) {
	return `i${s.replace('.', '')}`;
}

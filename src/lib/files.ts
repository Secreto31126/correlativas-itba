export function getName(path: string) {
	return path
		.match(/(?<=subjects\/).*(?=.json)/i)?.[0]
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

export function isPath(name: string, path: string) {
	return getName(path) === name;
}

/**
 * Get the name of the file without the extension.
 *
 * Uppercase and accents are removed if normalize is true.
 *
 * @param path The path to the file
 * @param normalize Whether to normalize the name or not
 * @returns The name of the file without the extension
 */
export function getName(path: string, normalize = true) {
	const name = path.match(/(?<=careers\/).*(?=.json)/i)?.[0];
	return normalize && name ? standarize(name) : name;
}

/**
 * Check if the name matches the path.
 *
 * @param name The name of the file without the extension
 * @param path The path to the file
 * @returns Whether the name matches the path or not
 */
export function isPath(name: string, path: string) {
	return getName(path) === standarize(name);
}

/**
 * Standarize a string by removing accents and lowercasing it.
 *
 * @param str The str to standarize
 * @returns The standarized str
 */
function standarize(str: string) {
	return str
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

export function preventDefault(c: CallableFunction) {
	return (e: Event) => {
		e.preventDefault();
		c();
	};
}

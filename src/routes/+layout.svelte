<script lang="ts">
	import '../app.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children?.()}

<style lang="postcss">
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	:global(h1, p, a) {
		font-family: 'Roboto', sans-serif;
		text-align: center;
	}
</style>

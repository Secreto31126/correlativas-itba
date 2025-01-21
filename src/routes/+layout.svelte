<script lang="ts">
	import '../app.css';

	import { getTheme, setTheme } from '$lib/stores/theme.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let dark = $derived(getTheme() === 'dark');
</script>

<div class="contents dark:bg-black" class:dark>
	{@render children?.()}
</div>

<style lang="postcss">
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	:global(h1, p, a) {
		font-family: 'Roboto', sans-serif;
		text-align: center;
	}
</style>

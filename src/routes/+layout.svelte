<script lang="ts">
	import '../app.css';

	import { getTheme } from '$lib/stores/theme.svelte';
	import { onMount } from 'svelte';

	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let dark = $derived(getTheme() === 'dark');

	onMount(() => {
		document.body.removeAttribute('data-loading');
	});
</script>

<div class="contents" class:dark>
	{@render children?.()}
</div>

<style lang="postcss">
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
	@reference "tailwindcss";

	:global(h1, p, a) {
		font-family: 'Roboto', sans-serif;
		text-align: center;
	}

	:global(body) {
		@apply transition-colors;
	}

	:global(body:has(.dark)) {
		@apply bg-zinc-900;

		& h1,
		& p,
		& button,
		& svg {
			@apply text-gray-200;
		}
	}
</style>

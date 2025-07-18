<script lang="ts">
	import GoogleButton from '$lib/components/GoogleButton.svelte';
	import { getTheme, toggleTheme } from '$lib/stores/theme.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Correlativas ITBA</title>
	<meta name="og:title" content="Correlativas ITBA" />
	<meta name="twitter:title" content="Correlativas ITBA" />
	<meta
		name="description"
		content="Explora todas las carreras que ofrece el Instituto Tecnológico Buenos Aires y descubre el plan de estudio de cada una con el mapa interactivo"
	/>
	<meta
		name="og:description"
		content="Explora todas las carreras que ofrece el Instituto Tecnológico Buenos Aires y descubre el plan de estudio de cada una con el mapa interactivo"
	/>
	<meta
		name="twitter:description"
		content="Explora todas las carreras que ofrece el Instituto Tecnológico Buenos Aires y descubre el plan de estudio de cada una con el mapa interactivo"
	/>
</svelte:head>

<header>
	<h1 class="text-4xl md:text-6xl my-3">Correlativas de...</h1>
</header>

<main class="flex flex-col items-center text-xl mb-24">
	{#each data.careers as { cute, plan, name, hidden }}
		{#if !hidden}
			<a href="/{cute}" class="underline text-blue-500 mb-1">
				{name} (Plan {plan})
			</a>
		{/if}
	{/each}
</main>

<footer class="fixed bottom-0 w-full h-16 md:h-18 mb-4 flex justify-center bg-none">
	<div
		class="flex h-full justify-center gap-6 md:gap-5 rounded-full px-5 py-4 bg-indigo-50 dark:bg-gray-700 backdrop-opacity-50"
	>
		<button onclick={toggleTheme} class="h-full cursor-pointer">
			{#if getTheme() === 'dark'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-full"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
					/>
				</svg>
			{/if}
		</button>
		<GoogleButton
			logged={!!data.userSession}
			picture={data.userSession?.picture}
			ping={!data.user_data?.options.visited_account}
		/>
		<a href="https://github.com/Secreto31126/correlativas-itba">
			{#if getTheme() === 'dark'}
				<img src="github-white.png" alt="View Source Code" class="h-full rounded-full" />
			{:else}
				<img src="github.png" alt="View Source Code" class="h-full rounded-full" />
			{/if}
		</a>
		<a href="/noob" aria-label="Tutorial" class="flex items-center justify-between">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-full"
				class:motion-safe:animate-bounce={!data.user_data}
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
				/>
			</svg>
		</a>
	</div>
</footer>

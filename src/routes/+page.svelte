<script lang="ts">
	import GoogleButton from '$lib/components/GoogleButton.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
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
	{#each data.careers as career}
		{#if career}
			<a href="/{career.cute}" class="underline text-blue-500 mb-1">
				{career.name} (Plan {career.plan})
			</a>
		{/if}
	{/each}
</main>

<footer class="fixed bottom-0 w-full h-16 md:h-20 pt-2 pb-4 flex justify-center gap-3 bg-white">
	<GoogleButton
		logged={!!data.userSession}
		picture={data.userSession?.picture}
		ping={!data.user_data?.options.visited_account}
	/>
	<a href="https://github.com/Secreto31126/correlativas-itba">
		<img src="github.png" alt="View Source Code" class="h-full rounded-full" />
	</a>
</footer>

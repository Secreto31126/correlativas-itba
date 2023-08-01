<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="text-4xl md:text-6xl my-3">Correlativas de...</h1>
<div class="flex flex-col justify-center text-xl">
	{#each data.careers as career}
		{#if career}
			<a href="/{career.url}" class="underline text-blue-500 mb-1">{career.og}</a>
		{/if}
	{/each}
</div>

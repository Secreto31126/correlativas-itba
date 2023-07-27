<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Correlativas de...</h1>
<div class="text-center">
	{#each data.careers as career}
		{#if career}
			<a href="/{career.url}" class="underline text-blue-500">{career.og}</a>
		{/if}
	{/each}
</div>

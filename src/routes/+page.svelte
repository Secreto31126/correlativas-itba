<script lang="ts">
	import { page } from '$app/stores';
	import { signInWith, signOut } from '$lib/modules/firebase';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="text-4xl md:text-6xl my-3">Correlativas de...</h1>
<div class="flex flex-col justify-center text-xl mb-24">
	{#each data.careers as career}
		{#if career}
			<a href="/{career.cute}" class="underline text-blue-500 mb-1">
				{career.name} (Plan {career.plan})
			</a>
		{/if}
	{/each}
</div>

<div class="fixed bottom-0 w-full pt-2 pb-4 flex justify-center bg-white">
	<button on:click={() => ($page.data.userSession ? signOut() : signInWith('google'))}>
		<img
			src={$page.data.userSession?.picture ??
				'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA'}
			alt="Logout"
			class="h-12 rounded-full"
		/>
	</button>
</div>

<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { initializeFirebase, signInWith, signOut } from '$lib/modules/firebase';

	import type { PageData } from './$types';

	export let data: PageData;

	if (browser) {
		try {
			initializeFirebase({
				apiKey: 'AIzaSyBYq_krHmwalCZOw1qQW24k1dfzGpIgm0A',
				authDomain: 'correlativas-itba.firebaseapp.com',
				projectId: 'correlativas-itba',
				storageBucket: 'correlativas-itba.appspot.com',
				messagingSenderId: '224247360201',
				appId: '1:224247360201:web:942f53e0e448293ac1fb18'
			});
		} catch (e) {
			console.error(e);
		}
	}
</script>

<h1 class="text-4xl md:text-6xl my-3">Correlativas de...</h1>
<div class="flex flex-col justify-center text-xl">
	{#each data.careers as career}
		{#if career}
			<a href="/{career.cute}" class="underline text-blue-500 mb-1">
				{career.name} (Plan {career.plan})
			</a>
		{/if}
	{/each}
</div>

<div class="absolute bottom-0 w-full my-4 flex justify-center">
	<button on:click={() => ($page.data.userSession ? signOut() : signInWith('google'))}>
		<img
			src={$page.data.userSession?.picture ??
				'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA'}
			alt="Logout"
			class="h-12 rounded-full"
		/>
	</button>
</div>

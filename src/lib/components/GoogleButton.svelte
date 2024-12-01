<script lang="ts">
	import { signInWith } from '$lib/modules/firebase';

	interface Props {
		ping: boolean;
		logged: boolean;
		picture?: string;
	}

	let { ping, logged, picture }: Props = $props();
</script>

{#if logged}
	<a href="/account" class="relative h-full">
		<img src={picture} alt="Your Account" class="h-full aspect-square rounded-full" />
		{#if ping}
			<span class="absolute top-0 right-0 flex h-3 w-3">
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
			</span>
		{/if}
	</a>
{:else}
	<button onclick={() => signInWith('google')} class="h-full">
		<img
			src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
			alt="Login"
			class="h-full aspect-square rounded-full"
		/>
	</button>
{/if}

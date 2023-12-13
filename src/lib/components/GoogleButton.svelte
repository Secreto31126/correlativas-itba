<script lang="ts">
	import { signInWith, signOut } from '$lib/modules/firebase';

	export let logged: boolean;
	export let picture: string | undefined;
</script>

<button on:click={() => (logged ? signOut() : signInWith('google'))} class="contents">
	<img
		src={logged
			? picture
			: 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA'}
		alt={logged ? 'Logout' : 'Login'}
		class="h-full rounded-full"
	/>
</button>

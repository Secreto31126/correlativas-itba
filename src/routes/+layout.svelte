<script lang="ts">
	import '../app.css';
</script>

<slot />

<style lang="postcss">
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	:global(h1, p, a) {
		font-family: 'Roboto', sans-serif;
		text-align: center;
	}
</style>

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

	:global(h1) {
		font-size: max(calc(200px - 10vw), 36px);
	}

	:global(a) {
		font-size: max(calc(150px - 10vw), 21px);
	}

	:global(p) {
		font-size: 1.5rem;
	}
</style>

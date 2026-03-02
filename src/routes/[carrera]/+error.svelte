<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<h1>{page.status}: {page.error?.message}</h1>
<div class="w-screen text-center">
	<a href={resolve('/')} class="mb-1 text-blue-500 underline">Inicio</a>
</div>

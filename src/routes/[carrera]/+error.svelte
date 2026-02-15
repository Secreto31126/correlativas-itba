<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error?.message}</h1>
<div class="w-screen text-center">
	<a href="/" class="underline text-blue-500 mb-1">Inicio</a>
</div>

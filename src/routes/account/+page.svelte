<script lang="ts">
	import { deleteDocument, getDocumentStore, saveDocument, signOut } from '$lib/modules/firebase';
	import { redirect } from '@sveltejs/kit';
	import { UserData } from '$lib/types/documents';
	import { onMount } from 'svelte';

	import type { PageData } from './$types';

	export let data: PageData;

	const db_store = getDocumentStore(UserData, new UserData(data.user_data));
	$: db = $db_store;

	function bye() {
		deleteDocument(db);
		signOut();
		redirect(304, '/');
	}

	function toggle_credits() {
		db.options.credits = !db.options.credits;
		saveDocument(db);
	}

	function toggle_requires() {
		db.options.requires = !db.options.requires;
		saveDocument(db);
	}

	onMount(() => {
		if (!db.options.visited_account) {
			db.options.visited_account = true;
			saveDocument(db);
		}
	});
</script>

<div class="flex flex-col">
	<button on:click={() => redirect(303, '/')}>Volver al inicio</button>
	<button on:click={signOut}>Log out</button>
	<button on:click={toggle_credits}>
		{db.options.credits ? 'Ocultar' : 'Mostrar'} créditos
	</button>
	<button on:click={toggle_requires}>
		{db.options.requires ? 'Ocultar' : 'Mostrar'} requisitos
	</button>
	<button on:click={bye} class="hover:bg-red-500 transition-colors duration-700">
		Delete data
	</button>
</div>

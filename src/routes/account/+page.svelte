<script lang="ts">
	import { deleteDocument, getDocumentStore, saveDocument, signOut } from '$lib/modules/firebase';
	import { redirect } from '@sveltejs/kit';
	import { UserData } from '$lib/types/documents';

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
</script>

<div class="flex flex-col">
	<button on:click={signOut}>Log out</button>
	<button on:click={bye}>Delete data</button>
	<button on:click={toggle_credits}>
		{db.options.credits ? 'Ocultar' : 'Mostrar'} créditos
	</button>
	<button on:click={toggle_requires}>
		{db.options.requires ? 'Ocultar' : 'Mostrar'} requisitos
	</button>
</div>

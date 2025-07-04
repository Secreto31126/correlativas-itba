<script lang="ts">
	import { deleteDocument, getDocumentStore, saveDocument, signOut } from '$lib/modules/firebase';
	import { redirect } from '@sveltejs/kit';
	import { UserData } from '$lib/types/documents';
	import { onMount } from 'svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const db_store = getDocumentStore(UserData, new UserData(data.user_data));
	let db = $derived($db_store);

	function ok_byeeeee() {
		if (
			confirm('¿Estás seguro de que querés borrar tu cuenta?\n¡Esta acción no se puede deshacer!')
		) {
			deleteDocument(db);
			signOut();
			redirect(304, '/');
		}
	}

	function toggle_code() {
		db.options.code = !db.options.code;
		saveDocument(db);
	}

	function toggle_credits() {
		db.options.credits = !db.options.credits;
		saveDocument(db);
	}

	function toggle_requires() {
		db.options.requires = !db.options.requires;
		saveDocument(db);
	}

	function toggle_progress() {
		db.options.progress = !db.options.progress;
		saveDocument(db);
	}

	function toggle_movement() {
		db.options.movement = !db.options.movement;
		saveDocument(db);
	}

	function toggle_optatives() {
		db.options.optatives = !db.options.optatives;
		saveDocument(db);
	}

	onMount(() => {
		if (!db.options.visited_account) {
			db.options.visited_account = true;
			saveDocument(db);
		}
	});
</script>

<svelte:head>
	<title>Correlativas ITBA - Cuenta</title>
</svelte:head>

<header class="md:ml-2 my-3 md:mt-1 md:w-fit">
	<a href="/">
		<h1 class="text-2xl md:text-4xl font-bold">Ajustes</h1>
	</a>
</header>

<div class="flex flex-col items-center gap-2">
	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar código</span>
		<input type="checkbox" checked={db.options.code} onchange={toggle_code} class="sr-only peer" />
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-yellow-600 dark:peer-checked:bg-yellow-600"
		></div>
	</label>

	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar créditos</span>
		<input
			type="checkbox"
			checked={db.options.credits}
			onchange={toggle_credits}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
		></div>
	</label>

	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">
			Mostrar requisitos
		</span>
		<input
			type="checkbox"
			checked={db.options.requires}
			onchange={toggle_requires}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"
		></div>
	</label>

	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar progreso</span>
		<input
			type="checkbox"
			checked={db.options.progress}
			onchange={toggle_progress}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-violet-600 dark:peer-checked:bg-violet-600"
		></div>
	</label>

	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">
			Arrastrar materias
		</span>
		<input
			type="checkbox"
			checked={db.options.movement}
			onchange={toggle_movement}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-pink-600 dark:peer-checked:bg-pink-600"
		></div>
	</label>

	<label class="relative inline-flex items-center cursor-pointer w-fit">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar electivas</span>
		<input
			type="checkbox"
			checked={db.options.optatives}
			onchange={toggle_optatives}
			class="sr-only peer"
		/>
		<div
			class="w-11 h-6 bg-gray-200 peer-focus:outline-hidden peer-focus:ring-4
			peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full
			peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:rtl:after:-translate-x-full
			peer-checked:after:border-white after:content-[''] after:absolute
			after:top-[2px] after:end-[22px] after:bg-white after:border-gray-300
			after:border after:rounded-full after:h-5 after:w-5 after:transition-all
			dark:border-gray-600 peer-checked:bg-orange-600 dark:peer-checked:bg-orange-600"
		></div>
	</label>

	<div class="mt-4">
		<button
			onclick={signOut}
			class="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600
			text-white text-sm font-medium rounded-md transition-all duration-500 w-fit"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 mr-2"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
				/>
			</svg>
			Cerrar sesión
		</button>

		<button
			onclick={ok_byeeeee}
			class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700
			text-white text-sm font-medium rounded-md transition-all duration-500 w-fit"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 mr-2"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
				/>
			</svg>
			Borrar cuenta
		</button>
	</div>
</div>

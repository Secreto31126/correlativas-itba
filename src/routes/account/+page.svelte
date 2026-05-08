<script lang="ts">
	import type { PageProps } from './$types';

	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { redirect } from '@sveltejs/kit';
	import { UserData } from '$lib/types/documents';
	import { deleteDocument, getDocumentStore, saveDocument, signOut } from '$lib/modules/firebase';

	let { data }: PageProps = $props();

	const db_store = $derived(getDocumentStore(UserData, new UserData(data.user_data)));
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

<header class="my-3 md:mt-1 md:ml-2 md:w-fit">
	<a href={resolve('/')}>
		<h1 class="text-2xl font-bold md:text-4xl">Ajustes</h1>
	</a>
</header>

<div class="flex flex-col items-center gap-2">
	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar código</span>
		<input type="checkbox" checked={db.options.code} onchange={toggle_code} class="peer sr-only" />
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-yellow-600 peer-focus:ring-4 peer-focus:ring-yellow-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-yellow-600 dark:peer-focus:ring-yellow-800"
		></div>
	</label>

	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar créditos</span>
		<input
			type="checkbox"
			checked={db.options.credits}
			onchange={toggle_credits}
			class="peer sr-only"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800"
		></div>
	</label>

	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">
			Mostrar requisitos
		</span>
		<input
			type="checkbox"
			checked={db.options.requires}
			onchange={toggle_requires}
			class="peer sr-only"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-green-600 dark:peer-focus:ring-green-800"
		></div>
	</label>

	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar progreso</span>
		<input
			type="checkbox"
			checked={db.options.progress}
			onchange={toggle_progress}
			class="peer sr-only"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-violet-600 peer-focus:ring-4 peer-focus:ring-violet-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-violet-600 dark:peer-focus:ring-violet-800"
		></div>
	</label>

	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">
			Arrastrar materias
		</span>
		<input
			type="checkbox"
			checked={db.options.movement}
			onchange={toggle_movement}
			class="peer sr-only"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-pink-600 peer-focus:ring-4 peer-focus:ring-pink-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-pink-600 dark:peer-focus:ring-pink-800"
		></div>
	</label>

	<label class="relative inline-flex w-fit cursor-pointer items-center">
		<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mostrar electivas</span>
		<input
			type="checkbox"
			checked={db.options.optatives}
			onchange={toggle_optatives}
			class="peer sr-only"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200
			peer-checked:bg-orange-600 peer-focus:ring-4 peer-focus:ring-orange-300
			peer-focus:outline-hidden after:absolute after:end-5.5 after:top-0.5
			after:h-5 after:w-5 after:rounded-full
			after:border after:border-gray-300 after:bg-white after:transition-all
			after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:rtl:after:-translate-x-full dark:border-gray-600
			dark:bg-gray-700 dark:peer-checked:bg-orange-600 dark:peer-focus:ring-orange-800"
		></div>
	</label>

	<div class="mt-4">
		<button
			onclick={signOut}
			class="inline-flex w-fit items-center rounded-md bg-indigo-500 px-4
			py-2 text-sm font-medium text-white transition-all duration-500 hover:bg-indigo-600"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-5 w-5"
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
			class="inline-flex w-fit items-center rounded-md bg-red-600 px-4
			py-2 text-sm font-medium text-white transition-all duration-500 hover:bg-red-700"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mr-2 h-5 w-5"
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

<script lang="ts">
	import type { PageProps } from './$types';

	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { redirect } from '@sveltejs/kit';
	import { UserData } from '$lib/types/documents';
	import { deleteDocument, getDocumentStore, saveDocument, signOut } from '$lib/modules/firebase';

	type Options = keyof (typeof db)['options'];

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

	function toggle_option(key: Options) {
		return () => {
			db.options[key] = !db.options[key];
			saveDocument(db);
		};
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

<div class="flex w-full flex-col items-center gap-2">
	<div class="flex w-4/5 flex-col gap-2 md:w-120 md:max-w-1/6">
		{#snippet toggle_button(label: string, key: Options)}
			<label class="relative inline-flex w-full cursor-pointer items-center justify-between">
				<span class="me-2 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>
				<input
					type="checkbox"
					checked={db.options[key]}
					onchange={toggle_option(key)}
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
		{/snippet}

		{@render toggle_button('Mostrar código', 'code')}
		{@render toggle_button('Mostrar créditos', 'credits')}
		{@render toggle_button('Mostrar requisitos', 'requires')}
		{@render toggle_button('Mostrar progreso', 'progress')}
		{@render toggle_button('Arrastrar materias', 'movement')}
		{@render toggle_button('Mostrar electivas', 'optatives')}
		{@render toggle_button('Ocultar materias viejas', 'hide_old')}
	</div>

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

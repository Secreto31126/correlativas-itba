<script lang="ts">
	import type { PageData } from './$types';

	import { onDestroy, onMount, tick } from 'svelte';
	import Block from '$lib/components/Block.svelte';
	import GoogleButton from '$lib/components/GoogleButton.svelte';
	import { getDocumentStore, saveDocument } from '$lib/modules/firebase';
	import { UserData } from '$lib/types/documents';
	import interact from 'interactjs';
	import { page } from '$app/stores';

	export let data: PageData;

	/**
	 * All the subjects codes codified
	 */
	const all = Array.from(new Set(data.career.map((e) => e.codec)));
	/**
	 * All the semesters numbers sorted
	 */
	const semesters = Array.from(new Set(data.career.map((e) => e.semester))).sort((a, b) => a - b);

	const db_store = data.user_data
		? getDocumentStore(UserData, new UserData(data.user_data))
		: undefined;
	$: db = $db_store ?? new UserData();

	let famous: string | undefined;
	$: show = famous ? [famous, ...getAllParents([famous])] : [];
	$: highlighted = famous ? [...show, ...getChilds(famous)] : [];

	let selected = [] as typeof all;
	$: passed = data.career.filter((e) =>
		(selected.length ? selected : db.subjects).includes(e.codec)
	);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - LeaderLine is not typed
	type LeaderLineType = typeof import('leader-line');
	type LineType = {
		position: () => LeaderLineType;
		hide: (animation: string) => LeaderLineType;
		show: (animation: string) => LeaderLineType;
		remove: () => void;
	};

	let LeaderLine: LeaderLineType;
	const lines: Record<string, LineType[]> = {};

	function getAllParents(ids: string[]) {
		const dependecies = [] as string[];

		for (let id of ids) {
			const parents = getParent(id);
			if (parents?.length) dependecies.push(...parents, ...getAllParents(parents));
		}

		return dependecies;
	}

	function getParent(id: string) {
		return data.career.find((e) => e.codec === id)?.parentc || [];
	}

	function getChilds(id: string) {
		return data.career.filter((e) => e.parentc.includes(id)).map((e) => e.codec);
	}

	async function highlight(e: CustomEvent<string>) {
		// If someone is already being highlighted, return
		if (famous) return;

		famous = e.detail;
		await tick();
		showLines();
	}

	async function defaultView() {
		if (!famous) return;

		lines[famous]?.forEach((l) => l.hide('draw'));
		famous = undefined;
	}

	function showLines(subject = famous) {
		if (!subject) return;

		lines[subject]?.forEach((l) => l.position().show('draw'));
	}

	function updateLines(subject = famous) {
		if (!subject) return;

		lines[subject]?.forEach((l) => l.position());
	}

	function touchScreen(e: CustomEvent<string>) {
		// Toggle famous
		if (famous) defaultView();
		else highlight(e);
	}

	let timeout: NodeJS.Timeout;
	let complete_shortcut = false;
	function context_menu(e: CustomEvent<string>) {
		if (selected.includes(e.detail)) {
			if (complete_shortcut) {
				clearTimeout(timeout);
				complete_selected_subjects();
				complete_shortcut = false;
			} else {
				selected = selected.filter((s) => s !== e.detail);
			}
		} else {
			if (!selected.length) {
				timeout = setTimeout(() => (complete_shortcut = false), 500);
				complete_shortcut = true;
			}

			selected = [...selected, e.detail];
		}
	}

	function complete_selected_subjects() {
		for (const e of selected) {
			if (db.subjects.includes(e)) {
				db.subjects.splice(db.subjects.indexOf(e), 1);
			} else {
				db.subjects.push(e);
			}
		}

		if (db.uid) saveDocument(db);
		else db = db;

		selected = [];
	}

	async function dragMoveListener(event: Interact.DragEvent) {
		const target = event.target;

		// keep the dragged position in the data-x/data-y attributes
		const x = parseFloat(target.getAttribute('data-x') || '0') + event.dx;
		const y = parseFloat(target.getAttribute('data-y') || '0') + event.dy;

		// translate the element
		target.style.transform = `translate(${x}px, ${y}px)`;

		// update the position attributes
		target.setAttribute('data-x', `${x}`);
		target.setAttribute('data-y', `${y}`);

		// Make the arrow follow the box
		lines[target.id]?.forEach((line) => line.position());
	}

	let counter_type = 'credits' as 'credits' | 'subjects';
	function toggleCounter() {
		counter_type = counter_type === 'credits' ? 'subjects' : 'credits';
	}

	onMount(async () => {
		interact('.cuatrimestre > div').draggable({
			inertia: true,
			autoScroll: false,
			modifiers: [
				interact.modifiers.restrictRect({
					restriction: document.body,
					endOnly: true
				})
			],
			listeners: {
				move: dragMoveListener
			}
		});

		LeaderLine = (await import('$lib/modules/leader-line.min')).default;

		all.forEach((id) => {
			const origin = document.getElementById(id)!;
			// const bounds = origin.getBoundingClientRect();
			// const startSocket =
			// 	bounds.left / innerWidth < 0.1 || bounds.right / innerWidth > 0.9 ? 'bottom' : 'auto';

			document.querySelectorAll(`[data-parents*=${id}]`).forEach((target) => {
				if (!lines[id]) lines[id] = [];
				lines[id].push(
					new LeaderLine(origin, target, {
						dash: { animation: true },
						path: 'magnet',
						hide: true
					})
				);
			});
		});
	});

	onDestroy(() => {
		Object.values(lines)
			.flat()
			.forEach((l) => l.remove());
	});
</script>

<svelte:head>
	<title>Correlativas de {data.career_data.name} en el ITBA</title>
	<meta
		name="description"
		content="Explora el plan de estudio de {data.career_data
			.name} en el ITBA con el mapa interactivo"
	/>
</svelte:head>

<div class="grid w-full md:min-h-screen pt-2">
	<header class="flex justify-between items-center mx-2 h-8 md:h-12">
		<a href="/">
			<h1 class="text-2xl md:text-4xl font-bold">{data.career_data.plan}</h1>
		</a>
		<div class="flex h-full gap-2 md:gap-4">
			{#if db.options.progress}
				<button on:click={toggleCounter}>
					{#if counter_type === 'credits'}
						{passed.reduce((acc, s) => (acc += s.credits ?? 0), 0)}
						{!selected.length ? `/ ${data.career.reduce((acc, s) => (acc += s.credits), 0)}` : ''} créditos
					{:else}
						{passed.length}
						{!selected.length ? `/ ${all.length}` : ''} materias
					{/if}
				</button>
			{/if}
			{#if selected.length}
				<div class="flex md:pr-2 [&>*]:w-5 md:[&>*]:w-6 gap-2 md:gap-4">
					<button on:click={complete_selected_subjects} title="Marcar como completadas">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="size-6"
						>
							<path
								d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z"
							/>
							<path
								d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z"
							/>
							<path
								d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z"
							/>
						</svg>
					</button>
					<button on:click={() => (selected = [])} title="Cancelar" class="grow">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{:else}
				<GoogleButton
					logged={!!data.userSession}
					picture={data.userSession?.picture}
					ping={!db.options.visited_account}
				/>
			{/if}
		</div>
	</header>
	<main class="flex flex-col md:justify-between gap-5 md:gap-2 w-full h-full py-2">
		{#each semesters as semester}
			<div class="flex flex-wrap justify-around items-center gap-1 md:gap-4 h-full cuatrimestre">
				{#each data.career.filter((e) => e.semester === semester) as subject}
					<Block
						{subject}
						{famous}
						{show}
						{highlighted}
						selecting={!!selected.length}
						selected={selected.includes(subject.codec)}
						tabindex={all.indexOf(subject.codec) + 1}
						strike={db.subjects.includes(subject.codec)}
						code={db.options.code && $page.params.materia !== 'noob'}
						credits={db.options.credits}
						requires={db.options.requires}
						on:in={highlight}
						on:out={defaultView}
						on:toggle={touchScreen}
						on:contextmenu={context_menu}
						on:tick={() => updateLines()}
						on:ready={() => updateLines()}
					/>
				{/each}
			</div>
		{/each}
	</main>
</div>

<style lang="postcss">
	div.grid {
		grid-template-rows: auto 1fr;
	}

	.cuatrimestre:nth-child(5n + 1) {
		--color: rgb(0, 155, 255);
		--b-color: rgba(0, 155, 255, 0.4);
	}

	.cuatrimestre:nth-child(5n + 2) {
		--color: rgb(255, 220, 190);
		--b-color: rgba(255, 220, 190, 0.4);
	}

	.cuatrimestre:nth-child(5n + 3) {
		--color: rgb(130, 255, 120);
		--b-color: rgba(130, 255, 120, 0.4);
	}

	.cuatrimestre:nth-child(5n + 4) {
		--color: rgb(255, 60, 60);
		--b-color: rgba(255, 60, 60, 0.4);
	}

	.cuatrimestre:nth-child(5n + 5) {
		--color: rgb(225, 150, 255);
		--b-color: rgba(225, 150, 255, 0.4);
	}
</style>

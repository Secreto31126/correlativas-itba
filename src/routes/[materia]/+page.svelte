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

	$: passed = data.career.filter((e) => db.subjects.includes(e.codec));

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

	function contextMenu(e: CustomEvent<string>) {
		db.subjects.includes(e.detail)
			? db.subjects.splice(db.subjects.indexOf(e.detail), 1)
			: db.subjects.push(e.detail);
		if (db.uid) saveDocument(db);
		else db = db;
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
						{passed.reduce((acc, s) => (acc += s.credits ?? 0), 0)} / {data.career.reduce(
							(acc, s) => (acc += s.credits),
							0
						)} créditos
					{:else}
						{passed.length} / {all.length} materias
					{/if}
				</button>
			{/if}
			<GoogleButton
				logged={!!data.userSession}
				picture={data.userSession?.picture}
				ping={!db.options.visited_account}
			/>
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
						tabindex={all.indexOf(subject.codec) + 1}
						strike={db.subjects.includes(subject.codec)}
						code={db.options.code && $page.params.materia !== 'noob'}
						credits={db.options.credits}
						requires={db.options.requires}
						on:in={highlight}
						on:out={defaultView}
						on:toggle={touchScreen}
						on:crossout={contextMenu}
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

<script lang="ts">
	import type { PageProps } from './$types';
	import type { FilledSubject } from '$lib/types/subjects';

	import { onDestroy, onMount, tick } from 'svelte';
	import Block from '$lib/components/Block.svelte';
	import GoogleButton from '$lib/components/GoogleButton.svelte';
	import { getDocumentStore, saveDocument } from '$lib/modules/firebase';
	import { UserData } from '$lib/types/documents';
	import interact from 'interactjs';
	import { page } from '$app/state';
	import { writable } from 'svelte/store';
	import confetti from 'canvas-confetti';

	let { data }: PageProps = $props();

	/**
	 * All the subjects
	 */
	const all_subjects = [...data.career, ...Object.values(data.optatives).flatMap((e) => e)];
	/**
	 * All the subjects codes codified
	 */
	const all_codecs = Array.from(new Set(all_subjects.map((e) => e.codec)));
	/**
	 * All the semesters numbers sorted
	 */
	const semesters = Array.from(new Set(data.career.map((e) => e.semester))).sort((a, b) => a! - b!);

	const db = data.user_data
		? getDocumentStore(UserData, new UserData(data.user_data))
		: writable<UserData>(new UserData());

	let famous: string | undefined = $state();
	let expanded: boolean = $state(false);
	let show = $derived(famous ? [famous, ...getAllParents([famous])] : []);
	let highlighted = $derived(famous ? [...show, ...getChilds(famous)] : []);

	let selected: typeof all_codecs = $state([]);
	let passed = $derived(
		data.career.filter((e) => (selected.length ? selected : $db.subjects).includes(e.codec))
	);
	let passed_credits = $derived(passed.reduce((acc, s) => (acc += s.credits ?? 0), 0));

	let visible_optatives = $state({}) as Record<string, boolean>;

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
	const lines: Record<string, { l: LineType; s: FilledSubject }[]> = {};

	let clientWidth = $state(0);
	let clientHeight = $state(0);

	function getAllParents(ids: string[]) {
		const dependecies = [] as string[];

		for (let id of ids) {
			const parents = getParent(id);
			if (parents?.length) dependecies.push(...parents, ...getAllParents(parents));
		}

		return dependecies;
	}

	function getParent(id: string) {
		return all_subjects.find((e) => e.codec === id)?.parentc || [];
	}

	function getChilds(id: string) {
		return all_subjects.filter((e) => e.parentc.includes(id)).map((e) => e.codec);
	}

	async function highlight(e: string) {
		// If someone is already being highlighted, return
		if (famous) return;

		famous = e;
		showLines();
	}

	async function defaultView() {
		if (!famous || expanded) return;

		lines[famous]?.forEach(({ l }) => l.hide('draw'));
		famous = undefined;
	}

	function showLines(subject = famous) {
		if (!subject) return;

		lines[subject]?.forEach(({ l, s }) => {
			if (!s.optative || visible_optatives[s.optative]) l.position().show('draw');
		});
	}

	function toggleExpanded() {
		expanded = !expanded;
		updateLines();
	}

	function toggleVisibleOptative(name: string) {
		visible_optatives[name] = !visible_optatives[name];
		updateLines();
	}

	async function updateLines(subject = famous) {
		if (!subject) return;

		await tick();
		lines[subject]?.forEach(({ l, s }) => {
			l.position();
			if (!s.optative) return;

			if (visible_optatives[s.optative]) {
				l.show('draw');
			} else {
				l.hide('none');
			}
		});
	}

	function touchScreen(e: string) {
		// Toggle famous
		toggleExpanded();
		if (famous) defaultView();
		else highlight(e);
	}

	let timeout: ReturnType<typeof setTimeout>;
	let complete_shortcut = false;
	function context_menu(e: string) {
		if (selected.includes(e)) {
			if (complete_shortcut) {
				clearTimeout(timeout);
				complete_selected_subjects();
				complete_shortcut = false;
			} else {
				selected = selected.filter((s) => s !== e);
			}
		} else {
			if (!selected.length) {
				timeout = setTimeout(() => (complete_shortcut = false), 500);
				complete_shortcut = true;
			}

			selected = [...selected, e];
		}
	}

	function animateConfetti(end: number) {
		const wider = clientWidth > clientHeight;
		const y = wider ? 1 : 0.35;

		const options = {
			particleCount: 8,
			spread: wider ? 55 : 120,
			startVelocity: wider ? 90 : 25,
			colors: ['#ff0', '#f00', '#0f0', '#00f', '#f0f', '#0ff'],
			disableForReducedMotion: true
		} satisfies confetti.Options;

		confetti({
			...options,
			angle: 60,
			origin: { x: 0, y }
		});
		confetti({
			...options,
			angle: 120,
			origin: { x: 1, y }
		});

		if (Date.now() < end) {
			requestAnimationFrame(animateConfetti.bind(null, end));
		}
	}

	function complete_selected_subjects() {
		for (const e of selected) {
			if ($db.subjects.includes(e)) {
				$db.subjects.splice($db.subjects.indexOf(e), 1);
			} else {
				$db.subjects.push(e);
			}
		}

		if ($db.uid) saveDocument($db);
		// @ts-ignore - If the db doesn't have a uid, it's a local writable store
		else db.set($db);

		selected = [];

		if (passed_credits >= data.credits) {
			animateConfetti(Date.now() + 5000);
		}
	}

	async function dragMoveListener(event: Interact.DragEvent) {
		if (!$db.options.movement || expanded) return;

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
		lines[target.id]?.forEach(({ l }) => l.position());
	}

	let counter_type: 'credits' | 'subjects' = $state('credits');
	function toggleCounter() {
		counter_type = counter_type === 'credits' ? 'subjects' : 'credits';
	}

	const scheduler_link = $derived(
		`https://ceitba.org.ar/scheduler/${data.career_data.itba}?plan=${data.career_data.plan}&code=${selected
			.map((code) => data.career.find((s) => s.codec === code)?.code)
			.join('&code=')}`
	);

	function escapeKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			expanded = false;
			selected = [];
			defaultView();
		}
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

		all_codecs.forEach((id) => {
			const origin = document.getElementById(id)!;
			// const bounds = origin.getBoundingClientRect();
			// const startSocket =
			// 	bounds.left / innerWidth < 0.1 || bounds.right / innerWidth > 0.9 ? 'bottom' : 'auto';

			document.querySelectorAll(`[data-parents*=${id}]`).forEach((target) => {
				if (!lines[id]) lines[id] = [];
				lines[id].push({
					l: new LeaderLine(origin, target, {
						dash: { animation: true },
						path: 'magnet',
						hide: true
					}),
					s: all_subjects.find((e) => e.codec === target.id)!
				});
			});
		});
	});

	onDestroy(() => {
		Object.values(lines)
			.flat()
			.forEach(({ l }) => l.remove());
	});
</script>

<svelte:head>
	<title>Correlativas de {data.career_data.name} en el ITBA</title>
	<meta name="og:title" content="Correlativas de {data.career_data.name} en el ITBA" />
	<meta name="twitter:title" content="Correlativas de {data.career_data.name} en el ITBA" />
	<meta
		name="description"
		content="Explora el plan de estudio de {data.career_data
			.name} en el ITBA con el mapa interactivo"
	/>
	<meta
		name="og:description"
		content="Explora el plan de estudio de {data.career_data
			.name} en el ITBA con el mapa interactivo"
	/>
	<meta
		name="twitter:description"
		content="Explora el plan de estudio de {data.career_data
			.name} en el ITBA con el mapa interactivo"
	/>
</svelte:head>

<svelte:body bind:clientWidth bind:clientHeight onkeydown={escapeKey} />

{#snippet subjects_row(subjects: FilledSubject[], collapse = false)}
	<div
		class="flex flex-wrap justify-around items-center h-full gap-1 md:gap-4 cuatrimestre {collapse
			? 'hidden'
			: ''}"
	>
		{#each subjects as subject}
			<Block
				{subject}
				{famous}
				{expanded}
				{show}
				{highlighted}
				selecting={!!selected.length}
				selected={selected.includes(subject.codec)}
				tabindex={all_codecs.indexOf(subject.codec) + 1}
				strike={$db.subjects.includes(subject.codec)}
				code={$db.options.code && page.params.carrera !== 'noob'}
				credits={$db.options.credits}
				requires={$db.options.requires}
				onin={highlight}
				onout={defaultView}
				ontoggle={touchScreen}
				onexpand={toggleExpanded}
				oncontextmenu={context_menu}
			/>
		{/each}
	</div>
{/snippet}

<div class="grid w-full md:min-h-screen pt-2">
	<header class="flex justify-between items-center mx-2 h-8 md:h-12">
		<a href="/">
			<h1 class="text-2xl md:text-4xl font-bold">{data.career_data.plan}</h1>
		</a>
		<div class="flex h-full gap-4">
			{#if $db.options.progress || selected.length}
				<button onclick={toggleCounter} class="cursor-pointer">
					{#if counter_type === 'credits'}
						{passed_credits}
						{!selected.length ? `/ ${data.credits}` : ''} créditos
					{:else}
						{passed.length}
						{!selected.length ? `/ ${data.career.length} troncales` : ' materias'}
					{/if}
				</button>
			{/if}
			{#if selected.length}
				<div class="flex md:pr-2 *:w-5 md:*:w-6 gap-4">
					<!-- https://heroicons.com/solid -->
					{#if data.career_data.itba}
						<a
							href={scheduler_link}
							title="Ir al planificador"
							aria-label="Scheduler"
							class="flex items-center"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-6"
							>
								<path
									d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
								/>
								<path
									fill-rule="evenodd"
									d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
					{/if}
					<button
						onclick={complete_selected_subjects}
						title="Marcar como completadas"
						aria-label="Completar"
						class="cursor-pointer"
					>
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
					<button
						onclick={() => (selected = [])}
						title="Cancelar"
						aria-label="Cancelar"
						class="grow cursor-pointer"
					>
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
					ping={!$db.options.visited_account}
				/>
			{/if}
		</div>
	</header>
	<main class="flex flex-col md:justify-between gap-5 md:gap-2 w-full h-full py-2">
		{#each semesters as semester}
			{@render subjects_row(data.career.filter((e) => e.semester === semester))}
		{/each}
		{#each Object.entries(data.optatives) as [name, subjects]}
			<div class="flex flex-col w-full text-center">
				<hr />
				<button onclick={() => toggleVisibleOptative(name)} class="cursor-pointer py-2">
					{name}
				</button>
			</div>
			{@render subjects_row(subjects, !visible_optatives[name])}
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

		:global(body:has(.dark) &) {
			--color: rgb(0, 100, 225);
			--b-color: rgba(0, 100, 225, 0.4);
		}
	}

	.cuatrimestre:nth-child(5n + 2) {
		--color: rgb(255, 220, 190);
		--b-color: rgba(255, 220, 190, 0.4);

		:global(body:has(.dark) &) {
			--color: rgb(255, 180, 150);
			--b-color: rgba(255, 180, 150, 0.4);
		}
	}

	.cuatrimestre:nth-child(5n + 3) {
		--color: rgb(130, 255, 120);
		--b-color: rgba(130, 255, 120, 0.4);

		:global(body:has(.dark) &) {
			--color: rgb(100, 205, 90);
			--b-color: rgba(100, 205, 90, 0.4);
		}
	}

	.cuatrimestre:nth-child(5n + 4) {
		--color: rgb(255, 60, 60);
		--b-color: rgba(255, 60, 60, 0.4);

		:global(body:has(.dark) &) {
			--color: rgb(235, 30, 30);
			--b-color: rgba(235, 30, 30, 0.4);
		}
	}

	.cuatrimestre:nth-child(5n + 5) {
		--color: rgb(225, 150, 255);
		--b-color: rgba(225, 150, 255, 0.4);

		:global(body:has(.dark) &) {
			--color: rgb(195, 120, 225);
			--b-color: rgba(195, 120, 225, 0.4);
		}
	}
</style>

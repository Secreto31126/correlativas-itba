<script lang="ts">
	import type { PageData } from './$types';

	import { onDestroy, onMount, tick } from 'svelte';
	import Block from '$lib/components/Block.svelte';
	// import interact from 'interactjs';

	export let data: PageData;

	/**
	 * All the subjects codes codified
	 */
	const all = Array.from(new Set(data.career.map((e) => e.codec)));
	/**
	 * All the semesters numbers sorted
	 */
	const semesters = Array.from(new Set(data.career.map((e) => e.semester))).sort((a, b) => a - b);

	/**
	 * All the striked subjects
	 */
	let striked = [] as string[];
	let famous: string | undefined;
	$: show = famous ? [famous, ...getAllParents([famous])] : [];
	$: highlighted = famous ? [...show, ...getChilds(famous)] : [];

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
		striked.includes(e.detail)
			? striked.splice(striked.indexOf(e.detail), 1)
			: striked.push(e.detail);
		striked = [...striked];
	}

	// function dragMoveListener(event: Interact.DragEvent) {
	// 	let target = event.target;
	// 	// keep the dragged position in the data-x/data-y attributes
	// 	let x = parseFloat(target.getAttribute('data-x') || '0') + event.dx;
	// 	let y = parseFloat(target.getAttribute('data-y') || '0') + event.dy;

	// 	// translate the element
	// 	target.style.transform = `translate(${x}px, ${y}px)`;

	// 	// update the posiion attributes
	// 	target.setAttribute('data-x', `${x}`);
	// 	target.setAttribute('data-y', `${y}`);

	// 	// Make the arrow follow the box
	// 	lines[target.id]?.forEach((line) => line.position());
	// }

	onMount(async () => {
		// interact('.cuatrimestre > div').draggable({
		// 	inertia: true,
		// 	autoScroll: false,
		// 	modifiers: [
		// 		interact.modifiers.restrictRect({
		// 			restriction: document.body,
		// 			endOnly: true
		// 		})
		// 	],
		// 	listeners: {
		// 		move: dragMoveListener
		// 	}
		// });

		LeaderLine = (await import('$lib/modules/leader-line.min')).default;

		all.forEach((id) => {
			const origin = document.querySelector(`#${id}`);

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

<div
	class="flex flex-col md:justify-around gap-6 md:gap-2 w-full min-h-[90vh] md:min-h-screen py-2"
>
	{#each semesters as semester}
		<div class="flex flex-wrap justify-around items-center gap-1 md:gap-4 h-full cuatrimestre">
			{#each data.career.filter((e) => e.semester === semester) as subject}
				<Block
					{subject}
					{famous}
					{show}
					{highlighted}
					tabindex={all.indexOf(subject.codec) + 1}
					strike={striked.includes(subject.codec)}
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
</div>

<style lang="postcss">
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

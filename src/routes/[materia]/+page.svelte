<script lang="ts">
	import type { PageData } from './$types';

	import { browser } from '$app/environment';
	import { onDestroy, onMount, tick } from 'svelte';
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

	async function highlight(e: string) {
		// If someone is already being highlighted, return
		if (famous) return;

		famous = e;
		await tick();
		redrawLines();
	}

	async function defaultView(e: string) {
		// If someone else is trying to steal the reflector, return
		if (famous !== e) return;

		lines[famous]?.forEach((l) => l.hide('draw'));
		famous = undefined;
	}

	function redrawLines(subject = famous) {
		if (!subject) return;

		lines[subject]?.forEach((l) => l.position().show('draw'));
	}

	const mouse = browser ? window.matchMedia('(pointer: fine)').matches : false;
	function touchScreen(e: string) {
		if (mouse) return;

		// Toggle famous
		if (famous) defaultView(e);
		else highlight(e);
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
			document.querySelectorAll(`[data-parents*=${id}]`).forEach((target) => {
				if (!lines[id]) lines[id] = [];
				lines[id].push(
					new LeaderLine(document.querySelector(`#${id}`), target, {
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

<div class="flex flex-col justify-around gap-4 w-full min-h-screen py-4">
	{#each semesters as semester}
		<div class="flex justify-around gap-4 cuatrimestre">
			{#each data.career.filter((e) => e.semester === semester) as subject}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					id={subject.codec}
					data-parents={subject.parentc.join(' ')}
					class="flex flex-col justify-center touch-none p-2 max-w-[15%]
					border-4 rounded-2xl border-[--color] outline-none
					transition-all duration-500 ease-in-out"
					class:famous={subject.codec === famous}
					class:show={show.includes(subject.codec)}
					class:hide={famous && !highlighted.includes(subject.codec)}
					title={subject.name}
					role="cell"
					tabindex={all.indexOf(subject.codec) + 1}
					on:focusin={() => highlight(subject.codec)}
					on:mouseenter={() => highlight(subject.codec)}
					on:focusout={() => defaultView(subject.codec)}
					on:mouseleave={() => defaultView(subject.codec)}
					on:click={() => touchScreen(subject.codec)}
				>
					<p class="m-0 select-none">
						{subject.codec === famous ? subject.formal : subject.name}
					</p>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style lang="postcss">
	.hide {
		opacity: 0.3;
	}

	.show {
		background-color: var(--b-color);
	}

	.famous {
		z-index: 99999;
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

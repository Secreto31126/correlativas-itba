<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import * as jq from 'jquery';
	import interact from 'interactjs';

	export let data: PageData;

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	type LeaderLineType = typeof import('leader-line');
	let LeaderLine: LeaderLineType;

	const lines: Record<
		string,
		{
			position: () => LeaderLineType;
			hide: (animation: string) => LeaderLineType;
			show: (animation: string) => LeaderLineType;
		}[]
	> = {};

	function highlight(e: MouseEvent) {
		// If someone is already being highlighted, return
		if (jq('.famous').length) return;

		const target = e.currentTarget as Element;
		console.log(e.currentTarget);

		const dependecies = [target.id, ...getAllParents([target.id])];

		jq(`.cuatrimestre > *:not(#${dependecies.join('):not(#')}):not(.${target.id})`).addClass(
			'hide'
		);
		if (dependecies.length) jq(`#${dependecies.join(', #')}`).addClass('show');
		jq(`#${target.id}`).addClass('famous');

		// Update lines (just in case) and show them
		lines[target.id]?.forEach((l) => l.position().show('draw'));
	}

	function getAllParents(ids: string[]): string[] {
		const dependecies = [];

		for (let id of ids) {
			if (!id) continue; // Idk why, _sometimes_ it happens, specially if dragging the object
			const parents = document.querySelector(`#${id}`)?.classList as string[] | undefined;
			if (parents?.length) dependecies.push(...parents, ...getAllParents(parents));
		}

		return dependecies;
	}

	function defaultView() {
		// If no elements are being highlighted, return
		if (!jq('.famous').length) return;

		jq('*').removeClass('hide').removeClass('show').removeClass('famous');

		Object.values(lines)
			.flat()
			.forEach((l) => l.hide('draw'));
	}

	function touchScreen(e: MouseEvent) {
		if (window.matchMedia('(pointer: fine)').matches) return;
		if (jq('.famous').length) defaultView();
		else highlight(e);
	}

	onMount(async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		LeaderLine = await import('leader-line');

		// target all dragable elements
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

		function dragMoveListener(event: Interact.DragEvent) {
			let target = event.target;
			// keep the dragged position in the data-x/data-y attributes
			let x = parseFloat(target.getAttribute('data-x') || '0') + event.dx;
			let y = parseFloat(target.getAttribute('data-y') || '0') + event.dy;

			// translate the element
			target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

			// update the posiion attributes
			target.setAttribute('data-x', x.toString());
			target.setAttribute('data-y', y.toString());

			// Make the arrow follow the box
			lines[target.id]?.forEach((line) => line.position());
		}

		document.querySelectorAll('.cuatrimestre > div').forEach((el) => {
			document.querySelectorAll(`.${el.id}`).forEach((target) => {
				if (!lines[el.id]) lines[el.id] = [];
				lines[el.id].push(
					new LeaderLine(el, target, {
						dash: { animation: true },
						path: 'magnet',
						hide: true
					})
				);
			});
		});
	});
</script>

{#each new Set(data.subject.map((e) => e.semester) ?? []) as semester}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="c{semester} cuatrimestre">
		{#each data.subject.filter((e) => e.semester === semester) as subject}
			<div
				id="i{subject.code.replace('.', '')}"
				class={subject.dep.map((e) => `i${e.replace('.', '')}`).join(' ')}
				title={subject.formal}
				on:mouseenter={highlight}
				on:mouseleave={defaultView}
				on:click={touchScreen}
			>
				<p>{subject.name}</p>
			</div>
		{/each}
	</div>
{/each}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

	p {
		font-family: 'Roboto', sans-serif;
		text-align: center;
	}

	p {
		font-size: 1.5rem;
	}

	.cuatrimestre {
		display: flex;
		justify-content: space-around;
		margin-bottom: 2.75vh;
	}

	.cuatrimestre > div {
		padding: 1vh;
		max-width: 15%;

		display: flex;
		flex-direction: column;
		justify-content: center;

		border: 5px solid rgb(var(--color));
		border-radius: 1rem;

		-webkit-transition: opacity 0.5s ease-in-out, background-color 0.5s ease-in-out;
		-moz-transition: opacity 0.5s ease-in-out, background-color 0.5s ease-in-out;
		transition: opacity 0.5s ease-in-out, background-color 0.5s ease-in-out;

		touch-action: none;
	}

	.hide {
		opacity: 0.3;
	}

	.show {
		background-color: rgba(var(--color), 0.4);
	}

	.famous {
		z-index: 99999;
	}

	.c1.cuatrimestre,
	.c6.cuatrimestre {
		--color: 0, 155, 255;
	}

	.c2.cuatrimestre,
	.c7.cuatrimestre {
		--color: 255, 220, 190;
	}

	.c3.cuatrimestre,
	.c8.cuatrimestre {
		--color: 130, 255, 120;
	}

	.c4.cuatrimestre,
	.c9.cuatrimestre {
		--color: 255, 60, 60;
	}

	.c5.cuatrimestre,
	.c10.cuatrimestre {
		--color: 225, 150, 255;
	}

	.cuatrimestre > div > p {
		margin: 0;

		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
	}
</style>

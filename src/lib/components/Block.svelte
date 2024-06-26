<script lang="ts">
	import type { FilledSubject } from '$lib/types/subjects';

	import { browser } from '$app/environment';
	import { createEventDispatcher, onMount, tick } from 'svelte';

	export let subject: FilledSubject;
	export let famous: string | undefined;
	export let show: string[];
	export let highlighted: string[];
	export let selecting: boolean;
	export let selected: boolean;
	export let tabindex: number;
	export let strike: boolean;
	export let code: boolean;
	export let credits: boolean;
	export let requires: boolean;

	type Events = {
		in: string;
		out: string;
		toggle: string;
		tick: void;
		ready: void;
		contextmenu: string;
	};

	const dispatch = createEventDispatcher<Events>();

	const mouse = browser ? window.matchMedia('(pointer: fine)').matches : undefined;
	const animation = browser ? !window.matchMedia('(prefers-reduced-motion)').matches : undefined;

	$: im_famous = famous === subject.codec;

	function event(type: keyof Events) {
		return () => {
			if (type === 'contextmenu') dispatch(type, subject.codec);
			else if (mouse && type === 'toggle') return;
			else if (!mouse && type !== 'toggle') return;
			else dispatch(type, subject.codec);
		};
	}

	let full_name = [] as string[];
	let tick_animation = true;
	let finished_animation = true;

	async function animate() {
		const comments = [] as string[];

		if (code) {
			comments.push(subject.code);
		}

		if (credits && subject.credits) {
			if (subject.credits === 1) comments.push('1 crédito');
			else comments.push(`${subject.credits} créditos`);
		}

		if (requires && subject.requires) {
			comments.push(`${subject.requires} requeridos`);
		}

		const comments_string = comments.length ? ` (${comments.join(', ')})` : '';
		const splitted = `${subject.formal}${comments_string}`.split('');

		// Fake animation if user prefers reduced motion
		// Or there's no mouse (mobiles)
		if (!animation || !mouse) {
			full_name = splitted;
			return;
		}

		await tick();
		// NEVER overwrite if there's full_name progress
		if (!finished_animation || full_name.length) return;

		finished_animation = false;
		full_name = [];

		let duration: number;

		for (const i in splitted) {
			// Racing condition detected
			if (full_name.length.toString() !== i) {
				console.log('racing condition detected', full_name.length, i);
				finished_animation = true;
				full_name = splitted;
				return;
			}

			full_name = [...full_name, splitted[i]];

			// If the letters match, skip animation
			if (splitted[i] === subject.name[i]) continue;

			// Make the animation always last 500ms (approx)
			duration ||= (500 / (splitted.length - parseInt(i))) | 0;

			tick_animation = !tick_animation;
			await new Promise((r) => setTimeout(r, duration));
		}

		await tick();
		finished_animation = true;
	}

	$: if (!im_famous) full_name = [];
	else animate();
	$: if (finished_animation) dispatch('ready');
	$: if ((tick_animation || !tick_animation) && im_famous) dispatch('tick');

	let div: HTMLDivElement;
	let width: number;
	let height: number;

	onMount(() => {
		width = div.offsetWidth;
		height = div.offsetHeight;
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	id={subject.codec}
	data-parents={subject.parentc.join(' ')}
	style="min-width: {width}px; min-height: {height}px;"
	class="flex relative flex-col justify-center touch-none
		border-2 md:border-4 rounded-xl md:rounded-2xl outline-none
		p-1 md:p-2 md:max-w-[15%]
		transition-colors duration-500 ease-in-out"
	class:famous={im_famous}
	class:show={show.includes(subject.codec)}
	class:hide={famous && !highlighted.includes(subject.codec)}
	class:strike
	title={subject.name}
	role="cell"
	{tabindex}
	on:focusin={event('in')}
	on:mouseenter={event('in')}
	on:focusout={event('out')}
	on:mouseleave={event('out')}
	on:click={event(selecting ? 'contextmenu' : 'toggle')}
	on:contextmenu|preventDefault={event('contextmenu')}
	bind:this={div}
>
	{#if selected}
		<span class="absolute translate-x-1/2 translate-y-[-50%] top-0 right-0 w-4 h-4 md:w-6 md:h-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="#0D0"
				class="size-6 bg-white rounded-xl"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
				/>
			</svg>
		</span>
	{/if}
	<p class="m-0 select-none text-sm md:text-2xl will-change-contents transform-gpu">
		{im_famous ? full_name.join('') : subject.name}
	</p>
</div>

<style lang="postcss">
	div {
		border-color: var(--color);
		z-index: 1;
	}

	.hide {
		z-index: -1;
		opacity: 0.3;
	}

	.show {
		background-color: var(--b-color);
		z-index: 99998;
	}

	.famous {
		z-index: 99999;
	}

	.strike {
		position: relative;
		--color: rgb(60, 60, 60);
		--b-color: rgb(60, 60, 60, 0.4);
	}

	.strike::after {
		content: ' ';
		position: absolute;
		top: 50%;
		left: -3%;
		width: 0;
		height: 10px;
		opacity: 80%;
		transform: translateY(-50%);
		background: repeat-x
			url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAKAQMAAAByjsdvAAAABlBMVEUAAADdMzNrjRuKAAAAAXRSTlMAQObYZgAAADdJREFUCNdj+MMABP8ZGCQY/h9g+MHw/AHzDwbGD+w/GBhq6h8wMNj/b2BgkP8HVMMPUsn+gQEAsTkQNRVnI4cAAAAASUVORK5CYII=);
		animation: strike 0.3s linear 0s 1 forwards;
	}

	@keyframes strike {
		to {
			width: 106%;
		}
	}
</style>

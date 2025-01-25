<script lang="ts">
	import type { FilledSubject } from '$lib/types/subjects';

	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';

	interface Props {
		subject: FilledSubject;
		famous: string | undefined;
		show: string[];
		highlighted: string[];
		selecting: boolean;
		selected: boolean;
		tabindex: number;
		strike: boolean;
		code: boolean;
		credits: boolean;
		requires: boolean;
		onin: (code: string) => void;
		onout: (code: string) => void;
		ontoggle: (code: string) => void;
		ontick: () => void;
		onready: () => void;
		oncontextmenu: (code: string) => void;
	}

	let {
		subject,
		famous,
		show,
		highlighted,
		selecting,
		selected,
		tabindex,
		strike,
		code,
		credits,
		requires,
		onin,
		onout,
		ontoggle,
		ontick,
		onready,
		oncontextmenu
	}: Props = $props();

	const webkit = browser ? 'webkitConvertPointFromNodeToPage' in window : undefined;
	const mouse = browser ? window.matchMedia('(pointer: fine)').matches : undefined;
	const animation = browser ? !window.matchMedia('(prefers-reduced-motion)').matches : undefined;

	let im_famous = $derived(famous === subject.codec);

	function event(type: 'in' | 'out' | 'toggle' | 'contextmenu') {
		if (type === 'contextmenu' && !webkit)
			return (e: Event) => {
				e.preventDefault();
				oncontextmenu(subject.codec);
			};

		if (type === 'in' && mouse) return () => onin(subject.codec);
		if (type === 'out' && mouse) return () => onout(subject.codec);
		if (type === 'toggle' && !mouse) return () => ontoggle(subject.codec);

		return () => {};
	}

	let full_name = $state([] as string[]);
	let tick_animation = $state(true);
	let finished_animation = $state(true);

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

	$effect(() => {
		if (!im_famous) full_name = [];
		else animate();
	});

	$effect(() => {
		if (finished_animation) onready();
	});

	$effect(() => {
		if ((tick_animation || !tick_animation) && im_famous) ontick();
	});

	let touchStartX: number;
	let touchStartY: number;
	let safariTimeout: ReturnType<typeof setTimeout>;
	function safariContextMenu(type: 'start' | 'end' | 'move') {
		if (!browser || mouse || !webkit) {
			return () => {};
		}

		if (type === 'start') {
			return (e: TouchEvent) => {
				touchStartX = e.touches[0].clientX;
				touchStartY = e.touches[0].clientY;

				safariTimeout = setTimeout(() => {
					oncontextmenu(subject.codec);
				}, 500);
			};
		}

		if (type === 'end') {
			return () => clearTimeout(safariTimeout);
		}

		if (type === 'move') {
			return (e: TouchEvent) => {
				const moveX = e.touches[0].clientX;
				const moveY = e.touches[0].clientY;

				// Cancel long-press if the touch moves significantly
				if (Math.abs(moveX - touchStartX) > 10 || Math.abs(moveY - touchStartY) > 10) {
					clearTimeout(safariTimeout);
				}
			};
		}
	}

	let div: HTMLDivElement;
	let width = $state(0);
	let height = $state(0);

	onMount(() => {
		width = div.offsetWidth;
		height = div.offsetHeight;
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
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
	onfocusin={event('in')}
	onmouseenter={event('in')}
	onfocusout={event('out')}
	onmouseleave={event('out')}
	onclick={event(selecting ? 'contextmenu' : 'toggle')}
	oncontextmenu={event('contextmenu')}
	ontouchstart={safariContextMenu('start')}
	ontouchend={safariContextMenu('end')}
	ontouchmove={safariContextMenu('move')}
	bind:this={div}
>
	{#if selected}
		<span class="absolute translate-x-1/2 translate-y-[-50%] top-0 right-0 w-4 h-4 md:w-6 md:h-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="#0D0"
				class="size-4 md:size-6 bg-white dark:bg-zinc-900 rounded-xl"
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

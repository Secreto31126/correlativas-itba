<script lang="ts">
	import type { FilledSubject } from '$lib/types/subjects';

	import { browser } from '$app/environment';
	import { createEventDispatcher } from 'svelte';

	export let subject: FilledSubject;
	export let famous: string | undefined;
	export let show: string[];
	export let highlighted: string[];
	export let tabindex: number;

	type Events = {
		in: string;
		out: string;
		toggle: string;
	};

	const dispatch = createEventDispatcher<Events>();

	const mouse = browser ? window.matchMedia('(pointer: fine)').matches : undefined;
	function event(type: keyof Events) {
		if ((mouse && type === 'toggle') || (!mouse && type !== 'toggle')) return;
		dispatch(type, subject.codec);
	}
</script>

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
	{tabindex}
	on:focusin={() => event('in')}
	on:mouseenter={() => event('in')}
	on:focusout={() => event('out')}
	on:mouseleave={() => event('out')}
	on:click={() => event('toggle')}
>
	<p class="m-0 select-none">
		{subject.codec === famous ? subject.formal : subject.name}
	</p>
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
</style>

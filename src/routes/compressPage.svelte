<script lang="ts">
	import TrashIcon from '$lib/icons/trashIcon.svelte';
	import PlayIcon from '$lib/icons/playIcon.svelte';
	import PauseIcon from '$lib/icons/pauseIcon.svelte';
	import { getFFmpegInstance, setupFFmpegListeners, terminateFFmpegInstance } from '$lib/ffmpeg';
	import { getUint8ArrayFromFile, bytesToMb } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	export let originalFile: File;
	export let onExitCompression: () => void = () => {};

	let compressionProgress = 0;
	let compressionSize = 0;
	let compressionState: 'in_progress' | 'done' = 'done';
	let compressionUrl = '';

	let playerTime = 0;
	let playerDuration = 0;
	let playerSlider = 0;
	let playerPaused = true;

	$: originalFileSizeInMb = bytesToMb(originalFile.size);
	$: compressionFileName = `kompress_${originalFile.name}.mp4`;
	$: compressionReductionPercentage = 100 - (compressionSize * 100) / originalFile.size;

	onMount(() => {
		startFileCompression(originalFile, compressionFileName);

		return () => terminateFFmpegInstance();
	});

	onDestroy(() => terminateFFmpegInstance());

	async function startFileCompression(inputFile: File, outputFileName: string) {
		compressionState = 'in_progress';

		const ffmpeg = await getFFmpegInstance();

		setupFFmpegListeners(
			ffmpeg,
			(size: number) => (compressionSize = size),
			(progress: number) => (compressionProgress = progress)
		);

		await ffmpeg.writeFile(inputFile.name, await getUint8ArrayFromFile(inputFile));

		await ffmpeg.exec([
			'-i',
			inputFile.name,
			'-c:v',
			'libx264',
			'-tag:v',
			'avc1',
			'-movflags',
			'faststart',
			'-crf',
			'45',
			'-preset',
			'ultrafast',
			'-progress',
			'-',
			'-v',
			'',
			'-y',
			outputFileName
		]);

		const outputFile = await ffmpeg.readFile(outputFileName);
		const outputFileAsUint8Array = outputFile as Uint8Array;
		const outputBlob = new Blob([outputFileAsUint8Array.buffer], { type: 'video/mp4' });
		const outputUrl = URL.createObjectURL(outputBlob);

		compressionUrl = outputUrl;

		playerSlider = 0;
		compressionSize = outputBlob.size;
		compressionState = 'done';
	}

	function exitCompression() {
		terminateFFmpegInstance();
		onExitCompression();
	}

	function dowloadVideo() {
		if (compressionState === 'done') {
			const link = document.createElement('a');
			link.href = compressionUrl;
			link.download = compressionFileName;
			link.click();
		}
	}

	function onSliderInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (compressionState === 'in_progress') {
			return;
		}
		const progress = Number(event.currentTarget.value);
		playerTime = (progress * playerDuration) / 100;
	}

	$: {
		if (compressionState === 'in_progress') {
			playerSlider = compressionProgress;
		}
		if (!playerPaused) {
			playerSlider = (playerTime * 100) / playerDuration;
		}
	}
</script>

<div class="container mx-auto flex h-screen max-w-4xl flex-col gap-4 p-4 sm:p-8">
	{#if compressionState === 'in_progress'}
		<div
			class="flex h-full w-full animate-pulse flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900"
		>
			<div class="text-zinc-300">Compressing video...</div>
			<div class="text-xl font-bold text-white">{compressionProgress}%</div>
		</div>
	{:else}
		<div class="h-full w-full overflow-hidden rounded-xl border border-zinc-700 p-2">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				bind:paused={playerPaused}
				bind:duration={playerDuration}
				bind:currentTime={playerTime}
				src={compressionUrl}
				playsinline={true}
				class="h-full w-full object-contain"
				controls={false}
			/>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-3">
		<button
			disabled={compressionState === 'in_progress'}
			on:click={() => (playerPaused = !playerPaused)}
			class="rounded p-2 text-sm text-white hover:bg-zinc-800"
		>
			{#if playerPaused}
				<PlayIcon class="h-5 w-5" />
			{:else}
				<PauseIcon class="h-5 w-5" />
			{/if}
		</button>
		<input
			on:input={onSliderInput}
			type="range"
			min="0"
			max="100"
			value={playerSlider}
			disabled={compressionState === 'in_progress'}
			class="h-full w-full"
		/>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:gap-6">
		<div class="flex flex-col gap-2 rounded-md bg-zinc-900 p-4 sm:p-6">
			<div class="text-sm text-gray-300">ORIGINAL</div>
			<h1 class="text-3xl font-semibold text-white sm:text-4xl">
				{originalFileSizeInMb} MB
			</h1>
			<button
				on:click={exitCompression}
				class="mt-3 flex items-center justify-center gap-2 rounded border border-zinc-500 p-2 text-sm text-white hover:bg-zinc-800"
			>
				<TrashIcon class="h-6 w-6 text-zinc-300" />
			</button>
		</div>
		<div class="flex flex-col items-start gap-2 rounded-md bg-zinc-900 p-4 sm:p-6">
			<div class="text-sm text-gray-300">COMPRESSED</div>
			<div class="flex flex-col gap-2 sm:inline-flex sm:flex-row sm:items-center">
				<h1 class="text-3xl font-semibold text-white sm:text-4xl">
					{bytesToMb(compressionSize)} MB
				</h1>
				<div class="rounded bg-lime-300 px-1.5 py-0.5 text-xs text-black max-sm:text-center">
					{compressionReductionPercentage.toFixed(0)}% smaller
				</div>
			</div>
			<button
				on:click={dowloadVideo}
				class="mt-3 w-full rounded bg-white p-2 text-sm text-black hover:bg-zinc-200"
				>Download</button
			>
		</div>
	</div>
</div>

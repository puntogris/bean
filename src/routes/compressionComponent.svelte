<script lang="ts">
	import TrashIcon from '$lib/icons/trashIcon.svelte';
	import PlayIcon from '$lib/icons/playIcon.svelte';
	import PauseIcon from '$lib/icons/pauseIcon.svelte';
	import { getFFmpegInstance, setupFFmpegListeners, terminateFFmpegInstance } from '$lib/ffmpeg';
	import { getUint8ArrayFromFile } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	export let selectedFile: File;
	export let onFileDeleted: () => void = () => {};

	const compressionStore = writable({
		progress: 0,
		size: 0
	});

	let isPlaying = false;
	let outputFileUrl: string = '';

	$: selectedFileSizeInMB = getFileSizeInMB(selectedFile);
	$: fileName = selectedFile.name;
	$: outputFileName = `kompress_${fileName}.mp4`;
	$: compressionPercentage = 100 - ($compressionStore.size * 100) / selectedFile.size;
	$: isConverting = $compressionStore.progress < 100;

	onMount(() => {
		startFileCompression(selectedFile, outputFileName);

		return () => {
			terminateFFmpegInstance();
		};
	});

	onDestroy(() => {
		terminateFFmpegInstance();
	});

	function getFileSizeInMB(file: File) {
		const sizeInBytes = file.size;
		const sizeInMB = sizeInBytes / (1024 * 1024);
		return sizeInMB;
	}

	async function startFileCompression(inputFile: File, outputFileName: string) {
		const ffmpeg = await getFFmpegInstance();

		setupFFmpegListeners(
			ffmpeg,
			(size: number) => {
				$compressionStore.size = size;
			},
			(progress: number) => {
				$compressionStore.progress = progress;
			}
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
			'40',
			'-preset',
			'ultrafast',
			'-progress',
			'-',
			'-v',
			'',
			'-y',
			outputFileName
		]);

		const data = await ffmpeg.readFile(outputFileName);
		const convertedFileAsUint8Array = data as Uint8Array;
		const blob = new Blob([convertedFileAsUint8Array.buffer], { type: 'video/mp4' });
		outputFileUrl = URL.createObjectURL(blob);

		$compressionStore.size = blob.size;
	}

	async function onDeleteClicked() {
		terminateFFmpegInstance();
		onFileDeleted();
	}

	function dowloadVideo() {
		if (outputFileUrl) {
			const link = document.createElement('a');
			link.href = outputFileUrl;
			link.download = outputFileName;
			link.click();
		}
	}

	function playVideo() {
		const video = document.getElementById('video') as HTMLVideoElement;
		video.play();
		isPlaying = true;
	}

	function pauseVideo() {
		const video = document.getElementById('video') as HTMLVideoElement;
		video.pause();
		isPlaying = false;
	}

	function setvideoProgress(progress: number) {
		if (isConverting) {
			return;
		}
		const video = document.getElementById('video') as HTMLVideoElement;
		video.currentTime = (progress * video.duration) / 100;
	}
</script>

<div class="container mx-auto flex h-screen max-w-4xl flex-col gap-6">
	{#if isConverting}
		<div
			class="flex h-full w-full animate-pulse flex-col items-center justify-center rounded-xl border border-zinc-500 bg-zinc-900"
		>
			<div class="text-zinc-300">Compressing video...</div>
			<div class="text-xl font-bold text-white">{$compressionStore.progress}%</div>
		</div>
	{:else}
		<div class="h-full w-full overflow-hidden rounded-xl border border-zinc-500 p-2">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				src={outputFileUrl}
				playsinline={true}
				class="h-full w-full object-contain"
				id="video"
				controls={false}
			/>
		</div>
	{/if}

	<div class="flex items-center justify-between gap-3">
		{#if isPlaying}
			<button on:click={pauseVideo} class="rounded p-2 text-sm text-white hover:bg-zinc-800">
				<PauseIcon class="h-5 w-5" />
			</button>
		{:else}
			<button on:click={playVideo} class="rounded p-2 text-sm text-white hover:bg-zinc-800">
				<PlayIcon class="h-5 w-5" />
			</button>
		{/if}
		<input
			on:input={(e) => {
				setvideoProgress(Number(e.currentTarget.value));
			}}
			type="range"
			min="0"
			max="100"
			value="0"
			class="h-full w-full"
		/>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:gap-6">
		<div class="flexflex-col gap-2 rounded-md bg-zinc-900 p-4 sm:p-6">
			<div class="text-sm text-gray-300">ORIGINAL</div>
			<h1 class="text-3xl font-semibold text-white sm:text-4xl">
				{selectedFileSizeInMB.toFixed(1)} MB
			</h1>
			<button
				on:click={onDeleteClicked}
				class="mt-3 flex items-center justify-center gap-2 rounded border border-zinc-500 p-2 text-sm text-white hover:bg-zinc-800"
			>
				<TrashIcon class="h-6 w-6 text-zinc-300" />
			</button>
		</div>
		<div class="flex flex-col items-start gap-2 rounded-md bg-zinc-900 p-4 sm:p-6">
			<div class="text-sm text-gray-300">COMPRESSED</div>
			<div class="flex flex-col gap-2 sm:inline-flex sm:flex-row sm:items-center">
				<h1 class="text-3xl font-semibold text-white sm:text-4xl">
					{($compressionStore.size / 1024 / 1024).toFixed(1)} MB
				</h1>
				<div class="rounded bg-lime-300 px-1.5 py-0.5 text-xs text-black max-sm:text-center">
					{compressionPercentage.toFixed(0)}% smaller
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

<script lang="ts">
	import TrashIcon from '$lib/icons/trashIcon.svelte';
	import { getFFmpegInstance, terminateFFmpegInstance } from '$lib/ffmpeg';
	import { getUint8ArrayFromFile } from '$lib/utils';
	import { onDestroy, onMount } from 'svelte';

	export let selectedFile: File;
	export let onFileDeleted: () => void = () => {};

	$: selectedFileSizeInMB = getFileSizeInMB(selectedFile);
	$: fileName = selectedFile.name;
	$: outputFileName = `kompress_${fileName}.mp4`;

	let convertedFileAsUint8Array: Uint8Array | null = null;

	onMount(() => {
		startFileCompression(selectedFile, outputFileName);

		return () => {
			terminateFFmpegInstance();
		};
	});

	onDestroy(() => {
		terminateFFmpegInstance();
		convertedFileAsUint8Array = null;
	});

	function getFileSizeInMB(file: File) {
		const sizeInBytes = file.size;
		const sizeInMB = sizeInBytes / (1024 * 1024);
		return sizeInMB;
	}

	async function startFileCompression(inputFile: File, outputFileName: string) {
		const ffmpeg = await getFFmpegInstance();

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
			'38',
			'-preset',
			'ultrafast',
			'-y',
			outputFileName
		]);

		const data = await ffmpeg.readFile(outputFileName);
		convertedFileAsUint8Array = data as Uint8Array;
	}

	async function onDeleteClicked() {
		terminateFFmpegInstance();
		onFileDeleted();
	}

	function dowloadVideo() {
		if (convertedFileAsUint8Array) {
			const blob = new Blob([convertedFileAsUint8Array.buffer], { type: 'video/mp4' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = outputFileName;
			link.click();
		}
	}
</script>

<div class="grid grid-cols-2 gap-6">
	<div class="flex min-w-60 flex-col gap-2 rounded-md bg-zinc-900 p-6">
		<div class="text-sm text-gray-300">ORIGINAL</div>
		<h1 class="text-4xl font-semibold text-white">{selectedFileSizeInMB.toFixed(1)} MB</h1>
		<button
			on:click={onDeleteClicked}
			class="mt-3 flex items-center justify-center gap-2 rounded border border-zinc-500 p-2 text-sm text-white hover:bg-zinc-800"
		>
			<TrashIcon class="h-6 w-6 text-zinc-300" />
		</button>
	</div>
	<div class="flex min-w-60 flex-col gap-2 rounded-md bg-zinc-900 p-6">
		<div class="text-sm text-gray-300">COMPRESSED</div>
		<div class="inline-flex items-center gap-2">
			<h1 class="text-4xl font-semibold text-white">7.5 MB</h1>
			<div class="rounded bg-lime-300 px-1.5 py-0.5 text-center text-xs text-black">
				74% smaller
			</div>
		</div>
		<button
			on:click={dowloadVideo}
			class="mt-3 rounded bg-white p-2 text-sm text-black hover:bg-zinc-200">Download</button
		>
	</div>
</div>

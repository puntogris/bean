<script lang="ts">
	import Dropzone from 'svelte-file-dropzone';

	export let onFileSelected: (file: File) => void = () => {};

	function handleFilesSelect(e: any) {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length) {
			onFileSelected(acceptedFiles[0]);
		}
	}
</script>

<Dropzone
	on:drop={handleFilesSelect}
	multiple={false}
	disableDefaultStyles
	accept="video/*"
	containerClasses="custom-dropzone"
>
	<p class="text-center text-gray-50">Drag 'n' drop some files here, or click to select a file</p>
	<p class="text-center text-sm text-gray-400">
		Compression happens on your device so your files never leave your computer
	</p>
	<button class="rounded bg-white p-2 text-sm text-black">Select file</button>
</Dropzone>

<style lang="postcss">
	:global(.custom-dropzone) {
		@apply flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-16;
	}
</style>

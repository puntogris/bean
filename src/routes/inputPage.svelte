<script lang="ts">
	import Dropzone from 'svelte-file-dropzone';
	import BeanIcon from '$lib/icons/beanIcon.svelte';

	export let onFileSelected: (file: File) => void = () => {};

	function handleFilesSelect(e: any) {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length) {
			onFileSelected(acceptedFiles[0]);
		}
	}
</script>

<div class="flex h-screen flex-col">
	<div class="container mx-auto flex h-full max-w-4xl items-center justify-center p-4 sm:p-14">
		<Dropzone
			on:drop={handleFilesSelect}
			multiple={false}
			disableDefaultStyles
			accept="video/*"
			containerClasses="custom-dropzone"
		>
			<p class="text-center text-gray-50">Drop a file here or click to select a one</p>
			<p class="mt-2 text-center text-gray-400">
				Compression happens on your device so your files never leave your computer
			</p>
			<button class="mt-5 rounded bg-white px-8 py-2 text-sm text-black">Select file</button>
		</Dropzone>
	</div>

	<footer class="mt-auto flex items-center justify-center p-2.5">
		<BeanIcon class="mr-2 h-4 w-4 text-zinc-300" />
		<p class="text-sm text-zinc-400">
			bean.puntogris by <a href="https://www.puntogris.com/" class="underline">this human</a> • code
			on
			<a href="https://github.com/puntogris/bean-site" class="underline">github</a>
		</p>
	</footer>
</div>

<style lang="postcss">
	:global(.custom-dropzone) {
		@apply flex flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 p-6 sm:px-8 sm:py-16;
	}
</style>

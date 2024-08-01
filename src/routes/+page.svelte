<script lang="ts">
	import CompressionComponent from './compressionComponent.svelte';
	import SelectionComponent from './selectionComponent.svelte';

	let selectedFile: File | null = null;
</script>

<main
	class="container mx-auto flex h-screen max-w-4xl flex-col items-center justify-center p-4 sm:p-14"
>
	{#if selectedFile}
		<CompressionComponent
			originalFile={selectedFile}
			onExitCompression={() => (selectedFile = null)}
		/>
	{:else}
		<SelectionComponent onFileSelected={(file) => (selectedFile = file)} />
	{/if}
</main>

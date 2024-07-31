<script lang="ts">
	import CompressionComponent from './compressionComponent.svelte';
	import SelectionComponent from './selectionComponent.svelte';

	let selectedFile: File | null = null;
</script>

<main class="container mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center">
	{#if selectedFile}
		<CompressionComponent {selectedFile} onFileDeleted={() => (selectedFile = null)} />
	{:else}
		<SelectionComponent onFileSelected={(file) => (selectedFile = file)} />
	{/if}
</main>

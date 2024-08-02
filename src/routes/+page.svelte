<script lang="ts">
	import CompressPage from './compressPage.svelte';
	import InputPage from './inputPage.svelte';

	let selectedFile: File | null = null;
</script>

<svelte:head>
	<title>bean.puntogris</title>
</svelte:head>

{#if selectedFile}
	<CompressPage originalFile={selectedFile} onExitCompression={() => (selectedFile = null)} />
{:else}
	<InputPage onFileSelected={(file) => (selectedFile = file)} />
{/if}

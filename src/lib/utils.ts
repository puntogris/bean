async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
	return new Promise((resolve) => {
		const fileReader = new FileReader();

		fileReader.onload = () => {
			const { result } = fileReader;
			if (result instanceof ArrayBuffer) {
				resolve(new Uint8Array(result));
			}
		};

		fileReader.onerror = () => {
			console.log('Error reading file');
		};

		fileReader.readAsArrayBuffer(file);
	});
}

export { getUint8ArrayFromFile };

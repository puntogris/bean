async function getUint8ArrayFromFile(file: File): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();

		fileReader.onload = () => {
			const { result } = fileReader;
			if (result instanceof ArrayBuffer) {
				resolve(new Uint8Array(result));
			}
		};

		fileReader.onerror = () => {
			reject(new Error('Error reading file'));
		};

		fileReader.readAsArrayBuffer(file);
	});
}

function bytesToMb(bytes: number): string {
	return (bytes / 1024 / 1024).toFixed(1);
}

export { getUint8ArrayFromFile, bytesToMb };

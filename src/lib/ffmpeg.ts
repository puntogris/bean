import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpegInstance(): Promise<FFmpeg> {
	if (!ffmpegInstance) {
		ffmpegInstance = new FFmpeg();

		await ffmpegInstance.load({
			coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
			wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
		});
	}
	return ffmpegInstance;
}

function setupFFmpegListeners(
	ffmpeg: FFmpeg,
	onSizeUpdate: (size: number) => void,
	onProgressUpdate: (progress: number) => void
) {
	ffmpeg.on('log', ({ message }) => {
		const logMessage = message.split('=');

		if (logMessage[0] === 'total_size') {
			onSizeUpdate(parseInt(logMessage[1]));
		}
	});

	ffmpeg.on('progress', ({ progress }) => {
		onProgressUpdate(Math.floor(progress * 100));
	});
}

// New versions have signals but it's not working properly at version 0.12.10
// We use this force the process to exit when leaving the page
function terminateFFmpegInstance() {
	ffmpegInstance?.terminate();
	ffmpegInstance = null;
}

export { getFFmpegInstance, terminateFFmpegInstance, setupFFmpegListeners };

import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpegInstance: FFmpeg | null = null;

export async function getFFmpegInstance(): Promise<FFmpeg> {
	if (!ffmpegInstance) {
		ffmpegInstance = new FFmpeg();

		ffmpegInstance.on('log', ({ message: msg }) => {
			console.log(msg);
		});

		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

		await ffmpegInstance.load({
			coreURL: `${baseURL}/ffmpeg-core.js`,
			wasmURL: `${baseURL}/ffmpeg-core.wasm`
		});
	}
	return ffmpegInstance;
}

// New versions have signals but it's not working properly at version 0.12.10
// We use this force the process to exit when leaving the page
export function terminateFFmpegInstance() {
	ffmpegInstance?.terminate();
	ffmpegInstance = null;
}


import path from 'path';
import { FFmpegVideoProvider } from '../impl/ffmpeg-video-provider';

export function makeVideoProvider() {
  const tempDir = path.join(process.cwd(), 'tmp', 'video-processing');
  const outputDir = path.join(process.cwd(), 'public', 'stories');

  return new FFmpegVideoProvider(
    tempDir,
    outputDir,
  );
}
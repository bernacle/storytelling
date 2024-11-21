import fs from 'fs';
import path from 'path';
import { FFmpegVideoProvider } from '../impl/ffmpeg-video-provider';

export function makeVideoProvider() {
  const tempDir = path.join(process.cwd(), 'tmp', 'video-processing');
  const outputDir = path.join(process.cwd(), 'public', 'stories');

  // Ensure directories exist
  for (const dir of [tempDir, outputDir]) {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory exists: ${dir}`);
    }
  }

  console.log('Video provider paths:', {
    cwd: process.cwd(),
    tempDir,
    outputDir,
    tempDirExists: fs.existsSync(tempDir),
    outputDirExists: fs.existsSync(outputDir)
  });

  return new FFmpegVideoProvider(
    tempDir,
    outputDir,
  );
}
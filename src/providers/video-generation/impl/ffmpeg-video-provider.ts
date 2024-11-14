import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import path from 'path';
import { promisify } from 'util';
import type { VideoComposition, VideoGenerationResult } from '../types';
import type { VideoGenerationProvider } from '../video-generation-provider';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);

export class FFmpegVideoProvider implements VideoGenerationProvider {
  constructor(
    private readonly tempDir: string,
    private readonly outputDir: string,
  ) {
    // Check if directories exist
    if (!fs.existsSync(tempDir)) {
      throw new Error(`Temp directory not found: ${tempDir}`);
    }
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory not found: ${outputDir}`);
    }

    // Check FFmpeg
    try {
      ffmpeg.getAvailableCodecs((err, _codecs) => {
        if (err) {
          throw new Error('FFmpeg not properly configured');
        }
      });
    } catch (error) {
      console.error('FFmpeg initialization error:', error);
      console.log('Please ensure FFmpeg is installed. On macOS, run: brew install ffmpeg');
      throw new Error('FFmpeg not found. Please install FFmpeg before running the application.');
    }
  }

  private async saveBase64File(base64Data: string, outputPath: string): Promise<void> {
    try {
      const base64Content = base64Data.replace(/^data:([a-zA-Z\/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Content, 'base64');
      await writeFile(outputPath, fileBuffer);
    } catch (error) {
      throw new Error(`Failed to save base64 file to ${path.basename(outputPath)}: ${error}`);
    }
  }

  private async createSegmentedVideo(
    imagePaths: string[],
    duration: number,
    outputPath: string
  ): Promise<void> {
    const segmentDuration = duration / imagePaths.length;

    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      imagePaths.forEach(imagePath => {
        command = command
          .input(imagePath)
          .inputOptions(['-loop 1'])
      });

      const filters: string[] = [];

      imagePaths.forEach((_, i) => {
        if (i === 0) {
          filters.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setpts=PTS-STARTPTS[v${i}]`);
        } else {
          const fadeStart = (i * segmentDuration) - 0.5;
          filters.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setpts=PTS-STARTPTS+${i * segmentDuration}/TB[v${i}]`);
          filters.push(`[tmp${i - 1}][v${i}]overlay=enable='between(t,${fadeStart},${i * segmentDuration})':shortest=1[tmp${i}]`);
        }
      });

      command
        .complexFilter(filters, `[tmp${imagePaths.length - 1}]`)
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-movflags +faststart',
          '-pix_fmt yuv420p',
          `-t ${duration}`
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ', {
            frames: progress.frames,
            currentFps: progress.currentFps,
            currentKbps: progress.currentKbps,
            targetSize: progress.targetSize,
            timemark: progress.timemark,
            percent: progress.percent
          });
        })
        .on('end', () => {
          console.log('FFmpeg process completed');
          resolve();
        })
        .on('error', (err: Error) => {
          console.error('FFmpeg process error:', err);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  async generate(composition: VideoComposition): Promise<VideoGenerationResult> {
    const sessionId = Date.now().toString();
    const workDir = path.join(this.tempDir, sessionId);

    try {
      await mkdir(workDir, { recursive: true });

      console.log('Saving narration...');
      const narrationPath = path.join(workDir, 'narration.mp3');
      await this.saveBase64File(composition.audio.url, narrationPath);

      const audioDuration = await getAudioDurationInSeconds(narrationPath);
      console.log(`Narration duration: ${audioDuration} seconds`);

      console.log('Saving images...');
      const imagePaths = await Promise.all(
        composition.scenes.map(async (scene, i) => {
          const imagePath = path.join(workDir, `scene_${i}.jpg`);
          await this.saveBase64File(scene.image, imagePath);
          return imagePath;
        })
      );

      console.log('Creating base video...');
      const baseVideoPath = path.join(workDir, 'base_video.mp4');
      await this.createSegmentedVideo(
        imagePaths,
        audioDuration,
        baseVideoPath
      );

      // Handle music - check if URL is provided
      const musicPath = path.join(workDir, 'background_music.mp3');
      if (composition.music.url) {
        console.log('Saving background music...');
        await this.saveBase64File(composition.music.url, musicPath);
      }

      const outputFileName = `story_${sessionId}.mp4`;
      const outputPath = path.join(this.outputDir, outputFileName);

      console.log('Adding audio tracks...');
      await new Promise((resolve, reject) => {
        let command = ffmpeg()
          .input(baseVideoPath)
          .input(narrationPath);

        // Only add music input if URL was provided
        if (composition.music.url) {
          command = command.input(musicPath);
        }

        // Adjust complex filter based on whether we have music
        const complexFilter = composition.music.url
          ? [
            `[2:a]volume=${composition.music.volume}[music]`,
            '[1:a][music]amix=inputs=2:duration=first[audio]'
          ]
          : [];

        command
          .complexFilter(complexFilter)
          .outputOptions([
            '-c:v copy',
            '-map 0:v',
            composition.music.url ? '-map [audio]' : '-map 1:a',
            '-shortest'
          ])
          .on('start', (commandLine) => {
            console.log('FFmpeg audio mixing started:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Audio mixing progress:', progress);
          })
          .save(outputPath)
          .on('end', resolve)
          .on('error', (err) => {
            console.error('FFmpeg audio mixing error:', err);
            reject(new Error(`Audio mixing failed: ${err.message}`));
          });
      });

      await rm(workDir, { recursive: true, force: true });

      return {
        videoUrl: `/stories/${outputFileName}`
      };
    } catch (error) {
      await rm(workDir, { recursive: true, force: true })
        .catch(err => console.error('Cleanup error during error handling:', err));

      throw new Error(`Video generation failed: ${error}`);
    }
  }
}
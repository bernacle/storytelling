import { generateSrtFile, generateSubtitleFilter } from '@/handlers/subtitles';
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
    if (!fs.existsSync(tempDir)) {
      throw new Error(`Temp directory not found: ${tempDir}`);
    }
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory not found: ${outputDir}`);
    }

    try {
      ffmpeg()
        .input('test')
        .outputOptions(['-version'])
        .on('error', (err) => {
          throw new Error(`FFmpeg test failed: ${err.message}`);
        })
        .on('end', () => {
          console.log('FFmpeg test successful');
        });
    } catch (error) {
      console.error('FFmpeg initialization error:', error);
      throw new Error('FFmpeg not found or not properly configured.');
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
    totalDuration: number,
    sceneDurations: number[],
    outputPath: string,
    subtitlePath: string,
    format: '1080x1920' | '1920x1080' = '1080x1920'
  ): Promise<void> {
    const [width, height] = format.split('x').map(Number);

    return new Promise<void>((resolve, reject) => {
      let command = ffmpeg();

      // Add all images as inputs
      imagePaths.forEach(imagePath => {
        command = command
          .input(imagePath)
          .inputOptions(['-loop 1']);
      });

      // Create filter graph
      const filters: string[] = [];
      let currentTime = 0;

      // Scale and process inputs
      imagePaths.forEach((_, i) => {
        filters.push(`[${i}:v]scale=${width}:${height},setsar=1:1[scaled${i}]`);
      });

      // Chain the videos together with transitions
      filters.push(`[scaled0]trim=duration=${sceneDurations[0]}[first]`);
      let lastOutput = 'first';

      for (let i = 1; i < imagePaths.length; i++) {
        const fadeStart = currentTime + sceneDurations[i - 1] - 0.5;
        currentTime += sceneDurations[i - 1];

        filters.push(
          `[${lastOutput}][scaled${i}]xfade=transition=fade:duration=0.5:offset=${fadeStart}[trans${i}]`
        );
        lastOutput = `trans${i}`;
      }

      // Add subtitles last in the filter chain
      const subtitleFilter = generateSubtitleFilter(subtitlePath, height);
      filters.push(`[${lastOutput}]${subtitleFilter}[final]`);

      let completed = false;

      command
        .complexFilter(filters, ['final'])  // Make sure we're outputting the 'final' pad
        .outputOptions([
          '-c:v libx264',
          '-preset medium',
          '-crf 23',
          '-movflags +faststart',
          '-pix_fmt yuv420p',
          `-t ${totalDuration}`,
          `-s ${format}`
        ])
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', {
            format,
            width,
            height,
            totalDuration,
            sceneDurations,
            command: commandLine
          });
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ', progress);
        })
        .on('error', (err) => {
          if (!completed) {
            completed = true;
            console.error('FFmpeg process error:', err);
            reject(new Error(`FFmpeg processing failed: ${err.message}`));
          }
        })
        .on('end', () => {
          if (!completed) {
            completed = true;
            resolve();
          }
        })
        .save(outputPath);
    });
  }

  // Helper function to ensure subtitle filter is properly escaped
  private escapeFilterPath(path: string): string {
    return path.replace(/['\[\],]/g, '\\$&');
  }

  async generate(composition: VideoComposition): Promise<VideoGenerationResult> {
    const sessionId = Date.now().toString();
    const workDir = path.join(this.tempDir, sessionId);

    try {
      await mkdir(workDir, { recursive: true });

      console.log(composition.music.url)

      console.log('Saving narration...');
      const narrationPath = path.join(workDir, 'narration.mp3');
      await this.saveBase64File(composition.audio.url, narrationPath);

      const audioDuration = await getAudioDurationInSeconds(narrationPath);
      console.log(`Narration duration: ${audioDuration} seconds`);

      let musicPath: string | undefined;
      if (composition.music?.url) {
        console.log('Saving background music...');
        musicPath = path.join(workDir, 'background_music.mp3');
        await this.saveBase64File(composition.music.url, musicPath);
      }

      console.log('Saving images...');
      const imagePaths = await Promise.all(
        composition.scenes.map(async (scene, i) => {
          const imagePath = path.join(workDir, `scene_${i}.jpg`);
          await this.saveBase64File(scene.image, imagePath);
          return imagePath;
        })
      );

      // Calculate scene durations
      const sceneDurations = composition.scenes.map(scene =>
        scene.duration
      );
      const totalDuration = sceneDurations.reduce((sum, duration) => sum + duration, 0);

      console.log('Generating subtitles...');
      const subtitlesPath = path.join(workDir, 'subtitles.srt');
      await generateSrtFile(composition.scenes, subtitlesPath);

      console.log('Creating base video...', {
        sceneDurations,
        totalDuration,
        hasMusicTrack: !!musicPath
      });

      // Create the base video with the images
      const baseVideoPath = path.join(workDir, 'base_video.mp4');
      await this.createSegmentedVideo(
        imagePaths,
        totalDuration,
        sceneDurations,
        baseVideoPath,
        subtitlesPath,
        '1080x1920'
      );

      const outputFileName = `story_${sessionId}.mp4`;
      const outputPath = path.join(this.outputDir, outputFileName);

      // Combine video with audio tracks
      console.log('Adding audio tracks...');
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg()
          .input(baseVideoPath)  // Video
          .input(narrationPath); // Narration

        if (musicPath) {
          command = command.input(musicPath);  // Background music
        }

        // Set up audio mixing based on whether we have background music
        if (musicPath) {
          console.log('Configuring audio mix with background music...');
          command
            .complexFilter([
              // Apply volume adjustment to background music
              `[2:a]volume=${composition.music?.volume || 0.4}[music]`,
              // Mix narration with background music
              '[1:a][music]amix=inputs=2:duration=first[audio]'
            ])
            .outputOptions([
              '-c:v copy',       // Copy video stream without re-encoding
              '-map 0:v',        // Include video stream
              '-map [audio]',    // Use mixed audio
              '-shortest'        // End when shortest stream ends
            ]);
        } else {
          console.log('Configuring audio with narration only...');
          command
            .outputOptions([
              '-c:v copy',
              '-map 0:v',
              '-map 1:a',
              '-shortest'
            ]);
        }

        let completed = false;

        command
          .on('start', (commandLine) => {
            console.log('FFmpeg audio mixing started:', commandLine);
          })
          .on('progress', (progress) => {
            console.log('Audio mixing progress:', progress);
          })
          .on('error', (err) => {
            if (!completed) {
              completed = true;
              console.error('FFmpeg audio mixing error:', err);
              reject(new Error(`Audio mixing failed: ${err.message}`));
            }
          })
          .on('end', () => {
            if (!completed) {
              completed = true;
              resolve();
            }
          })
          .save(outputPath);
      });

      // Cleanup temporary files
      await rm(workDir, { recursive: true, force: true });

      return {
        videoUrl: `/stories/${outputFileName}`
      };
    } catch (error) {
      await rm(workDir, { recursive: true, force: true })
        .catch(err => console.error('Cleanup error during error handling:', err));

      throw error instanceof Error ? error : new Error(`Video generation failed: ${error}`);
    }
  }
}
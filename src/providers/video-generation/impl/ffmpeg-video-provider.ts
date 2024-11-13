import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import type { VideoGenerationProvider } from '../video-generation-provider';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);

export class FFmpegVideoProvider implements VideoGenerationProvider {
  constructor(
    private readonly tempDir: string,
    private readonly outputDir: string,
    private readonly musicLibraryPath: string,
  ) { }

  private async saveBase64File(base64Data: string, outputPath: string): Promise<void> {
    try {
      // Remove data URL prefix if present
      const base64Content = base64Data.replace(/^data:([a-zA-Z\/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Content, 'base64');
      await writeFile(outputPath, fileBuffer);
    } catch (error) {
      throw new Error(`Failed to save base64 file to ${path.basename(outputPath)}: ${error}`);
    }
  }

  private getMusicTrackByMood(mood: string): string {
    const moodToMusic = {
      'UPBEAT': 'upbeat-background.mp3',
      'DRAMATIC': 'dramatic-background.mp3',
      'CALM': 'calm-background.mp3',
    };

    const musicFile = moodToMusic[mood as keyof typeof moodToMusic] || 'calm-background.mp3';
    return path.join(this.musicLibraryPath, musicFile);
  }

  private async createSegmentedVideo(
    imagePaths: string[],
    duration: number,
    outputPath: string
  ): Promise<void> {
    const segmentDuration = duration / imagePaths.length;

    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add each image input with its duration
      imagePaths.forEach(imagePath => {
        command = command
          .input(imagePath)
          .inputOptions(['-loop 1'])
      });

      // Create filter complex for crossfading between images
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


  async generate(composition: VideoComposition): Promise<{ videoUrl: string }> {
    const sessionId = Date.now().toString();
    const workDir = path.join(this.tempDir, sessionId);

    try {
      // Create working directory
      await mkdir(workDir, { recursive: true });

      // Save narration from base64
      console.log('Saving narration...');
      const narrationPath = path.join(workDir, 'narration.mp3');
      await this.saveBase64File(composition.audio.url, narrationPath);

      // Get narration duration
      const audioDuration = await getAudioDurationInSeconds(narrationPath);
      console.log(`Narration duration: ${audioDuration} seconds`);

      // Save images from base64
      console.log('Saving images...');
      const imagePaths = await Promise.all(
        composition.scenes.map(async (scene, i) => {
          const imagePath = path.join(workDir, `scene_${i}.jpg`);
          await this.saveBase64File(scene.image, imagePath);
          return imagePath;
        })
      );

      // Create base video with images
      console.log('Creating base video...');
      const baseVideoPath = path.join(workDir, 'base_video.mp4');
      await this.createSegmentedVideo(
        imagePaths,
        audioDuration,
        baseVideoPath
      );

      // Get background music
      const musicTrack = this.getMusicTrackByMood(composition.music.mood);

      // Final output path
      const outputFileName = `story_${sessionId}.mp4`;
      const outputPath = path.join(this.outputDir, outputFileName);

      // Combine video with audio tracks
      console.log('Adding audio tracks...');
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(baseVideoPath)
          .input(narrationPath)
          .input(musicTrack)
          .complexFilter([
            `[2:a]volume=${composition.music.volume}[music]`,
            '[1:a][music]amix=inputs=2:duration=first[audio]'
          ])
          .outputOptions([
            '-c:v copy',
            '-map 0:v',
            '-map [audio]',
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

      // Convert final video to base64 if needed
      // const finalVideoBase64 = await fs.promises.readFile(outputPath, { encoding: 'base64' });

      // Clean up
      await rm(workDir, { recursive: true, force: true });

      // Return public URL (adjust based on your server setup)
      return {
        videoUrl: `/stories/${outputFileName}`
      };
    } catch (error) {
      // Clean up on error
      await rm(workDir, { recursive: true, force: true })
        .catch(err => console.error('Cleanup error during error handling:', err));

      throw new Error(`Video generation failed: ${error}`);
    }
  }
}

// Update the interface to reflect base64 usage
export interface VideoComposition {
  audio: {
    url: string; // base64 string
    type: string;
  };
  scenes: Array<{
    image: string; // base64 string
    duration: number;
    transition: string;
    transitionDuration: number;
  }>;
  style: string;
  music: {
    mood: string;
    volume: number;
  };
}
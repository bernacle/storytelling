import { generateSrtFile, generateSubtitleFilter } from "@/handlers/subtitles";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import type { VideoComposition, VideoGenerationResult } from "../types";
import type { VideoGenerationProvider } from "../video-generation-provider";

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);

// Helper function to check if a file exists and get its size
async function checkFile(
  filePath: string
): Promise<{ exists: boolean; size?: number }> {
  try {
    const stats = await fs.promises.stat(filePath);
    return { exists: true, size: stats.size };
  } catch (error) {
    return { exists: false };
  }
}

// Helper function to probe media file
async function probeFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
}

export class FFmpegVideoProvider implements VideoGenerationProvider {
  constructor(
    private readonly tempDir: string,
    private readonly outputDir: string
  ) {
    if (!fs.existsSync(tempDir)) {
      throw new Error(`Temp directory not found: ${tempDir}`);
    }
    if (!fs.existsSync(outputDir)) {
      throw new Error(`Output directory not found: ${outputDir}`);
    }

    try {
      ffmpeg()
        .input("test")
        .outputOptions(["-version"])
        .on("error", (err) => {
          throw new Error(`FFmpeg test failed: ${err.message}`);
        })
        .on("end", () => {
          console.log("FFmpeg test successful");
        });
    } catch (error) {
      console.error("FFmpeg initialization error:", error);
      throw new Error("FFmpeg not found or not properly configured.");
    }
  }

  private async saveBase64File(
    base64Data: string,
    outputPath: string,
    expectedType: "audio" | "image"
  ): Promise<void> {
    try {
      // Allow for base64 data with or without mime type prefix
      let fileBuffer: Buffer;
      if (base64Data.includes("base64,")) {
        const base64Content = base64Data.split("base64,")[1];
        fileBuffer = Buffer.from(base64Content, "base64");
      } else {
        fileBuffer = Buffer.from(base64Data, "base64");
      }

      await writeFile(outputPath, fileBuffer);

      const fileInfo = await checkFile(outputPath);
      console.log("File saved:", {
        type: expectedType,
        path: path.basename(outputPath),
        size: fileInfo.size,
        exists: fileInfo.exists,
      });

      if (expectedType === "audio" && fileInfo.exists) {
        try {
          const probeData = await probeFile(outputPath);
          console.log("Audio file probe:", {
            path: path.basename(outputPath),
            format: probeData.format?.format_name,
            duration: probeData.format?.duration,
            size: probeData.format?.size,
            streams: probeData.streams?.map((s: any) => ({
              codec_type: s.codec_type,
              codec_name: s.codec_name,
              sample_rate: s.sample_rate,
              channels: s.channels,
            })),
          });
        } catch (probeError) {
          console.error("Failed to probe audio file:", {
            path: path.basename(outputPath),
            error: probeError,
          });
        }
      }

      if (!fileInfo.exists || fileInfo.size === 0) {
        throw new Error("Generated file is empty or does not exist");
      }
    } catch (error) {
      console.error("File save error:", {
        type: expectedType,
        path: path.basename(outputPath),
        error,
      });
      throw new Error(
        `Failed to save ${expectedType} file to ${path.basename(outputPath)}: ${error}`
      );
    }
  }

  private async createSegmentedVideo(
    imagePaths: string[],
    totalDuration: number,
    sceneDurations: number[],
    outputPath: string,
    subtitlePath: string,
    format: "1080x1920" | "1920x1080" = "1080x1920"
  ): Promise<void> {
    const [width, height] = format.split("x").map(Number);

    return new Promise<void>((resolve, reject) => {
      let command = ffmpeg();

      // Add all images as inputs
      imagePaths.forEach((imagePath) => {
        command = command.input(imagePath).inputOptions(["-loop 1"]);
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
      let lastOutput = "first";

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

      command
        .complexFilter(filters, ["final"])
        .outputOptions([
          "-c:v libx264",
          "-preset medium",
          "-crf 23",
          "-movflags +faststart",
          "-pix_fmt yuv420p",
          `-t ${totalDuration}`,
          `-s ${format}`,
        ])
        .on("start", (commandLine) => {
          console.log("FFmpeg process started:", {
            format,
            width,
            height,
            totalDuration,
            sceneDurations,
            command: commandLine,
          });
        })
        .on("stderr", (stderrLine) => {
          console.log("FFmpeg stderr:", stderrLine);
        })
        .on("progress", (progress) => {
          console.log("Processing: ", progress);
        })
        .on("error", (err) => {
          console.error("FFmpeg process error:", err);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .on("end", () => {
          resolve();
        })
        .save(outputPath);
    });
  }

  async generate(
    composition: VideoComposition
  ): Promise<VideoGenerationResult> {
    const sessionId = Date.now().toString();
    const workDir = path.join(this.tempDir, sessionId);

    try {
      await mkdir(workDir, { recursive: true });

      console.log("Saving narration...");
      const narrationPath = path.join(workDir, "narration.mp3");
      await this.saveBase64File(composition.audio.url, narrationPath, "audio");

      // Verify narration file
      const narrationInfo = await checkFile(narrationPath);
      if (!narrationInfo.exists || narrationInfo.size === 0) {
        throw new Error("Narration file is missing or empty");
      }

      console.log("Saving images...");
      const imagePaths = await Promise.all(
        composition.scenes.map(async (scene, i) => {
          const imagePath = path.join(workDir, `scene_${i}.jpg`);
          await this.saveBase64File(scene.image, imagePath, "image");
          return imagePath;
        })
      );

      // Calculate scene durations
      const sceneDurations = composition.scenes.map((scene) => scene.duration);
      const totalDuration = sceneDurations.reduce(
        (sum, duration) => sum + duration,
        0
      );

      const probeData = await probeFile(narrationPath);
      const duration = probeData.format.duration;
      console.log("Audio duration:", duration);

      console.log("Generating subtitles...");
      const subtitlesPath = path.join(workDir, "subtitles.srt");
      await generateSrtFile(composition.content, duration, subtitlesPath);

      console.log("Creating base video...", {
        sceneDurations,
        duration,
      });

      const baseVideoPath = path.join(workDir, "base_video.mp4");
      await this.createSegmentedVideo(
        imagePaths,
        duration,
        sceneDurations,
        baseVideoPath,
        subtitlesPath,
        "1080x1920"
      );

      const outputFileName = `story_${sessionId}.mp4`;
      const outputPath = path.join(this.outputDir, outputFileName);

      console.log("Adding audio tracks...");
      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg().input(baseVideoPath).input(narrationPath);

        command.on("start", async (commandLine) => {
          console.log("FFmpeg audio mixing command:", commandLine);

          try {
            const baseVideoInfo = await probeFile(baseVideoPath);
            const narrationInfo = await probeFile(narrationPath);

            console.log("Input files probe:", {
              baseVideo: {
                format: baseVideoInfo.format?.format_name,
                duration: baseVideoInfo.format?.duration,
                size: baseVideoInfo.format?.size,
              },
              narration: {
                format: narrationInfo.format?.format_name,
                duration: narrationInfo.format?.duration,
                size: narrationInfo.format?.size,
              },
            });
          } catch (probeError) {
            console.error("Failed to probe input files:", probeError);
          }
        });

        console.log("Configuring audio with narration only...");
        command.outputOptions([
          "-c:v copy",
          "-map 0:v",
          "-map 1:a",
          "-shortest",
        ]);

        command
          .on("stderr", (stderrLine) => {
            console.log("FFmpeg stderr:", stderrLine);
          })
          .on("error", (err, stdout, stderr) => {
            console.error("FFmpeg error:", {
              error: err.message,
              stdout,
              stderr,
            });
            reject(new Error(`Audio mixing failed: ${err.message}`));
          })
          .on("end", () => {
            resolve();
          })
          .save(outputPath);
      });

      const outputInfo = await checkFile(outputPath);
      console.log("Final output file check:", {
        path: outputPath,
        exists: outputInfo.exists,
        size: outputInfo.size,
      });

      await rm(workDir, { recursive: true, force: true });

      return {
        videoUrl: `/stories/${outputFileName}`,
      };
    } catch (error) {
      console.error("Video generation error:", error);
      await rm(workDir, { recursive: true, force: true }).catch((err) =>
        console.error("Cleanup error during error handling:", err)
      );

      throw error instanceof Error
        ? error
        : new Error(`Video generation failed: ${error}`);
    }
  }
}

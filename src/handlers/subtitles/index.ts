import type { Scene } from '@/providers/video-generation/types';
import fs from 'fs';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

// Helper function to format time in SRT format (HH:MM:SS,mmm)
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

interface SubtitleSegment {
  text: string;
  startTime: number;
  endTime: number;
}

// Function to split text into smaller phrases
function splitIntoPhrasesWithTiming(
  text: string,
  startTime: number,
  duration: number,
  wordsPerSegment = 8 // Adjust this value to control subtitle length
): SubtitleSegment[] {
  const words = text.split(' ');
  const segments: SubtitleSegment[] = [];
  const timePerWord = duration / words.length;

  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const segmentWords = words.slice(i, i + wordsPerSegment);
    const segmentStartTime = startTime + (i * timePerWord);
    const segmentEndTime = segmentStartTime + (segmentWords.length * timePerWord);

    segments.push({
      text: segmentWords.join(' '),
      startTime: segmentStartTime,
      endTime: segmentEndTime
    });
  }

  return segments;
}

// Calculate approximate speaking time for a piece of text
function calculateSpeakingTime(text: string): number {
  // Average speaking rate (words per minute)
  const WORDS_PER_MINUTE = 150;
  const WORDS_PER_SECOND = WORDS_PER_MINUTE / 60;

  const wordCount = text.split(/\s+/).length;
  return wordCount / WORDS_PER_SECOND;
}

export async function generateSrtFile(
  scenes: Scene[],
  outputPath: string
): Promise<void> {
  let currentTime = 0;
  let srtContent = '';
  let subtitleIndex = 1;

  for (const scene of scenes) {
    const sceneDuration = calculateSpeakingTime(scene.text);
    const segments = splitIntoPhrasesWithTiming(scene.text, currentTime, sceneDuration);

    for (const segment of segments) {
      // Wrap text if it exceeds maximum line length
      const wrappedText = wrapText(segment.text, subtitleStyle.fontProperties.maxLineLength);

      srtContent += `${subtitleIndex}\n`;
      srtContent += `${formatSrtTime(segment.startTime)} --> ${formatSrtTime(segment.endTime)}\n`;
      srtContent += `${wrappedText}\n\n`;
      subtitleIndex++;
    }

    currentTime += sceneDuration;
  }

  await writeFile(outputPath, srtContent, 'utf8');
}

// Styles for subtitles
export const subtitleStyle = {
  // Keep font size modest
  fontSize: 10, // Slightly smaller than before
  bottomPadding: 30,
  fontProperties: {
    font: 'Arial',
    primaryColor: 'FFFFFF', // Pure white
    outlineColor: '000000', // Black outline
    outlineWidth: 0.7, // Thinner outline
    alignment: 2, // Center alignment
    borderStyle: 1, // Outline only
    spacing: 0.3, // Reduced letter spacing for cleaner look
    maxLineLength: 35,
    bold: 0 // Disable bold to make it lighter
  }
};


function wrapText(text: string, maxLength: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join('\n');
}


// Generate FFmpeg subtitle filter with improved styling
export function generateSubtitleFilter(subtitlePath: string, videoHeight: number = 1920): string {
  // For vertical videos, adjust the scaling factor
  const fontSize = Math.floor(videoHeight * (subtitleStyle.fontSize / 1920)); // Changed base height to 1920
  const bottomPadding = Math.floor(videoHeight * (subtitleStyle.bottomPadding / 1920));
  const escapedPath = subtitlePath.replace(/['\[\],]/g, '\\$&');

  return `subtitles='${escapedPath}':force_style='` +
    `FontName=${subtitleStyle.fontProperties.font},` +
    `FontSize=${fontSize},` +
    `PrimaryColour=&H${subtitleStyle.fontProperties.primaryColor},` +
    `OutlineColour=&H${subtitleStyle.fontProperties.outlineColor},` +
    `Outline=${subtitleStyle.fontProperties.outlineWidth},` +
    `MarginV=${bottomPadding},` +
    `Alignment=${subtitleStyle.fontProperties.alignment},` +
    `BorderStyle=${subtitleStyle.fontProperties.borderStyle},` +
    `Spacing=${subtitleStyle.fontProperties.spacing},` +
    `Bold=${subtitleStyle.fontProperties.bold}'`;
}
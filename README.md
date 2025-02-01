# Storytelling API

## Overview
The Storytelling API allows users to submit scripts and analyze their content to extract moods, themes, emotions, and more. It also provides the capability to generate media such as images, voices, music, and videos based on the analyzed script.

## Features
- **Script Analysis**: Submit a story and receive detailed analysis, including mood, tone, and themes.
- **Media Generation**: Generate images, voices, music, and videos based on analyzed scripts.
- **API Key Authentication**: Secure your API usage with an API key.
- **Worker Coordination**: The worker manages media generation and video bundling using FFmpeg.

## Installation
### Prerequisites
- [pnpm](https://pnpm.io/) (for package management)
- [Docker](https://www.docker.com/) (for PostgreSQL and Redis)
- [Node.js](https://nodejs.org/)

### Steps
1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Start required services using Docker:
   ```sh
   docker-compose up
   ```

3. Run database migrations:
   ```sh
   pnpm run db:migrate
   ```

4. Start the API:
   ```sh
   pnpm run start
   ```

## API Usage
### 1. Register a User
Send a `POST` request to `/users` with the following payload:
```json
{
  "email": "user@example.com"
}
```

### 2. Create an API Key
Send a `POST` request to `/api-keys`:
```json
{
  "label": "My API Key",
  "user_id": "your-user-id"
}
```
The API key should be included in all subsequent requests using the `x-api-key` header.

### 3. Analyze a Script
Send a `POST` request to `/scripts/analyze` with your story:
```json
{
  "content": "Eager to transcend earthly bounds, Mira, a meticulous software engineer, spent every spare moment crafting a code-driven lunar rocket, defying gravity with lines of TypeScript until, against all odds, she touched down on the moon—her laptop glowing triumphantly under the silent lunar sky."
}
```

#### Sample Response
```json
{
  "script": {
    "id": "uuid",
    "content": "...",
    "type": "STORY",
    "analysis": {
      "mood": "uplifting",
      "tone": "inspiring",
      "scenes": [
        { "text": "Eager to transcend...", "emotion": "determination" },
        { "text": "defying gravity...", "emotion": "excitement" },
        { "text": "her laptop glowing...", "emotion": "pride" }
      ],
      "themes": ["space exploration", "engineering", "persistence"],
      "suggestedMusic": "instrumental electronic"
    }
  }
}
```

### 4. Generate Media
Based on the script analysis, you can make additional requests:
- **Generate Images:** `POST /images`
- **Generate Voices:** `POST /voices`
- **Generate Music:** `POST /musics`
- **Create a Video:** Bundles all media using FFmpeg

## Development
### Scripts
- `pnpm run dev` - Start API in development mode
- `pnpm run worker` - Start background worker
- `pnpm run start` - Start both API and worker
- `pnpm run db:migrate` - Run database migrations
- `pnpm run lint` - Check code linting
- `pnpm run lint:fix` - Auto-fix linting issues

## Contribution
Feel free to open an issue or submit a pull request if you would like to contribute.

## License
[MIT](LICENSE)
export class VoiceNotFoundError extends Error {
  constructor() {
    super('Voice not found.')
  }
}

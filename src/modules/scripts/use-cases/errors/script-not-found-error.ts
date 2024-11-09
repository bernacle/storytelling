export class ScriptNotFoundError extends Error {
  constructor() {
    super('Script not found.')
  }
}

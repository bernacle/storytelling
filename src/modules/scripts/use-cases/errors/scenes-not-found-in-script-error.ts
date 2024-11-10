export class ScenesNotFoundInScriptError extends Error {
  constructor() {
    super('No scenes found in script analysis.')
  }
}

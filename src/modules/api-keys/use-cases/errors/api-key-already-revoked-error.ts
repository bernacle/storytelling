export class ApiKeyRevoked extends Error {
  constructor() {
    super('This api key was already revoked.')
  }
}

/** A real address-lookup failure (HTTP error, network error, bad response) — never a genuine empty result. */
export class GeoLookupError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'GeoLookupError'
  }
}

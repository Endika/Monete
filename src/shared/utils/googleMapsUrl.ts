export function googleMapsUrl(
  address: string,
  coords?: { lat: number | null; lng: number | null },
): string {
  if (coords && coords.lat != null && coords.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

import { GeoLookupError } from '@/infrastructure/geo/GeoLookupError'

export interface PlaceSuggestion {
  placeId: string
  label: string
}

export async function googleAutocomplete(query: string, key: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 3) return []
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify({ input: query }),
    })
    if (!res.ok) throw new GeoLookupError(`Google Places autocomplete failed: ${res.status}`)
    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: { placeId?: string; text?: { text?: string } }
      }>
    }
    return (data.suggestions ?? [])
      .map((s) => {
        const pp = s.placePrediction
        if (!pp?.placeId || !pp.text?.text) return null
        return { placeId: pp.placeId, label: pp.text.text }
      })
      .filter((x): x is PlaceSuggestion => x !== null)
  } catch (e) {
    if (e instanceof GeoLookupError) throw e
    throw new GeoLookupError('Google Places autocomplete request failed', { cause: e })
  }
}

export async function googlePlaceDetails(
  placeId: string,
  key: string,
): Promise<{ label: string; name: string; lat: number; lng: number }> {
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'location,formattedAddress,displayName',
      },
    })
    if (!res.ok) throw new GeoLookupError(`Google place details failed: ${res.status}`)
    const data = (await res.json()) as {
      location?: { latitude?: number; longitude?: number }
      formattedAddress?: string
      displayName?: { text?: string }
    }
    if (!data.location?.latitude || !data.location?.longitude || !data.formattedAddress) {
      throw new GeoLookupError('Google place details response is missing location fields')
    }
    return {
      label: data.formattedAddress,
      name: data.displayName?.text ?? '',
      lat: data.location.latitude,
      lng: data.location.longitude,
    }
  } catch (e) {
    if (e instanceof GeoLookupError) throw e
    throw new GeoLookupError('Google place details request failed', { cause: e })
  }
}

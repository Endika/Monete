import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/presentation/components/common/Input'
import { ErrorBanner } from '@/presentation/components/common/ErrorBanner'
import { searchAddresses } from '@/infrastructure/geo/photonSearch'
import { googleAutocomplete, googlePlaceDetails } from '@/infrastructure/geo/googlePlaces'

export interface AddressAutocompleteValue {
  address: string
  lat: number | null
  lng: number | null
  name?: string
}

interface Props {
  value: string
  lat: number | null
  lng: number | null
  onChange: (v: AddressAutocompleteValue) => void
}

interface Suggestion {
  label: string
  placeId?: string
  lat?: number
  lng?: number
}

export function AddressAutocomplete({ value, onChange }: Props) {
  const { t, i18n } = useTranslation()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const latestQueryRef = useRef<string>('')

  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    onChange({ address: text, lat: null, lng: null })

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }

    latestQueryRef.current = text

    // Photon is also where Google's own search ends up when there's no key: any failure
    // past this point is the search the user is actually left looking at, so it must show
    // the app's error instead of quietly leaving the list empty.
    const tryPhoton = async (query: string, lang: string) => {
      try {
        const fallback = await searchAddresses(query, lang)
        if (mountedRef.current && query === latestQueryRef.current) {
          setSuggestions(fallback)
          setError(null)
        }
      } catch {
        if (mountedRef.current && query === latestQueryRef.current) {
          setSuggestions([])
          setError(t('home.addressSearchError'))
        }
      }
    }

    timerRef.current = setTimeout(() => {
      const query = text
      const lang = i18n.language

      if (key) {
        void googleAutocomplete(query, key)
          .then((results) => {
            if (!mountedRef.current || query !== latestQueryRef.current) return undefined
            if (results.length > 0) {
              setSuggestions(results.map((r) => ({ label: r.label, placeId: r.placeId })))
              setError(null)
              return undefined
            }
            // Google found nothing — try Photon before treating it as a genuine empty result.
            return tryPhoton(query, lang)
          })
          .catch(() => tryPhoton(query, lang))
      } else {
        void tryPhoton(query, lang)
      }
    }, 300)
  }

  const handlePick = (s: Suggestion) => {
    if (s.placeId && key) {
      void googlePlaceDetails(s.placeId, key)
        .then((details) => {
          setError(null)
          onChange({
            address: details.label,
            lat: details.lat,
            lng: details.lng,
            name: details.name,
          })
        })
        .catch(() => {
          // Don't save a coordinate-less place silently — leave the field as it was and
          // let the user retry, instead of dropping the party's map pin without a trace.
          setError(t('home.addressDetailsError'))
        })
    } else {
      setError(null)
      onChange({ address: s.label, lat: s.lat ?? null, lng: s.lng ?? null })
    }
    setSuggestions([])
  }

  return (
    <div className="flex flex-col gap-1">
      <Input
        label={t('home.addressLabel')}
        placeholder={t('home.addressPlaceholder')}
        type="text"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="rounded-2xl border border-cocoa/15 bg-white shadow-md overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-cocoa hover:bg-cocoa/5 transition-colors"
                onClick={() => handlePick(s)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorBanner message={error} />
    </div>
  )
}

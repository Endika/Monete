import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/presentation/components/common/Input'
import { searchAddresses } from '@/infrastructure/geo/photonSearch'
import { googleAutocomplete, googlePlaceDetails } from '@/infrastructure/geo/googlePlaces'

export interface AddressAutocompleteValue {
  address: string
  lat: number | null
  lng: number | null
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
    timerRef.current = setTimeout(() => {
      const query = text
      const lang = i18n.language

      if (key) {
        void googleAutocomplete(query, key)
          .then(async (results) => {
            if (!mountedRef.current || query !== latestQueryRef.current) return
            if (results.length > 0) {
              setSuggestions(results.map((r) => ({ label: r.label, placeId: r.placeId })))
            } else {
              // fallback to Photon if Google returns nothing
              const fallback = await searchAddresses(query, lang)
              if (mountedRef.current && query === latestQueryRef.current) {
                setSuggestions(fallback)
              }
            }
          })
          .catch(() => {
            void searchAddresses(query, lang).then((fallback) => {
              if (mountedRef.current && query === latestQueryRef.current) {
                setSuggestions(fallback)
              }
            })
          })
      } else {
        void searchAddresses(query, lang).then((results) => {
          if (mountedRef.current && query === latestQueryRef.current) {
            setSuggestions(results)
          }
        })
      }
    }, 300)
  }

  const handlePick = (s: Suggestion) => {
    if (s.placeId && key) {
      void googlePlaceDetails(s.placeId, key).then((details) => {
        if (details) {
          onChange({ address: details.label, lat: details.lat, lng: details.lng })
        } else {
          onChange({ address: s.label, lat: null, lng: null })
        }
      })
    } else {
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
    </div>
  )
}

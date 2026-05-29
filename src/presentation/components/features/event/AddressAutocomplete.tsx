import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/presentation/components/common/Input'
import { searchAddresses } from '@/infrastructure/geo/photonSearch'
import type { AddressSuggestion } from '@/infrastructure/geo/photonSearch'

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

export function AddressAutocomplete({ value, onChange }: Props) {
  const { t, i18n } = useTranslation()
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

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

    timerRef.current = setTimeout(() => {
      const lang = i18n.language
      void searchAddresses(text, lang).then((results) => {
        if (mountedRef.current) {
          setSuggestions(results)
        }
      })
    }, 300)
  }

  const handlePick = (s: AddressSuggestion) => {
    onChange({ address: s.label, lat: s.lat, lng: s.lng })
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

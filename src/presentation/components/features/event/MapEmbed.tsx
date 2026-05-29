import { useTranslation } from 'react-i18next'

interface MapEmbedProps {
  address: string
  lat: number | null
  lng: number | null
}

export function MapEmbed({ address, lat, lng }: MapEmbedProps) {
  const { t } = useTranslation()
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined

  if (!key) return null

  const q = lat != null && lng != null ? `${lat},${lng}` : address || null
  if (!q) return null

  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(q)}`

  return (
    <div className="pt-2">
      <iframe
        title={t('common.viewOnMaps')}
        className="w-full h-48 rounded-2xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  )
}

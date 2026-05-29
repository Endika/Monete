import { useTranslation } from 'react-i18next'

interface Entry {
  id: string
  title: string
  startsAt: string
}

interface PartyListProps {
  title: string
  entries: Entry[]
  onOpen: (id: string) => void
}

export function PartyList({ title, entries, onOpen }: PartyListProps) {
  const { i18n } = useTranslation()

  if (entries.length === 0) return null

  const fmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' })

  return (
    <section className="w-full flex flex-col gap-3">
      <h2 className="font-display text-lg font-bold text-cocoa">{title}</h2>
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onOpen(e.id)}
              className="w-full text-left bg-white rounded-2xl shadow-[0_4px_16px_-4px_rgba(59,42,34,0.10)] px-5 py-4 flex flex-col gap-0.5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(59,42,34,0.16)] transition-all duration-150 cursor-pointer"
            >
              <span className="font-display font-bold text-cocoa text-base leading-snug">
                {e.title}
              </span>
              <span className="font-body text-cocoa/60 text-sm">
                {fmt.format(new Date(e.startsAt))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

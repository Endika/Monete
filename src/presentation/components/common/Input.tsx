import type { InputHTMLAttributes } from 'react'

export function Input({
  label,
  id,
  className = '',
  ...rest
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-semibold font-display text-cocoa/80 tracking-wide">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`w-full rounded-2xl border-2 border-cocoa/15 bg-white px-4 py-2.5 text-sm text-cocoa placeholder:text-cocoa/40 transition-all duration-150 focus:border-raspberry focus:outline-none focus:ring-2 focus:ring-raspberry/25 ${className}`}
        {...rest}
      />
    </label>
  )
}

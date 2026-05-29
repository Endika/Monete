import type { InputHTMLAttributes } from 'react'

export function Input({
  label,
  id,
  className = '',
  ...rest
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${className}`}
        {...rest}
      />
    </label>
  )
}

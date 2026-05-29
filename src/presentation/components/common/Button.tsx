import type { ButtonHTMLAttributes } from 'react'

export function Button({
  className = '',
  disabled,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

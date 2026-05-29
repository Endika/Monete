import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost'

export function Button({
  className = '',
  disabled,
  children,
  variant = 'primary',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold font-display transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-raspberry text-cream shadow-[0_4px_14px_-4px_rgba(255,77,121,0.55)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-4px_rgba(255,77,121,0.60)] active:translate-y-0',
    ghost:
      'bg-transparent text-cocoa border-2 border-cocoa/30 hover:border-cocoa/60 hover:-translate-y-0.5 active:translate-y-0',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}

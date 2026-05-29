import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_12px_32px_-14px_rgba(180,90,60,0.30)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky -top-6 -mx-6 -mt-6 flex justify-end bg-white/95 px-6 pb-1 pt-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            className="text-cocoa/40 hover:text-cocoa/70 text-2xl leading-none transition-colors duration-150"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

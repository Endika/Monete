export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-2xl bg-raspberry/10 border border-raspberry/25 px-4 py-3 text-sm text-cocoa"
    >
      {message}
    </div>
  )
}

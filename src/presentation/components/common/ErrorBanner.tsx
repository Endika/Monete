export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

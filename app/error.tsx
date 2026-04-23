'use client'

export default function Error({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase mb-3">Error</p>
      <h2 className="text-2xl font-bold tracking-tight">問題が発生しました</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        一時的なエラーです。時間をおいて再度お試しください。
      </p>
      <button
        className="px-4 py-2 text-sm font-medium rounded-lg border hover:bg-accent transition-colors"
        onClick={() => reset()}
      >
        もう一度試す
      </button>
    </div>
  )
}

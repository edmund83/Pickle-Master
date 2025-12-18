export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pickle-500">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <span className="text-2xl font-bold text-neutral-900">Pickle</span>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-neutral-500">
          Simple inventory management for small businesses
        </p>
      </div>
    </div>
  )
}

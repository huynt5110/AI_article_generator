export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left side - Branding */}
      <div className="hidden md:flex flex-col justify-center p-12 bg-zinc-950 text-white">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">Travel AI</h1>
          <p className="text-lg text-zinc-400">
            Transform rough travel notes into structured editorial stories powered by AI.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

import { Navbar } from './navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:px-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}

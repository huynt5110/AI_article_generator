'use client';

import { useCurrentUser } from '@/hooks/queries/use-current-user';

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome back, {user?.firstName || 'User'}!</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This is your secure dashboard. You were automatically redirected here because you are already logged in.
      </p>
    </div>
  );
}

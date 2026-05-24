import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/auth/auth.service';
import { queryKeys } from '@/lib/react-query/query-keys';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: authService.getCurrentUser,
    retry: false, // Don't retry on 401s
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

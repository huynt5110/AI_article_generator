import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth/auth.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { LoginPayload } from '@/lib/auth/auth.types';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.push('/articles'); // or wherever the main app is
    },
  });
}

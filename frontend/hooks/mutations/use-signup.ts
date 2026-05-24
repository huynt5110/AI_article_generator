import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth/auth.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { SignupPayload } from '@/lib/auth/auth.types';

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupPayload) => authService.signup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.push('/dashboard');
    },
  });
}

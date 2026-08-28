import { useTRPC } from "@pbd/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateForfeit = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.forfeits.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.forfeits.pathKey() }),
    }),
  )
}

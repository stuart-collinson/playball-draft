import { useTRPC } from "@pbd/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteCup = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.cups.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.cups.pathKey() }),
    }),
  )
}

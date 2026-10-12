import { useTRPC } from "@pbd/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateCup = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.cups.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.cups.pathKey() }),
    }),
  )
}

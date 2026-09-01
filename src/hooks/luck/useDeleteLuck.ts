import { useTRPC } from "@pbd/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteLuck = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.luck.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.luck.pathKey() }),
    }),
  )
}

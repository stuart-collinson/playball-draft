import { useTRPC } from "@pbd/trpc/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateLuck = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.luck.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.luck.pathKey() }),
    }),
  )
}

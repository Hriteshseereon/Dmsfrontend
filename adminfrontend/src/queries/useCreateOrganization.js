import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "../api/organizations";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries(["organizations"]);
    },
  });
};

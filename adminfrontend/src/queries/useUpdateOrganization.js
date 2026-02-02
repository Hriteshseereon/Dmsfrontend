import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrganization } from "../api/organizations";

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateOrganization(id, data),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["organization", variables.id]);
      queryClient.invalidateQueries(["organizations"]);
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "../api/organizations";

export const useGetOrganization = (orgId, options = {}) => {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganization(orgId),
    enabled: !!orgId,
    ...options,
  });
};

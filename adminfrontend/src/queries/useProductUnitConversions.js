import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductUnitConversions,
  addProductUnitConversion,
} from "@/api/product";

const PRODUCT_UNIT_CONVERSIONS_QUERY_KEY = "product-unit-conversions";

export const useProductUnitConversions = (productId) => {
  const queryClient = useQueryClient();

  // query
  const query = useQuery({
    queryKey: [PRODUCT_UNIT_CONVERSIONS_QUERY_KEY, productId],
    queryFn: () => getProductUnitConversions(productId),
    enabled: !!productId,
  });

  // mutation - to update/add
  const addMutation = useMutation({
    mutationFn: addProductUnitConversion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_UNIT_CONVERSIONS_QUERY_KEY, variables.product],
      });
    },
  });


  return {
    unitConversions: query.data ?? [],

    // query states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // mutation
    addUnitConversion: addMutation.mutate,
    addUnitConversionAsync: addMutation.mutateAsync,
    isAdding: addMutation.isLoading,
    addError: addMutation.error,

    // helpers
    refetch: query.refetch,
  };
};

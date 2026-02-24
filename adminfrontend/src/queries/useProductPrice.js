import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductPrice,
  productPriceUpdate,
} from "@/api/product";

export const PRODUCT_PRICE_QUERY_KEY = "product-price";

export const useProductPrice = (productId) => {
  const queryClient = useQueryClient();

  /* ================= QUERY ================= */
  const query = useQuery({
    queryKey: [PRODUCT_PRICE_QUERY_KEY, productId],
    queryFn: () => getProductPrice(productId),
    enabled: !!productId,
  });

  const refreshData = () => {
    queryClient.invalidateQueries({
      queryKey: [PRODUCT_PRICE_QUERY_KEY, productId],
    });
  };

  /* ================= MUTATION ================= */
  const updateMutation = useMutation({
    mutationFn: productPriceUpdate,
    onSuccess: () => {
      // 🔥 auto re-render after update
      refreshData();
    },
  });

  return {
    priceData: query.data,

    // query states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // mutation
    updatePrice: updateMutation.mutate,
    updatePriceAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,

    // helpers
    refreshData,
    refetch: query.refetch,
  };
};
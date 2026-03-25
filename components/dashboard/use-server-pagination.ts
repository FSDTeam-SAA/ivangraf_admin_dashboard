import * as React from "react";

interface ServerPaginationResult {
  hasLiveTotal: boolean;
  totalItems: number;
  totalPages: number;
}

export function useServerPagination(
  totalItems: number | undefined,
  itemsPerPage: number
): ServerPaginationResult {
  const [stableTotalItems, setStableTotalItems] = React.useState(0);

  React.useEffect(() => {
    if (typeof totalItems === "number") {
      setStableTotalItems(totalItems);
    }
  }, [totalItems]);

  const resolvedTotalItems = totalItems ?? stableTotalItems;
  const totalPages = Math.max(1, Math.ceil(resolvedTotalItems / itemsPerPage));

  return {
    hasLiveTotal: typeof totalItems === "number",
    totalItems: resolvedTotalItems,
    totalPages,
  };
}

import * as React from "react";

interface PaginationResult<T> {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export function usePagination<T>(data: T[], itemsPerPage: number): PaginationResult<T> {
  const [page, setPage] = React.useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const items = React.useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, page, itemsPerPage]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return { page, setPage, totalPages, totalItems, items };
}
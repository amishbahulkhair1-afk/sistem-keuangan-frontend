import { useState, useMemo, useEffect } from "react";

/**
 * Custom Hook useTablePagination
 * Mengelola pagination client-side, seleksi row (checkbox), dan bulk action
 */
export function useTablePagination(items = [], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Reset page saat jumlah item berubah (misal ketika filter berganti)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalItems = items.length;
  const effectivePageSize = pageSize === 0 ? totalItems : pageSize;
  const totalPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1;

  // Pastikan current page selalu berada dalam batas valid
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (validPage - 1) * effectivePageSize;
  const endIndex = pageSize === 0 ? totalItems : Math.min(startIndex + effectivePageSize, totalItems);

  const paginatedItems = useMemo(() => {
    if (pageSize === 0 || totalItems === 0) return items;
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex, pageSize, totalItems]);

  const isAllCurrentPageSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.has(item.id));

  const isSomeCurrentPageSelected =
    paginatedItems.some((item) => selectedIds.has(item.id)) && !isAllCurrentPageSelected;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        paginatedItems.forEach((item) => next.delete(item.id));
      } else {
        paginatedItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  return {
    currentPage: validPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    displayStart: totalItems === 0 ? 0 : startIndex + 1,
    displayEnd: endIndex,
    paginatedItems,
    selectedIds,
    selectedCount: selectedIds.size,
    isAllSelected: isAllCurrentPageSelected,
    isSomeSelected: isSomeCurrentPageSelected,
    toggleSelect,
    toggleSelectAll,
    selectAllFiltered,
    clearSelection,
  };
}

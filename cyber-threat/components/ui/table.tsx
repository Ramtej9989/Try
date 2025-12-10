import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  noDataMessage?: string;
  emptyRowCount?: number;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
}

export const Table = <T,>({
  columns,
  data,
  isLoading = false,
  noDataMessage = 'No data available',
  emptyRowCount = 5,
  rowClassName,
  onRowClick,
  keyExtractor = (item: any, index: number) => index
}: TableProps<T>) => {
  // Generate empty rows for skeleton loading
  const emptyRows = isLoading
    ? Array.from({ length: emptyRowCount }).map((_, i) => i)
    : [];

  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            {columns.map((column, i) => (
              <th
                key={i}
                className={cn(
                  "h-10 px-4 text-left align-middle font-medium text-gray-500",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading
            ? emptyRows.map((i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-${i}-${colIndex}`} className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            : data.length > 0
              ? data.map((item, index) => {
                  const key = typeof keyExtractor === 'function'
                    ? keyExtractor(item, index)
                    : index;
                  
                  return (
                    <tr
                      key={key}
                      className={cn(
                        onRowClick && 'cursor-pointer hover:bg-gray-50',
                        rowClassName && rowClassName(item)
                      )}
                      onClick={() => onRowClick && onRowClick(item)}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={`${key}-${colIndex}`}
                          className="p-4 align-middle"
                        >
                          {column.cell
                            ? column.cell(item)
                            : column.accessorKey
                              ? (item[column.accessorKey] as React.ReactNode)
                              : null}
                        </td>
                      ))}
                    </tr>
                  );
                })
              : (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                    {noDataMessage}
                  </td>
                </tr>
              )}
        </tbody>
      </table>
    </div>
  );
};

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const TablePagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, pageSize, totalCount, onPageChange, className }, ref) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between px-4 py-3 border-t", className)}
      >
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                  "relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium",
                  currentPage === 1 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNumber;
                
                // Logic to show correct page numbers around the current page
                if (totalPages <= 5) {
                  pageNumber = idx + 1;
                } else if (currentPage <= 3) {
                  pageNumber = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + idx;
                } else {
                  pageNumber = currentPage - 2 + idx;
                }
                
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={cn(
                        "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                        pageNumber === currentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                  "relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium",
                  currentPage === totalPages 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  }
);

TablePagination.displayName = 'TablePagination';

export { TablePagination as Pagination };

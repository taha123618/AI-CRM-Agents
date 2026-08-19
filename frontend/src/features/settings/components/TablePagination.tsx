import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}: TablePaginationProps) {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-3 border-t border-[#3A4552] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-[#0B0C10] font-mono uppercase">
      <div className="flex items-center gap-3">
        <span className="text-[10px]">
          SHOWING <strong className="text-white">{startItem}</strong> TO{' '}
          <strong className="text-white">{endItem}</strong> OF{' '}
          <strong className="text-white">{totalItems}</strong> ENTRIES
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500 text-[10px]">PER PAGE:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#1F2833] border border-[#3A4552] text-slate-300 rounded-none px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#FFB800] font-mono"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0B0C10]">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-7 w-7 p-0 border-[#3A4552] text-slate-300 hover:border-[#FFB800] disabled:opacity-30"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-7 w-7 p-0 border-[#3A4552] text-slate-300 hover:border-[#FFB800] disabled:opacity-30"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <span className="px-2 py-0.5 text-slate-300 font-bold text-[10px] font-mono">
          PAGE {currentPage} OF {Math.max(1, totalPages)}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 p-0 border-[#3A4552] text-slate-300 hover:border-[#FFB800] disabled:opacity-30"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 p-0 border-[#3A4552] text-slate-300 hover:border-[#FFB800] disabled:opacity-30"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

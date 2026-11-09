import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/pagination";

type Props = {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PaginationControls({
  meta,
  onPageChange,
  className = "",
}: Props) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center gap-3 py-5 ${className}`}
      aria-label="Phân trang"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!meta.hasPreviousPage}
        onClick={() => onPageChange(meta.page - 1)}
      >
        <ChevronLeft size={16} />
        Trước
      </Button>
      <span className="text-sm text-muted-foreground">
        Trang {meta.page}/{meta.totalPages} · {meta.total} mục
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Sau
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}

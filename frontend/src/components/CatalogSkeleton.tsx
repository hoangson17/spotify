import { Skeleton } from "@/components/ui/skeleton";

type CardGridSkeletonProps = {
  count?: number;
  category?: boolean;
  round?: boolean;
};

export function CardGridSkeleton({
  count = 12,
  category = false,
  round = false,
}: CardGridSkeletonProps) {
  return (
    <div
      className={
        category
          ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      }
      aria-label="Đang tải nội dung"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 p-3">
          <Skeleton
            className={
              category
                ? "aspect-[16/9] w-full rounded-lg"
                : `aspect-square w-full ${round ? "rounded-full" : "rounded-lg"}`
            }
          />
          {!category && (
            <>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function ListSectionSkeleton({ round = false }: { round?: boolean }) {
  return (
    <section className="mb-10 w-full" aria-label="Đang tải danh sách">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-24" />
      </div>
      <CardGridSkeleton count={6} round={round} />
    </section>
  );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-10 p-6" aria-label="Đang tìm kiếm">
      <Skeleton className="h-9 w-72 max-w-full" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-32" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-2">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-2/3" />
              <Skeleton className="h-3 w-32 max-w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}

export function DetailSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div className="p-6 text-white" aria-label="Đang tải chi tiết">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Skeleton
          className={`h-48 w-48 shrink-0 ${round ? "rounded-full" : "rounded-lg"}`}
        />
        <div className="w-full space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="my-6 flex items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-11 w-11 rounded" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

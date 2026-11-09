import { CardGridSkeleton } from "@/components/CatalogSkeleton";
import Item from "@/components/Item";
import PaginationControls from "@/components/PaginationControls";
import { categoryService } from "@/services/categoryService";
import { trackService } from "@/services/trackService";
import type { PaginationMeta } from "@/types/pagination";
import { mediaUrl } from "@/utils/media";
import { Music2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  hexHexadecimal?: string | null;
};

type Track = {
  id: string;
  title: string;
  image_url?: string;
  audio_url?: string;
  artistNames?: string;
  artists?: Array<{ name?: string }>;
};

export default function CategoryTracks() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") || 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [category, setCategory] = useState<Category | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!id) return;

    setLoading(true);
    setError("");
    Promise.all([
      categoryService.getById(id),
      trackService.getAllTracks({ page, limit: 24, categoryId: id }),
    ])
      .then(([categoryResponse, tracksResponse]) => {
        if (!active) return;
        setCategory(categoryResponse.data);
        setTracks(tracksResponse.data.items ?? []);
        setMeta(tracksResponse.data.meta ?? null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.data?.message ||
            "Không tải được danh sách bài hát.",
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, page]);

  const changePage = (nextPage: number) => {
    setSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <main className="p-6 text-white">
        <CardGridSkeleton count={12} />
      </main>
    );
  }

  if (error || !category) {
    return <main className="p-6 text-red-400">{error || "Category không tồn tại."}</main>;
  }

  const categoryImage = mediaUrl(category.image_url || undefined);

  return (
    <main className="p-6 text-white">
      <header
        className="relative mb-8 min-h-48 overflow-hidden rounded-xl p-7 shadow-lg"
        style={{ backgroundColor: category.hexHexadecimal || "#4f46e5" }}
      >
        <div className="relative z-10 max-w-[70%]">
          <p className="mb-2 text-sm font-semibold text-white/75">THỂ LOẠI</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-3 max-w-xl text-sm text-white/80">
              {category.description}
            </p>
          )}
        </div>
        {categoryImage ? (
          <img
            src={categoryImage}
            alt=""
            className="absolute -bottom-8 right-2 h-52 w-52 rotate-12 rounded-lg object-cover shadow-2xl"
          />
        ) : (
          <Music2 className="absolute bottom-5 right-8 text-white/25" size={120} />
        )}
      </header>

      <h2 className="mb-4 text-2xl font-bold">Bài hát thuộc {category.name}</h2>
      {!tracks.length ? (
        <p className="text-gray-400">Chưa có bài hát trong thể loại này.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {tracks.map((track) => (
            <Item
              key={track.id}
              id={track.id}
              title={track.title}
              artist={
                track.artistNames ||
                track.artists
                  ?.map((artist) => artist.name)
                  .filter(Boolean)
                  .join(", ")
              }
              image_url={track.image_url}
              audio_url={track.audio_url}
              type="track"
            />
          ))}
        </div>
      )}

      <PaginationControls meta={meta} onPageChange={changePage} />
    </main>
  );
}

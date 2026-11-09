import Item from "@/components/Item";
import PaginationControls from "@/components/PaginationControls";
import { albumService } from "@/services/albumService";
import { artistService } from "@/services/artistService";
import { categoryService } from "@/services/categoryService";
import { playlistService } from "@/services/playlistService";
import { trackService } from "@/services/trackService";
import type { PaginationMeta } from "@/types/pagination";
import { mediaUrl } from "@/utils/media";
import { Music2 } from "lucide-react";
import { CardGridSkeleton } from "@/components/CatalogSkeleton";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const catalog = {
  tracks: {
    title: "Tất cả bài hát",
    type: "track" as const,
    load: (page: number) => trackService.getAllTracks({ page, limit: 24 }),
  },
  artists: {
    title: "Tất cả nghệ sĩ",
    type: "artist" as const,
    load: (page: number) => artistService.getAllArtists({ page, limit: 24 }),
  },
  albums: {
    title: "Tất cả album",
    type: "album" as const,
    load: (page: number) => albumService.getAllAlbum({ page, limit: 24 }),
  },
  playlists: {
    title: "Tất cả playlist",
    type: "playlist" as const,
    load: (page: number) => playlistService.getPlaylist({ page, limit: 24 }),
  },
  categories: {
    title: "Duyệt tìm tất cả",
    type: "category" as const,
    load: (page: number) => categoryService.getAll({ page, limit: 24 }),
  },
};

type CatalogType = keyof typeof catalog;

type BrowseItem = {
  id: string;
  title?: string;
  name?: string;
  artistNames?: string;
  image_url?: string;
  cover_image?: string;
  avatar?: string;
  audio_url?: string;
  description?: string | null;
  hexHexadecimal?: string | null;
  artists?: Array<{ name?: string }>;
  tracks?: Array<{
    id: string;
    title: string;
    artist: string;
    image_url: string;
    audio_url: string;
    duration?: number;
  }>;
};

export default function Browse() {
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page") || 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const config = catalog[type as CatalogType];

  useEffect(() => {
    let active = true;
    if (!config) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    config
      .load(page)
      .then(({ data }) => {
        if (!active) return;
        setItems(data.items);
        setMeta(data.meta);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.data?.message || "Không tải được dữ liệu.",
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [config, page]);

  if (!config) {
    return <div className="p-6 text-white">Danh mục không tồn tại.</div>;
  }

  const changePage = (nextPage: number) => {
    setSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">{config.title}</h1>
      {loading ? (
        <CardGridSkeleton
          count={config.type === "category" ? 8 : 12}
          category={config.type === "category"}
          round={config.type === "artist"}
        />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : !items.length ? (
        <p className="text-gray-400">Không có dữ liệu.</p>
      ) : config.type === "category" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((category) => {
            const image = mediaUrl(category.image_url);

            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group relative aspect-[16/9] overflow-hidden rounded-lg p-5 shadow-lg transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: category.hexHexadecimal || "#4f46e5",
                }}
              >
                <h2 className="relative z-10 max-w-[70%] text-2xl font-extrabold leading-tight text-white drop-shadow-md">
                  {category.name}
                </h2>

                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="absolute -bottom-5 -right-4 h-32 w-32 rotate-[18deg] rounded-md object-cover shadow-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105 sm:h-36 sm:w-36"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute -bottom-8 -right-5 flex h-36 w-36 rotate-[18deg] items-center justify-center rounded-2xl bg-black/20 shadow-2xl">
                    <Music2 size={58} className="text-white/80" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              title={item.title || ""}
              name={item.name}
              artist={
                item.artistNames ||
                item.artists
                  ?.map((artist) => artist.name)
                  .filter(Boolean)
                  .join(", ")
              }
              image_url={item.image_url || item.cover_image}
              avatar={item.avatar}
              audio_url={item.audio_url}
              isArtist={config.type === "artist"}
              playlistTracks={
                config.type === "playlist" || config.type === "artist"
                  ? item.tracks
                  : undefined
              }
              albumTracks={config.type === "album" ? item.tracks : undefined}
              type={config.type}
            />
          ))}
        </div>
      )}
      <PaginationControls meta={meta} onPageChange={changePage} />
    </main>
  );
}

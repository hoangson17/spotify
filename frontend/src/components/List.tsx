import React from "react";
import Item from "./Item";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { mediaUrl } from "@/utils/media";
import { Link } from "react-router-dom";
import { ListSectionSkeleton } from "./CatalogSkeleton";

interface ListItem {
  id: string;
  title?: string;
  artist?: string;
  image_url?: string;
  avatar?: string;
  name?: string;
  audio_url?: string;
  cover_image?: string;
  tracks?: any[];
  artists?: Array<{ name?: string }>;
}

interface ListProps {
  title: string;
  items: ListItem[];
  isArtist?: boolean;
  playlistTracks?: any[];
  albumTracks?: any[];
  imgNone?: string;
  seeAllTo?: string;
  loading?: boolean;
}

const List: React.FC<ListProps> = ({
  title,
  items,
  isArtist = false,
  playlistTracks,
  albumTracks,
  imgNone,
  seeAllTo,
  loading = false,
}) => {
  const getImageUrl = (url?: string) => {
    return mediaUrl(url, imgNone || "");
  };

  const getItemType = () => {
    if (isArtist) return "artist";
    if (playlistTracks !== undefined) return "playlist";
    if (albumTracks !== undefined) return "album";
    return "track";
  };

  if (loading) return <ListSectionSkeleton round={isArtist} />;

  if (!items.length) {
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {/* {seeAllTo && (
            <Link className="text-[13px] flex items-center gap-1 font-semibold text-gray-400 hover:text-gray-300" to={seeAllTo}>
              Hiển thị tất cả <ArrowRight size={16} />
            </Link>
          )} */}
        </div>
        <p className="text-gray-400">Không có dữ liệu.</p>
      </section>
    );
  }

  const renderItem = (item: ListItem) => (
    <Item
      id={item.id}
      title={item.title || ""}
      artist={item.artist || item.artists?.map((artist) => artist.name).filter(Boolean).join(", ")}
      image_url={getImageUrl(item.image_url || item.cover_image)}
      audio_url={item.audio_url}
      avatar={getImageUrl(item.avatar)}
      name={item.name}
      isArtist={isArtist}
      playlistTracks={item.tracks || playlistTracks}
      albumTracks={item.tracks || albumTracks}
      type={getItemType()}
    />
  );

  return (
    <section className="mb-10 w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {seeAllTo && (
          <Link
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-gray-400 hover:text-gray-300"
            to={seeAllTo}
          >
            Hiển thị tất cả
            {/* <ArrowRight size={16} /> */}
          </Link>
        )}
      </div>

      {items.length === 1 ? (
        <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
          {renderItem(items[0])}
        </div>
      ) : (
        <Carousel className="w-full overflow-hidden">
          <CarouselContent className="flex-nowrap">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                {renderItem(item)}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
};

export default List;

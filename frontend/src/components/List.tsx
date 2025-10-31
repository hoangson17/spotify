import React from "react";
import Item from "./Item";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface ListProps {
  title: string;
  items: {
    id: string;
    title?: string;
    artist?: string;
    image_url?: string;
    avatar?: string;
    name?: string;
    audio_url?: string;
    cover_image?: string;
    tracks?: any;
  }[];
  isArtist?: boolean;
  playlistTracks?: any[];
  albumTracks?: any[];
}

const List: React.FC<ListProps> = ({ title, items, isArtist ,playlistTracks ,albumTracks}) => {
  if (!items.length) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-400">Không có dữ liệu.</p>
      </section>
    );
  }

  return (
    <section className="mb-10 w-full">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      {items.length === 1 ? (
        <Item
          title={items[0].title || ""}
          artist={items[0].artist}
          image_url={items[0].image_url|| items[0].cover_image || "/placeholder.png"}
          avatar={items[0].avatar}
          name={items[0].name}
          isArtist={isArtist}
          playlistTracks={playlistTracks}
          albumTracks={albumTracks}
        />
      ) : (
        <Carousel className="w-full overflow-hidden">
          <CarouselContent className="w-full flex-nowrap">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <Item
                  id={item.id}
                  title={item.title || ""}
                  artist={item.artist}
                  image_url={item.image_url || item.cover_image || "/placeholder.png"}
                  audio_url={item.audio_url}     
                  avatar={item.avatar}
                  name={item.name}
                  isArtist={isArtist}
                  playlistTracks={item.tracks || []}
                  albumTracks={item.tracks || []}
                  type={isArtist ? "artist" : playlistTracks ? "playlist" : albumTracks ? "album" : "track"}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
};

export default List;

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from 'src/entities/playlist.entity';
import { Track } from 'src/entities/track.entity';
import { allowedFields, entityId, text, trackIds } from 'src/utils/input';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import {
  hasPermission,
  PermissionActor,
  requirePermission,
} from 'src/utils/permissions';
import { In, Repository } from 'typeorm';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

type Actor = PermissionActor;

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
  ) {}

  private readonly relations = ['tracks', 'tracks.artists', 'users'];

  async findAll(
    actor?: Actor,
    options: PaginationOptions = paginationOptions(),
  ) {
    const where = hasPermission(actor, 'playlists:read')
      ? undefined
      : actor
        ? [{ is_public: 1 }, { users: { id: actor.id } }]
        : { is_public: 1 };
    return paginated(
      await this.playlistRepository.findAndCount({
        where,
        relations: this.relations,
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async findOne(id: string, actor?: Actor) {
    const playlist = await this.playlistRepository.findOne({
      where: { id: entityId(id) },
      relations: this.relations,
    });
    if (
      !playlist ||
      (!playlist.is_public &&
        actor?.id !== playlist.users?.id &&
        !hasPermission(actor, 'playlists:read'))
    ) {
      throw new NotFoundException('Playlist not found');
    }
    return playlist;
  }

  private async owned(id: string, actor: Actor, operation = 'update') {
    const playlist = await this.playlistRepository.findOne({
      where: { id: entityId(id) },
      relations: this.relations,
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (actor.id !== playlist.users?.id)
      requirePermission(actor, `playlists:${operation}`);
    return playlist;
  }

  private fields(body: unknown, creating = false) {
    const data = allowedFields(body, ['title', 'description', 'is_public']);
    if (creating || data.title !== undefined)
      data.title = text(data.title, 'title', 100);
    if (data.description !== undefined)
      data.description = text(data.description, 'description', 5000, 0);
    if (data.is_public !== undefined) {
      if (![0, 1, '0', '1'].includes(data.is_public))
        throw new BadRequestException('Invalid visibility');
      data.is_public = Number(data.is_public);
    }
    return data;
  }

  async create(
    body: unknown,
    image: Express.Multer.File | undefined,
    actor: Actor,
  ) {
    const data = this.fields(body, true);
    const saved = await this.playlistRepository.save(
      this.playlistRepository.create({
        ...data,
        users: { id: actor.id },
        tracks: [],
        ...(image ? { cover_image: `/uploads/images/${image.filename}` } : {}),
      }),
    );
    commitUpload(image);
    return saved;
  }

  async update(
    id: string,
    body: unknown,
    image: Express.Multer.File | undefined,
    actor: Actor,
  ) {
    const playlist = await this.owned(id, actor);
    const data = this.fields(body);
    const oldImage = playlist.cover_image;
    Object.assign(
      playlist,
      data,
      image ? { cover_image: `/uploads/images/${image.filename}` } : {},
    );
    const saved = await this.playlistRepository.save(playlist);
    commitUpload(image);
    if (image) await removeUpload(oldImage);
    return saved;
  }

  async delete(id: string, actor: Actor) {
    const playlist = await this.owned(id, actor, 'delete');
    await this.playlistRepository.remove(playlist);
    await removeUpload(playlist.cover_image);
    return { success: true };
  }

  private async tracks(ids: unknown) {
    const validated = trackIds(ids);
    const tracks = validated.length
      ? await this.trackRepository.find({ where: { id: In(validated) } })
      : [];
    if (tracks.length !== validated.length)
      throw new NotFoundException('Track not found');
    return tracks;
  }

  async syncTrack(actor: Actor, id: string, ids: unknown) {
    const playlist = await this.owned(id, actor);
    playlist.tracks = await this.tracks(ids);
    return this.playlistRepository.save(playlist);
  }

  async addTrack(actor: Actor, id: string, ids: unknown) {
    const playlist = await this.owned(id, actor);
    const tracks = await this.tracks(ids);
    playlist.tracks.push(
      ...tracks.filter(
        (track) =>
          !playlist.tracks.some((existing) => existing.id === track.id),
      ),
    );
    return this.playlistRepository.save(playlist);
  }

  async removeTracks(actor: Actor, id: string, ids: unknown) {
    const playlist = await this.owned(id, actor);
    const removed = new Set(trackIds(ids));
    playlist.tracks = playlist.tracks.filter((track) => !removed.has(track.id));
    return this.playlistRepository.save(playlist);
  }
}

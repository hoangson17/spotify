import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track } from 'src/entities/track.entity';
import { User } from 'src/entities/user.entity';
import Hash from 'src/utils/hashing';
import {
  assertOwner,
  accountProfileFields,
  entityId,
  trackIds as validateTrackIds,
} from 'src/utils/input';
import { commitUpload, removeUpload } from 'src/utils/uploads';
import { In, IsNull, Not, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { Actor, assertManageAccount } from 'src/utils/roles';
import {
  normalizePermissions,
  PERMISSION_GROUPS,
  requirePermission,
} from 'src/utils/permissions';
import { allowedFields } from 'src/utils/input';
import {
  paginated,
  PaginationOptions,
  paginationOptions,
} from 'src/utils/pagination';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Track) private trackRepository: Repository<Track>,
    private readonly authService: AuthService,
  ) {}

  async update(
    id: string,
    data: any,
    file: Express.Multer.File | undefined,
    actor: any,
  ) {
    id = entityId(id);
    assertOwner(actor, id);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    data = accountProfileFields(actor, user, data);
    if (data.role !== undefined && data.role !== user.role)
      data.permissions = [];
    if (data.password) data.password = Hash.make(data.password);

    if (file) {
      if (file.mimetype.startsWith('image/'))
        data.avatar = `/uploads/images/${file.filename}`;
      else throw new Error('Invalid file type');
      // else if (file.mimetype === 'audio/mpeg') data.audio = `http://localhost:3000/uploads/audio/${file.filename}`;
    }
    await this.userRepository.update(id, data);
    commitUpload(file);
    if (file) await removeUpload(user.avatar);
    if (data.password || data.role) await this.authService.revokeSessions(id);
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string, actor: Actor) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return false;
    assertManageAccount(actor, user, 'status');
    await this.userRepository.softDelete(id);
    await this.authService.revokeSessions(id);
    return true;
  }

  async syncTrack(userId: string, trackIds: string[]) {
    userId = entityId(userId);
    trackIds = validateTrackIds(trackIds);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    //   const tracks = await this.trackRepository.findByIds(trackIds);

    if (tracks.length !== trackIds.length)
      throw new NotFoundException('No tracks found');
    user.tracks = tracks;

    return await this.userRepository.save(user);
  }

  async addTracks(userId: string, trackIds: string[]) {
    userId = entityId(userId);
    trackIds = validateTrackIds(trackIds);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });
    if (!user) throw new NotFoundException('User not found');

    const tracks = await this.trackRepository.find({
      where: { id: In(trackIds) },
    });
    //   const tracks = await this.trackRepository.findByIds(trackIds);

    if (tracks.length !== trackIds.length)
      throw new NotFoundException('No tracks found');

    const newTracks = tracks.filter(
      (track) => !user.tracks.some((t) => t.id === track.id),
    );

    user.tracks.push(...newTracks);

    const savedUser = await this.userRepository.save(user);

    return {
      ...savedUser,
      password: null,
    };
  }

  async deleteTracks(userId: string, trackIds: string[]) {
    userId = entityId(userId);
    trackIds = validateTrackIds(trackIds);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tracks'],
    });

    if (!user) throw new NotFoundException('User not found');

    const updatedTracks = user.tracks.filter(
      (track) => !trackIds.includes(track.id),
    );

    const dataUpdate = {
      ...user,
      tracks: updatedTracks,
    };

    return await this.userRepository.save(dataUpdate);
  }

  async getTracks(
    userId: string,
    options: PaginationOptions = paginationOptions(),
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const result = await this.trackRepository
      .createQueryBuilder('track')
      .innerJoin('track.users', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('track.artists', 'artist')
      .leftJoinAndSelect('track.album', 'album')
      .orderBy('track.created_at', 'DESC')
      .skip(options.skip)
      .take(options.limit)
      .getManyAndCount();
    return paginated(result, options);
  }

  async getAllUsers(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.userRepository.findAndCount({
        order: { created_at: 'DESC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async getUserLock(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.userRepository.findAndCount({
        withDeleted: true,
        where: { deletedAt: Not(IsNull()) },
        order: { deletedAt: 'DESC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async restore(id: string, actor: Actor) {
    requirePermission(actor, 'users:restore');
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) throw new NotFoundException('User not found');
    assertManageAccount(actor, user, 'restore');
    await this.userRepository.restore(id);
  }

  async hardDelete(id: string, actor: Actor) {
    requirePermission(actor, 'users:delete');
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) throw new NotFoundException('User not found');
    assertManageAccount(actor, user, 'delete');
    await this.authService.revokeSessions(id);
    await this.userRepository.delete(id);
  }

  permissionCatalog() {
    return PERMISSION_GROUPS;
  }

  async getAdmins(options: PaginationOptions = paginationOptions()) {
    return paginated(
      await this.userRepository.findAndCount({
        where: { role: 'admin' as any },
        withDeleted: true,
        order: { id: 'ASC' },
        skip: options.skip,
        take: options.limit,
      }),
      options,
    );
  }

  async setPermissions(id: string, body: unknown, actor: Actor) {
    if (actor.role !== 'super_admin')
      throw new ForbiddenException('Super admin only');
    const data = allowedFields(body, ['permissions']);
    const permissions = normalizePermissions(data.permissions);
    const admin = await this.userRepository.findOne({
      where: { id: entityId(id) },
      withDeleted: true,
    });
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin.role !== 'admin')
      throw new BadRequestException(
        'Only ordinary admin permissions can be changed',
      );
    await this.userRepository.update(id, { permissions });
    await this.authService.revokeSessions(id);
    return { id, permissions };
  }
}

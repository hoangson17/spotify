import { BadRequestException } from '@nestjs/common';
import { allowedFields, entityId, text } from './input';

export function artistFields(body: unknown, creating = false) {
  const data = allowedFields(body, ['name', 'bio', 'country']);
  if (creating || data.name !== undefined)
    data.name = text(data.name, 'name', 40);
  if (data.bio !== undefined) data.bio = text(data.bio, 'bio', 10000, 0);
  if (data.country !== undefined)
    data.country = text(data.country, 'country', 100, 0);
  return data;
}

export function albumFields(body: unknown, creating = false) {
  const data = allowedFields(body, ['title', 'artist']);
  if (creating || data.title !== undefined)
    data.title = text(data.title, 'title', 100);
  if (data.artist !== undefined)
    data.artist =
      data.artist === '' || data.artist === null
        ? null
        : { id: entityId(data.artist) };
  return data;
}

export function categoryFields(body: unknown, creating = false) {
  const data = allowedFields(body, ['name', 'description', 'hexHexadecimal']);
  if (creating || data.name !== undefined)
    data.name = text(data.name, 'name', 100);
  if (data.description !== undefined)
    data.description =
      data.description === '' || data.description === null
        ? null
        : text(data.description, 'description', 5000);
  if (data.hexHexadecimal !== undefined) {
    if (data.hexHexadecimal === '' || data.hexHexadecimal === null) {
      data.hexHexadecimal = null;
    } else if (
      typeof data.hexHexadecimal !== 'string' ||
      !/^#[0-9a-f]{6}$/i.test(data.hexHexadecimal)
    ) {
      throw new BadRequestException('Invalid category color');
    }
  }
  return data;
}

export function trackFields(body: unknown, creating = false) {
  const data = allowedFields(body, [
    'title',
    'album',
    'category',
    'duration',
    'artistId',
  ]);
  if (creating || data.title !== undefined)
    data.title = text(data.title, 'title', 100);
  if (data.album !== undefined)
    data.album =
      data.album === '' || data.album === null
        ? null
        : { id: entityId(data.album) };
  if (data.category !== undefined)
    data.category =
      data.category === '' || data.category === null
        ? null
        : { id: entityId(data.category) };
  if (creating || data.duration !== undefined) {
    const duration = Number(data.duration);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 24 * 60 * 60)
      throw new BadRequestException('Invalid audio duration');
    data.duration = Math.ceil(duration);
  }
  if (data.artistId !== undefined) {
    data.artists =
      data.artistId === '' || data.artistId === null
        ? []
        : [{ id: entityId(data.artistId) }];
    delete data.artistId;
  }
  return data;
}

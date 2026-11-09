import {
  Controller,
  INestApplication,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { imageMulterConfig, multerConfig } from './config/multer.config';
import { getUploadLimits } from './config/upload-limits';
import { UploadSizeInterceptor } from './interceptors/upload-size.interceptor';
import { SafeResponseInterceptor } from './interceptors/safe-response.interceptor';
import { UploadExceptionFilter } from './filters/upload-exception.filter';
import { cleanupUpload } from './utils/uploads';

const MB = 1024 * 1024;
const prefix = '9876543210';

@Controller('upload-test')
class UploadProbe {
  private async finish(files: Express.Multer.File[]) {
    const sizes = files.map((file) => file.size);
    await Promise.all(files.map((file) => cleanupUpload(file.path)));
    return { sizes };
  }
  @Post('image/:id')
  @UseInterceptors(FileInterceptor('avatar', imageMulterConfig))
  image(@Req() req: any) {
    return this.finish(req.file ? [req.file] : []);
  }

  @Post('track/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerConfig,
    ),
    UploadSizeInterceptor,
  )
  track(@Req() req: any) {
    return this.finish(
      Object.values(req.files as Record<string, Express.Multer.File[]>).flat(),
    );
  }
}

describe('Configurable upload limits', () => {
  it('reads limits when Multer is instantiated, after env configuration is available', () => {
    const image = process.env.UPLOAD_MAX_IMAGE_MB;
    const audio = process.env.UPLOAD_MAX_AUDIO_MB;
    try {
      process.env.UPLOAD_MAX_IMAGE_MB = '12';
      process.env.UPLOAD_MAX_AUDIO_MB = '50';
      expect(imageMulterConfig.limits?.fileSize).toBe(12 * MB + 1);
      expect(multerConfig.limits?.fileSize).toBe(50 * MB + 1);
      process.env.UPLOAD_MAX_IMAGE_MB = '0';
      expect(() => getUploadLimits()).toThrow();
      process.env.UPLOAD_MAX_IMAGE_MB = '101';
      expect(() => getUploadLimits()).toThrow();
    } finally {
      if (image === undefined) delete process.env.UPLOAD_MAX_IMAGE_MB;
      else process.env.UPLOAD_MAX_IMAGE_MB = image;
      if (audio === undefined) delete process.env.UPLOAD_MAX_AUDIO_MB;
      else process.env.UPLOAD_MAX_AUDIO_MB = audio;
    }
  });
});

describe('Multipart upload size regressions', () => {
  let app: INestApplication;
  const originalImage = process.env.UPLOAD_MAX_IMAGE_MB;
  const originalAudio = process.env.UPLOAD_MAX_AUDIO_MB;
  const leftovers = async () => {
    const lists = await Promise.all(
      ['images', 'audio'].map((folder) =>
        readdir(join(process.cwd(), 'uploads', folder)).catch(() => []),
      ),
    );
    return lists.flat().filter((name) => name.startsWith(prefix + '-'));
  };
  beforeAll(async () => {
    process.env.UPLOAD_MAX_IMAGE_MB = '10';
    process.env.UPLOAD_MAX_AUDIO_MB = '100';
    const module = await Test.createTestingModule({
      controllers: [UploadProbe],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalInterceptors(new SafeResponseInterceptor());
    app.useGlobalFilters(new UploadExceptionFilter(app.getHttpAdapter()));
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
    if (originalImage === undefined) delete process.env.UPLOAD_MAX_IMAGE_MB;
    else process.env.UPLOAD_MAX_IMAGE_MB = originalImage;
    if (originalAudio === undefined) delete process.env.UPLOAD_MAX_AUDIO_MB;
    else process.env.UPLOAD_MAX_AUDIO_MB = originalAudio;
  });
  it('accepts a 4 MB image that exceeded the previous 3 MB limit', async () => {
    const response = await request(app.getHttpServer())
      .post(`/upload-test/image/${prefix}`)
      .attach('avatar', Buffer.alloc(4 * MB), 'photo.png')
      .expect(201);
    expect(response.body.sizes).toEqual([4 * MB]);
    expect(await leftovers()).toEqual([]);
  });
  it('accepts an image exactly at the advertised maximum', async () => {
    const response = await request(app.getHttpServer())
      .post(`/upload-test/image/${prefix}`)
      .attach('avatar', Buffer.alloc(10 * MB), 'boundary.png')
      .expect(201);
    expect(response.body.sizes).toEqual([10 * MB]);
    expect(await leftovers()).toEqual([]);
  });
  it('accepts a 21 MB MP3 upload that exceeded the previous 20 MB limit', async () => {
    const response = await request(app.getHttpServer())
      .post(`/upload-test/track/${prefix}`)
      .attach('audio', Buffer.alloc(21 * MB), 'song.mp3')
      .expect(201);
    expect(response.body.sizes).toEqual([21 * MB]);
    expect(await leftovers()).toEqual([]);
  });
  it('returns a useful 413 response and cleans oversized single-image uploads', async () => {
    const response = await request(app.getHttpServer())
      .post(`/upload-test/image/${prefix}`)
      .attach('avatar', Buffer.alloc(11 * MB), 'large.png')
      .expect(413);
    expect(response.body.message).toContain('10 MB');
    expect(response.body.limits).toEqual({
      imageMaxBytes: 10 * MB,
      audioMaxBytes: 100 * MB,
    });
    expect(await leftovers()).toEqual([]);
  });
  it('enforces the image limit even when uploading it together with an MP3', async () => {
    await request(app.getHttpServer())
      .post(`/upload-test/track/${prefix}`)
      .attach('audio', Buffer.alloc(1024), 'song.mp3')
      .attach('image', Buffer.alloc(11 * MB), 'cover.png')
      .expect(413);
    expect(await leftovers()).toEqual([]);
  });
});

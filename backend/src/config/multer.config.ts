import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { getUploadLimits } from './upload-limits';

export const multerConfig: MulterOptions = {
  get limits() {
    const limits = getUploadLimits();
    // Busboy emits LIMIT_FILE_SIZE on reaching the threshold, so reserve one byte
    // to make the advertised maximum inclusive. Larger files are still rejected.
    return {
      fileSize: Math.max(limits.audioMaxBytes, limits.imageMaxBytes) + 1,
      files: 2,
      fields: 20,
      fieldSize: 64 * 1024,
    };
  },
  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    const images: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    };
    const valid =
      file.fieldname === 'audio'
        ? file.mimetype === 'audio/mpeg' && extension === '.mp3'
        : ['image', 'avatar', 'cover_image'].includes(file.fieldname) &&
          images[file.mimetype]?.includes(extension);
    if (!valid)
      return callback(
        new BadRequestException(
          'Only JPG, PNG, WebP, GIF images and MP3 audio are accepted',
        ),
        false,
      );
    callback(null, true);
  },
  storage: diskStorage({
    destination: (req, file, callback) => {
      const rootPath = join(process.cwd(), 'uploads'); // luôn ở thư mục gốc dự án
      let uploadPath = rootPath;
      if (file.mimetype.startsWith('image/')) {
        uploadPath = join(rootPath, 'images');
      } else if (file.mimetype === 'audio/mpeg') {
        uploadPath = join(rootPath, 'audio');
      } else {
        uploadPath = join(rootPath, 'others');
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      callback(null, uploadPath);
    },

    filename: (req, file, callback) => {
      const fileExt = extname(file.originalname);
      const userId =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          req.params.id ?? '',
        )
          ? req.params.id
          : 'user';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const newFileName = `${userId}-${uniqueSuffix}${fileExt}`;
      callback(null, newFileName);
    },
  }),
};

export const imageMulterConfig: MulterOptions = {
  ...multerConfig,
  get limits() {
    return {
      ...multerConfig.limits,
      fileSize: getUploadLimits().imageMaxBytes + 1,
      files: 1,
    };
  },
};

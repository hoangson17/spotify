import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

export const multerConfig = {
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
      const userId = req.params.id || 'user';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const newFileName = `${userId}-${uniqueSuffix}${fileExt}`;
      callback(null, newFileName);
    },
  }),
};

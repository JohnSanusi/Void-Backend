import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'social_app',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : (error as { message?: string })?.message || 'Upload failed';
            return reject(new Error(errorMessage));
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}

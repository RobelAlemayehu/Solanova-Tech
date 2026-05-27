import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');

    if (cloudinaryUrl) {
      // Parse the CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
      const url = new URL(cloudinaryUrl);
      const cloudName = url.hostname;
      const apiKey = url.username;
      const apiSecret = url.password;

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Allowed types: jpeg, png, webp.`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds the 5MB limit (received ${(file.size / 1024 / 1024).toFixed(2)}MB).`,
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'proplist/properties',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                error?.message ?? 'Failed to upload image to Cloudinary',
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}

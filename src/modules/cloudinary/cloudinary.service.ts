import { Injectable } from '@nestjs/common';
import {
    UploadApiResponse,
    UploadApiErrorResponse,
    v2 as cloudinary,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    async uploadFile(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise<UploadApiResponse | UploadApiErrorResponse>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'movie-h7',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result!);
                    },
                );

                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            },
        );
    }
}
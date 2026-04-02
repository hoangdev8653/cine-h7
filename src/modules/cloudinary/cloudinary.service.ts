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

    getOptimizedUrl(url: string, options: { width?: number; height?: number; crop?: string } = {}) {
        if (!url || !url.includes('cloudinary.com')) return url;

        const { width, height, crop = 'fill' } = options;

        let transformation = 'q_auto,f_auto';
        if (width) transformation += `,w_${width}`;
        if (height) transformation += `,h_${height}`;
        if (width || height) transformation += `,c_${crop}`;

        return url.replace('/upload/', `/upload/${transformation}/`);
    }
}
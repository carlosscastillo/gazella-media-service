import { minioClient, bucketName } from '../config/minio';
import crypto from 'crypto';

export const uploadFileToMinio = async (file: Express.Multer.File): Promise<string> => {
    const uniqueId = crypto.randomUUID();
    const extension = file.originalname.split('.').pop();
    const fileName = `${uniqueId}.${extension}`;

    await minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
    );

    const baseUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${baseUrl}/${bucketName}/${fileName}`;
};
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

    const publicHost = process.env.MINIO_PUBLIC_ENDPOINT || 'localhost';
    const baseUrl = `http://${publicHost}:${process.env.MINIO_PORT}`;
    return `${baseUrl}/${bucketName}/${fileName}`;
};

export const deleteFileFromMinio = async (fileName: string): Promise<void> => {
    try {
        await minioClient.removeObject(bucketName, fileName);
    } catch (error) {
        console.error(`Error eliminando archivo ${fileName} de MinIO:`, error);
        throw error;
    }
};
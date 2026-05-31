import * as Minio from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'password123'
});

export const bucketName = process.env.MINIO_BUCKET_NAME || 'gazella-media';

export const initMinio = async () => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket '${bucketName}' creado exitosamente.`);
        }
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: ["s3:GetObject"],
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                }
            ]
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Política de acceso público aplicada al bucket '${bucketName}'.`);
    } catch (error) {
        console.error('Error inicializando el bucket de MinIO:', error);
    }
};
import { Request, Response } from 'express';
import { uploadFileToMinio } from '../services/media_service';
import { publishEvent } from '../messaging/rabbitmq';

export const uploadMedia = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided in the request' });
        }

        const fileUrl = await uploadFileToMinio(req.file);

        const eventData = {
            url: fileUrl,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            timestamp: new Date().toISOString()
        };

        publishEvent('media.uploaded', eventData);

        return res.status(201).json({
            message: 'File uploaded successfully',
            url: fileUrl
        });
    } catch (error) {
        console.error('Error uploading file to MinIO:', error);
        return res.status(500).json({ error: 'Internal server error during file upload' });
    }
};
import { Request, Response } from 'express';
import { uploadFileToMinio, deleteFileFromMinio } from '../services/media_service';
import { publishEvent } from '../messaging/rabbitmq';

export const uploadMedia = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided or invalid file type' });
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
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteMedia = async (req: Request, res: Response): Promise<Response> => {
    try {
        const fileName = req.params.fileName as string;

        if (!fileName) {
            return res.status(400).json({ error: 'File name is required in the URL parameter' });
        }

        await deleteFileFromMinio(fileName);

        publishEvent('media.deleted', { fileName, timestamp: new Date().toISOString() });

        return res.status(200).json({ message: `File ${fileName} deleted successfully` });
    } catch (error) {
        console.error('Error in delete controller:', error);
        return res.status(500).json({ error: 'Internal server error during deletion' });
    }
};
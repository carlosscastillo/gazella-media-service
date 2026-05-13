import express from 'express';
import request from 'supertest';
import multer from 'multer';
import { vi, test, expect, describe, beforeEach } from 'vitest';

const { mockUploadFile, mockDeleteFile, mockPublishEvent } = vi.hoisted(() => ({
    mockUploadFile: vi.fn(),
    mockDeleteFile: vi.fn(),
    mockPublishEvent: vi.fn(),
}));

vi.mock('../../src/services/media_service', () => ({
    uploadFileToMinio: mockUploadFile,
    deleteFileFromMinio: mockDeleteFile,
}));

vi.mock('../../src/messaging/rabbitmq', () => ({
    publishEvent: mockPublishEvent,
    connectRabbitMQ: vi.fn(),
}));

import { uploadMedia, deleteMedia } from '../../src/controllers/media_controller';
import { errorHandler } from '../../src/handlers/error_handler';

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.json());
app.post('/media', upload.single('file'), uploadMedia);
app.delete('/media/:fileName', deleteMedia);
app.use(errorHandler);

const FAKE_FILE_BUFFER = Buffer.from('fake-image-content');
const FAKE_URL = 'http://localhost:9000/gazella-media/uuid-1234.png';

describe('POST /media – uploadMedia', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Subida exitosa devuelve 201 y la URL del archivo', async () => {
        mockUploadFile.mockResolvedValueOnce(FAKE_URL);

        const response = await request(app)
            .post('/media')
            .attach('file', FAKE_FILE_BUFFER, { filename: 'test.png', contentType: 'image/png' });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('File uploaded successfully');
        expect(response.body.url).toBe(FAKE_URL);
        expect(mockUploadFile).toHaveBeenCalledOnce();
        expect(mockPublishEvent).toHaveBeenCalledWith('media.uploaded', expect.objectContaining({
            url: FAKE_URL,
            originalName: 'test.png',
            mimetype: 'image/png',
        }));
    });

    test('Sin archivo devuelve 400', async () => {
        const response = await request(app)
            .post('/media')
            .field('dummy', 'value');

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('No file provided or invalid file type');
        expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test('Error en MinIO devuelve 500', async () => {
        mockUploadFile.mockRejectedValueOnce(new Error('MinIO connection failed'));

        const response = await request(app)
            .post('/media')
            .attach('file', FAKE_FILE_BUFFER, { filename: 'test.png', contentType: 'image/png' });

        expect(response.statusCode).toBe(500);
        expect(mockPublishEvent).not.toHaveBeenCalled();
    });

    test('Subida exitosa publica el evento con los datos correctos', async () => {
        mockUploadFile.mockResolvedValueOnce(FAKE_URL);

        await request(app)
            .post('/media')
            .attach('file', FAKE_FILE_BUFFER, { filename: 'photo.png', contentType: 'image/png' });

        expect(mockPublishEvent).toHaveBeenCalledWith('media.uploaded', expect.objectContaining({
            url: FAKE_URL,
            originalName: 'photo.png',
            mimetype: 'image/png',
            size: FAKE_FILE_BUFFER.length,
        }));
    });
});

describe('DELETE /media/:fileName – deleteMedia', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Eliminación exitosa devuelve 200 y mensaje de confirmación', async () => {
        mockDeleteFile.mockResolvedValueOnce(undefined);

        const response = await request(app)
            .delete('/media/uuid-1234.png');

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('File uuid-1234.png deleted successfully');
        expect(mockDeleteFile).toHaveBeenCalledWith('uuid-1234.png');
        expect(mockPublishEvent).toHaveBeenCalledWith('media.deleted', expect.objectContaining({
            fileName: 'uuid-1234.png',
        }));
    });

    test('Error en MinIO durante eliminación devuelve 500', async () => {
        mockDeleteFile.mockRejectedValueOnce(new Error('Object not found'));

        const response = await request(app)
            .delete('/media/uuid-1234.png');

        expect(response.statusCode).toBe(500);
        expect(mockPublishEvent).not.toHaveBeenCalled();
    });

    test('Eliminación exitosa publica el evento media.deleted con el fileName correcto', async () => {
        mockDeleteFile.mockResolvedValueOnce(undefined);

        await request(app).delete('/media/archivo-de-prueba.jpg');

        expect(mockPublishEvent).toHaveBeenCalledWith('media.deleted', expect.objectContaining({
            fileName: 'archivo-de-prueba.jpg',
        }));
    });
});
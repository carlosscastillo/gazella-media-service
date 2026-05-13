import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadMedia, deleteMedia } from '../controllers/media_controller';
import { upload } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth_validator';

const router = Router();

/**
 * @openapi
 * /media:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload a media file
 *     description: Uploads an image or video file to MinIO object storage. Publishes a media.uploaded event to RabbitMQ on success.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Image (JPEG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV). Max size: 50 MB."
 *     responses:
 *       201:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "http://localhost:9000/gazella-media/1b308567-84bb-42b5-9552-587799a2521a.png"
 *       400:
 *         description: No file provided, invalid file type, or file exceeds size limit.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No file provided or invalid file type"
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "Token inválido o ausente. Debes iniciar sesión para acceder a este recurso."
 *       500:
 *         description: Internal server error during upload.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', requireAuth, (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: `Upload error: ${err.message}. Please send only one file at a time under the 'file' key.`
            });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, uploadMedia);

/**
 * @openapi
 * /media/{fileName}:
 *   delete:
 *     tags:
 *       - Media
 *     summary: Delete a media file
 *     description: Deletes a file from MinIO object storage by its file name. Publishes a media.deleted event to RabbitMQ on success.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID-based file name returned when the file was uploaded.
 *         example: "1b308567-84bb-42b5-9552-587799a2521a.png"
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File 1b308567-84bb-42b5-9552-587799a2521a.png deleted successfully"
 *       400:
 *         description: File name parameter is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File name is required in the URL parameter"
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "Token inválido o ausente. Debes iniciar sesión para acceder a este recurso."
 *       500:
 *         description: Internal server error during deletion.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error during deletion"
 */
router.delete('/:fileName', requireAuth, deleteMedia);

export default router;

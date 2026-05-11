import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadMedia, deleteMedia } from '../controllers/media_controller';
import { upload } from '../middlewares/upload';
import { requireAuth } from '../middlewares/auth_validator';

const router = Router();

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

router.delete('/:fileName', requireAuth, deleteMedia);

export default router;
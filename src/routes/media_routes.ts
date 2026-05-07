import { Router } from 'express';
import { uploadMedia } from '../controllers/media_controller';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadMedia);

export default router;
import { Router } from 'express';
import { uploadMedia, deleteMedia } from '../controllers/media_controller';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/upload', upload.single('file'), uploadMedia);

router.delete('/:fileName', deleteMedia);

export default router;
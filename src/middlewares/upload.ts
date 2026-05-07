import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/quicktime'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only standard images and videos (PNG, JPEG,, MP4, WEBM, MOV) are allowed.'));
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, 
    },
    fileFilter
});
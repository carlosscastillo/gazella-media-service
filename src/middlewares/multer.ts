import { Request, Response, NextFunction } from "express";
import { upload } from "./upload";
import multer from "multer";

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
}
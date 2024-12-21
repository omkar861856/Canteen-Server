import { MulterError } from "multer";

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
}
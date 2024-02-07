import { Request, Response, NextFunction } from "express";

export const DownloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileUrl = req.query.file
        res.download(`uploads/${fileUrl}`, (error) => {
            if (error) {
                return res.status(404).json({ mesage: 'file not found' })
            }
        });
    } catch (error) {
        next(error)
    }
}
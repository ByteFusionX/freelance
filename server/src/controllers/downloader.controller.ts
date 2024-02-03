import { Request, Response, NextFunction } from "express";

export const DownloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileUrl = req.query.file
        res.download(`uploads/${fileUrl}`, (error) => {
            next(error)
        });
    } catch (error) {
        next(error)
    }
}
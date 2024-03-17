import { Request, Response, NextFunction } from "express";
import { nextTick } from "process";
const path = require('path')

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

export const fetchFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filename = req.params.filename
        const filePath = path.join(__dirname, '../../uploads', filename);
        res.sendFile(filePath, (error) => {
            if (error) {
                return res.status(404).json({ mesage: 'file not found' })
            }
        })
    } catch (error) {
        console.error(error);

        next(error)
    }
}
import { NextFunction } from "express";
import { Request, Response } from "express";

const TokenLogger = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.originalUrl.includes('login') || req.originalUrl.includes('uploads') || req.originalUrl.includes('employee/check') || req.headers.authorization) {
            next()
        } else {
            return res.status(401).json({ error: 'Authorization token is missing' })
        }
    } catch (error) {
        next(error)
    }
}

export default TokenLogger 
import { NextFunction } from "express";

const TokenLogger = (req: any, res: any, next: NextFunction) => {
    try {
        if (req.originalUrl.includes('login') || req.originalUrl.includes('uploads') || req.headers.authorization) {
            next()
        } else {
            return res.status(401).json({ error: 'Authorization token is missing' })
        }
    } catch (error) {
        next(error)
    }
}

export default TokenLogger 
import { NextFunction } from "express";

const TokenLogger = (req: any, res: any, next: NextFunction) => {
    try {
        if (req.originalUrl.includes('login')) next()

        if (req.headers.authorization) {
            next()
        }
        return res.status(403).json({ error: 'Access Forbidden' })
    } catch (error) {
        next(error)
    }
}

export default TokenLogger 
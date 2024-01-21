import { Request, Response, NextFunction } from "express"
import announcementModel from "../models/announcement.model"

export const celebrationCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); 
        
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1); 
        
        const celebData = await announcementModel.find({
          $and: [
            { celeb: true },
            { date: { $gte: today, $lt: tomorrow } }
          ]
        });

        return res.json(200).json(celebData)
        
    } catch (error) {
        next(error)
    }
}
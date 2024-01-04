import { NextFunction, Request, Response } from "express";
import announcementModel from "../models/announcement.model";


export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, date } = req.body
        const addAcnnouncement = new announcementModel({
            title,
            date,
            description
        })
        const saveAnnouncement = await addAcnnouncement.save()
        if (saveAnnouncement) {
            
            return res.status(200).json(true)
        }
        return res.status(502).json()
    } catch (error) {
        next(error);
    }
};

export const getAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let announcementData = await announcementModel.find().sort({ createdDate: -1 })
        if (announcementData.length) return res.status(200).json(announcementData)
        return res.status(202).json()
    } catch (error) {
        next(error)
    }
}

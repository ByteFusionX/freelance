import { NextFunction, Request, Response } from "express";
import announcementModel from "../models/announcement.model";


export const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, userId } = req.body;
    console.log(userId)
    const addAnnouncement = new announcementModel({
      title,
      date,
      description,
      celeb: false,
      viewedBy: userId ? [userId] : []
    });

    const saveAnnouncement = await addAnnouncement.save();
    if (saveAnnouncement) {
      return res.status(200).json(true);
    }
    return res.status(502).json();
  } catch (error) {
    next(error);
  }
};


export const getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query.page);
    const row = Number(req.query.row);
    const skip = (page - 1) * row;

    const pipeline: any[] = [
      { $sort: { createdDate: -1 } },
      { $skip: skip },
      { $limit: row }
    ];

    // Count total number of announcements
    const totalAnnouncements = await announcementModel.countDocuments();

    const announcementData = await announcementModel.aggregate(pipeline);

    if (!announcementData.length) {
      res.status(204).json();
    } else {
      res.status(200).json({ total: totalAnnouncements, announcements: announcementData });
    }
  } catch (error) {
    console.error('Error in getAnnouncement:', error);
    next(error);
  }
};




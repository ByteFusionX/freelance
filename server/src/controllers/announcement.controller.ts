import { NextFunction, Request, Response } from "express";
import announcementModel from "../models/announcement.model";
import { Server } from "socket.io";
import { connectedSockets } from "../service/socket-ioService";
const { ObjectId } = require('mongodb');

export const createAnnouncement = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, description, date, userId } = req.body;

    const addAnnouncement = new announcementModel({
      title,
      date,
      description,
      celeb: false,
      viewedBy: userId ? [userId] : []
    });

    const saveAnnouncement = await addAnnouncement.save();

    if (saveAnnouncement) {
      const socket = req.app.get('io') as Server;
      const filteredRoom = Object.keys(connectedSockets).filter(key => key !== userId);
      filteredRoom.forEach(room => {
        socket.to(room).emit("notifications", 'announcement');
      });
      return res.status(200).json({ success: true });
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
      { $limit: row },
    ];

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


export const markAsViewed = async (req: Request, res: Response) => {
  const { userId, announcementId } = req.body;

  try {
    if (!announcementId || !userId) {
      return res.status(400).json({ message: 'Announcement ID and User ID are required' });
    }

    // Find the announcement by ID
    const announcement = await announcementModel.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if the user has already viewed the announcement
    if (announcement.viewedBy.includes(userId)) {
      return res.status(200).json({ message: 'Announcement already viewed' });
    }

    // Add the user ID to the viewedBy array
    announcement.viewedBy.push(userId);

    // Save the updated announcement
    const updatedAnnouncement = await announcement.save();

    return res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




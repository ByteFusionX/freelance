import { Request, Response, NextFunction } from "express";
import Notification from "../models/notification.model";
import { Collection } from "mongoose";

interface NotificationData {
    type: string;
    title: string;
    message: string;
    recipients: { objectId: string; status: string }[];
    sentBy: string;
    date: Date;
    referenceId: string;
    referenceType: any;
    additionalData?: Record<string, unknown>;
}

export const createNotification = async (notification: NotificationData) => {
    try {
        // Validate notification data
        if (!notification.recipients || notification.recipients.length === 0) {
            throw new Error("Recipients are required");
        }

        const newNotification = new Notification(notification);
        await newNotification.save();
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

export const getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { recipientId } = req.query;
        const notifications = await Notification.find({ "recipients.objectId": recipientId }).exec();
        return res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { notificationId, recipientId } = req.body;
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, "recipients.objectId": recipientId },
            { $set: { "recipients.$.status": "read" } },
            { new: true }
        );
        if (notification) {
            return res.status(200).json({ success: true, notification });
        }
        return res.status(404).json({ success: false, message: 'Notification not found' });
    } catch (error) {
        next(error);
    }
};

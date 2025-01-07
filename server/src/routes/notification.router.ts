import { Router } from "express";
import { createNotification, getAllNotifications, markAsRead } from "../controllers/notification.controller";

const notificationRouter = Router();

notificationRouter.get('/all', getAllNotifications);
notificationRouter.patch('/mark-as-read', markAsRead);

export default notificationRouter;

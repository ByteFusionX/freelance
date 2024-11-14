import { Router } from "express";
import { createAnnouncement, getAnnouncement, markAsViewed } from "../controllers/announcement.controller";
const annoRouter = Router()

annoRouter.post('/addAnnouncement',createAnnouncement)
annoRouter.get('/getAnnouncement',getAnnouncement)
annoRouter.post('/markAsViewed',markAsViewed)


export default annoRouter

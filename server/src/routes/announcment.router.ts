import { Router } from "express";
import { createAnnouncement, getAnnouncement } from "../controllers/announcment.controller";
const annoRouter = Router()

annoRouter.post('/addAnnouncement',createAnnouncement)
annoRouter.get('/getAnnouncement',getAnnouncement)


export default annoRouter

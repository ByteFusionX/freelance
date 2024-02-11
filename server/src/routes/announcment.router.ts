import { Router } from "express";
import { createAnnouncement, getAnnouncement } from "../controllers/announcment.controller";
const annoRouter = Router()

annoRouter.post('/addAcnnouncement',createAnnouncement)
annoRouter.get('/getAcnnouncement',getAnnouncement)

export default annoRouter
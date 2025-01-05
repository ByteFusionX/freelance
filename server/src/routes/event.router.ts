import { Router } from "express";
import { fechEvents, newEvent } from "../controllers/event.controller";
const eventRouter = Router()
const upload = require("../common/multer.storage")

eventRouter.post('/new-event', upload.fields([{ name: 'eventFile' }]), newEvent)
eventRouter.get('/fetch/:collectionId', fechEvents)

export default eventRouter;
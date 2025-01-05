import { Router } from "express";
import { eventStatus, fechEvents, newEvent } from "../controllers/event.controller";
const eventRouter = Router()
const upload = require("../common/multer.storage")

eventRouter.post('/new-event', upload.fields([{ name: 'eventFile' }]), newEvent);
eventRouter.get('/fetch/:collectionId', fechEvents);
eventRouter.patch('/status', eventStatus)

export default eventRouter;
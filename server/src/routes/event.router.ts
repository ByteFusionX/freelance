import { Router } from "express";
import { newEvent } from "../controllers/event.controller";
const eventRouter = Router()
const upload = require("../common/multer.storage")

eventRouter.post('/new-event', upload.fields([{ name: 'eventFile' }]), newEvent)

export default eventRouter;
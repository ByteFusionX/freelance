import { Router } from "express";
import { DownloadFile } from "../controllers/downloader.controller";
const downRouter = Router()

downRouter.get('/', DownloadFile)

export default downRouter
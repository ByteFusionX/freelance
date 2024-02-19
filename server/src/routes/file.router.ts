import { Router } from "express";
import { DownloadFile, fetchFile } from "../controllers/file.controller";
const fileRouter = Router()

fileRouter.get('/download', DownloadFile)
fileRouter.get('/:filename', fetchFile)

export default fileRouter
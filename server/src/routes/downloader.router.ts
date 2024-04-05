import { Router } from "express";
import { downloadFile, clearAllPresaleFiles, deleteFile } from "../controllers/downloader.controller";
const downRouter = Router()

downRouter.get('/', downloadFile)
downRouter.delete('/', deleteFile)
downRouter.delete('/clearAll', clearAllPresaleFiles)

export default downRouter
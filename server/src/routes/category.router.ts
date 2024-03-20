import { Router } from "express";
import { createCategory, getCategory } from "../controllers/category.controller";
const catRouter = Router()

catRouter.get('/',getCategory)
catRouter.post('/',createCategory)

export default catRouter;
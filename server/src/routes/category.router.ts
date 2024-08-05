import { Router } from "express";
import { createCategory, getCategory, updateCategory } from "../controllers/category.controller";
const catRouter = Router()

catRouter.get('/', getCategory)
catRouter.post('/', createCategory)
catRouter.patch('/:categoryId', updateCategory)

export default catRouter;
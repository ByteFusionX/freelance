import { Request, Response, NextFunction } from "express";
import Category from '../models/category.model'


export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find().exec()

        if (categories.length > 0) {
            return res.status(200).json(categories);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryData = req.body;
        
        const categoryNameLowerCase = categoryData.categoryName.toLowerCase();
        
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp('^' + categoryNameLowerCase + '$', 'i') } });
        if (existingCategory) {
            return res.status(400).json('Category name already exists');
        }

        const category = new Category(categoryData);
        const saveCategory = await category.save();

        if (saveCategory) {
            return res.status(200).json(saveCategory);
        }

        console.log(saveCategory);
        return res.status(502).json(saveCategory);
    } catch (error) {
        next(error);
    }
}

// export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const data = req.body
//         let department = await Department.findOneAndUpdate(
//             { departmentName: data.departmentName }, { departmentHead: data.departmentHead })

//         if (department) {
//             department = await (await Department.findOne({ _id: department._id })).populate('departmentHead')
//             return res.status(200).json(department)
//         }
//         return res.status(502).json()
//     } catch (error) {
//         next(error)
//     }
// }
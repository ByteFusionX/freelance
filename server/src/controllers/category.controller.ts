import { Request, Response, NextFunction } from "express";
import Category from '../models/category.model'


export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'employees'
                }
            },
            {
                $addFields: {
                    employeeCount: { $size: '$employees' }
                }
            },
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    role: 1,
                    privileges: 1,
                    employeeCount: 1
                }
            }
        ]);

        if (categories.length > 0) {
            return res.status(200).json(categories);
        }
        return res.status(204).json();
    } catch (error) {
        next(error);
    }
};

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
        
        return res.status(502).json(saveCategory);
    } catch (error) {
        next(error);
    }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryData = req.body;
        const categoryId = req.params.categoryId;
        
        const categoryNameLowerCase = categoryData.categoryName.toLowerCase();
        
        const existingCategory = await Category.findOne({ categoryName: { $regex: new RegExp('^' + categoryNameLowerCase + '$', 'i') }, _id: { $ne: categoryId }  });
        if (existingCategory) {
            return res.status(400).json('Category name already exists');
        }

        const categoryUpdated = await Category.findByIdAndUpdate(categoryId,categoryData,{new:true});

        if (categoryUpdated) {
            return res.status(200).json(categoryUpdated);
        }
        
        return res.status(502).json();
    } catch (error) {
        next(error);
    }
}

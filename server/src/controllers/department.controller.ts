import { Request, Response, NextFunction } from "express";
import Department from '../models/department.model'


export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await Department.aggregate([
            {
                $lookup: {
                    from: 'employees', localField: 'departmentHead',
                    foreignField: '_id', as: 'departmentHead'
                }
            },
        ])

        if (departments.length > 0) {
            return res.status(200).json(departments);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departmentData = req.body
        const department = new Department(departmentData)
        const saveDepartment = await (await department.save()).populate(['departmentHead'])

        if (saveDepartment) {
            return res.status(200).json(saveDepartment)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        let department = await Department.findOneAndUpdate(
            { departmentName: data.departmentName }, { departmentHead: data.departmentHead })

        if (department) {
            department = await (await Department.findOne({ _id: department._id })).populate('departmentHead')
            return res.status(200).json(department)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}
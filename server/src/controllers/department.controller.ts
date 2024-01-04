import { Request, Response, NextFunction } from "express";
import Department from '../models/department.model'
const { ObjectId } = require('mongodb');


export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await Department.find().sort({ createdDate: 1 })
        if (departments.length) {
            return res.status(200).json(departments);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { departmentName, departmentHead, createdDate } = req.body
        const department = new Department({
            departmentName: departmentName,
            departmentHead: new ObjectId('6593e5ce8c8761526bdcbda4'),
            createdDate: createdDate
        })

        const saveDepartment = await department.save()
        if (saveDepartment) {
            return res.status(200).json(true)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

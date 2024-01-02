import { Request, Response, NextFunction } from "express";
import Department from '../models/department.model'
const { ObjectId } = require('mongodb');


export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const departments = await Department.find().sort({ createdDate: -1 })
        if(departments.length){
            return res.status(200).json(departments);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, head, date } = req.body
        const department = new Department({
            departmentName: name,
            departmentHead: new ObjectId('6593e5ce8c8761526bdcbda4'),
            createdDate: date
        })

        const saveDepartment = await department.save()
        if (saveDepartment) {
            return res.status(200).json()
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

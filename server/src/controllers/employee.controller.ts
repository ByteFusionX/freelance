import { Request, Response, NextFunction } from "express";
import Employee from '../models/employee.model'
const { ObjectId } = require('mongodb');


export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await Employee.find().sort({ createdDate: -1 }).populate('department')
        if(employees.length){
            return res.status(200).json(employees);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeData = req.body;
        const employee = new Employee(employeeData)

        const saveEmployee = await (await employee.save()).populate('department')
        if (saveEmployee) {
            return res.status(200).json(saveEmployee)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

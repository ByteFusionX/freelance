import { Request, Response, NextFunction } from "express";
import Employee from '../models/employee.model'
import * as bcrypt from 'bcrypt';

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employees = await Employee.find().sort({ createdDate: -1 }).populate('department')
        if (employees.length) {
            return res.status(200).json(employees);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let employeeId: string = await generateEmployeeId();
        console.log(employeeId)
        const employeeData = req.body;
        employeeData.employeeId = employeeId;

        const password = employeeData.password;
        employeeData.password = await bcrypt.hash(password, 10)

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


const generateEmployeeId = async () => {
    try {
        const lastEmployee = await Employee.findOne({}, {}, { sort: { employeeId: -1 } });
        let lastEmployeeId: String;

        if (lastEmployee) {
            lastEmployeeId = lastEmployee.employeeId
        }

        if (lastEmployee && lastEmployeeId) {
            console.log('asdf')
            const IdNumber = lastEmployeeId.split('-')
            const incrementedNum = parseInt(IdNumber[1]) + 1;
            return `NT-${incrementedNum}`
        } else {
            return 'NT-1100'
        }

    } catch (error) {
        console.log(error)
    }
}
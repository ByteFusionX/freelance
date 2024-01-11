import { Request, Response, NextFunction } from "express"
import employeeModel from "../models/employee.model"

export const celebrationCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const birthdayEmployee = await employeeModel.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$dob" }, currentMonth] },
                    { $eq: [{ $dayOfMonth: "$dob" }, currentDay] }
                ]
            }
        });

        res.status(200).json(birthdayEmployee);
    } catch (error) {
        next(error)
    }
}
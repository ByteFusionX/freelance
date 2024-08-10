import { Request, Response, NextFunction } from "express";
import Employee from '../models/employee.model'
import * as bcrypt from 'bcrypt';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import announcementModel from "../models/announcement.model";
import enquiryModel from "../models/enquiry.model";
import quotationModel from "../models/quotation.model";
import categoryModel, { UserRole } from "../models/category.model";
import departmentModel from "../models/department.model";
const ObjectId = require('mongoose').Types.ObjectId;

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
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

export const isEmployeePresent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeCount = await Employee.countDocuments();
        const categoryCount = await categoryModel.countDocuments();
        const departmentCount = await departmentModel.countDocuments();

        if (employeeCount > 0) {
            return res.status(200).json({ exists: true });
        }

        if(categoryCount == 0){
            await new categoryModel({
                categoryName: "CEO",
                role: UserRole.superAdmin, 
                privileges: {
                  dashboard: {
                    viewReport: 'all',
                    totalEnquiry: true,
                    totalQuote: true,
                    totalJobs: true,
                    totalPresale: true,
                    EnquiryChart: true,
                  },
                  employee: {
                    viewReport: 'all',
                    create: true,
                  },
                  announcement: {
                    viewReport: 'all',
                    create: true,
                  },
                  customer: {
                    viewReport: 'all',
                    create: true,
                  },
                  enquiry: {
                    viewReport: 'all',
                    create: true,
                  },
                  assignedJob: {
                    viewReport: 'all',
                  },
                  quotation: {
                    viewReport: 'all',
                    create: true,
                  },
                  jobSheet: {
                    viewReport: 'all',
                  },
                  dealSheet: true,
                  portalManagement: {
                    department: true,
                    notesAndTerms: true,
                  },
                },
              }).save()
        }

        if(departmentCount == 0){
            await new departmentModel({
                departmentName : 'General'
              }).save()
        }
        
        return res.status(200).json({ exists: false });
    } catch (error) {
        next(error);
    }
}

export const getEmployeeByEmployeId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;
        let employeeId = req.params.employeeId;
        let accessFilter = {};

        switch (access) {
            case 'reported':
                accessFilter = { reportingTo: new ObjectId(userId) };
                break;
            case 'created':
                accessFilter = { createdBy: new ObjectId(userId) };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { reportingTo: new ObjectId(userId) },
                        { createdBy: new ObjectId(userId) }
                    ]
                };
                break;

            default:
                break;
        }
        const matchFilters = { employeeId: employeeId }
        const filters = { $and: [matchFilters, accessFilter] }
        console.log(accessFilter)
        const employeeExist = await Employee.findOne({ employeeId: employeeId });

        if (employeeExist) {
            const employeeData = await Employee.aggregate([
                {
                    $match: filters
                },
                {
                    $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
                },
                {
                    $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' }
                },
                {
                    $lookup: { from: 'employees', localField: 'reportingTo', foreignField: '_id', as: 'reportingTo' }
                },
                {
                    $unwind: "$department"
                },
                {
                    $unwind: "$reportingTo"
                },
                {
                    $unwind: "$category"
                },
            ])

            if (employeeData[0]) {
                return res.status(200).json({ access: true, employeeData: employeeData[0] })
            } else {
                return res.status(200).json({ access: false })
            }
        }


        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const getFilteredEmployees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, search, access, userId } = req.body;

        let skipNum: number = (page - 1) * row;

        let searchRegex = search.split('').join('\\s*');
        let fullNameRegex = new RegExp(searchRegex, 'i');
        let total: number = 0;

        let matchFilters = {
            $or: [
                { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: fullNameRegex } } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
            ]
        }

        let accessFilter = {};

        switch (access) {
            case 'reported':
                accessFilter = { reportingTo: new ObjectId(userId) };
                break;
            case 'created':
                accessFilter = { createdBy: new ObjectId(userId) };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { reportingTo: new ObjectId(userId) },
                        { createdBy: new ObjectId(userId) }
                    ]
                };
                break;

            default:
                break;
        }

        const filters = { $and: [matchFilters, accessFilter] }

        await Employee.aggregate([
            {
                $match: filters
            },
            {
                $group: { _id: null, total: { $sum: 1 } }
            },
            {
                $project: { total: 1, _id: 0 }
            }
        ]).exec()
            .then((result: { total: number }[]) => {
                if (result && result.length > 0) {
                    total = result[0].total
                }
            })

        const employeeData = await Employee.aggregate([
            {
                $match: filters,
            },
            {
                $sort: { employeeId: 1 }
            },
            {
                $skip: skipNum
            },
            {
                $limit: row
            },
            {
                $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'department' }
            },
            {
                $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' }
            },
            {
                $lookup: { from: 'employees', localField: 'reportingTo', foreignField: '_id', as: 'reportingTo' }
            },
            {
                $unwind: "$department"
            },
            {
                $unwind: "$reportingTo"
            },
            {
                $unwind: "$category"
            },
        ]);
        if (!employeeData || !total) return res.status(204).json({ err: 'No enquiry data found' })
        return res.status(200).json({ total: total, employees: employeeData })

    } catch (error) {
        next(error)
    }
}

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let employeeId: string = await generateEmployeeId();
        const employeeData = req.body;
        employeeData.employeeId = employeeId;

        const password = employeeData.password;
        employeeData.password = await bcrypt.hash(password, 10);

        const employee = new Employee(employeeData);

        const saveEmployee = await (await employee.save()).populate('category department reportingTo');
        if (saveEmployee) {
            return res.status(200).json(saveEmployee);
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const getPasswordForEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id = req.params.id
        const employee = await Employee.findById(id)
        console.log(employee)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const editEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedEmployeeData = { ...req.body };
        const employeeId = req.body.employeeId;

        delete updatedEmployeeData.password;
        delete updatedEmployeeData.employeeId;

        const { password } = req.body;
        console.log(password)
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedEmployeeData.password = hashedPassword
        }

        const saveEmployeeEdit = await Employee.findByIdAndUpdate(
            employeeId,
            updatedEmployeeData,
            { new: true }).populate('category department reportingTo')

        if (saveEmployeeEdit) {
            return res.status(200).json(saveEmployeeEdit);
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const changePasswordOfEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body)
        const { oldPassword, newPassword, userId } = req.body
        const user = await Employee.findById({ userId })
        const userPassword = user.password
        bcrypt.compare(userPassword, oldPassword, async (err, result) => {
            if (err) {
                console.log("error comparing passwords:", err)
                return
            }
            if (result) {
                console.log("password matched")
                await Employee.findOneAndUpdate({ id: user.id }, { $set: { password: newPassword } })
                return res.status(200).json({ passwordChanged: true })
            } else {
                console.log("password dont match")
                return res.status(502).json({ passwordChanged: false })
            }
        })
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


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, password } = req.body
        const employee = await Employee.findOne({ employeeId: employeeId })
        if (employee) {
            const passwordMatch = await bcrypt.compare(password, employee.password)
            if (passwordMatch) {
                const payload = { id: employee._id, employeeId: employee.employeeId }
                const token = jwt.sign(payload, process.env.JWT_SECRET)
                res.status(200).json({ token: token, employeeData: employee })
            } else {
                res.send({ passwordNotMatchError: true })
            }
        } else {
            res.send({ employeeNotFoundError: true })
        }
    } catch (error) {
        next(error)
    }

}

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = req.params.id
        const employeeData = await Employee.findOne({ employeeId: employeeId }).populate('category');
        if (employeeData) return res.status(200).json(employeeData)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}

export const getNotificationCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.params.token
        const jwtPayload = jwt.verify(token, process.env.JWT_SECRET)
        const userId = (<any>jwtPayload).id
        const announcementCount = await announcementModel.countDocuments({ viewedBy: { $ne: userId } });
        const assignedJobCount = await enquiryModel.countDocuments({
            'preSale.presalePerson': userId,
            'preSale.seenbyEmployee': false,
        });
        const dealSheetCount = await quotationModel.countDocuments({
            "dealData.seenByApprover": false,
        });
        const feedbackCount = await enquiryModel.countDocuments({
            "preSale.feedback.seenByFeedbackProvider": false,
        });
        const employeeCount = {
            announcementCount,
            assignedJobCount,
            dealSheetCount,
            feedbackCount
        }
        console.log(dealSheetCount)
        if (employeeCount) return res.status(200).json(employeeCount)
        return res.status(502).json()
    } catch (error) {
        next(error)
    }
}



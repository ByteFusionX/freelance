import { Request, Response, NextFunction } from "express";
import Department from '../models/department.model'
import Enquiry from '../models/enquiry.model'
import Employee from '../models/employee.model'
const { ObjectId } = require('mongodb')


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

export const totalEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { access, userId } = req.query;

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);
    
        
        const departmentsWithCounts = await Department.aggregate([
            {
                $lookup: {
                    from: 'enquiries',
                    localField: '_id',
                    foreignField: 'department', 
                    as: 'enquiries'
                }
            },
            {
                $addFields: {
                    filteredEnquiries: {
                        $filter: {
                            input: '$enquiries',
                            as: 'enquiry',
                            cond: {
                                $switch: {
                                    branches: [
                                        {
                                            case: { $eq: [access, 'created'] },
                                            then: { $eq: ['$$enquiry.salesPerson', new ObjectId(userId)] }
                                        },
                                        {
                                            case: { $eq: [access, 'reported'] },
                                            then: { $in: ['$$enquiry.salesPerson', reportedToUserIds] }
                                        },
                                        {
                                            case: { $eq: [access, 'createdAndReported'] },
                                            then: {
                                                $or: [
                                                    { $eq: ['$$enquiry.salesPerson', new ObjectId(userId)] },
                                                    { $in: ['$$enquiry.salesPerson', reportedToUserIds] }
                                                ]
                                            }
                                        }
                                    ],
                                    default: { $literal: true }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalEnquiries: {
                        $size: '$filteredEnquiries'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    departmentId: '$_id',
                    departmentName: '$departmentName',
                    totalEnquiries: 1
                }
            }
        ]);
        
        

        if (departmentsWithCounts) return res.status(200).json(departmentsWithCounts);
        return res.status(502).json();
    } catch (error) {
        next(error);
    }
}

import { Request, Response, NextFunction } from "express";
import Customer from '../models/customer.model'
const { ObjectId } = require('mongodb')


export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await Customer.find().sort({ createdDate: -1 }).populate('department createdBy')

        if (customers.length > 0) {
            return res.status(200).json(customers);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const getFilteredCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page, row, createdBy } = req.body;
        let skipNum: number = (page - 1) * row;
        let isCreatedBy = createdBy == null ? true : false;


        let matchFilters = {
            $or: [{ createdBy: new ObjectId(createdBy) }, { createdBy: { $exists: isCreatedBy } }]
        }

        let total: number = 0;
        await Customer.aggregate([
            {
                $match: matchFilters
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

        const customerData = await Customer.aggregate([
            {
                $match: matchFilters,
            },
            {
                $sort: { createdDate: 1 }
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
                $lookup: { from: 'employees', localField: 'createdBy', foreignField: '_id', as: 'createdBy' }
            },
            {
                $unwind: "$department"
            },
            {
                $unwind: "$createdBy"
            },
        ]);
        if (!customerData || !total) return res.status(204).json({ err: 'No enquiry data found' })
        return res.status(200).json({ total: total, customers : customerData })

    } catch (error) {
        next(error)
    }
}

export const getCustomerCreators = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const customers = await Customer.aggregate([
            {
                $group: {
                    _id: "$createdBy",
                    count: { $sum: 1 }
                },
            },
            {
                $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'createdBy' }
            },
            {
                $unwind: "$createdBy"
            },
            {
                $project: {
                    _id: 0,
                    createdBy: 1
                }
            },
            {
                $project: {
                    _id: "$createdBy._id",
                    fullName: { $concat: ["$createdBy.firstName", " ", "$createdBy.lastName"] }
                }
            }
        ]);
        if (customers.length > 0) {
            return res.status(200).json(customers);
        }
        return res.status(204).json()
    } catch (error) {
        next(error)
    }
}

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerData = req.body
        const customer = new Customer(customerData)
        const saveCustomer = await customer.save()

        if (saveCustomer) {
            return res.status(200).json(saveCustomer)
        }
        return res.status(502).json()
    } catch (error) {
        next(error)
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
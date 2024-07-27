import { Request, Response, NextFunction } from "express";
import Customer from '../models/customer.model';
import Employee from '../models/employee.model';
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
        let { page, row, createdBy, access, userId } = req.body;
        let skipNum: number = (page - 1) * row;
        let isCreatedBy = createdBy == null ? true : false;


        let matchFilters = {
            $or: [{ createdBy: new ObjectId(createdBy) }, { createdBy: { $exists: isCreatedBy } }]
        }

        let accessFilter = {};

        let employeesReportingToUser = await Employee.find({ reportingTo: userId }, '_id');
        let reportedToUserIds = employeesReportingToUser.map(employee => employee._id);

        switch (access) {
            case 'created':
                accessFilter = { createdBy: new ObjectId(userId) };
                break;
            case 'reported':


                accessFilter = { createdBy: { $in: reportedToUserIds } };
                break;
            case 'createdAndReported':
                accessFilter = {
                    $or: [
                        { createdBy: new ObjectId(userId) },
                        { createdBy: { $in: reportedToUserIds } }
                    ]
                };
                break;

            default:
                break;
        }

        const filters = { $and: [matchFilters, accessFilter] }

        let total: number = 0;
        await Customer.aggregate([
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

        const customerData = await Customer.aggregate([
            {
                $match: filters,
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
        return res.status(200).json({ total: total, customers: customerData })

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
        let clientId: string = await generateClientRef(customerData.createdDate);
        customerData.clientRef = clientId;

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

export const editCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, department, contactDetails, companyName, customerEmailId, contactNo, createdBy } = req.body
        const updatedCustomer = await Customer.findOneAndUpdate({ _id: id }, {
            $set: {
                department: department,
                contactDetails: contactDetails,
                companyName: companyName,
                customerEmailId: customerEmailId,
                contactNo: contactNo,
                createdBy: createdBy
            }
        })
        return res.status(200).json(updatedCustomer)
    } catch (error) {
        next(error)
    }
}

const generateClientRef = async (date: string) => {
    try {
        const lastClientId = await Customer.aggregate([
            {
                $match: {
                    clientRef: { $ne: null }
                }
            },
            {
                $addFields: {
                    slNoString: {
                        $regexFind: {
                            input: "$clientRef",
                            regex: "^[0-9]+"
                        }
                    }
                }
            },
            {
                $addFields: {
                    slNo: {
                        $toInt: "$slNoString.match"
                    }
                }
            },
            {
                $sort: { slNo: -1 }
            }
        ]);
        let clientRef: string;
        const currentYear = new Date().getFullYear();
        const year = currentYear.toString().slice(-2);

        if (lastClientId.length) {
            let lastSlNo = lastClientId[0].slNo;
            const formattedSlNo = String(lastSlNo + 1).padStart(3, '0');
            clientRef = `${formattedSlNo}/${year}`
        } else {
            clientRef = `001-${year}`
        }
        return clientRef;
    } catch (error) {
        console.log(error)
    }
}
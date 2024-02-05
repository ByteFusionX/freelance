import { Request, Response, NextFunction } from "express";
import Customer from '../models/customer.model'


export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
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
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getCustomers = void 0;
const customer_model_1 = __importDefault(require("../models/customer.model"));
const getCustomers = async (req, res, next) => {
    try {
        const customers = await customer_model_1.default.find().sort({ createdDate: -1 }).populate('department createdBy');
        if (customers.length > 0) {
            return res.status(200).json(customers);
        }
        return res.status(204).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res, next) => {
    try {
        const customerData = req.body;
        const customer = new customer_model_1.default(customerData);
        const saveCustomer = await customer.save();
        if (saveCustomer) {
            return res.status(200).json(saveCustomer);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
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
//# sourceMappingURL=customer.controller.js.map
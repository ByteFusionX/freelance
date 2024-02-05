"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const department_model_1 = __importDefault(require("../models/department.model"));
const getDepartments = async (req, res, next) => {
    try {
        const departments = await department_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'employees', localField: 'departmentHead',
                    foreignField: '_id', as: 'departmentHead'
                }
            },
        ]);
        if (departments.length > 0) {
            return res.status(200).json(departments);
        }
        return res.status(204).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res, next) => {
    try {
        const departmentData = req.body;
        const department = new department_model_1.default(departmentData);
        const saveDepartment = await (await department.save()).populate(['departmentHead']);
        if (saveDepartment) {
            return res.status(200).json(saveDepartment);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.createDepartment = createDepartment;
const updateDepartment = async (req, res, next) => {
    try {
        const data = req.body;
        let department = await department_model_1.default.findOneAndUpdate({ departmentName: data.departmentName }, { departmentHead: data.departmentHead });
        if (department) {
            department = await (await department_model_1.default.findOne({ _id: department._id })).populate('departmentHead');
            return res.status(200).json(department);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.updateDepartment = updateDepartment;
//# sourceMappingURL=department.controller.js.map
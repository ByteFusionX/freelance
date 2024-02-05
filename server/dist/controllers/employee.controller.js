"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployee = exports.login = exports.createEmployee = exports.getEmployees = void 0;
const employee_model_1 = __importDefault(require("../models/employee.model"));
const bcrypt = __importStar(require("bcrypt"));
var jwt = require('jsonwebtoken');
const getEmployees = async (req, res, next) => {
    try {
        const employees = await employee_model_1.default.find().sort({ createdDate: -1 }).populate('department');
        if (employees.length) {
            return res.status(200).json(employees);
        }
        return res.status(204).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getEmployees = getEmployees;
const createEmployee = async (req, res, next) => {
    try {
        let employeeId = await generateEmployeeId();
        const employeeData = req.body;
        employeeData.employeeId = employeeId;
        const password = employeeData.password;
        employeeData.password = await bcrypt.hash(password, 10);
        const employee = new employee_model_1.default(employeeData);
        const saveEmployee = await (await employee.save()).populate('department');
        if (saveEmployee) {
            return res.status(200).json(saveEmployee);
        }
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.createEmployee = createEmployee;
const generateEmployeeId = async () => {
    try {
        const lastEmployee = await employee_model_1.default.findOne({}, {}, { sort: { employeeId: -1 } });
        let lastEmployeeId;
        if (lastEmployee) {
            lastEmployeeId = lastEmployee.employeeId;
        }
        if (lastEmployee && lastEmployeeId) {
            const IdNumber = lastEmployeeId.split('-');
            const incrementedNum = parseInt(IdNumber[1]) + 1;
            return `NT-${incrementedNum}`;
        }
        else {
            return 'NT-1100';
        }
    }
    catch (error) {
        console.log(error);
    }
};
const login = async (req, res, next) => {
    try {
        const { employeeId, password } = req.body;
        const employee = await employee_model_1.default.findOne({ employeeId: employeeId });
        if (employee) {
            const passwordMatch = await bcrypt.compare(password, employee.password);
            if (passwordMatch) {
                const payload = { id: employee._id, employeeId: employee.employeeId };
                const token = await jwt.sign(payload, process.env.JWT_SECRET);
                res.status(200).json({ token: token, employeeData: employee });
            }
            else {
                res.send({ passwordNotMatchError: true });
            }
        }
        else {
            res.status(502).json({ employeeNotFoundError: true });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const employeeData = await employee_model_1.default.findOne({ employeeId: employeeId });
        if (employeeData)
            return res.status(200).json(employeeData);
        return res.status(502).json();
    }
    catch (error) {
        next(error);
    }
};
exports.getEmployee = getEmployee;
//# sourceMappingURL=employee.controller.js.map
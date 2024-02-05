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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const path = __importStar(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const department_router_1 = __importDefault(require("./routes/department.router"));
const employee_router_1 = __importDefault(require("./routes/employee.router"));
const announcment_router_1 = __importDefault(require("./routes/announcment.router"));
const customer_router_1 = __importDefault(require("./routes/customer.router"));
const enquiry_router_1 = __importDefault(require("./routes/enquiry.router"));
const celebrationCheck_router_1 = __importDefault(require("./routes/celebrationCheck.router"));
const cronService = require('./service/cronService.ts');
const quotation_router_1 = __importDefault(require("./routes/quotation.router"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
cronService.startCronJob();
dotenv_1.default.config({ path: path.resolve(__dirname, '../.env') });
app.use((0, cors_1.default)({
    credentials: true,
    origin: [process.env.ORIGIN1],
}));
app.use('/', user_router_1.default);
app.use('/department', department_router_1.default);
app.use('/employee', employee_router_1.default);
app.use('/announcement', announcment_router_1.default);
app.use('/customer', customer_router_1.default);
app.use('/equiry', enquiry_router_1.default);
app.use('/celebrationCheck', celebrationCheck_router_1.default);
app.use('/quotation', quotation_router_1.default);
mongoose_1.default
    .connect(process.env.MONGODB_URL)
    .then(() => {
    console.log("Database connected and Working  ");
});
const port = process.env.PORT;
app.listen(port, () => {
    console.log("server running..");
});
//# sourceMappingURL=index.js.map
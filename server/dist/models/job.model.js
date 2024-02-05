"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStatus = void 0;
const mongoose_1 = require("mongoose");
var jobStatus;
(function (jobStatus) {
    jobStatus["WorkInProgress"] = "Work In Progress";
    jobStatus["Delivered"] = "Delivered";
    jobStatus["PartiallyDelivered"] = "Partially Delivered";
    jobStatus["Completed"] = "Completed";
    jobStatus["Cancelled"] = "Cancelled";
    jobStatus["OnHold"] = "On Hold";
    jobStatus["Inovoiced"] = "Inovoiced";
})(jobStatus || (exports.jobStatus = jobStatus = {}));
const jobSchema = new mongoose_1.Schema({
    quoteId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    jobId: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: Object.values(jobStatus),
        default: jobStatus.WorkInProgress,
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});
exports.default = (0, mongoose_1.model)("Job", jobSchema);
//# sourceMappingURL=job.model.js.map
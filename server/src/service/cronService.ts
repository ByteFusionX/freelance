// cronService.js

import employeeModel from "../models/employee.model";

const cron = require('node-cron');


const startCronJob = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();

            const birthdayEmployee = await employeeModel.find({
                $expr: {
                    $and: [
                        { $eq: [{ $month: "$dob" }, currentMonth] },
                        { $eq: [{ $dayOfMonth: "$dob" }, currentDay] }
                    ]
                }
            });

            const anniversaryEmployees = await employeeModel.find({
                $expr: {
                    $and: [
                        { $eq: [{ $month: "$dateOfJoining" }, currentMonth] },
                        { $eq: [{ $dayOfMonth: "$dateOfJoining" }, currentDay] }
                    ]
                }
            });

            console.log('Birthday Employees:', birthdayEmployee);
            console.log('Anniversary Employees:', anniversaryEmployees);

        } catch (error) {
            console.error('Cron job error:', error.message);
        }
    }).start();
};

module.exports = { startCronJob };

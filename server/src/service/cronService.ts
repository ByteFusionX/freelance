import employeeModel from "../models/employee.model";
import announcementModel from "../models/announcement.model";
const cron = require('node-cron');

const processEmployeeEvent = async (element, eventType) => {
    try {
        let eventTitle = '';
        let eventDescription = '';

        if (eventType === 'birthday') {
            eventTitle = `Happy Birthday ${element.firstName} ${element.lastName}`;
            eventDescription = 'Sending warm birthday wishes to our valued employees! May your special day be filled with joy, prosperity, and unforgettable moments. Your dedication contributes to the success of our company, and we appreciate your continued commitment. Happy Birthday!';
        } else if (eventType === 'anniversary') {

            const joinedDate = new Date(element.dateOfJoining);
            const today = new Date();
            const workAnniversary = new Date(today.getTime() - joinedDate.getTime());
            const yearsOfExperience = Math.abs(workAnniversary.getUTCFullYear() - 1970);

            eventTitle = `Congratulations ${element.firstName} ${element.lastName} on ${yearsOfExperience} Years of Dedication and Success: Happy Work Anniversary!`;
            eventDescription = 'Sending warm anniversary wishes to our valued employees! Thank you for your dedication and contributions to our success. Here\'s to many more years of collaboration and achievements. Happy Work Anniversary!';
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const saveEvent = new announcementModel({
            title: eventTitle,
            description: eventDescription,
            date: today,
            celeb: true
        });


        const saveComment = await saveEvent.save();

        if (!saveComment) return false;
        return true;
    } catch (error) {
        console.error(`Error saving ${eventType} announcement:`, error.message);
        return false;
    }
};

const startCronJob = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Working cron scheduled');
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();

            const [birthdayEmployees, anniversaryEmployees] = await Promise.all([
                employeeModel.find({
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$dob" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$dob" }, currentDay] }
                        ]
                    }
                }),
                employeeModel.find({
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$dateOfJoining" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$dateOfJoining" }, currentDay] }
                        ]
                    }
                })
            ]);

            if (birthdayEmployees.length > 0) {
                const birthdayPromises = birthdayEmployees.map(element => processEmployeeEvent(element, 'birthday'));
                await Promise.all(birthdayPromises);
            }

            if (anniversaryEmployees.length > 0) {
                const anniversaryPromises = anniversaryEmployees.map(element => processEmployeeEvent(element, 'anniversary'));
                await Promise.all(anniversaryPromises);
            }

        } catch (error) {
            console.error('Cron job error:', error.message);
        }
    }).start();
};


module.exports = { startCronJob };

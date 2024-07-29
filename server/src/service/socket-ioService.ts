import announcementModel from "../models/announcement.model";
import enquiryModel from "../models/enquiry.model";

export const socketConnection = async (socketIo) => {
    try {
        let io = socketIo

        io = socketIo;

        io.on("connection", (socket) => {
            console.log("New client connected");

            socket.on("disconnect", () => {
                console.log("Client disconnected");
            })
            socket.on('onCheck', async (userId) => {
                const notViewedCount = await getNotViewedAnnouncementsCount(userId)
                const notViewedPresaleCount = await getNotViewedPresale(userId)
                socket.emit('notViewed', { notViewedCount, notViewedPresaleCount })
            })
        })

    } catch (error) {
        console.log(error)
    }
}

const getNotViewedAnnouncementsCount = async (userId: string): Promise<number> => {
    try {
        const count = await announcementModel.countDocuments({ viewedBy: { $ne: userId } });
        return count;
    } catch (error) {
        console.error('Error in getNotViewedAnnouncementsCount:', error);
        return 0;
    }
};
const getNotViewedPresale = async (userId: string): Promise<number> => {
    try {
        const count = await enquiryModel.countDocuments({
            'preSale.presalePerson': userId,
            'preSale.seenbyEmployee': false,
        });
        return count;
    } catch (error) {
        console.error('Error in getNotViewedPresale:', error);
        return 0;
    }
};
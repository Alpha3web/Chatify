// controllers/userController.js
const User = require("../models/User");

const UserController = {
    /**
     * Get user by ID
     * @param {Request} req
     * @param {Response} res
     */
    async getUser(req, res) {
        const userId = req.params.id === "undefined"? req.userId: req.params.id;
        try {

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({
                userId,
                username: user.username,
                online: user.online
            });
        } catch (error) {
            res.status(501).json({ message: "Error fetching user" });
        }
    },

    /**
     * Get all users
     * @param {Request} req
     * @param {Response} res
     */
    async getAllUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users.map((user) => ({
                username: user.username,
                online: user.online,
                userId: user._id,
            })));
        } catch (error) {
            res.status(500).json({ message: "Error fetching users" });
        }
    },

    /**
     * Get user by ID and update online status
     * @param userId
     * @param currentStatus
     * @param socket
     */
    async updateOnlineStatus(userId, currentStatus, socket) {
        try {
            const user = await User.findByIdAndUpdate(userId, { online: currentStatus === "online" }, { new: true });
            socket.broadcast.emit('user-status-update', { username: user.username, online: user.online });
        } catch (error) {
            console.log(error);
        }

    }
};

module.exports = UserController;
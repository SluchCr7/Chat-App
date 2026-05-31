const asyncHandler = require("express-async-handler");
const { User } = require("../modules/User");
const { Message } = require("../modules/Message");
const { Group } = require("../modules/Group");
const { Channel } = require("../modules/Channel");
const os = require("os");

// Get system & statistics summary
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalChannels = await Channel.countDocuments();
    const totalMessages = await Message.countDocuments();
    
    // Count active online users
    const onlineUsersCount = await User.countDocuments({ isOnline: true });

    // System info
    const systemInfo = {
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        cpuCount: os.cpus().length,
        nodeVersion: process.version
    };

    // Message statistics (last 7 days aggregate)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const messageStats = await Message.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.status(200).json({
        stats: {
            totalUsers,
            totalGroups,
            totalChannels,
            totalMessages,
            onlineUsersCount
        },
        systemInfo,
        messageStats
    });
});

// Admin User Management: List all users with pagination
const getAdminUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
        users,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// Admin User Modification: Change Admin/Verified/Lock Status
const toggleUserAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot revoke your own admin rights" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({ message: `User admin status toggled to ${user.isAdmin}`, user });
});

const toggleUserVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ message: `User verification status toggled to ${user.isVerified}`, user });
});

// Admin Delete User
const deleteUserByAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot delete yourself" });
    }

    // Delete user's messages & user profile
    await User.findByIdAndDelete(user._id);
    await Message.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });

    res.status(200).json({ message: "User and associated conversations deleted successfully" });
});

module.exports = {
    getAdminStats,
    getAdminUsers,
    toggleUserAdmin,
    toggleUserVerification,
    deleteUserByAdmin
};

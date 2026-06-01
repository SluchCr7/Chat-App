const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["owner", "admin", "moderator", "member"],
        default: "member"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a user can only join a group once
groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

module.exports = { GroupMember };

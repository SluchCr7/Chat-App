const mongoose = require("mongoose");

const groupInviteSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
        index: true
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    invitee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

const GroupInvite = mongoose.model("GroupInvite", groupInviteSchema);

module.exports = { GroupInvite };

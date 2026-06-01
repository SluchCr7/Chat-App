const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "resolved"],
        default: "pending"
    }
}, {
    timestamps: true
});

const Report = mongoose.model("Report", reportSchema);

module.exports = { Report };

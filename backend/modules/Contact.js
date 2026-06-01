const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Ensure a user can only add a contact once
contactSchema.index({ user: 1, contact: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = { Contact };

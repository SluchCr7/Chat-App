const mongoose = require("mongoose");
const Joi = require("joi");

const channelSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["public", "private", "announcement"],
        default: "public"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Channel = mongoose.model("Channel", channelSchema);

const validateChannel = (channel) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        description: Joi.string().max(200).allow('', null),
        type: Joi.string().valid("public", "private", "announcement").default("public")
    });
    return schema.validate(channel);
};

module.exports = { Channel, validateChannel };

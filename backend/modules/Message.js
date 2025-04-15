const mongoose =require("mongoose");
const Joi =require("joi");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },
    Photos : {
        type: Array,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const Message = mongoose.model("Message", messageSchema);

const validateMessage = (message) => {
    const schema = Joi.object({
        text: Joi.string(),
    });
    return schema.validate(message);
};

module.exports = { Message, validateMessage };
const mongoose =require("mongoose");
const Joi =require("joi");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        // unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileName: {
        type: String,
        default : "@_Sluch"
    },
    profilePic: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null
        }
    },
    description : {
        type: String,
        default: "No description"
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

const validateUser = (user) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(user);
};

const validateLogin = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(user);
};

const validateUpdate = (user) => {
    const schema = Joi.object({
        username: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string(),
        profileName: Joi.string(),
        description: Joi.string(),
    });
    return schema.validate(user);
};

module.exports = { User, validateUser, validateLogin , validateUpdate };
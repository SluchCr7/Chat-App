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
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    profilePic: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null
        }
    },
    description: {
        type: String,
        default: "No description"
    },
    bannerPic: {
        type: Object,
        default: {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
            publicId: null
        }
    },
    socialLinks: {
        type: Object,
        default: {
            github: "",
            twitter: "",
            linkedin: ""
        }
    },
    status: {
        type: String,
        enum: ["online", "offline", "away", "busy", "invisible"],
        default: "offline"
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
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

const validateUser = (user) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        profileName: Joi.string().pattern(/^@?[a-zA-Z0-9_]+$/).required(),
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
        username: Joi.string().allow('', null),
        email: Joi.string().email().allow('', null),
        password: Joi.string().allow('', null),
        profileName: Joi.string().pattern(/^@?[a-zA-Z0-9_]+$/).allow('', null),
        description: Joi.string().allow('', null),
        status: Joi.string().valid("online", "offline", "away", "busy", "invisible").allow('', null),
        socialLinks: Joi.object({
            github: Joi.string().allow('', null),
            twitter: Joi.string().allow('', null),
            linkedin: Joi.string().allow('', null)
        }).allow(null),
        bannerPic: Joi.object({
            url: Joi.string().allow('', null),
            publicId: Joi.string().allow(null)
        }).allow(null)
    });
    return schema.validate(user);
};

module.exports = { User, validateUser, validateLogin , validateUpdate };
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
            req.user = decoded
            next()
        } catch (error) {
            return res.status(401).json({ message: "Invalid token" })
        }
    } else {
        return res.status(401).json({ message: "No token" })
    }
}

const verifyAdmain = async (req, res, next) => {
    verifyToken(req, res, next);
    if (!req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json("You are not administrator!");
    }
}

const verifyUser = async (req, res, next) => {
    verifyToken(req, res, next);
    if (req.user._id === req.params.id) {
        next();
    } else {
        return res.status(403).json("You are not User");
    }
}

const verifyAdmainUser = async (req, res, next) => {
    verifyAdmain(req, res, next);
    if (req.user.id === req.params.id || req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json("You are not User or Administrator");
    }
}

module.exports = { verifyToken, verifyAdmain, verifyUser, verifyAdmainUser }